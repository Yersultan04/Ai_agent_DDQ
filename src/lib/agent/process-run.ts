import { prisma } from "@/lib/db/prisma";
import { generateDraftAnswer } from "@/lib/agent/generate";
import { pickBestSnippets, scoreChunk } from "@/lib/retrieval/rank";

export type RunOptions = {
  topK: number;
  limit: number;
  includeDrafted: boolean;
};

const DEFAULT_OPTIONS: RunOptions = {
  topK: 5,
  limit: 200,
  includeDrafted: false,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function normalizeOptions(input?: Partial<RunOptions>): RunOptions {
  return {
    topK: clamp(Number(input?.topK ?? DEFAULT_OPTIONS.topK), 1, 10),
    limit: clamp(Number(input?.limit ?? DEFAULT_OPTIONS.limit), 1, 1000),
    includeDrafted: Boolean(input?.includeDrafted ?? DEFAULT_OPTIONS.includeDrafted),
  };
}

async function upsertAnswerByQuestionId(args: {
  projectId: string;
  questionId: string;
  text: string;
  status: "DRAFT";
  createdBy: "AGENT";
}) {
  const existing = await prisma.answer.findFirst({ where: { questionId: args.questionId }, select: { id: true } });

  if (existing) {
    return prisma.answer.update({
      where: { id: existing.id },
      data: { text: args.text, status: args.status },
      select: { id: true },
    });
  }

  return prisma.answer.create({
    data: {
      projectId: args.projectId,
      questionId: args.questionId,
      text: args.text,
      status: args.status,
      createdBy: args.createdBy,
    },
    select: { id: true },
  });
}

export async function processAgentRun(runId: string) {
  const run = await prisma.agentRun.findUnique({ select: { id: true, projectId: true, status: true, metaJson: true }, where: { id: runId } });
  if (!run) throw new Error("Agent run not found");
  if (run.status !== "RUNNING") return { ok: true, skipped: true };

  const opts = normalizeOptions(run.metaJson ? (JSON.parse(run.metaJson) as Partial<RunOptions>) : undefined);

  const statuses: string[] = opts.includeDrafted
    ? ["UNANSWERED", "GAP", "NEEDS_REVIEW", "DRAFTED"]
    : ["UNANSWERED", "GAP", "NEEDS_REVIEW"];

  const questions = await prisma.question.findMany({
    where: { projectId: run.projectId, status: { in: statuses } },
    orderBy: [{ number: "asc" }, { createdAt: "asc" }],
    take: opts.limit,
    select: { id: true, projectId: true, text: true },
  });

  const chunks = await prisma.documentChunk.findMany({
    where: { projectId: run.projectId },
    select: {
      id: true,
      text: true,
      sourceRef: true,
      documentId: true,
      document: { select: { title: true, filename: true } },
    },
    take: 3000,
  });

  const errors: Array<{ questionId: string; error: string }> = [];
  let drafted = 0;
  let gaps = 0;
  let processed = 0;

  for (const q of questions) {
    try {
      const ranked = chunks
        .map((c) => ({
          chunkId: c.id,
          text: c.text,
          sourceRef: c.sourceRef,
          documentId: c.documentId,
          documentTitle: c.document?.title ?? null,
          filename: c.document?.filename ?? null,
          score: scoreChunk(q.text, c.text),
        }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, opts.topK);

      if (ranked.length === 0) {
        const answer = await upsertAnswerByQuestionId({
          projectId: q.projectId,
          questionId: q.id,
          text: "I couldn't find supporting evidence in the Knowledge Base yet. Upload relevant policy docs and try again.",
          status: "DRAFT",
          createdBy: "AGENT",
        });

        await prisma.citation.deleteMany({ where: { answerId: answer.id } });
        await prisma.question.update({ where: { id: q.id }, data: { status: "GAP" } });
        gaps += 1;
      } else {
        const draftText = await generateDraftAnswer({
          question: q.text,
          evidence: ranked.map((r) => ({
            documentTitle: r.documentTitle ?? r.filename ?? "Document",
            sourceRef: r.sourceRef,
            snippet: pickBestSnippets(r.text, 220),
          })),
        });

        const answer = await upsertAnswerByQuestionId({
          projectId: q.projectId,
          questionId: q.id,
          text: draftText,
          status: "DRAFT",
          createdBy: "AGENT",
        });

        await prisma.citation.deleteMany({ where: { answerId: answer.id } });
        await prisma.citation.createMany({
          data: ranked.map((r) => ({
            answerId: answer.id,
            chunkId: r.chunkId,
            snippet: pickBestSnippets(r.text, 220),
            relevanceScore: r.score,
            startOffset: null,
            endOffset: null,
          })),
        });

        await prisma.question.update({ where: { id: q.id }, data: { status: "DRAFTED" } });
        drafted += 1;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ questionId: q.id, error: message });
    } finally {
      processed += 1;
      const progress = questions.length === 0 ? 100 : Math.round((processed / questions.length) * 100);
      await prisma.agentRun.update({ where: { id: run.id }, data: { progress, metaJson: JSON.stringify({ ...opts, processed, drafted, gaps, errors }) } });
    }
  }

  await prisma.agentRun.update({
    where: { id: run.id },
    data: {
      status: errors.length ? "FAILED" : "DONE",
      progress: 100,
      finishedAt: new Date(),
      metaJson: JSON.stringify({ ...opts, processed, drafted, gaps, errors }),
    },
  });

  return { ok: true, processed, drafted, gaps, errors };
}

export function parseRunBody(body: unknown): RunOptions {
  const b = (body ?? {}) as Partial<RunOptions>;
  return normalizeOptions(b);
}
