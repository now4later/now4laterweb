import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const agreement = await prisma.agreement.findFirst({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { signature: true, payments: true },
  });

  return Response.json({ agreement });
}
