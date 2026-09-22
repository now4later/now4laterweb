"use client";

import { useState } from "react";

export default function ResetClientPasswordForm({ email }) {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function savePassword(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/clients/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password.");
        return;
      }

      setResult("Password updated successfully. Use the password you just entered to test the client portal.");
      setPassword("");
    } catch {
      setError("Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={savePassword} style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New client password"
        minLength={8}
        required
        autoComplete="new-password"
        style={{ maxWidth: "240px" }}
      />
      <button type="submit" className="btn btn-secondary" disabled={loading}>
        {loading ? "Saving..." : "Set Password"}
      </button>
      {result && <span className="form-status success">{result}</span>}
      {error && <span className="form-status error">{error}</span>}
    </form>
  );
}
