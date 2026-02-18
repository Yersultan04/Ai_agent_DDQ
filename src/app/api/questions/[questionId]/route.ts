import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await ctx.params;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      projectId: true,
      externalId: true,
      number: true,
      section: true,
      text: true,
      answerType: true,
      status: true,
      owner: true,
      confidence: true,
      updatedAt: true,
      answers: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          text: true,
          status: true,
          createdBy: true,
          updatedAt: true,
          citations: {
            select: {
              id: true,
              snippet: true,
              relevanceScore: true,
              chunk: {
                select: {
                  id: true,
                  sourceRef: true,
                  document: {
                    select: { id: true, title: true, filename: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const latestAnswer = question.answers[0] ?? null;

  return NextResponse.json({
    question: {
      id: question.id,
      projectId: question.projectId,
      externalId: question.externalId,
      number: question.number,
      section: question.section,
      text: question.text,
      answerType: question.answerType,
      status: question.status,
      owner: question.owner,
      confidence: question.confidence,
      updatedAt: question.updatedAt.toISOString(),
    },
    answer: latestAnswer
      ? {
          id: latestAnswer.id,
          text: latestAnswer.text,
          status: latestAnswer.status,
          createdBy: latestAnswer.createdBy,
          updatedAt: latestAnswer.updatedAt.toISOString(),
          evidence: latestAnswer.citations.map((c) => ({
            citationId: c.id,
            snippet: c.snippet,
            relevanceScore: c.relevanceScore,
            sourceRef: c.chunk.sourceRef,
            documentId: c.chunk.document.id,
            documentTitle: c.chunk.document.title,
            filename: c.chunk.document.filename,
          })),
        }
      : null,
  });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // allow updating: status, owner, confidence
  const data: {
    status?: string;
    owner?: string | null;
    confidence?: string;
  } = {};
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.owner === "string" || body.owner === null) data.owner = body.owner;
  if (typeof body.confidence === "string") data.confidence = body.confidence;

  const updated = await prisma.question.update({
    where: { id: questionId },
    data,
    select: { id: true, status: true, owner: true, confidence: true, updatedAt: true },
  });

  await prisma.activityLog.create({
    data: {
      projectId: (await prisma.question.findUnique({ where: { id: questionId }, select: { projectId: true } }))!
        .projectId,
      questionId,
      actor: "USER",
      message: `Question updated: ${Object.keys(data).join(", ")}`,
    },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    owner: updated.owner,
    confidence: updated.confidence,
    updatedAt: updated.updatedAt.toISOString(),
  });
}
