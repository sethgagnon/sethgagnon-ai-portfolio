import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotionArticle {
  id: string;
  title: string;
  date: string | null;
  description: string;
  tags: string[];
  postUrl: string | null;
}

async function fetchArticles(): Promise<NotionArticle[]> {
  const { data, error } = await supabase.functions.invoke("notion-articles");
  if (error) throw new Error(error.message || "Failed to fetch articles");
  return data.articles;
}

export function useNotionArticles() {
  const query = useQuery({
    queryKey: ["notion-articles"],
    queryFn: fetchArticles,
    staleTime: 5 * 60 * 1000,
  });

  const allTags = Array.from(
    new Set((query.data || []).flatMap((a) => a.tags))
  ).sort();

  return { ...query, articles: query.data || [], allTags };
}
