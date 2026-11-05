"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const field = { width: "100%", maxWidth: "420px", padding: "11px 12px", borderRadius: "8px", border: "1px solid var(--border, #d7dce2)", background: "var(--surface, #fff)", color: "var(--text, #171717)" };

export default function NationwideDiscovery() {
  const router = useRouter();
  const [category, setCategory] = useState("web design");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function discover(event) {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/sales/discover", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Nationwide search failed.");
      setMessage("Searched " + data.searchedMarkets + " US metro areas. Found " + data.businessesFound + " results; added " + data.prospectsAdded + " new prospects and skipped " + data.duplicatesSkipped + " duplicates. " + data.failedMarkets + " markets had errors.");
      router.refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <section style={{ border: "1px solid var(--border, #e1e4e8)", borderRadius: "14px", padding: "22px", marginBottom: "28px" }}>
      <div className="section-label">UNITED STATES · MULTI-MARKET DISCOVERY</div>
      <h2 style={{ marginBottom: "8px" }}>Find prospects nationwide</h2>
      <p style={{ opacity: .75, fontSize: "14px", marginBottom: "16px" }}>Searches 24 major US metro areas for a business category and saves new matches into your prospect pipeline. Search results are not yet AI-audited or approved for outreach.</p>
      <form onSubmit={discover} style={{ display: "flex", gap: "12px", alignItems: "end", flexWrap: "wrap" }}>
        <label style={{ display: "grid", gap: "6px", fontSize: "14px", fontWeight: 600 }}>Business category
          <input value={category} onChange={(event) => setCategory(event.target.value)} required maxLength={100} placeholder="e.g. plumbers, dentists, restaurants" style={field} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy || !category.trim()}>{busy ? "Searching US markets..." : "Discover nationwide prospects"}</button>
      </form>
      {message && <p role="status" style={{ marginTop: "14px", fontSize: "14px" }}>{message}</p>}
      {error && <p role="alert" style={{ marginTop: "14px", color: "#b42318", fontSize: "14px" }}>{error}</p>}
    </section>
  );
}
