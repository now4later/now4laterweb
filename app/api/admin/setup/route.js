import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(request) {
  try {
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!setupToken) {
      return NextResponse.json(
        { error: "Admin setup is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const token = String(body?.token || "");

    if (!email || !password || !token) {
      return NextResponse.json(
        { error: "Email, password, and setup token are required." },
        { status: 400 }
      );
    }

    if (token !== setupToken) {
      return NextResponse.json({ error: "Invalid setup token." }, { status: 403 });
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Admin password must be at least 12 characters." },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin setup is already complete." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "ADMIN",
        name: "Tariq",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Unable to create the admin account." },
      { status: 500 }
    );
  }
}
