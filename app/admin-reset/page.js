"use client";

import { useState } from "react";

export default function AdminResetPasswordPage() {
  const [form, setForm] = useState({ email: "", password: "", token: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Password reset failed.");
        return;
      }

      setMessage("Admin password reset successfully. You can now sign in.");
      setForm({ email: "", password: "", token: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="container"
      style={{ padding: "70px 24px", maxWidth: "720px", margin: "0 auto" }}
    >
      <div className="section-label">ADMIN PASSWORD RESET</div>
      <h1 className="section-title">Reset Admin Password</h1>
      <p className="section-description" style={{ marginBottom: "28px" }}>
        Use your private setup token to reset the existing NOW4LATERWEB administrator password.
        Never share the token or new password with anyone.
      </p>

      <form onSubmit={submit} className="contact-form">
        <div className="form-row">
          <label htmlFor="reset-email">Admin Email</label>
          <input
            id="reset-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
        </div>

        <div className="form-row">
          <label htmlFor="reset-password">New Admin Password</label>
          <input
            id="reset-password"
            type="password"
            required
            minLength={12}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
          />
          <small>Use at least 12 characters. Do not send this password to anyone.</small>
        </div>

        <div className="form-row">
          <label htmlFor="reset-token">Private Setup Token</label>
          <input
            id="reset-token"
            type="password"
            required
            value={form.token}
            onChange={(e) => setForm({ ...form, token: e.target.value })}
            autoComplete="off"
          />
          <small>This must exactly match ADMIN_SETUP_TOKEN in Vercel.</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Resetting Password..." : "Reset Admin Password"}
        </button>

        {message && <p className="form-status success">{message}</p>}
        {error && <p className="form-status error">{error}</p>}
      </form>
    </main>
  );
}
