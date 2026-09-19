"use client";

import { useState } from "react";
import { formatCents } from "../../lib/money";

const PROJECT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "REVIEW", "LAUNCHED"];

export default function AdminAgreementsTable({ agreements }) {
  const [items, setItems] = useState(agreements);
  const [savingId, setSavingId] = useState(null);

  async function togglePayment(agreementId, payment) {
    const nextStatus = payment.status === "PAID" ? "PENDING" : "PAID";
    setSavingId(payment.id);
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((a) =>
            a.id !== agreementId
              ? a
              : {
                  ...a,
                  payments: a.payments.map((p) =>
                    p.id === payment.id ? { ...p, status: nextStatus } : p
                  ),
                }
          )
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  async function changeProjectStatus(agreementId, projectStatus) {
    setSavingId(agreementId);
    try {
      const res = await fetch(`/api/admin/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((a) => (a.id === agreementId ? { ...a, projectStatus } : a))
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p style={{ color: "var(--text-light)", marginTop: "10px" }}>
        No agreements yet.
      </p>
    );
  }

  return (
    <table style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
          <th style={{ padding: "10px 8px" }}>Client</th>
          <th style={{ padding: "10px 8px" }}>Version</th>
          <th style={{ padding: "10px 8px" }}>Status</th>
          <th style={{ padding: "10px 8px" }}>Payment option</th>
          <th style={{ padding: "10px 8px" }}>Payments</th>
          <th style={{ padding: "10px 8px" }}>Project status</th>
          <th style={{ padding: "10px 8px" }}>Signed</th>
        </tr>
      </thead>
      <tbody>
        {items.map((a) => (
          <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "10px 8px" }}>{a.client.email}</td>
            <td style={{ padding: "10px 8px" }}>v{a.version}</td>
            <td style={{ padding: "10px 8px" }}>{a.status}</td>
            <td style={{ padding: "10px 8px" }}>{a.paymentOption || "—"}</td>
            <td style={{ padding: "10px 8px" }}>
              {a.payments.length === 0 ? (
                "—"
              ) : (
                <div style={{ display: "grid", gap: "6px" }}>
                  {a.payments.map((p) => (
                    <div key={p.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span>
                        {p.type}: {formatCents(p.amount)} —{" "}
                        <strong>{p.status}</strong>
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        disabled={savingId === p.id}
                        onClick={() => togglePayment(a.id, p)}
                      >
                        {p.status === "PAID" ? "Mark Pending" : "Mark Paid"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </td>
            <td style={{ padding: "10px 8px" }}>
              <select
                value={a.projectStatus}
                disabled={savingId === a.id}
                onChange={(e) => changeProjectStatus(a.id, e.target.value)}
                style={{
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  padding: "0 8px",
                }}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </td>
            <td style={{ padding: "10px 8px" }}>
              {a.signature
                ? `${a.signature.signerName} — ${new Date(
                    a.signature.signedAt
                  ).toLocaleDateString()}`
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
