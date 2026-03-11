import { Badge } from "@/components/ui/badge";

const roles = [
  {
    title: "Cloud Engineering Director",
    context: "Large Regulated Enterprise, Health Services",
    dates: "2022–Present",
    bullets: [
      "Built and scaled a cloud consulting function from zero to 12+ engineers, now expanding to include Cloud AI services",
      "Co-led formation of an enterprise AI Council, establishing governance, operating model, and shared platform infrastructure",
      "Advising expansion of FinOps practice to cover AI workload costs before spend outpaces governance",
    ],
  },
  {
    title: "Owner",
    context: "CloudTech LLC",
    dates: "2020–Present",
    bullets: [
      "Independent advisory practice focused on cloud strategy, AI enablement, and infrastructure leadership",
      "Engagements with enterprise clients on cloud architecture, DevOps transformation, and AI platform design",
    ],
  },
  {
    title: "Cloud Platform Lead / Senior Manager",
    context: "Same Enterprise",
    dates: "2020–2022",
    bullets: [
      "Led cloud platform engineering team through rapid scaling of enterprise public cloud adoption",
      "Established cloud architecture standards, security patterns, and DevOps practices across the organization",
    ],
  },
  {
    title: "Architecture Senior Advisor",
    context: "Same Enterprise",
    dates: "2013–2020",
    bullets: [
      "7.5 years driving DevOps standards and cloud adoption across a large regulated enterprise",
      "IBM Champion 2013–2016 for external contributions to the practitioner community",
    ],
  },
];

const ExperienceSection = () => (
  <section id="experience" className="mx-auto max-w-6xl px-6 py-24">
    <h2 className="font-heading text-4xl font-bold text-foreground">Experience</h2>
    <p className="mt-3 max-w-2xl text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      The real story behind the resume — ask the AI for deeper context on any of it.
    </p>

    <div className="mt-10 grid gap-6 md:grid-cols-2">
      {roles.map((r) => (
        <div key={r.title + r.dates} className="glass-card rounded-xl p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>{r.context}</span>
            <span>·</span>
            <span>{r.dates}</span>
          </div>
          <h3 className="font-heading text-xl font-semibold text-foreground">{r.title}</h3>
          <ul className="mt-4 space-y-2">
            {r.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {b}
              </li>
            ))}
          </ul>
        </div>
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
