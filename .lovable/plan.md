

# Remove All Em Dashes and En Dashes Sitewide

## Scope
Replace every `—` (em dash) and `–` (en dash) across all source files with regular hyphens, commas, or periods depending on context.

## Files to edit

### 1. `src/components/ExperienceSection.tsx`
- **En dashes in dates** (lines 23, 39, 53, 68, 71, 159): `2022–Present` -> `2022-Present`, etc.
- **Em dashes in aiContext text** (lines 31, 33, 45, 46, 47, 60): Replace with commas or periods based on sentence flow

### 2. `src/components/FitAssessmentSection.tsx`
- Line 6: `Engineering — Fortune` -> `Engineering - Fortune`
- Line 9: `Engineering — Series` -> `Engineering - Series`
- Line 17: `engineers — directly` -> `engineers, directly`
- Line 18: `Council — strong` -> `Council, strong`
- Line 21: `yet — current` -> `yet. Current`
- Line 39: `person — including` -> `person, including`
- Line 96: `valuable — so` -> `valuable, so`

### 3. `src/components/WritingSection.tsx`
- Line 24: `perspective — not` -> `perspective, not`

### 4. `src/components/Footer.tsx`
- Line 19: `portfolio — ask` -> `portfolio. Ask`

### 5. `src/pages/Admin.tsx`
- Line 144: `Admin — Embeddings` -> `Admin - Embeddings`
- Line 206: `— similarity` -> `- similarity`

### 6. `supabase/functions/ai-chat/index.ts`
- Line 63: comment `— top 8` -> `- top 8`

## Hard rule going forward
All future content and code will use only regular hyphens (`-`). No em dashes or en dashes anywhere in the codebase.

