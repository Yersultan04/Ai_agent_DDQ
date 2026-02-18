module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/kb/chunk.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chunkText",
    ()=>chunkText
]);
function chunkText(input, opts) {
    const maxChars = opts?.maxChars ?? 1200;
    const overlapChars = opts?.overlapChars ?? 200;
    const sourceRef = opts?.sourceRef;
    const text = (input ?? "").replace(/\r\n/g, "\n").trim();
    if (!text) return [];
    const chunks = [];
    let i = 0;
    let idx = 0;
    while(i < text.length){
        const end = Math.min(i + maxChars, text.length);
        const slice = text.slice(i, end).trim();
        if (slice) {
            chunks.push({
                chunkIndex: idx++,
                text: slice,
                tokenCount: Math.ceil(slice.length / 4),
                sourceRef
            });
        }
        if (end >= text.length) break;
        i = Math.max(0, end - overlapChars);
    }
    return chunks;
}
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[project]/src/app/api/projects/[projectId]/kb/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kb$2f$chunk$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/kb/chunk.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
;
;
;
;
;
const runtime = "nodejs";
function safeName(name) {
    return name.replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
}
function isTextLike(mime) {
    if (!mime) return false;
    return mime.startsWith("text/") || mime === "application/json" || mime === "application/xml";
}
async function GET(_req, ctx) {
    const { projectId } = await ctx.params;
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
        where: {
            id: projectId
        },
        select: {
            id: true,
            name: true
        }
    });
    if (!project) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Project not found"
        }, {
            status: 404
        });
    }
    const docs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeDocument.findMany({
        where: {
            projectId
        },
        orderBy: {
            uploadedAt: "desc"
        },
        select: {
            id: true,
            title: true,
            filename: true,
            mimeType: true,
            storagePath: true,
            sha256: true,
            uploadedAt: true,
            _count: {
                select: {
                    chunks: true
                }
            }
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        project,
        docs
    });
}
async function POST(req, ctx) {
    const { projectId } = await ctx.params;
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
        where: {
            id: projectId
        },
        select: {
            id: true
        }
    });
    if (!project) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Project not found"
        }, {
            status: 404
        });
    }
    const form = await req.formData();
    const file = form.get("file");
    const title = form.get("title") ?? null;
    if (!file) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing file"
        }, {
            status: 400
        });
    }
    const filename = safeName(file.name || "document.txt");
    const mimeType = file.type || "application/octet-stream";
    // Save file to local disk (MVP storage)
    const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "storage", projectId);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dir, {
        recursive: true
    });
    const storagePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join("storage", projectId, `${Date.now()}_${filename}`);
    const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), storagePath);
    const buf = Buffer.from(await file.arrayBuffer());
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(absPath, buf);
    // Create doc row
    const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledgeDocument.create({
        data: {
            projectId,
            title,
            filename,
            mimeType,
            storagePath,
            sha256: null
        },
        select: {
            id: true,
            filename: true,
            mimeType: true,
            storagePath: true,
            uploadedAt: true
        }
    });
    // Text-only chunking for MVP
    let chunkCount = 0;
    let warning = null;
    if (isTextLike(mimeType)) {
        const text = buf.toString("utf8");
        const chunks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$kb$2f$chunk$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["chunkText"])(text, {
            maxChars: 1200,
            overlapChars: 200,
            sourceRef: `${filename}`
        });
        if (chunks.length) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].documentChunk.createMany({
                data: chunks.map((c)=>({
                        projectId,
                        documentId: doc.id,
                        chunkIndex: c.chunkIndex,
                        text: c.text,
                        sourceRef: c.sourceRef,
                        tokenCount: c.tokenCount
                    }))
            });
            chunkCount = chunks.length;
        }
    } else {
        warning = "Uploaded successfully, but chunking is enabled only for text-like files in this MVP (txt/md/json).";
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        doc,
        chunkCount,
        warning
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fafbdb04._.js.map