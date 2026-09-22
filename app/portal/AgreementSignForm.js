"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AgreementSignForm({ agreement }) {
  const router = useRouter();
  const [signerName, setSignerName] = useState("");
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSign(e) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/portal/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementId: agreement.id,
          paymentOption: "PAYMENT_PLAN",
          signerName,
          agreeChecked,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to sign agreement.");
        setStatus("error");
        return;
      }

      router.refresh();
    } catch (err) {
      setError("Failed to sign agreement.");
      setStatus("error");
    }
  }

  return (
    <div>
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "25px", maxHeight: "520px", overflowY: "auto", whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: 1.6, marginBottom: "25px" }}>
        {agreement.content}
      </div>

      <form onSubmit={handleSign} className="contact-form" style={{ margin: 0 }}>
        <div className="form-row">
          <label>Payment plan</label>
          <div style={{ padding: "12px", border: "1px solid var(--border)", borderRadius: "10px" }}>
            <strong>5 payments of $200.00 = $1,000.00</strong>
            <p style={{ marginTop: "6px", color: "var(--text-light)" }}>
              Your exact due dates are listed in the agreement above.
            </p>
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="signerName">Type your full legal name to sign</label>
          <input id="signerName" type="text" required value={signerName} onChange={(e) => setSignerName(e.target.value)} />
        </div>

        <div className="form-row">
          <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontWeight: 400 }}>
            <input type="checkbox" checked={agreeChecked} onChange={(e) => setAgreeChecked(e.target.checked)} style={{ marginTop: "3px" }} />
            <span>I have read and agree to the agreement above, and I intend the typed name and this action to serve as my electronic signature.</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={status === "sending" || !agreeChecked || !signerName}>
          {status === "sending" ? "Signing..." : "I Agree & Sign"}
        </button>

        {error && <p className="form-status error">{error}</p>}
      </form>
    </div>
  );
}
