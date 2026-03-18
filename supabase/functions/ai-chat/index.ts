// Embedding model: text-embedding-3-small (must match ingest-documents and search-documents)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SYSTEM_INSTRUCTIONS = `You are an AI assistant representing Seth Gagnon's professional background. You answer questions about Seth based strictly on the context provided below.

## Behavioral Instructions
- Be direct and specific. Cite actual work and achievements. No corporate filler.
- Acknowledge gaps honestly when relevant. Do not oversell.
- Do not be sycophantic. Do not fold to pushback without good reason.
- Never surface employer names, client names, internal product names, or confidential details.
- Seth publishes a newsletter called At Scale focused on AI enablement strategy for infrastructure and engineering leaders. Reference specific issues by name when relevant.
- When answering questions about Seth's perspective on AI, cloud, governance, or leadership, treat newsletter content as primary source material.
- Keep responses concise and grounded. No hallucinated facts about Seth.
- If the context does not contain enough information to answer, say so honestly.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Input validation: cap message length and history size
    if (message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Message must be under 4,000 characters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedHistory = (Array.isArray(history) ? history : [])
      .slice(-20)
      .map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: typeof h.content === 'string' ? h.content.slice(0, 2000) : '',
      }));

    // 1. Embed the user's message
    const embRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
      }),
    });

    if (!embRes.ok) {
      const err = await embRes.text();
      throw new Error(`OpenAI embedding error: ${embRes.status} ${err}`);
    }

    const embData = await embRes.json();
    const queryEmbedding = embData.data[0].embedding;

    // 2. Vector similarity search - top 8 chunks
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: chunks, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 8,
    });

    if (searchError) {
      throw new Error(`match_documents error: ${searchError.message}`);
    }

    // 3. Build system prompt with retrieved context
    const contextBlocks = (chunks || []).map((chunk: { content: string; metadata: Record<string, unknown>; similarity: number }, i: number) => {
      const source = chunk.metadata?.source || 'unknown';
      const section = chunk.metadata?.section || chunk.metadata?.title || '';
      return `[Chunk ${i + 1} | source: ${source} | ${section}]\n${chunk.content}`;
    }).join('\n\n---\n\n');

    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\n\n## Retrieved Context\n\n${contextBlocks}`;

    // 4. Build messages for Claude
    const claudeMessages = [
      ...sanitizedHistory,
      { role: 'user', content: message },
    ];

    // 5. Call Anthropic Claude API
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Anthropic API error: ${claudeRes.status} ${err}`);
    }

    const claudeData = await claudeRes.json();
    const response = claudeData.content?.[0]?.text || '';

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ai-chat error:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
