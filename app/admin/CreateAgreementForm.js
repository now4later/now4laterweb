"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function addDays(dateString, days) {
  const d = new Date(dateString + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "To be confirmed";
  return new Date(value + "T12:00:00").toLocaleDateString("en-US");
}

function buildPreview({ client, dates }) {
  const who = client.businessName ? `${client.name || client.email} (${client.businessName})` : (client.name || client.email);
  const rows = dates.map((d, i) => `Payment ${i + 1} — $200.00 — due ${formatDate(d)}`).join("\n");
  return `NOW4LATERWEB — WEBSITE DEVELOPMENT & MAINTENANCE AGREEMENT

Prepared for: ${who}
Total project price: $1,000.00

PAYMENT PLAN — FIVE $200 PAYMENTS
${rows}

MANAGEMENT & MAINTENANCE
• $75 per individual update request, OR
• $75/month for ongoing website maintenance and management.

NONPAYMENT
Payments must be received by the scheduled due dates. If a payment is not
properly received, NOW4LATERWEB may suspend services after notice. If the
required payment remains unpaid, the website service agreement and website
availability may be terminated due to insufficient funds.

The full agreement shown to the client will include the complete scope,
revisions, timeline, ownership, third-party services, termination,
electronic signature, and other terms.
`;
}

export default function CreateAgreementForm({ clients }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const today = new Date().toISOString().slice(0, 10);
  const [paymentDates, setPaymentDates] = useState(
    Array.from({ length: 5 }, (_, i) => addDays(today, i * 30))
  );
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const client = useMemo(
    () => clients.find((c) => c.id === clientId) || clients[0],
    [clients, clientId]
  );

  function updateDate(index, value) {
    setPaymentDates((prev) => prev.map((d, i) => (i === index ? value : d)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/admin/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, paymentDates }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create agreement.");
        setStatus("error");
        return;
      }

      setStatus("done");
      router.refresh();
    } catch (err) {
      setError("Failed to create agreement.");
      setStatus("error");
    }
  }

  if (clients.length === 0) {
    return <p style={{ color: "var(--text-light)", marginTop: "10px" }}>Add a client first, then you can create an agreement for them.</p>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="contact-form" style={{ margin: "15px 0 0" }}>
        <div className="form-row">
          <label htmlFor="agreementClient">Client</label>
          <select id="agreementClient" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.email} {c.businessName ? `(${c.businessName})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Payment due dates</label>
          <div style={{ display: "grid", gap: "10px" }}>
            {paymentDates.map((d, i) => (
              <label key={i} style={{ display: "grid", gap: "5px" }}>
                <span>Payment {i + 1} — $200</span>
                <input type="date" value={d} required onChange={(e) => updateDate(i, e.target.value)} />
              </label>
            ))}
          </div>
          <small style={{ color: "var(--text-light)" }}>Dates default to 30-day intervals. You can change each date before creating the agreement.</small>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(true)}>
            Preview Agreement
          </button>
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {status === "sending" ? "Creating..." : "Create & Send to Client Portal"}
          </button>
        </div>

        {status === "done" && (
          <p className="form-status success">Agreement created. It is now available in the client's portal for review and signature.</p>
        )}
        {error && <p className="form-status error">{error}</p>}
      </form>

      {showPreview && (
        <div style={{ marginTop: "20px", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>Agreement Preview — Not Sent</h4>
            <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: "15px", fontFamily: "inherit", lineHeight: 1.55, fontSize: "14px" }}>
            {buildPreview({ client, dates: paymentDates })}
          </pre>
        </div>
      )}
    </div>
  );
}
