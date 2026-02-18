export type Chunk = {
  chunkIndex: number;
  text: string;
  tokenCount?: number;
  sourceRef?: string;
};

export function chunkText(
  input: string,
  opts?: { maxChars?: number; overlapChars?: number; sourceRef?: string }
): Chunk[] {
  const maxChars = opts?.maxChars ?? 1200;
  const overlapChars = opts?.overlapChars ?? 200;
  const sourceRef = opts?.sourceRef;

  const text = (input ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const chunks: Chunk[] = [];
  let i = 0;
  let idx = 0;

  while (i < text.length) {
    const end = Math.min(i + maxChars, text.length);
    const slice = text.slice(i, end).trim();
    if (slice) {
      chunks.push({
        chunkIndex: idx++,
        text: slice,
        tokenCount: Math.ceil(slice.length / 4),
        sourceRef,
      });
    }
    if (end >= text.length) break;
    i = Math.max(0, end - overlapChars);
  }

  return chunks;
}
