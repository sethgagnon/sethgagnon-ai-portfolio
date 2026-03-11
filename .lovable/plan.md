

# Connect Writing Section to Notion — Full Plan

## Architecture

```text
Page load:
  WritingSection mounts
    → useNotionArticles() fires
      → supabase.functions.invoke("notion-articles")  (no pageId)
        → Edge Function queries Notion DB (metadata only)
        → Returns: [{ id, title, date, description, tags, postUrl }]
    → Renders card grid + dynamic tag filters

User clicks "Read more":
  ArticleDetail dialog opens
    → useArticleDetail(pageId) fires  (lazy, enabled: !!pageId)
      → supabase.functions.invoke("notion-articles", { body: { pageId } })
        → Edge Function fetches block children for that single page
        → Returns: { content: string } (rich text content)
    → Shows spinner while loading, then renders full body
```

## Prerequisites

1. **Enable Lovable Cloud** — needed for edge functions + Supabase client
2. **Add secrets** — `NOTION_API_KEY` and `NOTION_DATABASE_ID` via the secrets tool
3. **Notion integration** — user must have a Notion integration at notion.so/my-integrations and share the database with it

## Files to Create/Edit

### 1. Edge Function: `supabase/functions/notion-articles/index.ts`

Single function, two modes based on request body:

- **No `pageId`** (list mode):
  - Queries Notion database: `Format = "Newsletter Article"` AND `Status = "Posted"`
  - Sorts by `Date Posted` descending
  - Maps each page to: `{ id, title, date, description, tags, postUrl }`
  - `Date Posted` is a Notion **date property** (not datetime) — extract via `page.properties["Date Posted"].date.start` which returns a `YYYY-MM-DD` string
  - Does NOT fetch block children

- **With `pageId`** (detail mode):
  - Fetches Notion block children for that page
  - Serializes rich text blocks into renderable HTML/text
  - Returns `{ content: string }`

CORS headers included. JWT verification disabled in config.toml.

### 2. `supabase/config.toml`
```toml
[functions.notion-articles]
verify_jwt = false
```

### 3. `src/integrations/supabase/client.ts`
Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (provided by Lovable Cloud).

### 4. `src/hooks/useNotionArticles.ts`
- React Query hook calling edge function (no pageId)
- Returns `{ articles, allTags, isLoading, error }`
- `allTags` deduplicated and sorted from fetched data

### 5. `src/hooks/useArticleDetail.ts`
- React Query hook calling edge function with `pageId`
- `enabled: !!pageId` — only fires when an article is selected
- Caches result so reopening same article is instant

### 6. Rewrite `src/components/WritingSection.tsx`
- Remove all hardcoded articles and tags
- Use `useNotionArticles()` hook
- **Tag filter bar**: "All" pill (default, highlighted) + dynamic tag pills. Clicking filters cards.
- **Card grid**: `md:grid-cols-2`, 1-col mobile
- **Card content**: Title, date formatted via `format(parseISO(date), 'MMMM dd, yyyy')` where `date` is a `YYYY-MM-DD` string from Notion's date property, SEO Description, topic tag pills, "View on LinkedIn" link (`target="_blank"`)
- **"Read more"** link: sets `selectedArticleId`, opens ArticleDetail
- **Loading**: 4 skeleton cards
- **Error**: Message + "Try again" button
- **Empty filter**: "No articles match this topic"

### 7. Create `src/components/ArticleDetail.tsx`
- `Dialog` or `Sheet` component
- Receives `articleId` + metadata props (title, date, tags, postUrl)
- Calls `useArticleDetail(articleId)` internally — lazy fetch
- **Loading**: Skeleton lines inside dialog
- **Loaded**: Title, date, tags, rendered Draft Post body, "Read on LinkedIn" button
- **Error**: Inline error with retry

## Notion Property → UI Mapping

| Notion Property | Type | Usage | Displayed? |
|---|---|---|---|
| Title (page title) | title | Card headline + detail title | Yes |
| Date Posted | date (not datetime) | `YYYY-MM-DD` → formatted via `date-fns` | Yes |
| SEO Description | rich text | Card preview text | Yes |
| Topic Tags | multi-select | Filter pills + card tags | Yes |
| Post URL | url | LinkedIn CTA link | Yes |
| Draft Post | rich text (blocks) | Detail view body (lazy) | Yes (detail only) |
| Format | select | DB query filter | No |
| Status | select | DB query filter | No |

## What Does NOT Change
NavBar, HeroSection, ExperienceSection, SkillsSection, FitAssessmentSection, ChatDrawer, Footer, Index.tsx — all untouched.

