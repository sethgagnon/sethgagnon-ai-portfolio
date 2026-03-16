

## Plan: Add AI Tools Link to Nav Menu

### Change
Add "AI Tools" to the navigation links in `NavBar.tsx`, linking to the AI Tools & Platforms section.

### Details

**Update `src/components/NavBar.tsx`** — Add an entry to the `links` array:
```ts
const links = [
  { label: "Writing", href: "#writing" },
  { label: "Experience", href: "#experience" },
  { label: "AI Tools", href: "#ai-tools" },
  { label: "Fit Check", href: "#fit-check" },
];
```

**Update `src/components/AIToolsSection.tsx`** — Add `id="ai-tools"` to the section's root element so the anchor link works.

