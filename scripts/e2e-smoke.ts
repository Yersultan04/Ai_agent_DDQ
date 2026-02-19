import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

type ProjectCreateResponse = { id: string };
type QueueItem = { id: string; status: string };
type RunCreateResponse = { runId?: string; ok?: boolean };
type RunStatusResponse = { status: "RUNNING" | "DONE" | "FAILED"; progress: number; meta?: unknown };
type QuestionResponse = {
  question: { id: string };
  answer: { id: string; text: string } | null;
};

async function mustJson<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${label} failed (${res.status}): ${body}`);
  }
  return (await res.json()) as T;
}


async function waitForRun(baseUrl: string, runId: string, timeoutMs = 90000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const status = await mustJson<RunStatusResponse>(
      await fetch(`${baseUrl}/api/agent-runs/${runId}`, { cache: "no-store" }),
      "fetch run status"
    );

    if (status.status === "DONE") return status;
    if (status.status === "FAILED") {
      throw new Error(`Run failed: ${JSON.stringify(status.meta ?? {})}`);
    }

    await new Promise((r) => setTimeout(r, 800));
  }

  throw new Error("Timed out waiting for run completion");
}
async function run() {
  const runId = Date.now();

  const project = await mustJson<ProjectCreateResponse>(
    await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Smoke Project ${runId}`,
        clientName: "Smoke Client",
        evidenceOnly: true,
      }),
    }),
    "create project"
  );

  const question = await prisma.question.create({
    data: {
      projectId: project.id,
      number: 1,
      section: "Security",
      text: "Do you have a SOC2 Type II report and annual penetration testing?",
      status: "UNANSWERED",
    },
    select: { id: true },
  });

  const kbText = [
    "Our organization maintains a SOC2 Type II report.",
    "Independent penetration testing is performed at least annually.",
    "Evidence is tracked in our trust center.",
  ].join("\n");

  const form = new FormData();
  const kbFile = new File([kbText], "soc2-evidence.txt", { type: "text/plain" });
  form.set("title", "SOC2 Evidence");
  form.set("file", kbFile);

  await mustJson<{ ok: boolean }>(
    await fetch(`${baseUrl}/api/projects/${project.id}/kb`, {
      method: "POST",
      body: form,
    }),
    "upload kb"
  );

  const runCreate = await mustJson<RunCreateResponse>(
    await fetch(`${baseUrl}/api/projects/${project.id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topK: 5, includeDrafted: false }),
    }),
    "queue run agent"
  );

  if (runCreate.runId) {
    await waitForRun(baseUrl, runCreate.runId);
  }

  const queue = await mustJson<QueueItem[]>(
    await fetch(`${baseUrl}/api/projects/${project.id}/queue`, { cache: "no-store" }),
    "fetch queue"
  );

  const queueItem = queue.find((q) => q.id === question.id);
  if (!queueItem) {
    throw new Error("Question not found in queue");
  }

  if (queueItem.status !== "DRAFTED") {
    throw new Error(`Expected DRAFTED status after run, got: ${queueItem.status}`);
  }

  const questionPayload = await mustJson<QuestionResponse>(
    await fetch(`${baseUrl}/api/questions/${question.id}`),
    "fetch question detail"
  );

  if (!questionPayload.answer?.id) {
    throw new Error("Expected drafted answer to exist");
  }

  const approvedText = `${questionPayload.answer.text}\n\nFinalized by smoke test.`;

  await mustJson<{ id: string; status: string }>(
    await fetch(`${baseUrl}/api/answers/${questionPayload.answer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        text: approvedText,
        status: "APPROVED",
      }),
    }),
    "approve answer"
  );

  const csvRes = await fetch(`${baseUrl}/api/projects/${project.id}/export?format=csv`);
  if (!csvRes.ok) {
    throw new Error(`csv export failed (${csvRes.status})`);
  }
  const csv = await csvRes.text();
  if (!csv.includes("question_text") || !csv.includes("SOC2 Type II")) {
    throw new Error("CSV export does not contain expected content");
  }

  const jsonRes = await fetch(`${baseUrl}/api/projects/${project.id}/export?format=json`);
  if (!jsonRes.ok) {
    throw new Error(`json export failed (${jsonRes.status})`);
  }
  const exported = (await jsonRes.json()) as { project?: { id?: string }; questions?: unknown[] };
  if (exported.project?.id !== project.id || !Array.isArray(exported.questions) || exported.questions.length === 0) {
    throw new Error("JSON export payload is invalid");
  }

  console.log(`✅ Smoke flow passed for project ${project.id}`);
}

run()
  .catch((error) => {
    console.error("❌ Smoke flow failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
