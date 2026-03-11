

## Fix Mobile Horizontal Overflow

Three targeted changes:

1. **HeroSection.tsx** — Add `w-full sm:w-auto` to both CTA buttons and make the button container stack vertically on mobile (`flex-col sm:flex-row`).

2. **WritingSection.tsx** — Add `overflow-x-hidden` to the section wrapper to prevent the grid from bleeding past viewport edge.

3. **Index.tsx** — Add `overflow-x-hidden` to the top-level `<div>` wrapper as a safety net.

