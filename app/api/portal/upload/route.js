import { handleUpload } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
];

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // clientPayload carries { updateRequestId } set by the browser at
        // upload time. Confirm that update request actually belongs to
        // this logged-in client before issuing an upload token.
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        if (payload.updateRequestId) {
          const owned = await prisma.updateRequest.findFirst({
            where: { id: payload.updateRequestId, clientId: session.user.id },
          });
          if (!owned) {
            throw new Error("Update request not found for this client.");
          }
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            clientId: session.user.id,
            updateRequestId: payload.updateRequestId || null,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { clientId, updateRequestId } = JSON.parse(tokenPayload);
        await prisma.projectFile.create({
          data: {
            clientId,
            updateRequestId,
            url: blob.url,
            filename: blob.pathname,
          },
        });
      },
    });

    return Response.json(jsonResponse);
  } catch (err) {
    console.error("Blob upload failed:", err);
    return Response.json({ error: err.message }, { status: 400 });
  }
}
