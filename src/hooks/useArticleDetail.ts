import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function fetchArticleDetail(pageId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("notion-articles", {
    body: { pageId },
  });
  if (error) throw new Error(error.message || "Failed to fetch article");
  return data.content;
}

export function useArticleDetail(pageId: string | null) {
  return useQuery({
    queryKey: ["notion-article-detail", pageId],
    queryFn: () => fetchArticleDetail(pageId!),
    enabled: !!pageId,
    staleTime: 10 * 60 * 1000,
  });
}
