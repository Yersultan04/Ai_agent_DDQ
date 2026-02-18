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
"[project]/src/app/api/projects/[projectId]/export/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/prisma.ts [app-route] (ecmascript)");
;
;
const runtime = "nodejs";
function csvEscape(v) {
    const s = String(v ?? "");
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}
function computeStats(questions) {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter((q)=>(q.answers?.[0]?.text ?? "").trim().length > 0).length;
    const approvedAnswers = questions.filter((q)=>q.answers?.[0]?.status === "APPROVED").length;
    const draftedAnswers = questions.filter((q)=>q.answers?.[0]?.status === "DRAFT").length;
    let citationsCount = 0;
    for (const q of questions)citationsCount += q.answers?.[0]?.citations?.length ?? 0;
    return {
        totalQuestions,
        answeredQuestions,
        approvedAnswers,
        draftedAnswers,
        citationsCount
    };
}
async function GET(req, ctx) {
    const { projectId } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const formatRaw = (searchParams.get("format") ?? "csv").toLowerCase();
    const isJson = formatRaw === "json";
    const formatEnum = isJson ? "JSON" : "CSV";
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findUnique({
        where: {
            id: projectId
        },
        select: {
            id: true,
            name: true,
            clientName: true,
            type: true,
            evidenceOnly: true,
            updatedAt: true
        }
    });
    if (!project) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Project not found"
        }, {
            status: 404
        });
    }
    const questions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].question.findMany({
        where: {
            projectId
        },
        orderBy: [
            {
                number: "asc"
            },
            {
                createdAt: "asc"
            }
        ],
        select: {
            id: true,
            number: true,
            externalId: true,
            section: true,
            text: true,
            answerType: true,
            status: true,
            confidence: true,
            updatedAt: true,
            answers: {
                orderBy: [
                    {
                        updatedAt: "desc"
                    }
                ],
                take: 1,
                select: {
                    id: true,
                    text: true,
                    status: true,
                    updatedAt: true,
                    citations: {
                        select: {
                            id: true,
                            snippet: true,
                            relevanceScore: true,
                            chunk: {
                                select: {
                                    sourceRef: true,
                                    document: {
                                        select: {
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
    // Write an Export record (best-effort; do not fail export if logging fails)
    try {
        const stats = computeStats(questions);
        const filePath = `ddq_${projectId}.${isJson ? "json" : "csv"}`;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].export.create({
            data: {
                projectId,
                format: formatEnum,
                filePath,
                statsJson: JSON.stringify(stats)
            }
        });
    } catch (e) {
    // ignore
    }
    if (isJson) {
        const payload = {
            project,
            exportedAt: new Date().toISOString(),
            questions
        };
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify(payload, null, 2), {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": `attachment; filename="ddq_${projectId}.json"`
            }
        });
    }
    const header = [
        "project_id",
        "project_name",
        "client_name",
        "question_number",
        "question_external_id",
        "section",
        "question_text",
        "question_status",
        "confidence",
        "answer_status",
        "answer_text",
        "citations_count",
        "citations",
        "updated_at"
    ];
    const rows = [];
    rows.push(header.join(","));
    for (const q of questions){
        const a = q.answers?.[0] ?? null;
        const citations = (a?.citations ?? []).map((c)=>{
            const docTitle = c.chunk?.document?.title ?? c.chunk?.document?.filename ?? "doc";
            const ref = c.chunk?.sourceRef ?? "";
            const score = typeof c.relevanceScore === "number" ? c.relevanceScore.toFixed(2) : "";
            const snip = (c.snippet ?? "").slice(0, 180);
            return `${docTitle} | ${ref} | score:${score} | ${snip}`;
        });
        const row = [
            project.id,
            project.name,
            project.clientName ?? "",
            q.number ?? "",
            q.externalId ?? "",
            q.section ?? "",
            q.text,
            q.status,
            q.confidence,
            a?.status ?? "",
            a?.text ?? "",
            String(citations.length),
            citations.join(" || "),
            new Date(q.updatedAt).toISOString()
        ].map(csvEscape);
        rows.push(row.join(","));
    }
    const csv = rows.join("\n");
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="ddq_${projectId}.csv"`
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__45e2310d._.js.map