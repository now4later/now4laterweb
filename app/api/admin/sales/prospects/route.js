import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const prospects = await prisma.prospect.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return Response.json({ prospects });
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const businessName = String(body.businessName || "").trim().slice(0, 160);
  if (!businessName) {
    return Response.json({ error: "Business name is required." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase().slice(0, 254) || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const prospect = await prisma.prospect.create({
    data: {
      businessName,
      contactName: String(body.contactName || "").trim().slice(0, 120) || null,
      email,
      phone: String(body.phone || "").trim().slice(0, 40) || null,
      website: String(body.website || "").trim().slice(0, 500) || null,
      location: String(body.location || "").trim().slice(0, 160) || null,
      category: String(body.category || "").trim().slice(0, 100) || null,
      source: "MANUAL",
      researchNotes: String(body.notes || "").trim().slice(0, 5000) || null,
    },
  });

  return Response.json({ prospect }, { status: 201 });
}

export async function PATCH(request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const allowed = ["NEW", "RESEARCHING", "DRAFT_READY", "CONTACTED", "REPLIED", "QUALIFIED", "APPOINTMENT", "WON", "LOST", "DO_NOT_CONTACT"];
  if (!body.id || !allowed.includes(body.status)) {
    return Response.json({ error: "A valid prospect and status are required." }, { status: 400 });
  }

  const prospect = await prisma.prospect.update({
    where: { id: String(body.id) },
    data: {
      status: body.status,
      optedOut: body.status === "DO_NOT_CONTACT" ? true : undefined,
    },
  });
  return Response.json({ prospect });
}
