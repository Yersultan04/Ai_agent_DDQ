import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RunAgentButton from "@/components/run-agent-button";
import { Badge } from "@/components/ui/badge";

type QuestionRow = {
  id: string;
  projectId: string;
  externalId?: string | null;
  number?: number | null;
  section?: string | null;
  text: string;
  answerType: string;
  status: string;
  owner?: string | null;
  confidence: string;
  updatedAt: string;
};

async function getQueue(projectId: string): Promise<QuestionRow[]> {
  const res = await fetch(`http://localhost:3000/api/projects/${projectId}/queue`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "APPROVED") return "default";
  if (status === "GAP") return "destructive";
  if (status === "NEEDS_REVIEW") return "secondary";
  if (status === "DRAFTED") return "secondary";
  return "outline";
}

export default async function QueuePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const rows = await getQueue(projectId);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Question queue</h1>
          <div className="text-sm text-muted-foreground">{rows.length} questions</div>
        </div>

        <div className="flex gap-2">
          <RunAgentButton projectId={projectId} />
          <Link href={`/projects/${projectId}`} className="rounded-md border px-4 py-2">
            Overview
          </Link>
          <Link href={`/projects/${projectId}/kb`} className="rounded-md border px-4 py-2">
            KB
          </Link>
          <Link href={`/projects/${projectId}/export`} className="rounded-md border px-4 py-2">
            Export
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="p-3 w-16">#</th>
                  <th className="p-3 w-44">Section</th>
                  <th className="p-3">Question</th>
                  <th className="p-3 w-32">Status</th>
                  <th className="p-3 w-28">Confidence</th>
                  <th className="p-3 w-44">Updated</th>
                  <th className="p-3 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q) => (
                  <tr key={q.id} className="border-b hover:bg-muted/30 align-top">
                    <td className="p-3 text-muted-foreground">{q.number ?? "-"}</td>
                    <td className="p-3">{q.section ?? "-"}</td>
                    <td className="p-3">
                      <Link className="underline underline-offset-4" href={`/questions/${q.id}`}>
                        {q.text}
                      </Link>
                      {q.externalId ? (
                        <div className="text-xs text-muted-foreground mt-1">{q.externalId}</div>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{q.confidence}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(q.updatedAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`/questions/${q.id}`}
                          className="rounded-md border px-3 py-1.5 text-sm"
                        >
                          Open
                        </a>

                        {/* Plain HTML form: no JS handlers in Server Component */}
                        <form action={`/api/questions/${q.id}/draft`} method="post">
                          <button
                            type="submit"
                            className="rounded-md border px-3 py-1.5 text-sm"
                            title="Creates/updates a DRAFT answer with citations"
                          >
                            Draft
                          </button>
                        </form>
                      </div>

                      <div className="text-[11px] text-muted-foreground mt-2">
                        After Draft: refresh the page to see updated status/time.
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td className="p-6 text-muted-foreground" colSpan={7}>
                      No questions yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
