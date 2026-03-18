

## Plan: Add "Quick Takes" Section from Notion

Reuse the existing Notion integration — same database, just filter for `Format = "Quick Take"` instead of `"Newsletter Article"`.

### Changes

**1. Update `supabase/functions/notion-articles/index.ts`**
- Accept an optional `type` parameter in the request body
- When `type === "quick-takes"`, filter for `Format = "Quick Take"` + `Status = "Posted"`
- Default behavior (no type) remains unchanged for newsletter articles

**2. Create `src/hooks/useQuickTakes.ts`**
- Invoke the same `notion-articles` edge function with `{ type: "quick-takes" }`
- Return `{ quickTakes, allTags, isLoading, error, refetch }`

**3. Create `src/components/QuickTakesSection.tsx`**
- Compact card layout — date, description text, tags, "View on LinkedIn" link
- No detail/dialog view (short-form content, just link out)
- Tag filter bar like WritingSection
- Same glass-card styling

**4. Update `src/pages/Index.tsx`**
- Add `<QuickTakesSection />` in an `<ErrorBoundary>` after WritingSection

**5. Update `src/components/NavBar.tsx`**
- Add "Quick Takes" nav link with `href="#quick-takes"`

