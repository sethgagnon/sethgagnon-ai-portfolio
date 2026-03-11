import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNotionArticles, NotionArticle } from "@/hooks/useNotionArticles";
import ArticleDetail from "@/components/ArticleDetail";

const WritingSection = () => {
  const { articles, allTags, isLoading, error, refetch } = useNotionArticles();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NotionArticle | null>(null);

  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <section id="writing" className="mx-auto max-w-6xl overflow-x-hidden px-6 py-24">
      <h2 className="font-heading text-4xl font-bold text-foreground">At Scale</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
        A newsletter for infrastructure and engineering leaders navigating enterprise AI adoption.
        Real practitioner perspective — not vendor content.
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
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-10 text-center py-12">
          <p className="text-sm text-destructive mb-3">Failed to load articles.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3 mr-1" /> Try again
          </Button>
        </div>
      )}

      {/* Empty filter state */}
      {!isLoading && !error && filtered.length === 0 && articles.length > 0 && (
        <p className="mt-10 text-sm text-muted-foreground">No articles match this topic.</p>
      )}

      {/* Article cards */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {filtered.map((a) => (
            <article key={a.id} className="glass-card rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                {a.date && <span>{format(parseISO(a.date), "MMMM dd, yyyy")}</span>}
                <span>·</span>
                <Badge variant="outline" className="text-[10px] border-border">
                  Newsletter Article
                </Badge>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground leading-snug">
                {a.title}
              </h3>
              {a.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.tags.map((tag) => (
                    <Badge key={tag} className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">
                {a.description}
              </p>
              <div className="mt-6 flex gap-4 text-xs">
                <button
                  onClick={() => setSelectedArticle(a)}
                  className="text-primary hover:underline"
                >
                  Read more
                </button>
                {a.postUrl && (
                  <button
                    onClick={() => window.open(a.postUrl!, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    View on LinkedIn <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Article detail dialog */}
      {selectedArticle && (
        <ArticleDetail
          articleId={selectedArticle.id}
          title={selectedArticle.title}
          date={selectedArticle.date}
          tags={selectedArticle.tags}
          postUrl={selectedArticle.postUrl}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </section>
  );
};

export default WritingSection;
