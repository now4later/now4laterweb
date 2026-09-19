import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

const VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "REVIEW", "LAUNCHED"];

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { projectStatus } = await request.json();
  if (!VALID_STATUSES.includes(projectStatus)) {
    return Response.json({ error: "Invalid project status." }, { status: 400 });
  }

  const agreement = await prisma.agreement.update({
    where: { id: params.id },
    data: { projectStatus },
  });

  return Response.json({ agreement });
}
