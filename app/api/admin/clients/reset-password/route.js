import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
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
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Client email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Client password must be at least 8 characters." }, { status: 400 });
    }

    const client = await prisma.user.findFirst({
      where: { email, role: "CLIENT" },
      select: { id: true, email: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client account not found." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: client.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true, client: { id: client.id, email: client.email } });
  } catch (error) {
    console.error("Client password update error:", error);
    return NextResponse.json({ error: "Unable to update the client password." }, { status: 500 });
  }
}
