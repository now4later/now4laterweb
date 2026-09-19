import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const updateRequests = await prisma.updateRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, email: true, businessName: true } },
      files: true,
    },
  });

  return Response.json({ updateRequests });
}
