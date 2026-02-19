"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RunResponse = { runId: string };
type RunStatus = { status: "RUNNING" | "DONE" | "FAILED"; progress: number };

async function waitForRun(runId: string, timeoutMs = 90_000): Promise<RunStatus> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const res = await fetch(`/api/agent-runs/${runId}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch run status (${res.status})`);

    const json = (await res.json()) as RunStatus;
    if (json.status === "DONE" || json.status === "FAILED") return json;

    await new Promise((r) => setTimeout(r, 800));
  }

  throw new Error("Run timed out");
}

export default function RunAgentButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    if (loading) return;
    setLoading(true);
    setMsg("Queued...");

    try {
      const res = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topK: 5, includeDrafted: false }),
      });

      const json = (await res.json()) as RunResponse;
      if (!res.ok || !json?.runId) throw new Error(`Failed to queue run (${res.status})`);

      setMsg("Running...");
      const finalStatus = await waitForRun(json.runId);
      setMsg(finalStatus.status === "DONE" ? "Done" : "Failed");
      router.refresh();
    } catch (error: unknown) {
      setMsg(error instanceof Error ? error.message : "Failed");
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
