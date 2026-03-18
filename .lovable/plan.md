

## Plan: Add Institution Logos to Education Section

Add logos for Northeastern University, University of Connecticut, and Stanford University next to each education entry.

### Changes

**1. Add logo images**
- Download/save logos to `public/` (e.g., `northeastern.png`, `uconn.png`, `stanford.png`) or use publicly available logo URLs

**2. Update `src/components/ExperienceSection.tsx`**
- Refactor the education entries from plain `<span>` elements into a structured list with logo + text pairs
- Each entry gets a small logo image (e.g., 24×24px) displayed inline to the left of the text
- Convert the flat `flex` layout into individual rows with `flex items-center gap-3`

```text
Before:  "MS Technology Commercialization, Northeastern University"
After:   [logo] MS Technology Commercialization, Northeastern University
```

