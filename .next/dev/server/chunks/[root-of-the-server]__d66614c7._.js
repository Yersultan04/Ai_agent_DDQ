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
"[project]/src/app/api/questions/[questionId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/prisma.ts [app-route] (ecmascript)");
;
;
async function GET(_req, ctx) {
    const { questionId } = await ctx.params;
    const question = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].question.findUnique({
        where: {
            id: questionId
        },
        select: {
            id: true,
            projectId: true,
            externalId: true,
            number: true,
            section: true,
            text: true,
            answerType: true,
            status: true,
            owner: true,
            confidence: true,
            updatedAt: true,
            answers: {
                orderBy: {
                    updatedAt: "desc"
                },
                take: 1,
                select: {
                    id: true,
                    text: true,
                    status: true,
                    createdBy: true,
                    updatedAt: true,
                    citations: {
                        select: {
                            id: true,
                            snippet: true,
                            relevanceScore: true,
                            chunk: {
                                select: {
                                    id: true,
                                    sourceRef: true,
                                    document: {
                                        select: {
                                            id: true,
                                            title: true,
                                            filename: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!question) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Not found"
        }, {
            status: 404
        });
    }
    const latestAnswer = question.answers[0] ?? null;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        question: {
            id: question.id,
            projectId: question.projectId,
            externalId: question.externalId,
            number: question.number,
            section: question.section,
            text: question.text,
            answerType: question.answerType,
            status: question.status,
            owner: question.owner,
            confidence: question.confidence,
            updatedAt: question.updatedAt.toISOString()
        },
        answer: latestAnswer ? {
            id: latestAnswer.id,
            text: latestAnswer.text,
            status: latestAnswer.status,
            createdBy: latestAnswer.createdBy,
            updatedAt: latestAnswer.updatedAt.toISOString(),
            evidence: latestAnswer.citations.map((c)=>({
                    citationId: c.id,
                    snippet: c.snippet,
                    relevanceScore: c.relevanceScore,
                    sourceRef: c.chunk.sourceRef,
                    documentId: c.chunk.document.id,
                    documentTitle: c.chunk.document.title,
                    filename: c.chunk.document.filename
                }))
        } : null
    });
}
async function PATCH(req, ctx) {
    const { questionId } = await ctx.params;
    const body = await req.json().catch(()=>null);
    if (!body || typeof body !== "object") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid JSON"
        }, {
            status: 400
        });
    }
    // allow updating: status, owner, confidence
    const data = {};
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.owner === "string" || body.owner === null) data.owner = body.owner;
    if (typeof body.confidence === "string") data.confidence = body.confidence;
    const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].question.update({
        where: {
            id: questionId
        },
        data,
        select: {
            id: true,
            status: true,
            owner: true,
            confidence: true,
            updatedAt: true
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].activityLog.create({
        data: {
            projectId: (await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].question.findUnique({
                where: {
                    id: questionId
                },
                select: {
                    projectId: true
                }
            })).projectId,
            questionId,
            actor: "USER",
            message: `Question updated: ${Object.keys(data).join(", ")}`
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        id: updated.id,
        status: updated.status,
        owner: updated.owner,
        confidence: updated.confidence,
        updatedAt: updated.updatedAt.toISOString()
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d66614c7._.js.map