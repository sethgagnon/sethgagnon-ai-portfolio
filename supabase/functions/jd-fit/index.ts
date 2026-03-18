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

const SYSTEM_PROMPT = `ROLE: You are an honest, direct fit assessor evaluating how well Seth Gagnon fits a job description. You have access to Seth's background, skills, experience, and what he is looking for.

VERDICT RULES — these are non-negotiable:

- You MUST return exactly one of three verdicts: "Strong Fit", "Worth a Conversation", or "Probably Not"
- You MUST commit to a verdict. Hedging, blending verdicts, or saying "it depends" is not allowed.
- "Probably Not" is a valid and frequently correct answer. Do not bias toward positive verdicts.
- Never invent or assume experience Seth does not have. If the role requires something Seth clearly lacks, that must factor into the verdict.

VERDICT DEFINITIONS:

- Strong Fit: The role aligns closely with Seth's demonstrated strengths. He has done this work, at this scale, in similar environments. A hiring manager would likely want to talk to him.
- Worth a Conversation: There is real overlap but meaningful gaps or unknowns. Seth could be right for this role but it is not a clear match on paper. Worth exploring.
- Probably Not: The role requires things Seth clearly does not have — hands-on engineering, consumer product, early-stage startup, deep individual contributor work, or other areas outside his core. Not a good use of either party's time.

KNOWN GAPS — always weigh these honestly:

- Consumer product and mobile: entire career is B2B enterprise
- Hands-on software engineering: Seth is a leader and architect, not a working coder
- Early-stage startup environments: all experience is large regulated enterprise
- Deep vendor certifications beyond Azure Fundamentals and IBM

STRONG FIT SIGNALS — roles that align well:

- VP or equivalent senior technology leadership
- Regulated industries: healthcare, financial services, insurance
- Enterprise AI enablement, platform strategy, or cloud transformation
- Organizations needing leadership at the intersection of technical strategy and organizational change
- Multi-cloud environments (AWS, Azure, GCP, OCI)
- FinOps, governance, or AI Council / Center of Excellence type roles

OUTPUT FORMAT — return only this JSON structure, nothing else:

{
  "verdict": "Strong Fit" | "Worth a Conversation" | "Probably Not",
  "summary": "One sentence stating the verdict and the single most important reason.",
  "strengths": ["2-4 specific strengths relevant to this JD, grounded in Seth's actual experience"],
  "gaps": ["1-3 honest gaps or concerns for this specific role. If none, return an empty array."],
  "reasoning": "2-3 sentences of direct reasoning explaining the verdict. Be specific to this JD. No generic praise. No hedging."
}`;

// Simple in-memory rate limiter: max 5 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { jd } = await req.json();

    if (!jd || typeof jd !== 'string') {
      return new Response(JSON.stringify({ error: 'jd (job description) is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (jd.length > 8000) {
      return new Response(JSON.stringify({ error: 'Job description must be under 8,000 characters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Embed the JD text
    const embRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: jd,
      }),
    });

    if (!embRes.ok) {
      const err = await embRes.text();
      throw new Error(`OpenAI embedding error: ${embRes.status} ${err}`);
    }

    const embData = await embRes.json();
    const queryEmbedding = embData.data[0].embedding;

    // 2. Vector similarity search - top 10 chunks
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: chunks, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 10,
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

    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n## Seth's Background Context\n\n${contextBlocks}`;

    // 4. Call Anthropic Claude API
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
        system: fullSystemPrompt,
        messages: [{ role: 'user', content: `Evaluate how well Seth Gagnon fits this job description:\n\n${jd}` }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Anthropic API error: ${claudeRes.status} ${err}`);
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content?.[0]?.text || '';

    // 5. Parse JSON from Claude's response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('jd-fit error:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
