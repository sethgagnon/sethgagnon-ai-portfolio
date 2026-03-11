import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Sparkles } from "lucide-react";

interface ContextEntry {
  label: string;
  text: string;
}

interface Role {
  title: string;
  context_label: string;
  dates: string;
  bullets: string[];
  aiContext?: ContextEntry[];
}

const roles: Role[] = [
  {
    title: "Cloud Engineering Director",
    context_label: "Large Regulated Enterprise, Health Services",
    dates: "2022-Present",
    bullets: [
      "Built and scaled a cloud consulting function from zero to 12+ engineers, now expanding to include Cloud AI services",
      "Co-led formation of an enterprise AI Council, establishing governance, operating model, and shared platform infrastructure",
      "Advising expansion of FinOps practice to cover AI workload costs before spend outpaces governance",
    ],
    aiContext: [
      { label: "SITUATION", text: "No internal cloud consulting capability existed. The enterprise had fragmented cloud adoption with no centralized expertise, governance, or cost visibility." },
      { label: "APPROACH", text: "Built credibility through a relationship-driven model. Demonstrated results on a high-visibility initiative first, then scaled the function by proving value before asking for headcount." },
      { label: "TECHNICAL WORK", text: "Stood up multi-cloud platform engineering across Azure and AWS. Co-led AI Council with governance layers spanning model selection, data privacy, cost allocation, and shared platform infrastructure." },
      { label: "LESSONS LEARNED", text: "\"The job is enablement, not gatekeeping. If teams see you as a bottleneck, you've already lost, no matter how right your architecture is.\"" },
    ],
  },
  {
    title: "Owner",
    context_label: "CloudTech LLC",
    dates: "2020–Present",
    bullets: [
      "Independent advisory practice focused on cloud strategy, AI enablement, and infrastructure leadership",
      "Engagements with enterprise clients on cloud architecture, DevOps transformation, and AI platform design",
    ],
    aiContext: [
      { label: "SITUATION", text: "Most AI strategy discourse comes from vendors or analysts — there's a gap for the practitioner perspective, someone who's actually building and operating these systems inside enterprises." },
      { label: "APPROACH", text: "Launched the At Scale newsletter and advisory practice grounded in real operating experience — bridging the gap between executive AI ambition and engineering reality." },
      { label: "LESSONS LEARNED", text: "\"Writing from the inside — while you're still doing the work — carries a credibility that no amount of retrospective thought leadership can match.\"" },
    ],
  },
  {
    title: "Cloud Platform Lead / Senior Manager",
    context_label: "Same Enterprise",
    dates: "2020–2022",
    bullets: [
      "Led cloud platform engineering team through rapid scaling of enterprise public cloud adoption",
      "Established cloud architecture standards, security patterns, and DevOps practices across the organization",
    ],
    aiContext: [
      { label: "SITUATION", text: "Rapid scaling pressure with constrained budgets. The organization was moving to public cloud faster than governance and standards could keep up." },
      { label: "APPROACH", text: "Led through influence without authority in a matrixed organization — aligned stakeholders across security, finance, and application teams through shared outcomes rather than mandates." },
      { label: "TECHNICAL WORK", text: "Defined cloud architecture standards, security patterns, and DevOps practices that became the organizational baseline. Drove landing zone design and workload migration patterns." },
      { label: "LESSONS LEARNED", text: "\"In a matrixed org, your ability to lead through ambiguity matters more than your technical depth. People follow clarity, not credentials.\"" },
    ],
  },
  {
    title: "Architecture Senior Advisor",
    context_label: "Same Enterprise",
    dates: "2013–2020",
    bullets: [
      "7.5 years driving DevOps standards and cloud adoption across a large regulated enterprise",
      "IBM Champion 2013–2016 for external contributions to the practitioner community",
    ],
    aiContext: [
      { label: "SITUATION", text: "Legacy-heavy enterprise in early stages of cloud adoption. Significant cultural and technical resistance to modern engineering practices." },
      { label: "APPROACH", text: "Drove DevOps standards across a large organization by combining grassroots advocacy with formal architecture governance — meeting teams where they were." },
      { label: "TECHNICAL WORK", text: "Built CI/CD pipelines, middleware modernization patterns, and early cloud-native reference architectures. Contributed tooling and practices back to the broader IBM practitioner community." },
      { label: "LESSONS LEARNED", text: "\"Sustained community contribution isn't about self-promotion — it's about sharpening your own thinking by teaching others. The IBM Champion recognition was a byproduct, not the goal.\"" },
    ],
  },
];

const ExperienceCard = ({ role }: { role: Role }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
        <span>{role.context_label}</span>
        <span>·</span>
        <span>{role.dates}</span>
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground">{role.title}</h3>
      <ul className="mt-4 space-y-2">
        {role.bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {b}
          </li>
        ))}
      </ul>

      {role.aiContext && (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{open ? "Hide AI Context" : "Show AI Context"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="rounded-lg bg-black/30 border border-border/50 p-4 space-y-4">
              {role.aiContext.map((entry, i) => (
                <div key={i}>
                  <p className="text-xs uppercase tracking-widest font-mono text-primary/70 mb-1">
                    {entry.label}
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${
                      entry.label === "LESSONS LEARNED"
                        ? "italic text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

const ExperienceSection = () => (
  <section id="experience" className="mx-auto max-w-6xl px-6 py-24">
    <h2 className="font-heading text-4xl font-bold text-foreground">Experience</h2>
    <p className="mt-3 max-w-2xl text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      The real story behind the resume — ask the AI for deeper context on any of it.
    </p>

    <div className="mt-10 grid gap-6 md:grid-cols-2">
      {roles.map((r) => (
        <ExperienceCard key={r.title + r.dates} role={r} />
      ))}
    </div>

    {/* Education */}
    <div className="mt-12 glass-card rounded-xl p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Education</h3>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-8">
        <span>MS Technology Commercialization — Northeastern University</span>
        <span>BS Management Information Systems — University of Connecticut</span>
      </div>
    </div>

    {/* Recognition */}
    <div className="mt-6 flex flex-wrap gap-2">
      {["IBM Champion 2013–2016", "2024 Timmy Awards Finalist, Best Tech Manager", "Microsoft Certified: Azure Fundamentals"].map((r) => (
        <Badge key={r} variant="outline" className="border-border text-muted-foreground text-xs">{r}</Badge>
      ))}
    </div>
  </section>
);

export default ExperienceSection;
