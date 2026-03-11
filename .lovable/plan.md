

# Fix Article Formatting

## Problem
The edge function returns well-structured HTML (`<h2>`, `<p>`, `<strong>`, etc.), but the `prose` CSS classes used in `ArticleDetail.tsx` do nothing because the **`@tailwindcss/typography`** plugin is not installed.

## Fix (2 changes)

### 1. Install `@tailwindcss/typography`
Add the package to dependencies.

### 2. Register the plugin in `tailwind.config.ts`
Add `require("@tailwindcss/typography")` to the `plugins` array (line 94):
```ts
plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
```

No changes needed to the edge function or `ArticleDetail.tsx` — the existing `prose prose-invert prose-sm` classes will work once the plugin is active.

