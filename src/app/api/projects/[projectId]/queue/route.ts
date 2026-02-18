import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await ctx.params;

  const questions = await prisma.question.findMany({
    where: { projectId },
    orderBy: [{ number: "asc" }, { createdAt: "asc" }],
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
    },
  });

  return NextResponse.json(questions);
}
