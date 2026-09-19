import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// GET /api/admin/clients — list all clients (admin only)
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      businessName: true,
      createdAt: true,
      agreements: {
        select: {
          id: true,
          status: true,
          paymentOption: true,
          projectStatus: true,
        },
      },
    },
  });

  return Response.json({ clients });
}

// POST /api/admin/clients — create a new client account (admin only)
// Generates a random temporary password and returns it once, in the
// response, so the admin can share it with the client. It is never
// stored in plaintext or logged.
export async function POST(request) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, name, businessName } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return Response.json(
      { error: "A user with this email already exists." },
      { status: 409 }
    );
  }

  const tempPassword = crypto.randomBytes(9).toString("base64url"); // e.g. "kQ2f9..."
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const client = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: "CLIENT",
      name: name || null,
      businessName: businessName || null,
    },
  });

  return Response.json({
    client: { id: client.id, email: client.email },
    tempPassword, // shown once — share this with the client yourself
  });
}
