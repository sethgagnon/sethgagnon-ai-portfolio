

# Phase 3: Data Layer — Embeddings Pipeline and Admin Page

## Blocker: Missing Secret

`OPENAI_API_KEY` is **not** currently configured in your project secrets. It must be added before the embed-and-sync function can generate embeddings. I will prompt you to add it during implementation.

## Architecture Overview

```text
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│  /admin UI   │─────▶│ embed-and-sync   │─────▶│  documents   │
│  (React)     │      │ (edge function)  │      │  (pgvector)  │
└─────────────┘      │                  │      └──────────────┘
                      │  1. Fetch content │
                      │  2. Chunk text    │
                      │  3. Call OpenAI   │
                      │  4. Upsert rows   │
                      └──────┬───────────┘
                             │
                      ┌──────▼───────────┐
                      │ notion-articles  │ (existing, called
                      │ edge function    │  internally for
                      └──────────────────┘  newsletter source)
```

## Step 1: Database Migration

Create the `documents` table with pgvector column and IVFFlat index. Also create a `match_documents` RPC function for vector similarity search.

```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_documents(query_embedding vector(1536), match_count int DEFAULT 5)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

No RLS needed — this table is only accessed via service role key from edge functions.

## Step 2: `embed-and-sync` Edge Function

**File:** `supabase/functions/embed-and-sync/index.ts`

- Accepts `{ source: "ai-context" | "newsletter" | "all" }`
- **AI Context source:** Hardcoded text split into chunks by section (~500 tokens each). The 7 sections from the provided text will produce ~10-12 chunks.
- **Newsletter source:** Calls the existing `notion-articles` function internally (via fetch to `SUPABASE_URL/functions/v1/notion-articles`), then for each article calls it again with `pageId` to get the HTML content. Strips HTML tags, combines title + body, chunks if needed.
- **Chunking:** Simple split by character count (~2000 chars ≈ 500 tokens), respecting paragraph boundaries.
- **Embedding:** Calls OpenAI `text-embedding-ada-002` API in batches.
- **Storage:** Deletes existing rows matching the source in metadata, then inserts new chunks.
- Returns `{ success, counts: { deleted, inserted } }`.

**Config update** (`supabase/config.toml`):
```toml
[functions.embed-and-sync]
verify_jwt = false

[functions.notion-articles]
verify_jwt = false
```

## Step 3: Admin Page

**File:** `src/pages/Admin.tsx`

- PIN gate: hardcoded 4-digit PIN check (stored in component, shown on first visit)
- Three sync buttons calling `supabase.functions.invoke('embed-and-sync', { body: { source } })`
- Status display: queries `documents` table for count per source and max inserted time (from metadata or a timestamp field)
- Test search input: embeds query text via a small edge function (`search-documents`), then calls `match_documents` RPC, displays top 5 results with content preview and metadata

## Step 4: `search-documents` Edge Function

**File:** `supabase/functions/search-documents/index.ts`

- Accepts `{ query: string, match_count?: number }`
- Embeds the query using OpenAI
- Calls `match_documents` RPC
- Returns results

## Step 5: Route and Navigation

- Add `/admin` route in `App.tsx`
- No nav link — accessed directly by URL

## Files to Create/Edit

| File | Action |
|------|--------|
| Database migration (SQL) | Create `documents` table + `match_documents` function |
| `supabase/functions/embed-and-sync/index.ts` | Create |
| `supabase/functions/search-documents/index.ts` | Create |
| `supabase/config.toml` | Add function configs |
| `src/pages/Admin.tsx` | Create |
| `src/App.tsx` | Add `/admin` route |

