import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GitHubRepo {
  id: string;
  full_name: string;
  name: string;
  description: string | null;
  readme_excerpt: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}

function extractReadmeExcerpt(raw: string, maxLen = 200): string | null {
  // Strip markdown: badges, images, headers, links, bold/italic, HTML tags
  const cleaned = raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")        // images/badges
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")      // links → text
    .replace(/^#{1,6}\s+.*$/gm, "")               // headers
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1") // bold/italic
    .replace(/<[^>]+>/g, "")                       // HTML tags
    .replace(/```[\s\S]*?```/g, "")                // code blocks
    .replace(/`[^`]+`/g, "")                       // inline code
    .replace(/\n{2,}/g, "\n")
    .trim();

  // Find first non-empty line that looks like a sentence
  const lines = cleaned.split("\n").map(l => l.trim()).filter(l => l.length > 20);
  if (!lines.length) return null;

  const excerpt = lines[0].length > maxLen ? lines[0].slice(0, maxLen).replace(/\s\S*$/, "…") : lines[0];
  return excerpt;
}

export function useGitHubRepos() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: featured, error } = await supabase
          .from("featured_repos")
          .select("*")
          .order("display_order", { ascending: true });

        if (error || !featured?.length) {
          setRepos([]);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          featured.map(async (f: { id: string; repo_full_name: string }) => {
            try {
              const res = await fetch(`https://api.github.com/repos/${f.repo_full_name}`, {
                headers: { "User-Agent": "lovable-app" },
              });
              if (!res.ok) return null;
              const data = await res.json();

              // Fetch README excerpt
              let readme_excerpt: string | null = null;
              try {
                const readmeRes = await fetch(`https://api.github.com/repos/${f.repo_full_name}/readme`, {
                  headers: { "User-Agent": "lovable-app", Accept: "application/vnd.github.v3+json" },
                });
                if (readmeRes.ok) {
                  const readmeData = await readmeRes.json();
                  const bytes = Uint8Array.from(atob(readmeData.content.replace(/\n/g, "")), c => c.charCodeAt(0));
                  const decoded = new TextDecoder().decode(bytes);
                  readme_excerpt = extractReadmeExcerpt(decoded);
                }
              } catch { /* fall back to description */ }

              return {
                id: f.id,
                full_name: data.full_name,
                name: data.name,
                description: data.description,
                readme_excerpt,
                language: data.language,
                stargazers_count: data.stargazers_count,
                forks_count: data.forks_count,
                html_url: data.html_url,
              } as GitHubRepo;
            } catch {
              return null;
            }
          })
        );

        setRepos(results.filter((r): r is GitHubRepo => r !== null));
      } catch {
        setRepos([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { repos, loading };
}
