import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }
  return Response.json({
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  });
}
