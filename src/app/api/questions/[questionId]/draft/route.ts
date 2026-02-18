import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { pickBestSnippets, scoreChunk } from "@/lib/retrieval/rank";

export const runtime = "nodejs";

type Body = { topK?: number };

async function upsertAnswerByQuestionId(args: {
  projectId: string;
  questionId: string;
  text: string;
  status: "DRAFT";
  createdBy: "AGENT";
}) {
  const existing = await prisma.answer.findFirst({
    where: { questionId: args.questionId },
    orderBy: { updatedAt: "desc" },
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

export async function POST(req: Request, ctx: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await ctx.params;

  const body = (await req.json().catch(() => ({}))) as Body;
  const topK = Math.min(Math.max(body.topK ?? 5, 1), 10);

  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, projectId: true, text: true },
  });

  if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const chunks = await prisma.documentChunk.findMany({
    where: { projectId: q.projectId },
    select: {
      id: true,
      text: true,
      sourceRef: true,
      documentId: true,
      document: { select: { title: true, filename: true } },
    },
    take: 3000,
  });

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
    .slice(0, topK);

  if (ranked.length === 0) {
    const text =
      "I couldn't find supporting evidence in the Knowledge Base yet. Upload relevant policy docs and try again.";

    const answer = await upsertAnswerByQuestionId({
      projectId: q.projectId,
      questionId: q.id,
      text,
      status: "DRAFT",
      createdBy: "AGENT",
    });

    await prisma.question.update({ where: { id: q.id }, data: { status: "GAP" } });
    await prisma.citation.deleteMany({ where: { answerId: answer.id } });

    return NextResponse.json({ ok: true, answer, evidence: [], note: "No relevant chunks found. Marked question as GAP." });
  }

  const bullets = ranked.map((r, i) => {
    const doc = r.documentTitle ?? r.filename ?? "Document";
    const ref = r.sourceRef ? ` (${r.sourceRef})` : "";
    return `- Evidence ${i + 1}: ${doc}${ref}`;
  });

  const draftText = `Based on the uploaded documentation, here is the current evidence:

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

  const evidence = ranked.map((r) => ({
    chunkId: r.chunkId,
    snippet: pickBestSnippets(r.text, 220),
    relevanceScore: r.score,
    sourceRef: r.sourceRef,
    documentId: r.documentId,
    documentTitle: r.documentTitle,
    filename: r.filename,
  }));

  return NextResponse.json({ ok: true, answer, evidence });
}
