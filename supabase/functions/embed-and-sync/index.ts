import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── AI Context (hardcoded) ──────────────────────────────────────────

const AI_CONTEXT_SECTIONS: { section: string; text: string }[] = [
  {
    section: "Career Overview",
    text: `Current Role: Cloud Engineering Director at a large regulated enterprise in the health services sector. Leading a team of more than a dozen cloud engineers, overseeing enterprise-wide cloud adoption, AI enablement infrastructure, and platform strategy across a multi-cloud environment (AWS, Azure, GCP, OCI).

Career Arc: 20+ years of technology leadership, the majority inside large regulated enterprise environments. Progression from business analysis and infrastructure engineering through application development management, architecture advisory, cloud platform leadership, and current director-level scope. Parallel track as an independent technology consultant (CloudTech LLC) providing advisory services on cloud, middleware, and DevOps.

Education: MS, Technology Commercialization — Northeastern University. BS, Management Information Systems — University of Connecticut.

Recognition: IBM Champion 2013–2016 (Middleware). 2024 Timmy Awards Finalist, Best Tech Manager. Microsoft Certified: Azure Fundamentals. Certifications in Generative AI (Technical Fundamentals and Human-Centered).`,
  },
  {
    section: "Skills Assessment",
    text: `Strong: Cloud platform architecture and engineering (multi-cloud: AWS, Azure, GCP, OCI). Enterprise AI enablement strategy and infrastructure. Agentic AI platform architecture. Building and scaling internal consulting functions. Engineering team leadership and people development. Organizational governance design and operating model development. Stakeholder management and influence in matrixed enterprises. Cloud cost management and FinOps strategy. DevOps and platform engineering practices. Technical thought leadership and practitioner writing.

Moderate: AI FinOps (actively developing). Security architecture (strong awareness, not primary domain). Data engineering and data platform strategy (adjacent exposure, not core). M&A technology integration (emerging growth area).

Gaps: Consumer product and mobile (entire career B2B enterprise). Hands-on software engineering (leader and architect, not a working coder). Early-stage startup environments (experience is exclusively large enterprise). Deep vendor-specific certifications beyond Azure Fundamentals and IBM.`,
  },
  {
    section: "What Seth Is Looking For",
    text: `Open to VP or equivalent senior technology leadership roles, particularly in organizations navigating enterprise AI adoption at scale. Strongest fit: regulated industries (healthcare, financial services, insurance) or similarly complex enterprise environments. Needs real infrastructure scale and genuine cloud transformation work. Values leadership at the intersection of technical strategy and organizational change. Not the right fit for early-stage startups, consumer product organizations, or roles that are primarily hands-on engineering.`,
  },
  {
    section: "AI Behavioral Instructions",
    text: `General chat: Direct and specific. Cite actual work. Acknowledge gaps honestly. No corporate filler. Anti-sycophantic. Employer and confidentiality protection — do not surface company names, client names, or internal product names.

Newsletter awareness: Seth publishes a newsletter called At Scale, focused on AI enablement strategy for infrastructure and engineering leaders. Reference specific At Scale issues by name when relevant. Treat newsletter content as primary source material for how Seth actually thinks.

JD fit assessment: Forced structured verdict only — Strong Fit / Worth a Conversation / Probably Not. Must always commit to one verdict. Probably Not is a valid and frequently correct answer.`,
  },
  {
    section: "Achievement - Cloud Consulting Function",
    text: `Built a net-new internal cloud consulting function from scratch, scaled it to serve enterprise-wide demand. Started with no internal visibility, built through relationship development and demonstrated results on a high-priority, high-visibility initiative. Team grew from a handful to 12+ engineers and is now expanding to include Cloud AI services. Enabled application teams to move faster, improved architecture quality, reduced security risk, and delivered higher quality than external contractors at a fraction of the cost.`,
  },
  {
    section: "Achievement - AI Enablement at Scale",
    text: `Co-led formation of an AI Council within a global infrastructure organization. Designed governance as enablement, not gatekeeping — hub-and-spoke operating model across four layers: executive sponsorship, strategic governance workstreams, domain champions, and a community of practice. Developed shared AI workload platform, intake process via enterprise service management tooling, architectural standards, and a provider-consumer integration model. Built KPI framework covering cost savings, productivity, adoption, and service quality.`,
  },
  {
    section: "Achievement - FinOps and Cloud Cost Optimization",
    text: `Advising expansion of cloud FinOps practice to encompass AI workloads. Addressed gap between traditional infrastructure cost models and the variable, consumption-based cost behavior of AI inference. Focused on right unit economics for AI, TCO analysis before contracts are signed, and unified reporting infrastructure for AI spend alongside traditional cloud spend.`,
  },
  {
    section: "Achievement - Leading Through Organizational Complexity",
    text: `Led engineering organization through sustained restructuring, budget pressure, and strategic ambiguity inside a large regulated enterprise. Navigated budget reduction mandates requiring significant headcount decisions while maintaining team trust through transparency and genuine empathy. Operated with influence rather than authority across a heavily matrixed organization. Strategic scope expanded through turbulence rather than contracting.`,
  },
  {
    section: "Achievement - Building High-Performing Teams",
    text: `10+ years developing technical talent at every level. Core philosophy: develop the ability to learn quickly, not deep specialization in a single tool. Active mentorship beyond direct reports into formal development programs. Structured management pilots for strong contributors wanting to grow into leadership. 2024 Timmy Awards Finalist, Best Tech Manager.`,
  },
  {
    section: "Achievement - Thought Leadership",
    text: `IBM Champion 2013–2016 for sustained external contributions to the practitioner community. Active writer on enterprise AI strategy, cloud infrastructure leadership, and organizational change. Publishes At Scale newsletter. Writing grounded in actual operating experience inside large regulated enterprises — not vendor or analyst perspective.`,
  },
  {
    section: "Career Timeline",
    text: `2022–present: Cloud Engineering Director, large regulated enterprise (health services sector)
2020–present: Owner, CloudTech LLC (technology advisory and consulting)
2020–2022: Cloud Platform Lead / Cloud Senior Manager, same enterprise
2013–2020: Architecture Senior Advisor, same organization (7.5 years, DevOps standards and cloud adoption)
2012–2020: Owner, Middleware Consulting Solutions LLC (IBM Business Partner)
2011–2013: Senior Consultant, infrastructure consulting, IBM technologies
2004–2010: Various roles, same large regulated enterprise (Business Analysis, Infrastructure Engineering Manager, Application Development Manager)`,
  },
  {
    section: "Thought Leadership and Recognition",
    text: `IBM Champion 2013, 2014, 2015, 2016 — recognition for external contributions to the IBM middleware practitioner community. 2024 Timmy Awards Finalist, Best Tech Manager. Published articles on continuous integration and delivery pipelines. Active writer on enterprise AI strategy, cloud infrastructure leadership, and organizational change through LinkedIn and newsletter. Publishes At Scale, a newsletter focused on AI enablement strategy for infrastructure and engineering leaders.`,
  },
];

