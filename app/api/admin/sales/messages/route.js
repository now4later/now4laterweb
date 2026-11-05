import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const prospectId = String(body.prospectId || "");
  const subject = String(body.subject || "").trim().slice(0, 240);
  const messageBody = String(body.body || "").trim().slice(0, 12000);
  if (!prospectId || !subject || !messageBody) {
    return Response.json({ error: "Prospect, subject, and message are required." }, { status: 400 });
  }

  const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } });
  if (!prospect) return Response.json({ error: "Prospect not found." }, { status: 404 });
  if (prospect.optedOut || prospect.status === "DO_NOT_CONTACT") {
    return Response.json({ error: "This prospect is marked do-not-contact. No outreach draft can be saved." }, { status: 409 });
  }

  const draft = await prisma.outreachMessage.create({
    data: { prospectId, subject, body: messageBody, status: "DRAFT" },
  });
  await prisma.prospect.update({ where: { id: prospectId }, data: { status: "DRAFT_READY" } });
  return Response.json({ draft }, { status: 201 });
}
