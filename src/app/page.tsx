import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    title: "Projects",
    href: "/projects",
    description: "Browse active DDQ/RFP projects and track progress.",
  },
  {
    title: "Knowledge Base",
    href: "/projects",
    description: "Upload evidence docs inside a project KB and chunk for retrieval.",
  },
  {
    title: "Queue",
    href: "/projects",
    description: "Review drafted answers, approve, or mark gaps for follow-up.",
  },
  {
    title: "Export",
    href: "/projects",
    description: "Generate CSV/JSON packages with citations for audit trails.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold">DDQ Copilot</h1>
        <p className="text-muted-foreground max-w-3xl leading-7">
          Evidence-first assistant for security questionnaires. Build a project, upload knowledge documents,
          draft with retrieval-backed citations, and export audit-ready responses.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Open projects
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={item.href} className="hover:underline underline-offset-4">
                  {item.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.description}</CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div>1) Create project</div>
            <div>2) Upload KB docs</div>
            <div>3) Run agent drafting</div>
            <div>4) Review and approve answers</div>
            <div>5) Export package for client/audit</div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
