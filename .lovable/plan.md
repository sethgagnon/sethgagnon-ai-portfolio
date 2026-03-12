

# Create Social Preview (OG) Image

Generate a 1200x630px social preview image for sethgagnon.com.

**Design concept**: Clean, dark professional card with:
- "Seth Gagnon" as the primary text
- "Cloud & AI Enterprise Strategist" as subtitle
- Credential pills (AWS, Azure, GCP, OCI)
- Clean, modern aesthetic matching the site's dark theme

**Implementation**:
1. Generate the image using AI and save to `public/og-image.png`
2. Update `index.html` to point `og:image` and `twitter:image` to `https://sethgagnon.com/og-image.png`

**Files changed**:
- `public/og-image.png` — new generated social image
- `index.html` — update og:image and twitter:image URLs

