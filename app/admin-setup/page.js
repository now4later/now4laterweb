"use client";

import { useState } from "react";

export default function AdminSetupPage() {
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
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Admin setup failed.");
        return;
      }

      setMessage("Admin account created. You can now sign in.");
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
      <div className="section-label">ONE-TIME SETUP</div>
      <h1 className="section-title">Create Admin Account</h1>
      <p className="section-description" style={{ marginBottom: "28px" }}>
        Use this page once to create the initial NOW4LATERWEB administrator.
        The setup is protected by a private setup token and automatically
        locks after an admin account exists.
      </p>

      <form onSubmit={submit} className="contact-form">
        <div className="form-row">
          <label htmlFor="setup-email">Admin Email</label>
          <input
            id="setup-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
        </div>

        <div className="form-row">
          <label htmlFor="setup-password">Admin Password</label>
          <input
            id="setup-password"
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
          <label htmlFor="setup-token">Private Setup Token</label>
          <input
            id="setup-token"
            type="password"
            required
            value={form.token}
            onChange={(e) => setForm({ ...form, token: e.target.value })}
            autoComplete="off"
          />
          <small>This must exactly match ADMIN_SETUP_TOKEN in Vercel.</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating Admin..." : "Create Admin Account"}
        </button>

        {message && <p className="form-status success">{message}</p>}
        {error && <p className="form-status error">{error}</p>}
      </form>
    </main>
  );
}
