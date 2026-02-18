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
"[project]/src/lib/retrieval/rank.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "pickBestSnippets",
    ()=>pickBestSnippets,
    "scoreChunk",
    ()=>scoreChunk
]);
function tokenize(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/).filter((t)=>t.length >= 3);
}
function scoreChunk(query, chunkText) {
    const q = tokenize(query);
    const c = tokenize(chunkText);
    if (q.length === 0 || c.length === 0) return 0;
    const cFreq = new Map();
    for (const t of c)cFreq.set(t, (cFreq.get(t) ?? 0) + 1);
    // Simple BM25-ish-ish scoring (not full BM25, but works well for MVP)
    let score = 0;
    const uniqueQ = Array.from(new Set(q));
    for (const t of uniqueQ){
        const tf = cFreq.get(t) ?? 0;
        if (tf === 0) continue;
        score += 1 + Math.log(1 + tf);
    }
    // small length normalization
    score = score / Math.sqrt(200 + c.length);
    return score;
}
function pickBestSnippets(text, maxLen = 220) {
    const s = (text || "").trim().replace(/\s+/g, " ");
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen).trimEnd() + "…";
}
}),
"[project]/src/app/api/projects/[projectId]/run/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2f$rank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/retrieval/rank.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
async function readBody(req) {
    const ct = req.headers.get("content-type") ?? "";
    try {
        if (ct.includes("application/json")) return await req.json();
        if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
            const fd = await req.formData();
            const obj = {};
            for (const [k, v] of fd.entries())obj[k] = v;
            return obj;
        }
    } catch  {
    // ignore
    }
    return {};
}
async function upsertAnswerByQuestionId(args) {
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].answer.findFirst({
        where: {
            questionId: args.questionId
        },
        select: {
            id: true
        }
    });
    if (existing) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].answer.update({
            where: {
                id: existing.id
            },
            data: {
                text: args.text,
                status: args.status
            },
            select: {
                id: true,
                text: true,
                status: true,
                updatedAt: true
            }
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].answer.create({
        data: {
            projectId: args.projectId,
            questionId: args.questionId,
            text: args.text,
            status: args.status,
            createdBy: args.createdBy
        },
        select: {
            id: true,
            text: true,
            status: true,
            updatedAt: true
        }
    });
}
async function POST(req, ctx) {
    const { projectId } = await ctx.params;
    const body = await readBody(req);
    const topK = clamp(Number(body.topK ?? 5), 1, 10);
    const limit = clamp(Number(body.limit ?? 200), 1, 1000);
    const includeDrafted = String(body.includeDrafted ?? "false") === "true";
    const statuses = includeDrafted ? [
        "UNANSWERED",
        "GAP",
        "NEEDS_REVIEW",
        "DRAFTED"
    ] : [
        "UNANSWERED",
        "GAP",
        "NEEDS_REVIEW"
    ];
    const questions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].question.findMany({
        where: {
            projectId,
            status: {
                in: statuses
            }
        },
        orderBy: [
            {
                number: "asc"
            },
            {
                createdAt: "asc"
            }
        ],
        take: limit,
        select: {
            id: true,
            projectId: true,
            text: true,
            status: true
        }
    });
    const chunks = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].documentChunk.findMany({
        where: {
            projectId
        },
        select: {
            id: true,
            text: true,
            sourceRef: true,
            documentId: true,
            document: {
                select: {
                    title: true,
                    filename: true
                }
            }
        },
        take: 3000
    });
    const errors = [];
    let drafted = 0;
    let gaps = 0;
    for (const q of questions){
        try {
            const ranked = chunks.map((c)=>{
                const score = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2f$rank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreChunk"])(q.text, c.text);
                return {
                    chunkId: c.id,
                    text: c.text,
                    sourceRef: c.sourceRef,
                    documentId: c.documentId,
                    documentTitle: c.document?.title ?? null,
                    filename: c.document?.filename ?? null,
                    score
                };
            }).filter((r)=>r.score > 0).sort((a, b)=>b.score - a.score).slice(0, topK);
            if (ranked.length === 0) {
                const answer = await upsertAnswerByQuestionId({
                    projectId: q.projectId,
                    questionId: q.id,
                    text: "I couldn't find supporting evidence in the Knowledge Base yet. Upload relevant policy docs and try again.",
                    status: "DRAFT",
                    createdBy: "AGENT"
                });
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].citation.deleteMany({
                    where: {
                        answerId: answer.id
                    }
                });
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].question.update({
                    where: {
                        id: q.id
                    },
                    data: {
                        status: "GAP"
                    }
                });
                gaps += 1;
                continue;
            }
            const bullets = ranked.map((r, i)=>{
                const doc = r.documentTitle ?? r.filename ?? "Document";
                const ref = r.sourceRef ? ` (${r.sourceRef})` : "";
                return `- Evidence ${i + 1}: ${doc}${ref}`;
            });
            const draftText = `Based on the uploaded documentation, here is the current evidence:

${bullets.join("\n")}

Draft response (edit as needed):
[Write a concise, audit-friendly answer here referencing the evidence above.]`;
            const answer = await upsertAnswerByQuestionId({
                projectId: q.projectId,
                questionId: q.id,
                text: draftText,
                status: "DRAFT",
                createdBy: "AGENT"
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].citation.deleteMany({
                where: {
                    answerId: answer.id
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].citation.createMany({
                data: ranked.map((r)=>({
                        answerId: answer.id,
                        chunkId: r.chunkId,
                        snippet: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$retrieval$2f$rank$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickBestSnippets"])(r.text, 220),
                        relevanceScore: r.score,
                        startOffset: null,
                        endOffset: null
                    }))
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].question.update({
                where: {
                    id: q.id
                },
                data: {
                    status: "DRAFTED"
                }
            });
            drafted += 1;
        } catch (e) {
            errors.push({
                questionId: q.id,
                error: e?.message ?? String(e)
            });
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        projectId,
        processed: questions.length,
        drafted,
        gaps,
        errors
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b8071826._.js.map