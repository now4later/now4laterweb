"use client";

import { useState } from "react";

export default function ResetClientPasswordForm({ email }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function resetPassword() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/clients/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setResult(data.tempPassword);
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <button type="button" className="btn btn-secondary" onClick={resetPassword} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
      {result && (
        <strong style={{ fontSize: "13px" }}>
          New temporary password: {result} — save/share it now; it will not be shown again.
        </strong>
      )}
      {error && <span className="form-status error">{error}</span>}
    </span>
  );
}
