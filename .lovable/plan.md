

# Consolidated Plan: `ingest-documents` Edge Function with Notion-based AI Context

## Overview
Replace the existing `embed-and-sync` function with a new `ingest-documents` function that:
1. Pulls AI Context dynamically from a Notion page (instead of hardcoded text)
2. Pulls newsletter articles from the existing `notion-articles` function
3. Uses `text-embedding-3-small` (upgraded from `ada-002`)
4. Adds ~50 token overlap between chunks
5. Includes content hashing for deduplication metadata

The Admin page will be updated to call `ingest-documents` instead of `embed-and-sync`. The `search-documents` function will also be updated to use `text-embedding-3-small` so query embeddings match.

## Blocker
**Notion page ID for the AI Context document is needed.** It will be stored as a secret (`NOTION_AI_CONTEXT_PAGE_ID`) so it can be changed without redeployment.

## Changes

### 1. Create `supabase/functions/ingest-documents/index.ts`

- Accepts `{ source: "ai_context" | "newsletter" | "all" }`
- **AI Context source**: Fetches blocks from the Notion page via `GET /v1/blocks/{pageId}/children` using existing `NOTION_API_KEY`. Parses heading blocks as section names, text blocks underneath as section content. Chunks with ~2000 char max and ~200 char overlap.
- **Newsletter source**: Calls existing `notion-articles` function for list, then with `pageId` for each article's HTML. Strips HTML, prepends title, chunks the same way.
- **Embedding**: `text-embedding-3-small` (1536 dimensions), batched in groups of 20.
- **Idempotency**: Deletes all documents matching the source before inserting fresh. Each chunk's metadata includes a SHA-256 `content_hash`.
- **Metadata format**:
  - AI Context: `{ source: "ai_context", type: "context", section: "<heading>", content_hash }`
  - Newsletter: `{ source: "newsletter", type: "article", title, article_id, content_hash }`

### 2. Update `supabase/functions/search-documents/index.ts`

- Change embedding model from `text-embedding-ada-002` to `text-embedding-3-small` to match ingest embeddings.

### 3. Update `src/pages/Admin.tsx`

- Replace the sync buttons to call `ingest-documents` instead of `embed-and-sync`.
- Keep the same UI structure (three buttons: AI Context / Newsletter / All, plus test search).

### 4. Add secret: `NOTION_AI_CONTEXT_PAGE_ID`

- Store the Notion page ID as a secret so it's configurable.

### 5. No changes to
- `notion-articles` edge function
- `documents` table schema
- `embed-and-sync` (left in place but no longer called from UI)

## Files

| File | Action |
|------|--------|
| `supabase/functions/ingest-documents/index.ts` | Create |
| `supabase/functions/search-documents/index.ts` | Edit (model change) |
| `src/pages/Admin.tsx` | Edit (call ingest-documents) |
| Secret: `NOTION_AI_CONTEXT_PAGE_ID` | Add |

