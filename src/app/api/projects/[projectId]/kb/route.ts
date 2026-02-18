import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { chunkText } from "@/lib/kb/chunk";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

function safeName(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
}

function isTextLike(mime: string | null) {
  if (!mime) return false;
  return (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml"
  );
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const docs = await prisma.knowledgeDocument.findMany({
    where: { projectId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      title: true,
      filename: true,
      mimeType: true,
      storagePath: true,
      sha256: true,
      uploadedAt: true,
      _count: { select: { chunks: true } },
    },
  });

  return NextResponse.json({ project, docs });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const title = (form.get("title") as string | null) ?? null;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const filename = safeName(file.name || "document.txt");
  const mimeType = file.type || "application/octet-stream";

  // Save file to local disk (MVP storage)
  const dir = path.join(process.cwd(), "storage", projectId);
  await fs.mkdir(dir, { recursive: true });
  const storagePath = path.join("storage", projectId, `${Date.now()}_${filename}`);
  const absPath = path.join(process.cwd(), storagePath);

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buf);

  // Create doc row
  const doc = await prisma.knowledgeDocument.create({
    data: {
      projectId,
      title,
      filename,
      mimeType,
      storagePath,
      sha256: null,
    },
    select: { id: true, filename: true, mimeType: true, storagePath: true, uploadedAt: true },
  });

  // Text-only chunking for MVP
  let chunkCount = 0;
  let warning: string | null = null;

  if (isTextLike(mimeType)) {
    const text = buf.toString("utf8");
    const chunks = chunkText(text, {
      maxChars: 1200,
      overlapChars: 200,
      sourceRef: `${filename}`,
    });

    if (chunks.length) {
      await prisma.documentChunk.createMany({
        data: chunks.map((c) => ({
          projectId,
          documentId: doc.id,
          chunkIndex: c.chunkIndex,
          text: c.text,
          sourceRef: c.sourceRef,
          tokenCount: c.tokenCount,
        })),
      });
      chunkCount = chunks.length;
    }
  } else {
    warning =
      "Uploaded successfully, but chunking is enabled only for text-like files in this MVP (txt/md/json).";
  }

  return NextResponse.json({
    ok: true,
    doc,
    chunkCount,
    warning,
  });
}
