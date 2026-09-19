import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const file = await prisma.projectFile.findUnique({
    where: { id: params.id },
  });

  if (!file) {
    return Response.json({ error: "File not found." }, { status: 404 });
  }

  const isOwner = file.clientId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.redirect(file.url);
}
