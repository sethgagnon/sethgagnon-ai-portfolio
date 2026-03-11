import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const tags = ["AI", "Cloud", "Leadership", "Strategy", "Architecture", "Governance"];

const articles = [
  {
    title: "Why Your AI Governance Model Will Break Before You Think It Will",
    date: "March 2026",
    tag: "Governance",
    description: "Most enterprises copy-paste their data governance playbook onto AI and call it done. Here's why that fails at scale — and what a workable model actually looks like.",
  },
  {
    title: "The FinOps Problem Nobody Is Talking About: AI Inference Costs",
    date: "February 2026",
    tag: "AI",
    description: "Training costs get the headlines, but inference is the slow bleed. If your FinOps practice doesn't account for AI workload patterns, you're already behind.",
  },
  {
    title: "Building an AI-Ready Platform: What Infrastructure Leaders Get Wrong",
    date: "January 2026",
    tag: "Architecture",
    description: "The platform your cloud team built for containerized workloads won't cut it for AI. Here's what actually needs to change — and what can stay.",
  },
];

const WritingSection = () => (
  <section id="writing" className="mx-auto max-w-6xl px-6 py-24">
    <h2 className="font-heading text-4xl font-bold text-foreground">At Scale</h2>
    <p className="mt-3 max-w-2xl text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      A newsletter for infrastructure and engineering leaders navigating enterprise AI adoption. Real practitioner perspective — not vendor content.
    </p>

    {/* Tag filter bar */}
    <div className="mt-8 flex flex-wrap gap-2">
      {tags.map((t) => (
        <button key={t} className="rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          {t}
        </button>
      ))}
    </div>

    {/* Article cards */}
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {articles.map((a) => (
        <article key={a.title} className="glass-card rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>{a.date}</span>
            <span>·</span>
            <Badge variant="outline" className="text-[10px] border-border">Newsletter Article</Badge>
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground leading-snug">{a.title}</h3>
          <Badge className="mt-3 w-fit text-[10px]">{a.tag}</Badge>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">{a.description}</p>
          <div className="mt-6 flex gap-4 text-xs">
            <a href="#" className="text-primary hover:underline">Read Article</a>
            <a href="#" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              View on LinkedIn <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default WritingSection;
