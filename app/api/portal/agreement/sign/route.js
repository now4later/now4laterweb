import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { resend } from "../../../../../lib/resend";

function hashContent(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function getClientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const { agreementId, paymentOption, signerName, agreeChecked } = body || {};

  if (!agreementId || !paymentOption || !signerName || !agreeChecked) {
    return Response.json(
      {
        error:
          "Agreement, payment option, full name, and explicit agreement are all required.",
      },
      { status: 400 }
    );
  }

  if (!["FULL", "SPLIT"].includes(paymentOption)) {
    return Response.json({ error: "Invalid payment option." }, { status: 400 });
  }

  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: { client: true },
  });

  if (!agreement || agreement.clientId !== session.user.id) {
    return Response.json({ error: "Agreement not found." }, { status: 404 });
  }

  if (agreement.status === "SIGNED") {
    return Response.json(
      { error: "This agreement has already been signed." },
      { status: 409 }
    );
  }

  const agreementHash = hashContent(agreement.content);
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  const payments =
    paymentOption === "FULL"
      ? [{ amount: agreement.totalAmount, type: "FULL", status: "PENDING" }]
      : [
          { amount: agreement.totalAmount / 2, type: "DEPOSIT", status: "PENDING" },
          { amount: agreement.totalAmount / 2, type: "BALANCE", status: "PENDING" },
        ];

  const [, signature] = await prisma.$transaction([
    prisma.agreement.update({
      where: { id: agreement.id },
      data: {
        status: "SIGNED",
        paymentOption,
        payments: { create: payments },
      },
    }),
    prisma.signature.create({
      data: {
        agreementId: agreement.id,
        signerName,
        signerEmail: session.user.email,
        agreementVersion: agreement.version,
        agreementHash,
        ipAddress,
        userAgent,
      },
    }),
  ]);

  try {
    if (process.env.RESEND_API_KEY && process.env.INQUIRY_FROM_EMAIL) {
      const from = process.env.INQUIRY_FROM_EMAIL;
      const adminTo = process.env.INQUIRY_TO_EMAIL;

      const clientSend = await resend.emails.send({
        from,
        to: session.user.email,
        subject: "Your NOW4LATERWEB agreement is signed",
        html: `<p>Hi ${signerName},</p>
          <p>This confirms your NOW4LATERWEB website development agreement
          (version ${agreement.version}) was signed on ${new Date().toLocaleString()}.</p>
          <p>Payment option selected: <strong>${paymentOption === "FULL" ? "Full payment ($1,000)" : "Split payment ($500 + $500)"}</strong></p>
          <p>Keep this email for your records.</p>`,
      });
      if (clientSend.error) {
        console.error("Resend rejected the client signature confirmation:", {
          name: clientSend.error.name,
          message: clientSend.error.message,
        });
      }

      if (adminTo) {
        const adminSend = await resend.emails.send({
          from,
          to: adminTo,
          subject: `Agreement signed: ${agreement.client.email}`,
          html: `<p>${signerName} (${agreement.client.email}) signed agreement v${agreement.version}.</p>
            <p>Payment option: ${paymentOption}</p>`,
        });
        if (adminSend.error) {
          console.error("Resend rejected the admin signature notification:", {
            name: adminSend.error.name,
            message: adminSend.error.message,
          });
        }
      }
    }
  } catch (err) {
    console.error("Signature confirmation email failed:", err);
  }

  return Response.json({ ok: true, signature });
}
