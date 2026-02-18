import { prisma } from "../src/lib/db/prisma";

async function main() {
  // Clean (dev only)
  await prisma.citation.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.knowledgeDocument.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.export.deleteMany();
  await prisma.questionnaireFile.deleteMany();
  await prisma.question.deleteMany();
  await prisma.project.deleteMany();

  const project = await prisma.project.create({
    data: {
      name: "Acme — SIG Lite Feb 2026",
      type: "SECURITY_QUESTIONNAIRE",
      clientName: "Acme Inc.",
      evidenceOnly: true,
    },
  });

  const sections = ["Access Control", "Encryption", "Incident Response", "Privacy", "BCP/DR"];

  const questions = Array.from({ length: 20 }).map((_, i) => ({
    projectId: project.id,
    externalId: `Q-${String(i + 1).padStart(3, "0")}`,
    number: i + 1,
    section: sections[i % sections.length],
    text:
      i % 5 === 0
        ? "Do you encrypt data at rest? Specify standards/algorithms."
        : i % 5 === 1
        ? "Do you support SSO (SAML/OIDC)? Describe your access controls."
        : i % 5 === 2
        ? "Describe your incident response process and notification timelines."
        : i % 5 === 3
        ? "How do you manage user access reviews and least privilege?"
        : "Do you have a documented backup and disaster recovery plan?",
    answerType: "TEXT",
    status: "UNANSWERED",
    confidence: "UNKNOWN",
  }));

  await prisma.question.createMany({ data: questions });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      actor: "AGENT",
      message: "Demo project seeded with 20 questions.",
    },
  });

  console.log("Seeded:", { projectId: project.id, questions: questions.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
