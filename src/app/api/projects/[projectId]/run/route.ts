import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parseRunBody, processAgentRun } from "@/lib/agent/process-run";

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

  void processAgentRun(run.id).catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        metaJson: JSON.stringify({ ...options, error: message }),
      },
    });
  });

  return NextResponse.json({ ok: true, runId: run.id, status: run.status, progress: run.progress, startedAt: run.startedAt.toISOString() }, { status: 202 });
}
