import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ExportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Export</h1>
        <Link href={`/projects/${projectId}/queue`} className="rounded-md border px-4 py-2">
          Back to queue
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Download</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Export answers with evidence (citations) for audit-ready sharing.
          </div>

          <div className="flex gap-2 flex-wrap">
            <a
              href={`/api/projects/${projectId}/export?format=csv`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Download CSV
            </a>
            <a
              href={`/api/projects/${projectId}/export?format=json`}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2"
            >
              Download JSON
            </a>
          </div>

          <div className="text-xs text-muted-foreground">
            CSV is best for auditors. JSON is best for integrations.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
