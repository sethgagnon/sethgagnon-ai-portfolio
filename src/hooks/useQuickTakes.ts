import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QuickTake {
  id: string;
  title: string;
  date: string | null;
  description: string;
  tags: string[];
  postUrl: string | null;
}

async function fetchQuickTakes(): Promise<QuickTake[]> {
  const { data, error } = await supabase.functions.invoke("notion-articles", {
    body: { type: "quick-takes" },
  });
  if (error) throw new Error(error.message || "Failed to fetch quick takes");
  return data.articles;
}

export function useQuickTakes() {
  const query = useQuery({
    queryKey: ["quick-takes"],
    queryFn: fetchQuickTakes,
    staleTime: 5 * 60 * 1000,
  });

  const allTags = Array.from(
    new Set((query.data || []).flatMap((a) => a.tags))
  ).sort();

  return { ...query, quickTakes: query.data || [], allTags };
}
