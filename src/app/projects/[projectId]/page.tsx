import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Project Overview</h1>
        <div className="flex gap-2">
          <Link
            href={`/projects/${projectId}/queue`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Open queue
          </Link>
          <Link
            href={`/projects/${projectId}/export`}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2"
          >
            Export
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next step</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Next: queue table + question detail + agent runs.
        </CardContent>
      </Card>
    </main>
  );
}
