import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GitHubRepo {
  id: string;
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
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
              return {
                id: f.id,
                full_name: data.full_name,
                name: data.name,
                description: data.description,
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
