
CREATE TABLE public.featured_repos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_full_name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_repos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON public.featured_repos
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service role full access"
ON public.featured_repos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
