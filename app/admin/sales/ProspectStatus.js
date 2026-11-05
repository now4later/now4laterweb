"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  ["NEW", "New"], ["RESEARCHING", "Researching"], ["DRAFT_READY", "Draft ready"],
  ["CONTACTED", "Contacted"], ["REPLIED", "Replied"], ["QUALIFIED", "Qualified"],
  ["APPOINTMENT", "Appointment"], ["WON", "Won"], ["LOST", "Lost"],
  ["DO_NOT_CONTACT", "Do not contact"],
];

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function ProspectStatus({ id, initialStatus, initialFollowUpAt }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [followUpAt, setFollowUpAt] = useState(toLocalInput(initialFollowUpAt));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function update(payload, onSuccess) {
    setBusy(true); setError(""); setSaved(false);
    try {
      const response = await fetch("/api/admin/sales/prospects", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update prospect.");
      if (onSuccess) onSuccess(result.prospect);
      setSaved(true); router.refresh();
    } catch (err) {
      setError(err.message || "Could not update prospect.");
    } finally { setBusy(false); }
  }

  return <div style={{ minWidth: "150px" }}>
    <select aria-label="Prospect status" value={status} disabled={busy}
      onChange={(event) => {
        const next = event.target.value;
        update({ status: next }, () => setStatus(next));
      }}
      style={{ padding: "7px 9px", borderRadius: "8px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)", color: "inherit", maxWidth: "150px" }}>
      {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    <label style={{ display: "block", fontSize: "11px", marginTop: "8px", opacity: .8 }}>Follow-up
      <input aria-label="Follow-up date and time" type="datetime-local" value={followUpAt}
        onChange={(event) => setFollowUpAt(event.target.value)} disabled={busy}
        style={{ display: "block", width: "100%", marginTop: "3px", padding: "6px", border: "1px solid var(--border, #ddd)", borderRadius: "6px", background: "var(--surface, #fff)", color: "inherit", fontSize: "11px" }} />
    </label>
    <button type="button" disabled={busy} onClick={() => update({ followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null })}
      style={{ fontSize: "11px", marginTop: "5px", padding: "4px 7px" }}>Save follow-up</button>
    {saved && <div style={{ fontSize: "11px", color: "green" }}>Saved</div>}
    {error && <div role="alert" style={{ color: "#b42318", fontSize: "11px" }}>{error}</div>}
  </div>;
}
