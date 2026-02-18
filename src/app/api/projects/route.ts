import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  const projectIds = projects.map((p) => p.id);

  const answeredAgg = await prisma.question.groupBy({
    by: ["projectId"],
    where: {
      projectId: { in: projectIds },
      status: { in: ["APPROVED", "NEEDS_REVIEW", "DRAFTED"] },
    },
    _count: { _all: true },
  });

  const gapAgg = await prisma.question.groupBy({
    by: ["projectId"],
    where: { projectId: { in: projectIds }, status: "GAP" },
    _count: { _all: true },
  });

  const answeredMap = new Map(answeredAgg.map((x) => [x.projectId, x._count._all]));
  const gapMap = new Map(gapAgg.map((x) => [x.projectId, x._count._all]));

  const payload = projects.map((p) => {
    const total = p._count.questions;
    const answered = answeredMap.get(p.id) ?? 0;
    const gaps = gapMap.get(p.id) ?? 0;

    const statusLabel =
      answered === 0 && gaps === 0 ? "Drafting" : gaps > 0 ? "In Review" : "Exported";

    return {
      id: p.id,
      name: p.name,
      type: p.type,
      clientName: p.clientName,
      evidenceOnly: p.evidenceOnly,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      totalQuestions: total,
      answeredQuestions: answered,
      gapQuestions: gaps,
      statusLabel,
    };
  });

  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: body.name,
      type: body.type ?? "SECURITY_QUESTIONNAIRE",
      clientName: body.clientName ?? null,
      evidenceOnly: body.evidenceOnly ?? true,
    },
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
}
