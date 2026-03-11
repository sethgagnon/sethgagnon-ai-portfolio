

# Phase 4: AI Chat with RAG

## Blocker: ANTHROPIC_API_KEY

The secret `ANTHROPIC_API_KEY` is **not configured** in the project. It must be added before the `ai-chat` edge function can work. I will request it as the first step of implementation.

## Plan

### 0. Delete `embed-and-sync`
Remove `supabase/functions/embed-and-sync/index.ts` — obsolete, uses incompatible embedding model.

### 1. Create `supabase/functions/ai-chat/index.ts`
- CORS + OPTIONS handler
- Accept `{ message, history }` POST body
- Embed `message` with OpenAI `text-embedding-3-small`
- Call `match_documents` RPC (top 8 chunks)
- Build system prompt: behavioral instructions + retrieved context chunks with source metadata
- Call Anthropic Messages API (`claude-sonnet-4-6`) with system prompt, history, and current message
- Return `{ response: string }`

### 2. Update `supabase/config.toml`
Add:
```toml
[functions.ai-chat]
verify_jwt = false
```

### 3. Install `react-markdown`
Required for rendering AI responses with proper formatting.

### 4. Rewrite `src/components/ChatDrawer.tsx`
- State: `messages` array, `input` string, `isLoading` boolean
- Show 6 starter questions when no messages (clicking sends immediately)
- Dynamic message rendering: user bubbles right-aligned, AI bubbles left-aligned with `react-markdown`
- Animated typing indicator during loading
- Auto-scroll on new messages via `useRef` + `scrollIntoView`
- Error handling: catch failures, show inline error message
- Call `supabase.functions.invoke('ai-chat', { body: { message, history } })`
- Keep suggestions visible below messages for follow-up questions

