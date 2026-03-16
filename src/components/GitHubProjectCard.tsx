import { Star, GitFork, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { GitHubRepo } from "@/hooks/useGitHubRepos";

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Ruby: "#701516",
};

export function GitHubProjectCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function GitHubProjectCard({ repo }: { repo: GitHubRepo }) {
  const langColor = repo.language ? languageColors[repo.language] || "#8b8b8b" : null;

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card rounded-xl p-6 flex flex-col gap-3 hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {repo.name}
        </h3>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      {repo.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
      )}

      <div className="flex items-center gap-4 mt-auto text-xs text-muted-foreground">
        {repo.language && langColor && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: langColor }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" />
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5" />
          {repo.forks_count}
        </span>
      </div>
    </a>
  );
}
