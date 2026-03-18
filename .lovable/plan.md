

## Plan: Fetch Page Body Content for Quick Take Card Previews

Currently, the quick take cards show the `SEO Description` property from Notion. To show actual post content, we'll fetch the first few blocks of each quick take's page body and display a plain-text excerpt on the card.

### Changes

**1. Update `supabase/functions/notion-articles/index.ts`**
- For quick-takes list mode, after mapping the articles, fetch the first ~3 blocks of each page using the existing `fetchAllBlocks` helper (or a lighter version limited to a few blocks)
- Extract plain text from those blocks and return it as a `bodyExcerpt` field (truncated to ~300 chars)
- This adds N extra API calls to Notion (one per quick take), but these are server-side and Notion's rate limit is generous (3 req/sec)

**2. Update `src/hooks/useQuickTakes.ts`**
- Add `bodyExcerpt` to the `QuickTake` interface

**3. Update `src/components/QuickTakesSection.tsx`**
- Display `qt.bodyExcerpt` (falling back to `qt.description`) as the preview text on each card
- Keep the existing `line-clamp-4` styling

### Re-deploy
- Re-deploy the `notion-articles` edge function

