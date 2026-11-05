"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const qualities = ["", "No website", "Outdated", "Needs improvement", "Mobile-friendly", "Modern"];

export default function ProspectResearchForm({ prospect }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(prospect.category || "");
  const [source, setSource] = useState(prospect.source || "");
  const [websiteQuality, setWebsiteQuality] = useState(prospect.websiteQuality || "");
  const [researchNotes, setResearchNotes] = useState(prospect.researchNotes || "");
  const [busy, setBusy] = useState(false);
  const [researchBusy, setResearchBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [report, setReport] = useState(null);

  async function runResearch() {
    setResearchBusy(true); setMessage(""); setReport(null);
    try {
      const response = await fetch("/api/admin/sales/research", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: prospect.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Online research failed.");
      setReport(result.report);
      setMessage(result.saved ? "Website research saved to this prospect." : "No website is listed. A separate public social-search pass is still needed.");
      router.refresh();
    } catch (error) { setMessage(error.message || "Online research failed."); }
    finally { setResearchBusy(false); }
  }

  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/sales/prospects", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prospect.id, category, source, websiteQuality, researchNotes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save research.");
      setMessage("Research saved."); setOpen(false); router.refresh();
    } catch (error) { setMessage(error.message || "Could not save research."); }
    finally { setBusy(false); }
  }

  const fieldStyle = { display: "block", width: "100%", marginTop: "4px", padding: "8px", border: "1px solid var(--border, #ddd)", borderRadius: "6px", background: "var(--surface, #fff)", color: "inherit" };
  return <div style={{ marginTop: "8px" }}>
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(!open)} style={{ fontSize: "12px", padding: "6px 9px" }}>{open ? "Close research" : "Research details"}</button>
      <button type="button" className="btn btn-primary" onClick={runResearch} disabled={researchBusy} style={{ fontSize: "12px", padding: "6px 9px" }}>{researchBusy ? "Scanning website..." : "Run online research"}</button>
    </div>
    {open && <form onSubmit={save} style={{ marginTop: "10px", minWidth: "260px", display: "grid", gap: "8px" }}>
      <label style={{ fontSize: "12px" }}>Business category<input value={category} onChange={(e) => setCategory(e.target.value)} maxLength={100} placeholder="e.g. auto repair" style={fieldStyle} /></label>
      <label style={{ fontSize: "12px" }}>Research source<input value={source} onChange={(e) => setSource(e.target.value)} maxLength={160} placeholder="e.g. business website, directory" style={fieldStyle} /></label>
      <label style={{ fontSize: "12px" }}>Website assessment<select value={websiteQuality} onChange={(e) => setWebsiteQuality(e.target.value)} style={fieldStyle}>{qualities.map((quality) => <option key={quality} value={quality}>{quality || "Not assessed"}</option>)}</select></label>
      <label style={{ fontSize: "12px" }}>Research notes<textarea rows={4} maxLength={5000} value={researchNotes} onChange={(e) => setResearchNotes(e.target.value)} placeholder="Research findings are saved here automatically; you can add notes too." style={fieldStyle} /></label>
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save research"}</button>
    </form>}
    {report && <div style={{ marginTop: "10px", padding: "10px", border: "1px solid var(--border, #ddd)", borderRadius: "8px", fontSize: "12px", overflowWrap: "anywhere" }}>
      <strong>{report.websiteStatus}</strong>
      {report.title && <p>Title: {report.title}</p>}
      {report.description && <p>{report.description}</p>}
      <strong>Social profiles linked from website</strong>
      {report.socialProfiles?.length ? <ul>{report.socialProfiles.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{url}</a></li>)}</ul> : <p>No supported social links found on the website.</p>}
      <strong>Website observations</strong><ul>{report.observations?.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>}
    {message && <p role="status" style={{ fontSize: "12px", marginTop: "6px" }}>{message}</p>}
  </div>;
}
