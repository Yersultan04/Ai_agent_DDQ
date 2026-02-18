"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RunAgentButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    if (loading) return;
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topK: 5, includeDrafted: false }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      setMsg("Done");
      router.refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Running…" : "Run agent"}
      </button>
      {msg ? <span className="text-xs text-muted-foreground">{msg}</span> : null}
    </div>
  );
}
