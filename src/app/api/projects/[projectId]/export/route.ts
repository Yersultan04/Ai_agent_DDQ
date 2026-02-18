import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function computeStats(questions: Array<any>) {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((q) => (q.answers?.[0]?.text ?? "").trim().length > 0).length;
  const approvedAnswers = questions.filter((q) => q.answers?.[0]?.status === "APPROVED").length;
  const draftedAnswers = questions.filter((q) => q.answers?.[0]?.status === "DRAFT").length;

  let citationsCount = 0;
  for (const q of questions) citationsCount += (q.answers?.[0]?.citations?.length ?? 0);

  return { totalQuestions, answeredQuestions, approvedAnswers, draftedAnswers, citationsCount };
}

export async function GET(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const formatRaw = (searchParams.get("format") ?? "csv").toLowerCase();
  const isJson = formatRaw === "json";
  const formatEnum = isJson ? "JSON" : "CSV";

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      clientName: true,
      type: true,
      evidenceOnly: true,
      updatedAt: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const questions = await prisma.question.findMany({
    where: { projectId },
    orderBy: [{ number: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      number: true,
      externalId: true,
      section: true,
      text: true,
      answerType: true,
      status: true,
      confidence: true,
      updatedAt: true,
      answers: {
        orderBy: [{ updatedAt: "desc" }],
        take: 1,
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
      },
    },
  });

  // Write an Export record (best-effort; do not fail export if logging fails)
  try {
    const stats = computeStats(questions);
    const filePath = `ddq_${projectId}.${isJson ? "json" : "csv"}`;

    await prisma.export.create({
      data: {
        projectId,
        format: formatEnum as any,
        filePath,
        statsJson: JSON.stringify(stats),
      },
    });
  } catch (e) {
    // ignore
  }

  if (isJson) {
    const payload = {
      project,
      exportedAt: new Date().toISOString(),
      questions,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="ddq_${projectId}.json"`,
      },
    });
  }

  const header = [
    "project_id",
    "project_name",
    "client_name",
    "question_number",
    "question_external_id",
    "section",
    "question_text",
    "question_status",
    "confidence",
    "answer_status",
    "answer_text",
    "citations_count",
    "citations",
    "updated_at",
  ];

  const rows: string[] = [];
  rows.push(header.join(","));

  for (const q of questions) {
    const a = q.answers?.[0] ?? null;

    const citations = (a?.citations ?? []).map((c) => {
      const docTitle = c.chunk?.document?.title ?? c.chunk?.document?.filename ?? "doc";
      const ref = c.chunk?.sourceRef ?? "";
      const score = typeof c.relevanceScore === "number" ? c.relevanceScore.toFixed(2) : "";
      const snip = (c.snippet ?? "").slice(0, 180);
      return `${docTitle} | ${ref} | score:${score} | ${snip}`;
    });

    const row = [
      project.id,
      project.name,
      project.clientName ?? "",
      q.number ?? "",
      q.externalId ?? "",
      q.section ?? "",
      q.text,
      q.status,
      q.confidence,
      a?.status ?? "",
      a?.text ?? "",
      String(citations.length),
      citations.join(" || "),
      new Date(q.updatedAt).toISOString(),
    ].map(csvEscape);

    rows.push(row.join(","));
  }

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ddq_${projectId}.csv"`,
    },
  });
}
