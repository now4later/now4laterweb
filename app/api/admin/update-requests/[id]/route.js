import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "DONE"];

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const updateRequest = await prisma.updateRequest.update({
    where: { id: params.id },
    data: { status },
  });

  return Response.json({ updateRequest });
}
