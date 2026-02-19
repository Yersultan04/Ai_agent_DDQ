export type EvidenceItem = {
  documentTitle: string;
  sourceRef?: string | null;
  snippet: string;
};

export type GenerateDraftInput = {
  question: string;
  evidence: EvidenceItem[];
};

function buildEvidenceBlock(evidence: EvidenceItem[]) {
  return evidence
    .map((e, i) => {
      const ref = e.sourceRef ? ` (${e.sourceRef})` : "";
      return `${i + 1}. ${e.documentTitle}${ref}\nSnippet: ${e.snippet}`;
    })
    .join("\n\n");
}

function localFallbackDraft(input: GenerateDraftInput) {
  const bullets = input.evidence.map((e, i) => {
    const ref = e.sourceRef ? ` (${e.sourceRef})` : "";
    return `- Evidence ${i + 1}: ${e.documentTitle}${ref}`;
  });

  return `Based on the uploaded documentation, here is the current evidence:\n\n${bullets.join("\n")}\n\nDraft response (edit as needed):\n[Write a concise, audit-friendly answer here referencing the evidence above.]`;
}

async function generateWithOpenAI(input: GenerateDraftInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const prompt = [
    "You are a security questionnaire assistant.",
    "Write a concise enterprise-ready answer using only provided evidence.",
    "If evidence is insufficient, explicitly say what is missing.",
    "Do not invent controls that are not in evidence.",
    "",
    `Question:\n${input.question}`,
    "",
    `Evidence:\n${buildEvidenceBlock(input.evidence)}`,
    "",
    "Return plain text only.",
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: "system", content: "You produce evidence-grounded DDQ answers." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const text = json.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function generateDraftAnswer(input: GenerateDraftInput): Promise<string> {
  const provider = (process.env.AGENT_PROVIDER ?? "local").toLowerCase();

  if (provider === "openai") {
    const generated = await generateWithOpenAI(input);
    if (generated) return generated;
  }

  return localFallbackDraft(input);
}
