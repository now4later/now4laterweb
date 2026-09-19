"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddClientForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, businessName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create client.");
      } else {
        setResult(data);
        setEmail("");
        setName("");
        setBusinessName("");
        router.refresh();
      }
    } catch (err) {
      setError("Failed to create client.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="contact-form" style={{ margin: "15px 0 0" }}>
        <div className="form-row">
          <label htmlFor="clientEmail">Client email</label>
          <input
            id="clientEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="clientName">Client name</label>
          <input
            id="clientName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="clientBusiness">Business name</label>
          <input
            id="clientBusiness"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Adding..." : "Add Client"}
        </button>
        {error && <p className="form-status error">{error}</p>}
      </form>

      {result && (
        <p className="form-status success" style={{ maxWidth: "640px" }}>
          Client created: {result.client.email}. Temporary password (share
          this with them yourself — it won't be shown again):{" "}
          <strong>{result.tempPassword}</strong>
        </p>
      )}
    </div>
  );
}
