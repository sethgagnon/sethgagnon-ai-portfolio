

# Seth Gagnon — AI-Queryable Portfolio

A single-page dark-themed portfolio website for a Cloud Engineering Director / Enterprise AI Strategist. Fully static shell with polished UI — no backend or API connections.

## Design System
- Near-black background (#0a0a0a) with glassmorphism card effects
- Teal (#4ade80) primary accent, amber (#d4a574) secondary accent
- Serif headings (Georgia/Playfair Display via Google Fonts), sans-serif body
- Subtle bordered cards with rounded corners and backdrop blur

## Sections (top to bottom)

1. **Fixed Navigation** — "SG" logo, section links (Writing, Experience, Fit Check), prominent "Ask AI" button opening chat drawer

2. **Hero** — Status badge, large serif name, teal title, positioning statement, credential pills (AWS, Azure, GCP, OCI, IBM Champion, At Scale Newsletter), two CTAs ("Ask AI About Me" + "Read At Scale"), scroll indicator

3. **Writing ("At Scale")** — Newsletter description, topic tag filter bar (visual only), 3 placeholder article cards with titles, dates, format badges, topic tags, descriptions, and placeholder links

4. **Experience** — 4 role cards with company context, dates, titles, and achievement bullets. Education row and recognition row below.

5. **Skills Matrix** — Three side-by-side cards: Strong (teal), Developing (gray), Honest Gaps (amber) with listed skills

6. **Honest Fit Assessment** — Toggle buttons for demo content, textarea for JD paste, "Analyze Fit" button, static sample output with verdict badge, fit/gap bullets, recommendation, and philosophy callout

7. **AI Chat Drawer** — Right-sliding drawer with chat history area, pre-seeded suggested question chips, static placeholder Q&A exchange, input field + send button

8. **Footer** — Name, title, placeholder LinkedIn/Email links, tagline, copyright

## Technical Approach
- Single Index page with component files per section
- Smooth scroll navigation via anchor IDs
- Chat drawer using Sheet/Drawer component from shadcn
- All interactions are visual shells — no backend, no AI, no functional filtering
- Responsive layout with mobile considerations

