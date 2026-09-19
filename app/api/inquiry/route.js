import { Resend } from "resend";

// Server-side only. RESEND_API_KEY is never sent to the browser.
const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, businessName, projectType, message } = body || {};

    if (!name || !email) {
      return Response.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const to = process.env.INQUIRY_TO_EMAIL;
    const from = process.env.INQUIRY_FROM_EMAIL;

    if (!to || !from || !process.env.RESEND_API_KEY) {
      console.error(
        "Inquiry email not sent: missing RESEND_API_KEY, INQUIRY_TO_EMAIL, or INQUIRY_FROM_EMAIL env vars."
      );
      return Response.json(
        { error: "Email is not configured yet." },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New NOW4LATERWEB inquiry from ${name}`,
      html: `
        <h2>New website inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Business Name:</strong> ${escapeHtml(businessName || "—")}</p>
        <p><strong>Project Type:</strong> ${escapeHtml(projectType || "—")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message || "—").replace(/\n/g, "<br/>")}</p>
      `,
    });

    if (error) {
      console.error("Resend rejected the inquiry email:", {
        name: error.name,
        message: error.message,
      });
      return Response.json(
        {
          error: "Resend rejected the inquiry email.",
          details: error.message,
        },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("Inquiry send failed:", err);
    return Response.json(
      { error: "Failed to send inquiry." },
      { status: 500 }
    );
  }
}
