import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

function chunkText(text: string, chunkSize = 900, overlap = 120) {
  const cleaned = text.replace(/\r\n/g, "\n");
  const chunks: { content: string; start: number; end: number }[] = [];

  let i = 0;
  while (i < cleaned.length) {
    const end = Math.min(i + chunkSize, cleaned.length);
    const content = cleaned.slice(i, end);
    chunks.push({ content, start: i, end });
    i = end - overlap;
    if (i < 0) i = 0;
    if (end === cleaned.length) break;
  }
  return chunks;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await ctx.params;

  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const filename = file.name || "upload.txt";
  const mime = file.type || "text/plain";

  if (!filename.endsWith(".txt") && !filename.endsWith(".md")) {
    return NextResponse.json({ error: "Only .txt or .md supported for MVP" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const raw = buf.toString("utf8");

  const doc = await prisma.knowledgeDocument.create({
    data: {
      projectId,
      title: filename.replace(/\.(txt|md)$/i, ""),
      filename,
      mimeType: mime,
      content: raw,
    },
    select: { id: true },
  });

  const chunks = chunkText(raw);
  await prisma.documentChunk.createMany({
    data: chunks.map((c, idx) => ({
      documentId: doc.id,
      sourceRef: `chunk:${idx + 1}`,
      content: c.content,
      charStart: c.start,
      charEnd: c.end,
    })),
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      actor: "USER",
      message: `KB uploaded: ${filename} (${chunks.length} chunks)`,
    },
  });

  return NextResponse.json({
    documentId: doc.id,
    chunksCreated: chunks.length,
  });
}
