import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import SignOutButton from "../../components/SignOutButton";
import ProspectForm from "./ProspectForm";
import ProspectStatus from "./ProspectStatus";
import OutreachDraftForm from "./OutreachDraftForm";

const labels = {
  NEW: "New", RESEARCHING: "Researching", DRAFT_READY: "Draft ready",
  CONTACTED: "Contacted", REPLIED: "Replied", QUALIFIED: "Qualified",
  APPOINTMENT: "Appointment", WON: "Won", LOST: "Lost",
  DO_NOT_CONTACT: "Do not contact",
};
const statusStyle = { fontSize: "12px", padding: "4px 8px", borderRadius: "999px", background: "var(--surface-alt, #f1f3f5)", display: "inline-block" };

export default async function SalesDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/portal");

  const prospects = await prisma.prospect.findMany({
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const count = (status) => prospects.filter((p) => p.status === status).length;
  const stats = [
    ["All prospects", prospects.length],
    ["Need follow-up", prospects.filter((p) => p.followUpAt && p.followUpAt <= new Date() && !["WON", "LOST", "DO_NOT_CONTACT"].includes(p.status)).length],
    ["Replies", count("REPLIED")],
    ["Appointments", count("APPOINTMENT")],
    ["Qualified", count("QUALIFIED")],
    ["Drafts", prospects.reduce((total, p) => total + p.messages.length, 0)],
  ];

  return (
    <main className="container" style={{ padding: "56px 0 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div className="section-label">PRIVATE ADMIN WORKSPACE</div>
          <h1 className="section-title">AI Sales Engine</h1>
          <p className="section-description">Prospect tracking and outreach preparation for NOW4LATERWEB.</p>
        </div>
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <Link href="/admin">Back to admin</Link><SignOutButton />
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "12px", margin: "30px 0" }}>
        {stats.map(([label, value]) => (
          <div key={label} style={{ border: "1px solid var(--border, #e1e4e8)", borderRadius: "12px", padding: "18px" }}>
            <div style={{ fontSize: "13px", opacity: .7 }}>{label}</div>
            <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "6px" }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ border: "1px solid var(--border, #e1e4e8)", borderRadius: "14px", padding: "22px", marginBottom: "28px" }}>
        <h2 style={{ marginBottom: "8px" }}>Add a prospect</h2>
        <p style={{ marginBottom: "18px", opacity: .75, fontSize: "14px" }}>Save a business and its contact details. Adding a prospect does not send an email.</p>
        <ProspectForm />
      </section>

      <section style={{ border: "1px solid var(--border, #e1e4e8)", borderRadius: "14px", padding: "22px" }}>
        <h2 style={{ marginBottom: "16px" }}>Prospect pipeline ({prospects.length})</h2>
        {prospects.length === 0 ? <p style={{ opacity: .7 }}>No prospects yet. Add your first business above.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
              <thead><tr>{["Business", "Contact", "Location", "Status", "Outreach", "Last activity"].map((heading) => <th key={heading} style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid var(--border, #e1e4e8)", fontSize: "13px" }}>{heading}</th>)}</tr></thead>
              <tbody>
                {prospects.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid var(--border, #eee)" }}>
                      <strong>{p.businessName}</strong>
                      {p.website && <div><a href={p.website.startsWith("http") ? p.website : "https://" + p.website} target="_blank" rel="noreferrer">{p.website}</a></div>}
                      {p.email && <div style={{ fontSize: "13px", opacity: .7 }}>{p.email}</div>}
                    </td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid var(--border, #eee)" }}>{p.contactName || "—"}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid var(--border, #eee)" }}>{p.location || "—"}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid var(--border, #eee)" }}><ProspectStatus id={p.id} initialStatus={p.status} initialFollowUpAt={p.followUpAt?.toISOString() || ""} />{p.optedOut && <div style={{ color: "#b42318", fontSize: "12px" }}>Opted out</div>}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid var(--border, #eee)" }}><OutreachDraftForm prospectId={p.id} businessName={p.businessName} disabled={p.optedOut || p.status === "DO_NOT_CONTACT"} />{p.messages.length > 0 && <div style={{ fontSize: "12px", opacity: .7, marginTop: "5px" }}>{p.messages.length} draft(s)</div>}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid var(--border, #eee)" }}>{new Date(p.updatedAt).toLocaleDateString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p style={{ marginTop: "18px", fontSize: "13px", opacity: .7 }}>Drafts are saved for your review only. No messages are sent automatically. Pricing, negotiation, and closing remain yours.</p>
    </main>
  );
}
