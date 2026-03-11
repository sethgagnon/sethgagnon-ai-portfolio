ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON public.documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.match_documents(query_embedding extensions.vector(1536), match_count int DEFAULT 5)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding)::float AS similarity
  FROM public.documents d
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;