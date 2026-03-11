

# Fix: LinkedIn Post URL Links Not Opening

## Problem
The links are correctly rendered in both the card grid and the article detail dialog, and the `postUrl` data is present. The issue is that `<a target="_blank">` links inside the Lovable preview iframe are blocked by the sandbox policy. This affects the preview only — the published site at sethgagnon.lovable.app works correctly.

## Fix
Replace the plain `<a>` tags with `onClick` handlers using `window.open()`, which has better compatibility with sandboxed iframes.

### Files to edit

**`src/components/WritingSection.tsx`** (lines 121-130)
- Change the LinkedIn link from `<a href={...} target="_blank">` to a `<button>` or `<a>` with `onClick={() => window.open(a.postUrl, '_blank')}` and `e.preventDefault()`

**`src/components/ArticleDetail.tsx`** (lines 78-89)
- Same change for the "Read on LinkedIn" link in the dialog footer

Both changes are small — just swapping to `window.open()` on click.

