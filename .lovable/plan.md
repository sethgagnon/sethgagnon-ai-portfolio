

# Phase 5: JD Fit Assessment Tool

## Overview
Create a `jd-fit` edge function with RAG-powered fit assessment and rewire the existing `FitAssessmentSection` UI to call it live instead of showing hardcoded sample data.

## Step 1: Create `supabase/functions/jd-fit/index.ts`

New edge function following the same pattern as `ai-chat`:
- Accept `{ jd: string }` POST body
- Embed the JD text via OpenAI `text-embedding-3-small`
- Vector search top 10 chunks via `match_documents` RPC
- Build system prompt with the detailed verdict instructions (Strong Fit / Worth a Conversation / Probably Not), known gaps, strong fit signals, and strict JSON output format as specified
- Call Anthropic Claude `claude-sonnet-4-20250514` with system prompt + JD as user message
- Parse JSON from Claude's response, return it
- CORS headers, error handling matching existing functions

## Step 2: Update `supabase/config.toml`

Add:
```toml
[functions.jd-fit]
verify_jwt = false
```

## Step 3: Rewrite `src/components/FitAssessmentSection.tsx`

Replace the hardcoded demo UI with a live integration:

- **State**: `jdText`, `result` (parsed JSON or null), `loading`, `error`
- **Input**: Keep the textarea with "Paste a job description here..." placeholder. Remove the demo toggle buttons and hardcoded sample data.
- **Button**: "Assess Fit" button, disabled when empty or loading. Shows "Analyzing fit..." spinner during loading.
- **API call**: `supabase.functions.invoke('jd-fit', { body: { jd: jdText } })`, parse response JSON
- **Results display**:
  - Color-coded verdict badge: green (`bg-green-600`) for Strong Fit, yellow (`bg-yellow-500`) for Worth a Conversation, red (`bg-red-600`) for Probably Not
  - Summary sentence below verdict
  - Two-column grid (stacks on mobile): Strengths (left) and Gaps (right) as bullet lists
  - Reasoning paragraph below
  - Scroll to results on render using `scrollIntoView`
- **Reset**: "Try Another Role" button clears result and resets textarea
- **Error**: Inline error message with retry option
- **Keep**: The philosophy callout at the bottom

## Step 4: Deploy and test

Deploy the edge function and verify it responds correctly.

## Files Changed
1. `supabase/functions/jd-fit/index.ts` — new edge function
2. `supabase/config.toml` — add jd-fit config
3. `src/components/FitAssessmentSection.tsx` — full rewrite with live API integration

