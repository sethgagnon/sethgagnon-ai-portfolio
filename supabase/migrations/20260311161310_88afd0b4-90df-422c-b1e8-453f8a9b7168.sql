CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding extensions.vector(1536),
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX ON public.documents USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION public.match_documents(query_embedding extensions.vector(1536), match_count int DEFAULT 5)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding)::float AS similarity
  FROM public.documents d
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;