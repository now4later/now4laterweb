import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import SignOutButton from "../components/SignOutButton";
import AddClientForm from "./AddClientForm";
import CreateAgreementForm from "./CreateAgreementForm";
import AdminAgreementsTable from "./AdminAgreementsTable";
import AdminUpdateRequestsSection from "./AdminUpdateRequestsSection";
import ResetClientPasswordForm from "./ResetClientPasswordForm";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/portal");

  // Admin sees everything, by design — every route these components call
  // re-checks session.user.role === "ADMIN" on the server before returning
  // or changing anything, so this page's own access doesn't rely on the UI
  // alone. Clients never reach this page: middleware.js redirects any
  // non-admin session away from /admin, and every /api/portal/* route
  // scopes its query to the logged-in client's own id — no client-facing
  // endpoint accepts another client's id as a parameter.
  const [clients, agreements, updateRequests] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agreement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { email: true, businessName: true } },
        signature: true,
        payments: true,
      },
    }),
    prisma.updateRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, email: true, businessName: true } },
        files: true,
      },
    }),
  ]);

  return (
    <main className="container" style={{ padding: "70px 0" }}>
      <div className="section-label">ADMIN</div>
      <h1 className="section-title">NOW4LATERWEB Admin Dashboard</h1>
      <p className="section-description" style={{ marginBottom: "30px" }}>
        Signed in as {session.user.email}
      </p>

      <SignOutButton />

      <div style={{ marginTop: "40px" }}>
        <h3>Add a client</h3>
        <AddClientForm />
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Clients ({clients.length})</h3>
        {clients.length === 0 ? (
          <p style={{ color: "var(--text-light)", marginTop: "10px" }}>
            No clients yet. Add one above.
          </p>
        ) : (
          <ul style={{ marginTop: "10px" }}>
            {clients.map((c) => (
              <li key={c.id}>
                <div>
                  {c.email} {c.businessName ? `— ${c.businessName}` : ""} —
                  joined {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <ResetClientPasswordForm email={c.email} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Create an agreement</h3>
        <CreateAgreementForm clients={clients} />
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Agreements &amp; payments ({agreements.length})</h3>
        <p style={{ color: "var(--text-light)", marginTop: "6px" }}>
          Mark a payment paid once you've actually received it, and update
          project status as work progresses — both update immediately in
          the client's portal.
        </p>
        <AdminAgreementsTable agreements={agreements} />
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3>Update requests ({updateRequests.length})</h3>
        <p style={{ color: "var(--text-light)", marginTop: "6px" }}>
          Files attach a secure link — only you and the client who submitted
          them can open them.
        </p>
        <AdminUpdateRequestsSection updateRequests={updateRequests} />
      </div>
    </main>
  );
}
