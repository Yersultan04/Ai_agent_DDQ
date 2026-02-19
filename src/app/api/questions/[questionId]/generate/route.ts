import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

type GenerateBody = {
  mode?: "draft" | "approve";
};

function buildDraftAnswer() {
  // MVP stub (позже заменим на LLM + retrieval)
  return `Draft answer (MVP):\n\nWe encrypt data at rest using industry-standard encryption (e.g., AES-256) where applicable. Access to encryption keys is restricted and managed via role-based access controls. Further details can be provided upon request.`;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await ctx.params;

  let body: GenerateBody = {};
  try {
    body = await req.json();
  } catch {
    // ok: body optional
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      projectId: true,
      text: true,
      status: true,
      project: { select: { evidenceOnly: true } },
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Pick a chunk to cite (best effort). If none exists, we still create an answer without citations.
  const bestChunk = await prisma.documentChunk.findFirst({
    where: { projectId: question.projectId },
    orderBy: [{ id: "asc" }],
    select: {
      id: true,
      text: true,
      sourceRef: true,
      document: { select: { title: true, filename: true } },
    },
  });

  const answerText = buildDraftAnswer();

  // Create Answer
  const answer = await prisma.answer.create({
    data: {
      projectId: question.projectId,
      questionId: question.id,
      text: answerText,
      status: body.mode === "approve" ? "APPROVED" : "DRAFT",
      createdBy: "AGENT",
    },
    select: {
      id: true,
      text: true,
      status: true,
      updatedAt: true,
    },
  });

  // Create Citation if we have a chunk
  if (bestChunk) {
    const snippet = bestChunk.text.slice(0, 240);

    await prisma.citation.create({
      data: {
        answerId: answer.id,
        chunkId: bestChunk.id,
        snippet,
        relevanceScore: 0.75,
      },
    });
  }

  // Update Question status (evidenceOnly gates UI approval later)
  await prisma.question.update({
    where: { id: question.id },
    data: {
      status: "DRAFTED",
    },
  });

  // Return payload with citations
  const answerWithCitations = await prisma.answer.findUnique({
    where: { id: answer.id },
    select: {
      id: true,
      text: true,
      status: true,
      updatedAt: true,
      citations: {
        select: {
          id: true,
          snippet: true,
          relevanceScore: true,
          chunk: {
            select: {
              sourceRef: true,
              document: { select: { title: true, filename: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    questionId: question.id,
    projectId: question.projectId,
    answer: answerWithCitations,
  });
}
