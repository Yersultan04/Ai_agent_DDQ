import Link from "next/link";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Uploader } from "./Uploader";

type KbDoc = {
  id: string;
  title: string | null;
  filename: string;
  mimeType: string;
  storagePath: string;
  uploadedAt: string;
  _count: { chunks: number };
};

async function getKb(projectId: string): Promise<{ project: { id: string; name: string }; docs: KbDoc[] }> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/projects/${projectId}/kb`, { cache: "no-store" });
  if (!res.ok) {
    return { project: { id: projectId, name: "Project" }, docs: [] };
  }
  return res.json();
}

export default async function KbPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const data = await getKb(projectId);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Knowledge Base</h1>
          <div className="text-sm text-muted-foreground">
            {data.project?.name ?? "Project"} • {data.docs.length} documents
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/projects/${projectId}/queue`} className="rounded-md border px-4 py-2">
            Back to queue
          </Link>
          <Link href={`/projects/${projectId}/export`} className="rounded-md border px-4 py-2">
            Export
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload document</CardTitle>
        </CardHeader>
        <CardContent>
          <Uploader projectId={projectId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.docs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No documents yet. Upload txt/md/json to start.</div>
          ) : (
            <div className="space-y-2">
              {data.docs.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-4 border rounded-md p-3">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {d.title ? d.title : d.filename}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {d.filename} • {d.mimeType} • chunks: {d._count.chunks}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded: {new Date(d.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.storagePath}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
