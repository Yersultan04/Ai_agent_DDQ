import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { pickBestSnippets, scoreChunk } from "@/lib/retrieval/rank";

export const runtime = "nodejs";

type Body = {
  topK?: number;
  limit?: number;
  includeDrafted?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

async function readBody(req: Request): Promise<Body> {
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) return (await req.json()) as Body;
    if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      const fd = await req.formData();
      const obj: Record<string, unknown> = {};
      for (const [k, v] of fd.entries()) obj[k] = v;
      return obj as Body;
    }
  } catch {
    // ignore
  }
  return {};
}

async function upsertAnswerByQuestionId(args: {
  projectId: string;
  questionId: string;
  text: string;
  status: "DRAFT";
  createdBy: "AGENT";
}) {
  const existing = await prisma.answer.findFirst({
    where: { questionId: args.questionId },
    select: { id: true },
  });

  if (existing) {
    return prisma.answer.update({
      where: { id: existing.id },
      data: { text: args.text, status: args.status },
      select: { id: true, text: true, status: true, updatedAt: true },
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
    select: { id: true, text: true, status: true, updatedAt: true },
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;

  const body = await readBody(req);
  const topK = clamp(Number(body.topK ?? 5), 1, 10);
  const limit = clamp(Number(body.limit ?? 200), 1, 1000);
  const includeDrafted = String(body.includeDrafted ?? "false") === "true";

  const statuses: string[] = includeDrafted
    ? ["UNANSWERED", "GAP", "NEEDS_REVIEW", "DRAFTED"]
    : ["UNANSWERED", "GAP", "NEEDS_REVIEW"];

  const questions = await prisma.question.findMany({
    where: { projectId, status: { in: statuses } },
    orderBy: [{ number: "asc" }, { createdAt: "asc" }],
    take: limit,
    select: { id: true, projectId: true, text: true, status: true },
  });

  const chunks = await prisma.documentChunk.findMany({
    where: { projectId },
    select: {
      id: true,
      text: true,
      sourceRef: true,
      documentId: true,
      document: { select: { title: true, filename: true } },
    },
    take: 3000, // MVP safety cap
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

      const bullets = ranked.map((r, i) => {
        const doc = r.documentTitle ?? r.filename ?? "Document";
        const ref = r.sourceRef ? ` (${r.sourceRef})` : "";
        return `- Evidence ${i + 1}: ${doc}${ref}`;
      });

      const draftText =
`Based on the uploaded documentation, here is the current evidence:

${bullets.join("\n")}

Draft response (edit as needed):
[Write a concise, audit-friendly answer here referencing the evidence above.]`;

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
    } catch (e: any) {
      errors.push({ questionId: q.id, error: e?.message ?? String(e) });
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
}
