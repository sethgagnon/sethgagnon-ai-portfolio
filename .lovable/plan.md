

# AI Tools & Platforms Section

## Assets
Copy the three uploaded logos into `src/assets/tools/`:
- `user-uploads://lovable-icon-bg-light.png` → `src/assets/tools/lovable.png`
- `user-uploads://CUBE_25D.svg` → `src/assets/tools/cursor.svg`
- `user-uploads://kiro.svg` → `src/assets/tools/kiro.svg`

## New file: `src/components/AIToolsSection.tsx`
- Section heading: "AI Tools & Platforms"
- Responsive grid (1 col mobile, 3 col desktop) with `glass-card` styling
- Three tool cards, each with:
  - Logo image imported from `@/assets/tools/`, displayed at consistent size (40×40px, `object-contain`)
  - Tool name and descriptor
- **Lovable** card: "L4: Platinum" badge using primary accent, subtle primary border
- **Cursor** card: "AI Code Editor" descriptor
- **Kiro** card: "AI Development Tool" descriptor

## Updated file: `src/pages/Index.tsx`
- Import `AIToolsSection`, place between `SkillsSection` and `FitAssessmentSection` wrapped in `ErrorBoundary`

