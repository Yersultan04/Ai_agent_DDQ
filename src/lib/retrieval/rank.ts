export type RankedChunk = {
  chunkId: string;
  text: string;
  sourceRef?: string | null;
  documentTitle?: string | null;
  filename?: string | null;
  documentId: string;
  score: number;
};

function tokenize(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

export function scoreChunk(query: string, chunkText: string): number {
  const q = tokenize(query);
  const c = tokenize(chunkText);
  if (q.length === 0 || c.length === 0) return 0;

  const cFreq = new Map<string, number>();
  for (const t of c) cFreq.set(t, (cFreq.get(t) ?? 0) + 1);

  // Simple BM25-ish-ish scoring (not full BM25, but works well for MVP)
  let score = 0;
  const uniqueQ = Array.from(new Set(q));
  for (const t of uniqueQ) {
    const tf = cFreq.get(t) ?? 0;
    if (tf === 0) continue;
    score += 1 + Math.log(1 + tf);
  }

  // small length normalization
  score = score / Math.sqrt(200 + c.length);

  return score;
}

export function pickBestSnippets(text: string, maxLen = 220): string {
  const s = (text || "").trim().replace(/\s+/g, " ");
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen).trimEnd() + "…";
}
