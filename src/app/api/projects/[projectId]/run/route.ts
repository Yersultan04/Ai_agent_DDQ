import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { pickBestSnippets, scoreChunk } from "@/lib/retrieval/rank";
import { generateDraftAnswer } from "@/lib/agent/generate";

export const runtime = "nodejs";

async function readBody(req: Request): Promise<unknown> {
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) return await req.json();
    if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      const fd = await req.formData();
      const obj: Record<string, unknown> = {};
      for (const [k, v] of fd.entries()) obj[k] = v;
      return obj;
    }
  } catch {
    // ignore
  }
  return {};
}

export async function GET(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;

  const runs = await prisma.agentRun.findMany({
    where: { projectId },
    orderBy: { startedAt: "desc" },
    take: 20,
    select: { id: true, agentName: true, status: true, progress: true, startedAt: true, finishedAt: true, metaJson: true },
  });

  return NextResponse.json(runs);
}

export async function POST(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;
  const body = await readBody(req);
  const options = parseRunBody(body);

  const run = await prisma.agentRun.create({
    data: {
      projectId,
      agentName: "AnswerEvidence",
      status: "RUNNING",
      progress: 0,
      metaJson: JSON.stringify(options),
    },
    select: { id: true, status: true, progress: true, startedAt: true },
  });

  const errors: Array<{ questionId: string; error: string }> = [];
  let drafted = 0;
  let gaps = 0;

  for (const q of questions) {
    try {
      const ranked = chunks
        .map((c) => {
          const score = scoreChunk(q.text, c.text);
          return {
            chunkId: c.id,
            text: c.text,
            sourceRef: c.sourceRef,
            documentId: c.documentId,
            documentTitle: c.document?.title ?? null,
            filename: c.document?.filename ?? null,
            score,
          };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

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
        continue;
      }

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ questionId: q.id, error: message });
    }
  }

  return NextResponse.json({
    ok: true,
    projectId,
    processed: questions.length,
    drafted,
    gaps,
    errors,
  });

  return NextResponse.json({ ok: true, runId: run.id, status: run.status, progress: run.progress, startedAt: run.startedAt.toISOString() }, { status: 202 });
}
