import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Client email is required." }, { status: 400 });
    }

    const client = await prisma.user.findFirst({
      where: { email, role: "CLIENT" },
      select: { id: true, email: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client account not found." }, { status: 404 });
    }

    const tempPassword = crypto.randomBytes(12).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: client.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      client: { id: client.id, email: client.email },
      tempPassword,
    });
  } catch (error) {
    console.error("Client password reset error:", error);
    return NextResponse.json({ error: "Unable to reset the client password." }, { status: 500 });
  }
}
