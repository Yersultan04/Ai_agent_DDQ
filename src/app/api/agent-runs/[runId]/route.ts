import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_req: Request, ctx: { params: Promise<{ runId: string }> }) {
  const { runId } = await ctx.params;

  const run = await prisma.agentRun.findUnique({
    where: { id: runId },
    select: {
      id: true,
      projectId: true,
      agentName: true,
      status: true,
      progress: true,
      startedAt: true,
      finishedAt: true,
      metaJson: true,
    },
  });

  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  let meta: unknown = null;
  try {
    meta = run.metaJson ? JSON.parse(run.metaJson) : null;
  } catch {
    meta = run.metaJson;
  }

  return NextResponse.json({
    ...run,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
    meta,
  });
}
