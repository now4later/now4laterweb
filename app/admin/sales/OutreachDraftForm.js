"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OutreachDraftForm({ prospectId, businessName, disabled = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/sales/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, subject, body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save draft.");
      setMessage("Draft saved. Nothing has been sent.");
      setSubject(""); setBody(""); setOpen(false); router.refresh();
    } catch (error) {
      setMessage(error.message || "Could not save draft.");
    } finally { setBusy(false); }
  }

  return <div style={{ marginTop: "8px" }}>
    <button type="button" className="btn btn-secondary" disabled={disabled}
      onClick={() => setOpen(!open)} style={{ fontSize: "12px", padding: "6px 9px" }}>
      {open ? "Close draft" : "Prepare email"}
    </button>
    {open && <form onSubmit={save} style={{ marginTop: "10px", minWidth: "260px", display: "grid", gap: "8px" }}>
      <label style={{ fontSize: "12px" }}>Subject
        <input required value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder={`A quick idea for ${businessName}`}
          style={{ display: "block", width: "100%", marginTop: "4px", padding: "8px", border: "1px solid var(--border, #ddd)", borderRadius: "6px", background: "var(--surface, #fff)", color: "inherit" }} />
      </label>
      <label style={{ fontSize: "12px" }}>Email draft
        <textarea required rows={5} value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Write a short, personal introduction..."
          style={{ display: "block", width: "100%", marginTop: "4px", padding: "8px", border: "1px solid var(--border, #ddd)", borderRadius: "6px", background: "var(--surface, #fff)", color: "inherit" }} />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving..." : "Save draft only"}</button>
    </form>}
    {message && <p role="status" style={{ fontSize: "12px", marginTop: "6px" }}>{message}</p>}
  </div>;
}
