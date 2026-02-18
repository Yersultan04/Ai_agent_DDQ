import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ answerId: string }> }
) {
  const { answerId } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (!body?.questionId || typeof body.questionId !== "string") {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }
  if (typeof body.text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id: body.questionId },
    select: { id: true, projectId: true },
  });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const nextStatus: "DRAFT" | "APPROVED" = body.status === "APPROVED" ? "APPROVED" : "DRAFT";

  // Evidence-only enforcement: approve only if citations exist
  if (nextStatus === "APPROVED") {
    const citationsCount = await prisma.citation.count({
      where: { answerId: answerId === "new" ? "__none__" : answerId },
    });

    // if it's "new", there are obviously 0 citations now
    if (citationsCount === 0) {
      await prisma.question.update({
        where: { id: body.questionId },
        data: { status: "GAP" },
      });

      return NextResponse.json(
        { error: "Cannot approve without evidence. Question marked as GAP." },
        { status: 400 }
      );
    }
  }

  let answer;
  if (answerId === "new") {
    answer = await prisma.answer.create({
      data: {
        projectId: question.projectId,
        questionId: body.questionId,
        text: body.text,
        status: nextStatus,
        createdBy: "USER",
      },
      select: { id: true, status: true, updatedAt: true },
    });
  } else {
    answer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        text: body.text,
        status: nextStatus,
      },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  // Keep question status in sync
  const qStatus =
    nextStatus === "APPROVED" ? "APPROVED" : "DRAFTED";

  await prisma.question.update({
    where: { id: body.questionId },
    data: { status: qStatus },
  });

  await prisma.activityLog.create({
    data: {
      projectId: question.projectId,
      questionId: body.questionId,
      actor: "USER",
      message: nextStatus === "APPROVED" ? "Answer approved." : "Answer saved as draft.",
    },
  });

  return NextResponse.json({
    id: answer.id,
    status: answer.status,
    updatedAt: answer.updatedAt.toISOString(),
  });
}