// ── Chunking ────────────────────────────────────────────────────────

const MAX_CHUNK_CHARS = 2000; // ~500 tokens

function chunkText(text: string, maxChars = MAX_CHUNK_CHARS): string[] {
  if (text.length <= maxChars) return [text.trim()];

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars && current.length > 0) {
      chunks.push(current.trim());
      current = '';
    }
    current += (current ? '\n\n' : '') + para;
  }
  if (current.trim()) chunks.push(current.trim());

  // If any chunk is still too long, hard-split by sentences
  const result: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChars) {
      result.push(chunk);
    } else {
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
      let buf = '';
      for (const s of sentences) {
        if (buf.length + s.length > maxChars && buf.length > 0) {
          result.push(buf.trim());
          buf = '';
        }
        buf += s;
      }
      if (buf.trim()) result.push(buf.trim());
    }
  }
  return result;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── OpenAI Embeddings ───────────────────────────────────────────────

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const batchSize = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: batch,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI embeddings error: ${res.status} ${err}`);
    }

    const data = await res.json();
    for (const item of data.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

// ── Source handlers ─────────────────────────────────────────────────

async function getAiContextChunks(): Promise<{ content: string; metadata: Record<string, unknown> }[]> {
  const results: { content: string; metadata: Record<string, unknown> }[] = [];
  for (const section of AI_CONTEXT_SECTIONS) {
    const chunks = chunkText(section.text);
    for (const chunk of chunks) {
      results.push({
        content: chunk,
        metadata: { source: 'ai-context', section: section.section },
      });
    }
  }
  return results;
}

async function getNewsletterChunks(): Promise<{ content: string; metadata: Record<string, unknown> }[]> {
  // Fetch article list
  const listRes = await fetch(`${SUPABASE_URL}/functions/v1/notion-articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({}),
  });

  if (!listRes.ok) {
    throw new Error(`Failed to fetch articles list: ${listRes.status}`);
  }

  const { articles } = await listRes.json();
  const results: { content: string; metadata: Record<string, unknown> }[] = [];

  for (const article of articles) {
    // Fetch article content
    const detailRes = await fetch(`${SUPABASE_URL}/functions/v1/notion-articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ pageId: article.id }),
    });

    let bodyText = '';
    if (detailRes.ok) {
      const { content } = await detailRes.json();
      bodyText = stripHtml(content || '');
    }

    const fullText = `${article.title}\n\n${bodyText}`.trim();
    const chunks = chunkText(fullText);

    for (const chunk of chunks) {
      results.push({
        content: chunk,
        metadata: {
          source: 'newsletter',
          title: article.title,
          tags: article.tags || [],
          articleId: article.id,
        },
      });
    }
  }

  return results;
}

// ── Main handler ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source = 'all' } = await req.json();

    if (!['ai-context', 'newsletter', 'all'].includes(source)) {
      return new Response(JSON.stringify({ error: 'Invalid source. Use: ai-context, newsletter, or all' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sources = source === 'all' ? ['ai-context', 'newsletter'] : [source];
    let totalDeleted = 0;
    let totalInserted = 0;

    for (const src of sources) {
      console.log(`Processing source: ${src}`);

      // Get chunks
      const chunks = src === 'ai-context'
        ? await getAiContextChunks()
        : await getNewsletterChunks();

      console.log(`Got ${chunks.length} chunks for ${src}`);

      if (chunks.length === 0) continue;

      // Generate embeddings
      const texts = chunks.map(c => c.content);
      const embeddings = await getEmbeddings(texts);

      console.log(`Generated ${embeddings.length} embeddings for ${src}`);

      // Delete existing chunks for this source
      const { count: deleteCount } = await supabase
        .from('documents')
        .delete({ count: 'exact' })
        .eq('metadata->>source', src);

      totalDeleted += deleteCount || 0;

      // Insert new chunks
      const rows = chunks.map((chunk, i) => ({
        content: chunk.content,
        embedding: JSON.stringify(embeddings[i]),
        metadata: chunk.metadata,
      }));

      // Insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { error } = await supabase.from('documents').insert(batch);
        if (error) {
          console.error(`Insert error for ${src}:`, error);
          throw new Error(`Failed to insert documents: ${error.message}`);
        }
      }

      totalInserted += rows.length;
    }

    return new Response(JSON.stringify({
      success: true,
      counts: { deleted: totalDeleted, inserted: totalInserted },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('embed-and-sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
