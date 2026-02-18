"use client";

import { useState } from "react";

export function Uploader({ projectId }: { projectId: string }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!file) {
      setStatus("Pick a file first.");
      return;
    }
    setBusy(true);
    setStatus(null);

    const fd = new FormData();
    fd.set("title", title);
    fd.set("file", file);

    const res = await fetch(`/api/projects/${projectId}/kb`, {
      method: "POST",
      body: fd,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setStatus(json?.error ?? `Upload failed (${res.status})`);
      setBusy(false);
      return;
    }

    const msgParts = [
      `Uploaded: ${json?.doc?.filename ?? "document"}`,
      `Chunks: ${json?.chunkCount ?? 0}`,
      json?.warning ? `Note: ${json.warning}` : null,
    ].filter(Boolean);

    setStatus(msgParts.join(" • "));
    setTitle("");
    setFile(null);
    setBusy(false);

    // Refresh the page list
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="e.g., SOC2 Type II Report 2025"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">File</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
          accept=".txt,.md,.json,.xml"
        />
        <div className="text-xs text-muted-foreground">
          MVP: chunking works for text-like files (txt/md/json/xml). You can still upload other files, but they won’t be chunked yet.
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={upload}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Uploading..." : "Upload to KB"}
        </button>
        {status ? <div className="text-sm text-muted-foreground">{status}</div> : null}
      </div>
    </div>
  );
}
