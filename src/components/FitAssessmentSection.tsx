import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const strongFitJD = `VP of Cloud Engineering — Fortune 500 Healthcare Company
Lead enterprise cloud strategy across AWS and Azure. Build and manage a team of 15+ cloud engineers. Drive AI/ML platform adoption. Partner with security and compliance teams. 10+ years in enterprise technology leadership required.`;

const weakFitJD = `Head of Mobile Engineering — Series B Consumer Fintech
Lead mobile engineering for our flagship iOS/Android app. Ship weekly releases to 2M+ users. Build and scale a team of mobile engineers. Deep expertise in React Native or Flutter required.`;

const sampleOutput = {
  verdict: "Strong Fit",
  reasoning: "This role maps directly to my current scope and trajectory. I've built cloud functions at this scale inside regulated healthcare, co-led AI governance, and managed the kind of cross-functional alignment this position demands.",
  fit: [
    "20+ years enterprise technology leadership in regulated environments (healthcare specifically)",
    "Built cloud consulting function from zero to 12+ engineers — directly mirrors the team-building requirement",
    "Co-led enterprise AI Council — strong alignment with AI/ML platform adoption mandate",
  ],
  gaps: [
    "Haven't held the exact VP title yet — current scope is Director-level with VP-adjacent responsibilities",
  ],
  recommendation: "I'd take this conversation seriously. The scope matches, the domain matches, and I bring practitioner depth that most candidates at this level have traded for breadth. Let's talk.",
};

const FitAssessmentSection = () => {
  const [jdText, setJdText] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  const handleDemo = (type: "strong" | "weak") => {
    setJdText(type === "strong" ? strongFitJD : weakFitJD);
    setShowOutput(false);
  };

  return (
    <section id="fit-check" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="font-heading text-4xl font-bold text-foreground">Honest Fit Assessment</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
        Paste a job description. Get an honest assessment of whether I'm the right person — including when I'm not.
      </p>

      {/* Demo toggles */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={() => handleDemo("strong")}>Strong Fit Example</Button>
        <Button variant="outline" size="sm" onClick={() => handleDemo("weak")}>Weak Fit Example</Button>
      </div>

      <Textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste job description here..."
        className="mt-4 min-h-[140px] bg-muted/30"
      />

      <Button className="mt-4" onClick={() => setShowOutput(true)}>Analyze Fit</Button>

      {showOutput && (
        <div className="mt-8 glass-card rounded-xl p-6 space-y-6">
          <Badge className="text-sm px-4 py-1">{sampleOutput.verdict}</Badge>
          <p className="text-sm text-muted-foreground leading-relaxed">{sampleOutput.reasoning}</p>

          <div>
            <h4 className="text-sm font-semibold text-primary mb-2">WHERE I FIT</h4>
            <ul className="space-y-2">
              {sampleOutput.fit.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-secondary mb-2">WHERE I DON'T FIT</h4>
            <ul className="space-y-2">
              {sampleOutput.gaps.map((g, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">MY RECOMMENDATION</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{sampleOutput.recommendation}</p>
          </div>
        </div>
      )}

      {/* Philosophy callout */}
      <div className="mt-8 rounded-xl border border-border/50 bg-muted/20 p-5">
        <p className="text-sm text-muted-foreground italic">
          "This isn't a cover letter. It's a mutual qualification. Your time is valuable — so is mine."
        </p>
      </div>
    </section>
  );
};

export default FitAssessmentSection;
