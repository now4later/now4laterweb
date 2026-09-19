import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { resend } from "../../../../lib/resend";

const CATEGORIES = ["Photos", "Videos", "Events", "Text/Content", "Links", "Other"];

// GET /api/portal/update-requests — list this client's own requests + files
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const updateRequests = await prisma.updateRequest.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { files: true },
  });

  return Response.json({ updateRequests });
}

// POST /api/portal/update-requests — create a new update request
// Body: { category, description }
// Files are attached afterward via /api/portal/upload, referencing the
// returned updateRequest.id.
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const { category, description } = await request.json();

  if (!category || !CATEGORIES.includes(category)) {
    return Response.json({ error: "Valid category is required." }, { status: 400 });
  }
  if (!description || !description.trim()) {
    return Response.json({ error: "Description is required." }, { status: 400 });
  }

  const updateRequest = await prisma.updateRequest.create({
    data: {
      clientId: session.user.id,
      category,
      description: description.trim(),
    },
  });

  try {
    if (
      process.env.RESEND_API_KEY &&
      process.env.INQUIRY_FROM_EMAIL &&
      process.env.INQUIRY_TO_EMAIL
    ) {
      await resend.emails.send({
        from: process.env.INQUIRY_FROM_EMAIL,
        to: process.env.INQUIRY_TO_EMAIL,
        subject: `New update request: ${session.user.email}`,
        html: `<p><strong>${session.user.email}</strong> submitted a new update request.</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p>View it in the admin dashboard.</p>`,
      });
    }
  } catch (err) {
    console.error("Update request notification email failed:", err);
  }

  return Response.json({ updateRequest });
}
