import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { chunkText } from "@/lib/kb/chunk";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

function safeName(name: string) {
  return name.replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
}

function extOf(filename: string) {
  return path.extname(filename).toLowerCase();
}

function isTextLike(mime: string | null, filename: string) {
  const ext = extOf(filename);
  if (mime?.startsWith("text/")) return true;
  if (mime === "application/json" || mime === "application/xml") return true;
  return [".txt", ".md", ".json", ".xml", ".csv", ".log", ".yaml", ".yml"].includes(ext);
}

function sha256Hex(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
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

  const buf = Buffer.from(await file.arrayBuffer());
  const sha256 = sha256Hex(buf);

  const duplicate = await prisma.knowledgeDocument.findFirst({
    where: { projectId, sha256 },
    select: { id: true, filename: true, uploadedAt: true, _count: { select: { chunks: true } } },
  });

  if (duplicate) {
    return NextResponse.json(
      {
        ok: true,
        duplicate: true,
        doc: {
          id: duplicate.id,
          filename: duplicate.filename,
          mimeType,
          storagePath: null,
          uploadedAt: duplicate.uploadedAt,
        },
        chunkCount: duplicate._count.chunks,
        warning: "This exact file was already uploaded for this project (same SHA-256). Reusing existing document.",
      },
      { status: 200 }
    );
  }

  // Save file to local disk (MVP storage)
  const dir = path.join(process.cwd(), "storage", projectId);
  await fs.mkdir(dir, { recursive: true });
  const storagePath = path.join("storage", projectId, `${Date.now()}_${filename}`);
  const absPath = path.join(process.cwd(), storagePath);
  await fs.writeFile(absPath, buf);

  // Create doc row
  const doc = await prisma.knowledgeDocument.create({
    data: {
      projectId,
      title,
      filename,
      mimeType,
      storagePath,
      sha256,
    },
    select: { id: true, filename: true, mimeType: true, storagePath: true, uploadedAt: true },
  });

  let chunkCount = 0;
  let warning: string | null = null;

  if (isTextLike(mimeType, filename)) {
    const text = buf.toString("utf8");
    const chunks = chunkText(text, {
      maxChars: 1200,
      overlapChars: 200,
      sourceRef: filename,
    });

    if (chunks.length) {
      await prisma.documentChunk.createMany({
        data: chunks.map((c) => ({
          projectId,
          documentId: doc.id,
          chunkIndex: c.chunkIndex,
          text: c.text,
          sourceRef: `${filename}#chunk-${c.chunkIndex + 1}`,
          tokenCount: c.tokenCount,
        })),
      });
      chunkCount = chunks.length;
    } else {
      warning = "Uploaded successfully, but no text content was found for chunking.";
    }
  } else {
    warning =
      "Uploaded successfully, but chunking is enabled only for text-like files in this MVP (txt/md/json/xml/csv/yaml).";
  }

  return NextResponse.json({
    ok: true,
    duplicate: false,
    doc,
    chunkCount,
    warning,
  });
}
