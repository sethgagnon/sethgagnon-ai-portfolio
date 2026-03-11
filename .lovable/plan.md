

# Add Collapsible AI Context to Experience Cards

## Overview
Add a collapsible "AI Context" panel to each experience card, matching the reference screenshot. Each panel contains structured categories (SITUATION, APPROACH, TECHNICAL WORK, LESSONS LEARNED) with content drawn from the AI context document achievements already in the database.

## Design (matching screenshot)
- Below the existing bullets, add a toggle: sparkle icon + "Show AI Context" / "Hide AI Context" in primary (teal) color with chevron
- When expanded, reveal a darker inner card with the structured categories
- Category labels styled as uppercase monospace/small-caps in muted teal
- Body text in muted foreground; "Lessons Learned" rendered as italic quoted text in primary color
- Uses Radix Collapsible component (already installed)

## Data Structure
Add a `context` field to each role object with arrays of `{ label, text }` entries:

- **Cloud Engineering Director**: Situation (no internal visibility, built from scratch), Approach (relationship-driven, demonstrated results on high-visibility initiative), Technical Work (multi-cloud platform, AI Council governance layers), Lessons Learned (quote about enablement vs gatekeeping)
- **Owner / CloudTech**: Situation (practitioner perspective gap in AI strategy discourse), Approach (newsletter + advisory grounded in operating experience), Lessons Learned (quote about writing from the inside)
- **Cloud Platform Lead**: Situation (rapid scaling pressure, budget constraints), Approach (influence without authority in matrixed org), Technical Work (architecture standards, security patterns, DevOps practices), Lessons Learned (quote about leading through ambiguity)
- **Architecture Senior Advisor**: Situation (legacy enterprise, early cloud adoption), Approach (drove DevOps standards across large org), Technical Work (CI/CD pipelines, middleware modernization), Lessons Learned (quote about sustained community contribution → IBM Champion)

## File Changes
- **`src/components/ExperienceSection.tsx`** — Add `context` arrays to each role, import `Collapsible` components, add state management (convert to client component with `useState`), render the collapsible panel with structured categories inside each card.

## Visual Details
- Inner context panel: darker bg (`bg-black/30` or similar), rounded, subtle border
- Category labels: `text-xs uppercase tracking-widest font-mono text-primary/70`
- Lessons Learned text: `italic text-primary`
- Smooth open/close animation via Collapsible

