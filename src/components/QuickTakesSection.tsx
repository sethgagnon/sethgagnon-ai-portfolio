import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useQuickTakes } from "@/hooks/useQuickTakes";

const QuickTakesSection = () => {
  const { quickTakes, allTags, isLoading, error, refetch } = useQuickTakes();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? quickTakes.filter((qt) => qt.tags.includes(activeTag))
    : quickTakes;

  return (
    <section id="quick-takes" className="mx-auto max-w-6xl overflow-x-hidden px-6 py-24">
      <h2 className="font-heading text-4xl font-bold text-foreground">Quick Takes</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
        Short-form commentary on AI, infrastructure, and engineering leadership — originally shared on LinkedIn.
      </p>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              activeTag === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t === activeTag ? null : t)}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                activeTag === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-10 text-center py-12">
          <p className="text-sm text-destructive mb-3">Failed to load quick takes.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3 mr-1" /> Try again
          </Button>
        </div>
      )}

      {/* Empty filter state */}
      {!isLoading && !error && filtered.length === 0 && quickTakes.length > 0 && (
        <p className="mt-10 text-sm text-muted-foreground">No quick takes match this topic.</p>
      )}

      {/* Quick take cards */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((qt) => (
            <article key={qt.id} className="glass-card rounded-xl p-5 flex flex-col">
              {qt.date && (
                <span className="text-[11px] text-muted-foreground mb-2">
                  {format(parseISO(qt.date), "MMM dd, yyyy")}
                </span>
              )}
              <h3 className="font-heading text-sm font-semibold text-foreground leading-snug">
                {qt.title}
              </h3>
              {qt.description && (
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-4 flex-1">
                  {qt.description}
                </p>
              )}
              {qt.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {qt.tags.map((tag) => (
                    <Badge key={tag} className="text-[9px] px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {qt.postUrl && (
                <button
                  onClick={() => window.open(qt.postUrl!, "_blank", "noopener,noreferrer")}
                  className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline w-fit"
                >
                  View on LinkedIn <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default QuickTakesSection;
