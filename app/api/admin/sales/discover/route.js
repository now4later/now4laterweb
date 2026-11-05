import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

const MARKETS = [
  ["New York, NY", 40.7128, -74.0060], ["Los Angeles, CA", 34.0522, -118.2437],
  ["Chicago, IL", 41.8781, -87.6298], ["Houston, TX", 29.7604, -95.3698],
  ["Phoenix, AZ", 33.4484, -112.0740], ["Philadelphia, PA", 39.9526, -75.1652],
  ["San Antonio, TX", 29.4241, -98.4936], ["San Diego, CA", 32.7157, -117.1611],
  ["Dallas, TX", 32.7767, -96.7970], ["San Jose, CA", 37.3382, -121.8863],
  ["Austin, TX", 30.2672, -97.7431], ["Jacksonville, FL", 30.3322, -81.6557],
  ["Fort Worth, TX", 32.7555, -97.3308], ["Columbus, OH", 39.9612, -82.9988],
  ["Charlotte, NC", 35.2271, -80.8431], ["Indianapolis, IN", 39.7684, -86.1581],
  ["Seattle, WA", 47.6062, -122.3321], ["Denver, CO", 39.7392, -104.9903],
  ["Washington, DC", 38.9072, -77.0369], ["Boston, MA", 42.3601, -71.0589],
  ["Nashville, TN", 36.1627, -86.7816], ["Atlanta, GA", 33.7490, -84.3880],
  ["Miami, FL", 25.7617, -80.1918], ["Portland, OR", 45.5152, -122.6784],
];

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const category = String(body.category || "").trim().slice(0, 100);
  if (!category) return Response.json({ error: "Enter a business category to search nationwide." }, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Response.json({
    error: "Nationwide discovery is wired for Google Places, but it is not activated yet. Add GOOGLE_MAPS_API_KEY to the Vercel preview environment and redeploy. No prospects were searched or added."
  }, { status: 503 });

  const markets = MARKETS.slice(0, 24);
  const results = await Promise.allSettled(markets.map(async ([city, lat, lng]) => {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "places.id,places.displayName,places.websiteUri,places.nationalPhoneNumber,places.formattedAddress,places.primaryTypeDisplayName,places.rating,places.userRatingCount" },
      body: JSON.stringify({
        textQuery: category + " businesses",
        pageSize: 10,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 25000 } },
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Places search failed for " + city + " (" + response.status + ").");
    const data = await response.json();
    return (data.places || []).map((place) => ({ place, city }));
  }));

  const failures = results.filter((item) => item.status === "rejected");
  const found = results.filter((item) => item.status === "fulfilled").flatMap((item) => item.value);
  let added = 0;
  let duplicates = 0;

  for (const { place, city } of found) {
    const name = place.displayName?.text?.trim();
    if (!name) continue;
    const website = place.websiteUri || null;
    const phone = place.nationalPhoneNumber || null;
    const existing = await prisma.prospect.findFirst({
      where: {
        businessName: { equals: name, mode: "insensitive" },
        location: { contains: city.split(",")[0], mode: "insensitive" },
      },
      select: { id: true },
    });
    if (existing) { duplicates++; continue; }
    await prisma.prospect.create({
      data: {
        businessName: name,
        website,
        phone,
        location: place.formattedAddress || city,
        category: place.primaryTypeDisplayName?.text || category,
        source: "Google Places",
        researchNotes: [
          "Discovered by nationwide search.",
          place.rating ? "Google rating: " + place.rating + " (" + (place.userRatingCount || 0) + " reviews)." : null,
          "Website quality and sales opportunity still need automated assessment.",
        ].filter(Boolean).join(" "),
      },
    });
    added++;
  }

  return Response.json({
    searchedMarkets: markets.length,
    businessesFound: found.length,
    prospectsAdded: added,
    duplicatesSkipped: duplicates,
    failedMarkets: failures.length,
    note: "This first discovery pass searches 24 major US metro areas. Results are leads to review, not verified sales opportunities; website audits and AI recommendations are the next layer.",
  });
}
