import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { formatCents } from "../../lib/money";
import SignOutButton from "../components/SignOutButton";
import AgreementSignForm from "./AgreementSignForm";
import UpdateRequestForm from "./UpdateRequestForm";

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Scoped strictly to this client's own id — never queries other clients.
  const agreement = await prisma.agreement.findFirst({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { signature: true, payments: true },
  });

  const updateRequests = await prisma.updateRequest.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { files: true },
  });

  return (
    <main className="container" style={{ padding: "70px 0" }}>
      <div className="section-label">CLIENT PORTAL</div>
      <h1 className="section-title">Welcome, {session.user.email}</h1>
      <p className="section-description" style={{ marginBottom: "30px" }}>
        This is your private dashboard. Only you can see the information
        below.
      </p>

      <SignOutButton />

      <div style={{ marginTop: "40px" }}>
        <h3>Your agreement</h3>

        {!agreement && (
          <p style={{ color: "var(--text-light)", marginTop: "10px" }}>
            No agreement on file yet. NOW4LATERWEB will prepare your
            agreement and it will appear here for you to review and sign.
          </p>
        )}

        {agreement && agreement.status === "PENDING" && (
          <div style={{ marginTop: "15px" }}>
            <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>
              Please review the agreement below, choose a payment option, and
              sign to confirm.
            </p>
            <AgreementSignForm agreement={agreement} />
          </div>
        )}

        {agreement && agreement.status === "SIGNED" && (
          <div style={{ marginTop: "15px" }}>
            <p style={{ color: "var(--green)", fontWeight: 700 }}>
              ✓ Signed on{" "}
              {new Date(agreement.signature.signedAt).toLocaleDateString()}
            </p>
            <p style={{ marginTop: "8px" }}>
              Payment option:{" "}
              <strong>
                5 payments of $200.00
              </strong>
            </p>
            <p style={{ marginTop: "4px" }}>
              Project status:{" "}
              <strong>{agreement.projectStatus.replace("_", " ")}</strong>
            </p>

            <h4 style={{ marginTop: "25px" }}>Payments</h4>
            <ul style={{ marginTop: "8px" }}>
              {agreement.payments.map((p) => (
                <li key={p.id}>
                  {p.type} — {formatCents(p.amount)} —{" "}
                  <strong>{p.status}</strong>
                  {p.dueDate &&
                    ` — due ${new Date(p.dueDate).toLocaleDateString()}`}
                </li>
              ))}
            </ul>

            <details style={{ marginTop: "25px" }}>
              <summary>View signed agreement text</summary>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "14px",
                  marginTop: "12px",
                  color: "var(--text-light)",
                }}
              >
                {agreement.content}
              </div>
            </details>
          </div>
        )}
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Request a website update</h3>
        <p style={{ color: "var(--text-light)", marginTop: "8px" }}>
          Photos, videos, event dates, text, links, or other minor changes —
          submit a request below and attach any files.
        </p>
        <UpdateRequestForm />
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Your update requests</h3>
        {updateRequests.length === 0 ? (
          <p style={{ color: "var(--text-light)", marginTop: "10px" }}>
            You haven't submitted any update requests yet.
          </p>
        ) : (
          <ul style={{ marginTop: "10px", display: "grid", gap: "16px" }}>
            {updateRequests.map((ur) => (
              <li
                key={ur.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {ur.category} — <span>{ur.status.replace("_", " ")}</span>
                </div>
                <p style={{ marginTop: "6px", color: "var(--text-light)" }}>
                  {ur.description}
                </p>
                <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--text-light)" }}>
                  Submitted {new Date(ur.createdAt).toLocaleDateString()}
                </p>
                {ur.files.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    {ur.files.map((f) => (
                      <a
                        key={f.id}
                        href={`/api/files/${f.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginRight: "10px",
                          fontSize: "13px",
                          color: "var(--blue)",
                          fontWeight: 600,
                        }}
                      >
                        📎 {f.filename.split("/").pop()}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
