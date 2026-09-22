import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { generateAgreementText } from "../../../../lib/agreement-template";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/agreements — list every agreement, for admin oversight
export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const agreements = await prisma.agreement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, email: true, name: true, businessName: true } },
      signature: true,
      payments: true,
    },
  });

  return Response.json({ agreements });
}

// POST /api/admin/agreements — create a new agreement for a client
// Body: { clientId }
export async function POST(request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { clientId, paymentDates } = await request.json();
  if (!clientId) {
    return Response.json({ error: "clientId is required." }, { status: 400 });
  }

  if (!Array.isArray(paymentDates) || paymentDates.length !== 5 || paymentDates.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d))) {
    return Response.json({ error: "Five valid payment due dates are required." }, { status: 400 });
  }

  const client = await prisma.user.findUnique({ where: { id: clientId } });
  if (!client || client.role !== "CLIENT") {
    return Response.json({ error: "Client not found." }, { status: 404 });
  }

  const existingCount = await prisma.agreement.count({
    where: { clientId },
  });

  const content = generateAgreementText({
    clientName: client.name || client.email,
    businessName: client.businessName,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    paymentDates,
  });

  const agreement = await prisma.agreement.create({
    data: {
      clientId,
      version: existingCount + 1,
      content,
      status: "PENDING",
    },
  });

  return Response.json({ agreement });
}
