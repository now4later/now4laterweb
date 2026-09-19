"use client";

import { useState } from "react";

const STATUSES = ["OPEN", "IN_PROGRESS", "DONE"];

export default function AdminUpdateRequestsSection({ updateRequests }) {
  const [items, setItems] = useState(updateRequests);
  const [savingId, setSavingId] = useState(null);

  async function handleStatusChange(id, status) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/update-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((ur) => (ur.id === id ? { ...ur, status } : ur))
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p style={{ color: "var(--text-light)", marginTop: "10px" }}>
        No update requests yet.
      </p>
    );
  }

  return (
    <ul style={{ marginTop: "10px", display: "grid", gap: "16px" }}>
      {items.map((ur) => (
        <li
          key={ur.id}
          style={{
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700 }}>
                {ur.category} — {ur.client.email}
                {ur.client.businessName ? ` (${ur.client.businessName})` : ""}
              </div>
              <p style={{ marginTop: "6px", color: "var(--text-light)" }}>
                {ur.description}
              </p>
              <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--text-light)" }}>
                Submitted {new Date(ur.createdAt).toLocaleDateString()}
              </p>
            </div>

            <select
              value={ur.status}
              disabled={savingId === ur.id}
              onChange={(e) => handleStatusChange(ur.id, e.target.value)}
              style={{
                height: "36px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                padding: "0 10px",
              }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {ur.files.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              {ur.files.map((f) => (
                <a
                  key={f.id}
                  href={`/api/files/${f.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginRight: "10px",
                    fontSize: "13px",
                    color: "var(--blue)",
                    fontWeight: 600,
                  }}
                >
                  📎 {f.filename.split("/").pop()}
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
