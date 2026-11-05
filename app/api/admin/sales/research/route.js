import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

const SOCIAL_HOSTS = [
  "facebook.com", "instagram.com", "linkedin.com", "tiktok.com",
  "youtube.com", "youtu.be", "x.com", "twitter.com",
];

function isPublicWebUrl(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(":")) return false;
    return true;
  } catch {
    return false;
  }
}

function socialLinksFrom(html) {
  const links = new Set();
  const matches = html.matchAll(/href\s*=\s*["']([^"'<>]+)["']/gi);
  for (const match of matches) {
    try {
      const url = new URL(match[1].replace(/&amp;/g, "&"));
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      if (SOCIAL_HOSTS.some((domain) => host === domain || host.endsWith("." + domain))) {
        links.add(url.origin + url.pathname);
      }
    } catch {}
  }
  return [...links].slice(0, 12);
}

async function readLimited(response, maxBytes) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total > maxBytes ? 0 : total);
  if (!merged.length) return new TextDecoder().decode(chunks[0] || new Uint8Array());
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(merged);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!body.prospectId) return Response.json({ error: "A prospect ID is required." }, { status: 400 });

  const prospect = await prisma.prospect.findUnique({ where: { id: String(body.prospectId) } });
  if (!prospect) return Response.json({ error: "Prospect not found." }, { status: 404 });
  if (!prospect.website) return Response.json({
    report: {
      businessName: prospect.businessName,
      websiteStatus: "No website is listed in the business record.",
      socialProfiles: [],
      observations: ["Search the business name and location across public social platforms and directories in a later discovery pass."],
    },
    saved: false,
  });

  const rawUrl = prospect.website.startsWith("http") ? prospect.website : "https://" + prospect.website;
  if (!isPublicWebUrl(rawUrl)) return Response.json({ error: "The saved website address is not a valid public HTTP or HTTPS website." }, { status: 400 });

  let response;
  try {
    response = await fetch(rawUrl, {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(9000),
      headers: { "User-Agent": "NOW4LATERWEB-ProspectResearch/1.0", "Accept": "text/html,application/xhtml+xml" },
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "The business website could not be reached safely. It may block automated requests or be temporarily unavailable." }, { status: 422 });
  }

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("text/html")) {
    return Response.json({ error: "The business website did not return a readable HTML page." }, { status: 422 });
  }

  const html = await readLimited(response, 1_500_000);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim().slice(0, 180) || null;
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim().slice(0, 350) || null;
  const socialProfiles = socialLinksFrom(html);
  const hasViewport = /name=["']viewport["']/i.test(html);
  const hasForm = /<form\b/i.test(html);
  const hasPhoneLink = /href=["']tel:/i.test(html);
  const hasEmailLink = /href=["']mailto:/i.test(html);
  const hasBookingSignal = /(book now|schedule|appointment|reservation)/i.test(html);
  const observations = [
    title ? "Page title: " + title : "No readable page title was detected.",
    description ? "Meta description: " + description : "No standard meta description was detected.",
    hasViewport ? "A mobile viewport declaration is present." : "No mobile viewport declaration was detected; mobile layout needs a closer check.",
    hasForm ? "At least one HTML form is present." : "No HTML form was detected on the fetched page.",
    hasPhoneLink ? "A click-to-call phone link is present." : "No click-to-call phone link was detected.",
    hasEmailLink ? "A direct email link is present." : "No direct email link was detected.",
    hasBookingSignal ? "Booking or appointment language was detected." : "No obvious booking or appointment language was detected.",
    socialProfiles.length ? "Social profiles linked from the website: " + socialProfiles.join(", ") : "No supported social profile links were found on the fetched page.",
  ];
  const report = { businessName: prospect.businessName, websiteStatus: "Website fetched successfully.", title, description, socialProfiles, observations };
  const note = [
    "AUTOMATED WEBSITE RESEARCH (" + new Date().toISOString() + ")",
    ...observations,
    "Note: this is a lightweight public-page scan, not a full performance, accessibility, mobile-rendering, or social-content audit.",
  ].join("\n");
  const combinedNotes = [prospect.researchNotes, note].filter(Boolean).join("\n\n").slice(0, 5000);
  await prisma.prospect.update({
    where: { id: prospect.id },
    data: { researchNotes: combinedNotes, source: prospect.source || "Website research" },
  });

  return Response.json({ report, saved: true });
}
