import { Check, Circle, X } from "lucide-react";

const categories = [
  {
    title: "Strong",
    icon: Check,
    accent: "text-primary",
    borderAccent: "border-primary/30",
    items: [
      "Cloud platform architecture (AWS, Azure, GCP, OCI)",
      "Enterprise AI enablement strategy",
      "Agentic AI platform architecture",
      "Engineering team leadership",
      "Organizational governance design",
      "FinOps strategy",
      "Technical thought leadership",
    ],
  },
  {
    title: "Developing",
    icon: Circle,
    accent: "text-muted-foreground",
    borderAccent: "border-border",
    items: [
      "AI FinOps (established cloud FinOps foundation, extending to AI)",
      "M&A technology integration",
    ],
  },
  {
    title: "Honest Gaps",
    icon: X,
    accent: "text-secondary",
    borderAccent: "border-secondary/30",
    items: [
      "Consumer / mobile product",
      "Hands-on software engineering",
      "Early-stage startup environments",
    ],
  },
];

const SkillsSection = () => (
  <section className="mx-auto max-w-6xl px-6 py-24">
    <h2 className="font-heading text-4xl font-bold text-foreground mb-10">Skills Matrix</h2>
    <div className="grid gap-6 md:grid-cols-3">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <div key={cat.title} className={`glass-card rounded-xl p-6 border ${cat.borderAccent}`}>
            <div className={`flex items-center gap-2 mb-5 ${cat.accent}`}>
              <Icon className="h-5 w-5" />
              <h3 className="font-heading text-xl font-semibold">{cat.title}</h3>
            </div>
            <ul className="space-y-3">
              {cat.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${cat.accent}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  </section>
);

export default SkillsSection;
