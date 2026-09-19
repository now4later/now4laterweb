"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Photos", "Videos", "Events", "Text/Content", "Links", "Other"];

export default function UpdateRequestForm() {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(null); // null | "submitting" | "uploading" | "done" | "error"
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");

    try {
      // 1. Create the update request record first.
      const res = await fetch("/api/portal/update-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit update request.");
        setStatus("error");
        return;
      }

      const updateRequestId = data.updateRequest.id;

      // 2. Upload each selected file directly to Vercel Blob from the
      // browser. The server (/api/portal/upload) verifies this client owns
      // the update request before issuing each upload token, and records
      // the file in the database once the upload completes.
      if (files.length > 0) {
        setStatus("uploading");
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Uploading file ${i + 1} of ${files.length}...`);
          const file = files[i];
          await upload(`updates/${updateRequestId}/${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/portal/upload",
            clientPayload: JSON.stringify({ updateRequestId }),
          });
        }
      }

      setStatus("done");
      setDescription("");
      setFiles([]);
      setCategory(CATEGORIES[0]);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting your update request.");
      setStatus("error");
    } finally {
      setUploadProgress("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" style={{ margin: "15px 0 0" }}>
      <div className="form-row">
        <label htmlFor="urCategory">Update type</label>
        <select
          id="urCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="urDescription">Describe what you'd like updated</label>
        <textarea
          id="urDescription"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label htmlFor="urFiles">Photos / videos / files (optional)</label>
        <input
          id="urFiles"
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files))}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting" || status === "uploading"}
      >
        {status === "submitting"
          ? "Submitting..."
          : status === "uploading"
          ? uploadProgress || "Uploading..."
          : "Submit Update Request"}
      </button>

      {status === "done" && (
        <p className="form-status success">
          Update request submitted successfully.
        </p>
      )}
      {error && <p className="form-status error">{error}</p>}
    </form>
  );
}
