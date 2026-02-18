import Link from "next/link";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProjectSummary = {
  id: string;
  name: string;
  type: string;
  clientName?: string | null;
  evidenceOnly: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  gapQuestions: number;
  statusLabel: string;
  updatedAt: string;
};

function safeVariant(label: string): "default" | "secondary" | "outline" | "destructive" {
  const v = (label || "").toUpperCase();
  if (v.includes("APPROV")) return "default";
  if (v.includes("CONFLICT") || v.includes("FAIL")) return "destructive";
  if (v.includes("DRAFT") || v.includes("REVIEW")) return "secondary";
  return "outline";
}

async function getProjects(): Promise<ProjectSummary[]> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (!host) return [];
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/projects`, {
    cache: "no-store",
    headers: {
      // helps avoid weird caching/proxy behavior in some setups
      Accept: "application/json",
    },
  });

  if (!res.ok) return [];
  return (await res.json()) as ProjectSummary[];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <div className="text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        </div>

        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create a new project or seed demo data.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-6">
                    <Link
                      href={`/projects/${p.id}/queue`}
                      className="hover:underline underline-offset-4"
                    >
                      {p.name}
                    </Link>
                  </CardTitle>

                  <Badge variant={safeVariant(p.statusLabel)}>{p.statusLabel}</Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  {p.clientName ? `Client: ${p.clientName}` : "No client set"} • {p.type}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{p.totalQuestions} total</Badge>
                  <Badge variant="outline">{p.answeredQuestions} answered</Badge>
                  <Badge variant="outline">{p.gapQuestions} gaps</Badge>
                  {p.evidenceOnly ? <Badge>Evidence-first</Badge> : <Badge variant="secondary">Flexible</Badge>}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(p.updatedAt).toLocaleString()}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/projects/${p.id}/queue`} className="rounded-md border px-3 py-1.5 text-sm">
                      Queue
                    </Link>
                    <Link href={`/projects/${p.id}/kb`} className="rounded-md border px-3 py-1.5 text-sm">
                      KB
                    </Link>
                    <Link href={`/projects/${p.id}/export`} className="rounded-md border px-3 py-1.5 text-sm">
                      Export
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
