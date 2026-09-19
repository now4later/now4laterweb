"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAgreementForm({ clients }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/admin/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
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
    return (
      <p style={{ color: "var(--text-light)", marginTop: "10px" }}>
        Add a client first, then you can create an agreement for them.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="contact-form"
      style={{ margin: "15px 0 0" }}
    >
      <div className="form-row">
        <label htmlFor="agreementClient">Client</label>
        <select
          id="agreementClient"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.email} {c.businessName ? `(${c.businessName})` : ""}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Creating..." : "Create $1,000 Agreement"}
      </button>

      {status === "done" && (
        <p className="form-status success">
          Agreement created. It's now waiting in the client's portal for
          review and signature.
        </p>
      )}
      {error && <p className="form-status error">{error}</p>}
    </form>
  );
}
