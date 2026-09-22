import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(request) {
  try {
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!setupToken) {
      return NextResponse.json({ error: "Admin reset is not configured." }, { status: 503 });
    }

    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const token = String(body?.token || "");

    if (!email || !password || !token) {
      return NextResponse.json(
        { error: "Email, new password, and setup token are required." },
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

    const admin = await prisma.user.findFirst({
      where: { email, role: "ADMIN" },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin password reset error:", error);
    return NextResponse.json(
      { error: "Unable to reset the admin password." },
      { status: 500 }
    );
  }
}
