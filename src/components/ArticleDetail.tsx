import { useEffect } from "react";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { format, parseISO } from "date-fns";

interface ArticleDetailProps {
  articleId: string | null;
  title: string;
  date: string | null;
  tags: string[];
  postUrl: string | null;
  onClose: () => void;
}

const ArticleDetail = ({ articleId, title, date, tags, postUrl, onClose }: ArticleDetailProps) => {
  const { data: content, isLoading, error, refetch } = useArticleDetail(articleId);

  // Dynamic SEO: update document title and meta description when article opens
  useEffect(() => {
    if (!articleId) return;
    const prevTitle = document.title;
    document.title = `${title} | Seth Gagnon`;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    if (metaDesc) {
      metaDesc.setAttribute("content", `${title} — At Scale newsletter by Seth Gagnon`);
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.setAttribute("content", prevDesc);
    };
  }, [articleId, title]);

  return (
    <Dialog open={!!articleId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-foreground leading-snug pr-8">
            {title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {date && (
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(date), "MMMM dd, yyyy")}
                </span>
              )}
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] border-border">
                  {tag}
                </Badge>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-destructive mb-3">Failed to load article content.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-3 w-3 mr-1" /> Try again
              </Button>
            </div>
          )}

          {content && (
            <article
              className="prose prose-invert prose-sm max-w-none prose-headings:font-heading prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, { ADD_ATTR: ['target', 'rel'] }) }}
            />
          )}
        </div>

        {postUrl && (
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={() => window.open(postUrl!, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Read on LinkedIn <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArticleDetail;
