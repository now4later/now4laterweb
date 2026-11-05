"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldStyle = {
  width: "100%", padding: "11px 12px", borderRadius: "8px",
  border: "1px solid var(--border, #d7dce2)", background: "var(--surface, #fff)",
  color: "var(--text, #171717)", marginTop: "6px",
};

export default function ProspectForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true); setError(""); setSaved(false);
    const data = Object.fromEntries(new FormData(formElement).entries());
    try {
      const response = await fetch("/api/admin/sales/prospects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save prospect.");
      formElement.reset();
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to save prospect.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px", alignItems: "end" }}>
      {[
        ["businessName", "Business name *", true],
        ["contactName", "Contact person"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["website", "Website"],
        ["location", "City / area"],
        ["category", "Business type"],
      ].map(([name, label, required]) => (
        <label key={name} style={{ display: "block", fontSize: "14px", fontWeight: 600 }}>
          {label}
          <input name={name} required={!!required} type={name === "email" ? "email" : "text"} style={fieldStyle} />
        </label>
      ))}
      <label style={{ display: "block", fontSize: "14px", fontWeight: 600, gridColumn: "1 / -1" }}>
        Research notes
        <textarea name="notes" rows={3} style={fieldStyle} />
      </label>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px", alignItems: "center" }}>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving..." : "Add prospect"}</button>
        {saved && <span role="status">Prospect saved.</span>}
        {error && <span role="alert" style={{ color: "#b42318" }}>{error}</span>}
      </div>
    </form>
  );
}
