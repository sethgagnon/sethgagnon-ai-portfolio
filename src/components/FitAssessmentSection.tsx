import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FitResult {
  verdict: "Strong Fit" | "Worth a Conversation" | "Probably Not";
  summary: string;
  strengths: string[];
  gaps: string[];
  reasoning: string;
}

const verdictStyles: Record<string, string> = {
  "Strong Fit": "bg-green-600 text-white border-green-600",
  "Worth a Conversation": "bg-yellow-500 text-black border-yellow-500",
  "Probably Not": "bg-red-600 text-white border-red-600",
};

const FitAssessmentSection = () => {
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<FitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleAssess = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("jd-fit", {
        body: { jd: jdText.trim() },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setResult(data as FitResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJdText("");
    setResult(null);
    setError(null);
  };

  return (
    <section id="fit-check" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="font-heading text-4xl font-bold text-foreground">Honest Fit Assessment</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
        Paste a job description. Get an honest assessment of whether I'm the right person, including when I'm not.
      </p>

      {!result && (
        <>
          <Textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste a job description here..."
            className="mt-8 min-h-[160px] bg-muted/30"
            disabled={loading}
          />

          <Button
            className="mt-4"
            onClick={handleAssess}
            disabled={!jdText.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing fit…
              </>
            ) : (
              "Assess Fit"
            )}
          </Button>
        </>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={handleAssess}>
            Try Again
          </Button>
        </div>
      )}

      {result && (
        <div ref={resultRef} className="mt-8 glass-card rounded-xl p-6 space-y-6">
          <Badge className={`text-sm px-4 py-1.5 ${verdictStyles[result.verdict] || ""}`}>
            {result.verdict}
          </Badge>

          <p className="text-base text-foreground font-medium leading-relaxed">{result.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3">WHERE I FIT</h4>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-secondary mb-3">WHERE I DON'T FIT</h4>
              {result.gaps.length > 0 ? (
                <ul className="space-y-2">
                  {result.gaps.map((g, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      {g}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No significant gaps identified.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">REASONING</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.reasoning}</p>
          </div>

          <Button variant="outline" onClick={handleReset}>
            Try Another Role
          </Button>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border/50 bg-muted/20 p-5">
        <p className="text-sm text-muted-foreground italic">
          "This isn't a cover letter. It's a mutual qualification. Your time is valuable, so is mine."
        </p>
      </div>
    </section>
  );
};

export default FitAssessmentSection;
