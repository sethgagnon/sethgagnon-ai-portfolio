

# Regenerate OG Image Matching Site Color Scheme

The current OG image doesn't match the site's visual identity. Regenerate it using the exact color palette from the site.

## Color Scheme Reference (from index.css)
- **Background**: `hsl(0, 0%, 4%)` — near-black (#0A0A0A)
- **Primary accent**: `hsl(142, 69%, 58%)` — teal/mint green
- **Secondary accent**: `hsl(30, 40%, 64%)` — warm amber
- **Foreground text**: `hsl(0, 0%, 95%)` — off-white
- **Muted text**: `hsl(0, 0%, 55%)` — medium gray
- **Border/glass**: `hsla(0, 0%, 100%, 0.08)` — subtle white border

## Implementation
1. Regenerate `public/og-image.png` (1200x630) with an explicit prompt specifying:
   - Near-black background (#0A0A0A)
   - "Seth Gagnon" in off-white serif font
   - "Cloud & AI Enterprise Strategist" in teal/mint green (#4ADE80)
   - AWS, Azure, GCP, OCI credential pills with subtle white borders on dark cards
   - Minimal, modern layout — no gradients or stock imagery
   - Matches the dark glassmorphism aesthetic of the site

## Files Changed
- `public/og-image.png` — regenerated with correct colors

