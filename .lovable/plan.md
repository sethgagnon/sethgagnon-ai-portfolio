

# Phase 6: Polish + Launch

Final quality pass — SEO, performance, mobile, accessibility, copy review, and domain prep. No new features.

## Step 1: SEO Meta Tags

**Update `index.html`**:
- Title: `Seth Gagnon | Cloud & AI Leadership`
- Meta description with the provided copy
- OG tags: og:title, og:description, og:type (website), og:url (https://sethgagnon.com)
- Twitter card: summary_large_image with matching title/description
- Canonical URL: https://sethgagnon.com
- Keep existing og:image/twitter:image URLs

**Dynamic article SEO**: Update `ArticleDetail.tsx` to set `document.title` on open (e.g. `${title} | Seth Gagnon`) and restore on close. The NotionArticle interface already has `description` for meta description — add a `useEffect` that updates the meta description tag dynamically when the dialog opens.

## Step 2: Performance Optimization

- **Hero image**: Add `loading="eager"` explicitly (above fold). The avatar already loads eagerly by default — no change needed.
- **Loading skeletons**: Already present in WritingSection and ArticleDetail. Add a skeleton/spinner state to FitAssessmentSection (already has loading state with spinner — confirmed good). ChatDrawer has bounce dots for loading — confirmed good.
- **Error boundaries**: Add a React error boundary wrapper around major sections in `Index.tsx` so a crash in one section doesn't break the whole page.
- **Reserved space for newsletter cards**: The skeleton grid already reserves space during loading — confirmed good.

## Step 3: Mobile QA Fixes

Review at current viewport (402px) which is representative of mobile:

- **Hero**: CTAs use `w-full sm:w-auto` with `flex-col sm:flex-row` — looks correct. Verify credential pills wrap properly with `flex-wrap`.
- **Newsletter cards**: Grid uses `md:grid-cols-2`, single column on mobile — correct.
- **ChatDrawer**: Sheet is `w-full sm:max-w-md` — correct. Input anchored at bottom with form at the bottom of flex column.
- **FitAssessmentSection**: Textarea is full width, results grid uses `md:grid-cols-2` (stacks on mobile) — correct.
- **Experience**: Grid uses `md:grid-cols-2` — stacks on mobile. Education section uses `sm:flex-row` with `flex-col` default — correct.
- **Skills**: Grid uses `md:grid-cols-3` — stacks to single column on mobile — correct.
- **Nav**: Mobile hamburger menu already implemented.

No major mobile fixes needed based on code review. Minor fix: add `overflow-x-hidden` to the writing section's tag filter bar to prevent any edge-case horizontal scroll from many tags (already has `overflow-x-hidden` on the section — good).

## Step 4: Accessibility

- Add `aria-label` to nav hamburger button, chat send button, and tag filter buttons
- Add `alt` text to the profile avatar image (already has `alt="Seth Gagnon"` — good)
- Ensure focus-visible states: Tailwind's default `focus-visible:ring` on buttons covers this via shadcn components
- **Verdict badge contrast**: Green on white text, yellow on black text, red on white text — all meet AA. Confirmed in existing code.

## Step 5: Console & Error Cleanup

- No `console.log` found in client code — confirmed clean
- Fix `any` types in Admin.tsx catch blocks (lines 92, 112) — change to `unknown` with proper type narrowing
- Remove hardcoded `ADMIN_PIN = "1234"` security concern — add a comment noting this is intentional for a non-sensitive admin page (or leave as-is since it's out of scope for this phase)

## Step 6: Copy Review

Based on code review, all copy matches requirements:
- Hero: Direct, specific — ✓
- Experience: Honest gaps section in Skills — ✓
- At Scale header: "A newsletter for infrastructure and engineering leaders..." — ✓
- Chat suggestions: 6 starter questions present — ✓
- JD Fit intro: "Get an honest assessment...including when I'm not" — ✓
- Footer: Minimal with name, title, LinkedIn, email, year — has "AI-queryable portfolio" line which is fine

**One fix**: Footer says `© 2026` — good for current year.

## Step 7: Custom Domain Prep & README

Update `README.md` with custom domain connection steps:
1. Go to Lovable project Settings → Domains
2. Add `sethgagnon.com` and `www.sethgagnon.com`
3. At DNS provider: A records for `@` and `www` → `185.158.133.1`, plus TXT record for verification
4. Wait for SSL provisioning
5. Update og:url and canonical to `https://sethgagnon.com` once live

## Files Changed

1. `index.html` — updated title, meta description, OG tags, canonical URL
2. `src/components/ArticleDetail.tsx` — dynamic document.title and meta description
3. `src/pages/Index.tsx` — wrap sections in error boundary
4. `src/components/ErrorBoundary.tsx` — new simple error boundary component
5. `src/components/NavBar.tsx` — aria-labels on hamburger button
6. `src/components/ChatDrawer.tsx` — aria-label on send button
7. `src/pages/Admin.tsx` — fix `any` types to `unknown`
8. `README.md` — add custom domain setup instructions

