"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EvidenceItem = {
  chunkId: string;
  snippet: string;
  relevanceScore?: number | null;
  sourceRef?: string | null;
  documentId: string;
  documentTitle?: string | null;
  filename?: string | null;
};

type QuestionPayload = {
  question: {
    id: string;
    projectId: string;
    externalId?: string | null;
    number?: number | null;
    section?: string | null;
    text: string;
    answerType: string;
    status: string;
    owner?: string | null;
    confidence: string;
    updatedAt: string;
  };
  answer: null | {
    id: string;
    text: string;
    status: string;
    createdBy: string;
    updatedAt: string;
    evidence?: EvidenceItem[];
  };
};

function statusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "APPROVED") return "default";
  if (status === "GAP") return "destructive";
  if (status === "NEEDS_REVIEW") return "secondary";
  if (status === "DRAFTED") return "secondary";
  return "outline";
}

export default function QuestionDetailPage() {
  const params = useParams<{ questionId: string }>();
  const questionId = params?.questionId;

  const [data, setData] = useState<QuestionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answerId = useMemo(() => data?.answer?.id ?? "new", [data]);

  async function reload(questionIdToLoad: string) {
    const res = await fetch(`/api/questions/${questionIdToLoad}`, { cache: "no-store" });
    if (!res.ok) {
      setError(`Failed to load question (${res.status})`);
      return;
    }
    const json = (await res.json()) as QuestionPayload;
    setData(json);
    setAnswerText(json.answer?.text ?? "");
  }

  useEffect(() => {
    if (!questionId) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/questions/${questionId}`, { cache: "no-store" });
      if (!res.ok) {
        setError(`Failed to load question (${res.status})`);
        setLoading(false);
        return;
      }
      const json = (await res.json()) as QuestionPayload;
      if (ignore) return;

      setData(json);
      setAnswerText(json.answer?.text ?? "");
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [questionId]);

  async function saveDraft() {
    if (!data) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/answers/${answerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: data.question.id,
        text: answerText,
        status: "DRAFT",
      }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error ?? "Failed to save draft");
      setSaving(false);
      return;
    }

    await reload(data.question.id);
    setSaving(false);
  }

  async function approve() {
    if (!data) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/answers/${answerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: data.question.id,
        text: answerText,
        status: "APPROVED",
      }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error ?? "Failed to approve");
      await reload(data.question.id);
      setSaving(false);
      return;
    }

    await reload(data.question.id);
    setSaving(false);
  }

  async function markGap() {
    if (!data) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/questions/${data.question.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "GAP" }),
    });

    if (!res.ok) setError("Failed to mark GAP");

    await reload(data.question.id);
    setSaving(false);
  }

  async function draftWithEvidence(topK = 5) {
    if (!data) return;
    setDrafting(true);
    setError(null);

    const res = await fetch(`/api/questions/${data.question.id}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topK }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error ?? "Draft with evidence failed");
      setDrafting(false);
      return;
    }

    await reload(data.question.id);
    setDrafting(false);
  }

  if (!questionId) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="text-sm text-muted-foreground">Loading route...</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl p-6 space-y-4">
        <div className="text-sm text-muted-foreground">Not found.</div>
        <Link href="/projects" className="underline underline-offset-4">
          Back to projects
        </Link>
      </main>
    );
  }

  const q = data.question;
  const evidence = data.answer?.evidence ?? [];

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold">Question</h1>
            <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
            <Badge variant="outline">{q.confidence}</Badge>
            {q.externalId ? <Badge variant="secondary">{q.externalId}</Badge> : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {q.section ?? "No section"} • #{q.number ?? "-"}
          </div>
        </div>

        <Link href={`/projects/${q.projectId}/queue`} className="rounded-md border px-4 py-2">
          Back to queue
        </Link>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6">
          {q.text}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Answer</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => draftWithEvidence(5)}
              disabled={drafting}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-60"
            >
              {drafting ? "Drafting..." : "Draft with evidence"}
            </button>
            <button
              onClick={saveDraft}
              disabled={saving}
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button
              onClick={approve}
              disabled={saving}
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Approving..." : "Approve"}
            </button>
            <button
              onClick={markGap}
              disabled={saving}
              className="rounded-md border px-3 py-2 text-sm text-red-600 disabled:opacity-60"
            >
              Mark GAP
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full min-h-[220px] rounded-md border bg-background p-3 text-sm"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Write or generate an answer..."
          />
          <div className="text-xs text-muted-foreground">
            Tip: click “Draft with evidence” after uploading KB docs to generate an evidence-first draft + citations.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {evidence.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No evidence yet. Upload docs to KB and click “Draft with evidence”.
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((e, idx) => {
                const title = e.documentTitle ?? e.filename ?? "Document";
                const ref = e.sourceRef ? ` • ${e.sourceRef}` : "";
                const score =
                  typeof e.relevanceScore === "number"
                    ? ` • score ${e.relevanceScore.toFixed(3)}`
                    : "";
                return (
                  <div key={`${e.chunkId ?? "nochunk"}-${idx}`} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">
                      Evidence {idx + 1}: {title}
                      <span className="text-xs text-muted-foreground">{ref}{score}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {e.snippet}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
