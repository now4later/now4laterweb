import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await request.json();
  if (!["PAID", "PENDING"].includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id: params.id },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });

  return Response.json({ payment });
}
