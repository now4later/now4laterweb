"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  ["NEW", "New"], ["RESEARCHING", "Researching"], ["DRAFT_READY", "Draft ready"],
  ["CONTACTED", "Contacted"], ["REPLIED", "Replied"], ["QUALIFIED", "Qualified"],
  ["APPOINTMENT", "Appointment"], ["WON", "Won"], ["LOST", "Lost"],
  ["DO_NOT_CONTACT", "Do not contact"],
];

export default function ProspectStatus({ id, initialStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(next) {
    const previous = status;
    setStatus(next); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/sales/prospects", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update status.");
      router.refresh();
    } catch (err) {
      setStatus(previous);
      setError(err.message || "Could not update status.");
    } finally { setBusy(false); }
  }

  return <div>
    <select aria-label="Prospect status" value={status} disabled={busy} onChange={(event) => change(event.target.value)}
      style={{ padding: "7px 9px", borderRadius: "8px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)", color: "inherit", maxWidth: "150px" }}>
      {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    {error && <div role="alert" style={{ color: "#b42318", fontSize: "12px" }}>{error}</div>}
  </div>;
}
