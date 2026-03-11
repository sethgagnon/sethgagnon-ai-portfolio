import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY')!;
const NOTION_AI_CONTEXT_PAGE_ID = Deno.env.get('NOTION_AI_CONTEXT_PAGE_ID')!;
const NOTION_VERSION = '2022-06-28';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Notion helpers ──────────────────────────────────────────────────

function notionFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

function extractPlainText(richTextArray: any[]): string {
  if (!richTextArray) return '';
  return richTextArray.map((rt: any) => rt.plain_text || '').join('');
}

async function fetchAllBlocks(pageId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined;
  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const res = await notionFetch(url);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Notion API error fetching blocks for ${pageId}: ${res.status} ${err}`);
    }
    const data = await res.json();
    blocks.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

// ── Hashing ─────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Chunking ────────────────────────────────────────────────────────

const MAX_CHUNK_CHARS = 2000;
const OVERLAP_CHARS = 200;

function chunkText(text: string, maxChars = MAX_CHUNK_CHARS, overlap = OVERLAP_CHARS): string[] {
  if (text.length <= maxChars) return [text.trim()];

  const paragraphs = text.split(/\n\n+/);
  const rawChunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars && current.length > 0) {
      rawChunks.push(current.trim());
      // Overlap: keep the tail of the previous chunk
      const tail = current.slice(-overlap).trim();
      current = tail ? tail + '\n\n' + para : para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current.trim()) rawChunks.push(current.trim());

  // Hard-split any chunks still too long
  const result: string[] = [];
  for (const chunk of rawChunks) {
    if (chunk.length <= maxChars) {
      result.push(chunk);
    } else {
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
      let buf = '';
      for (const s of sentences) {
        if (buf.length + s.length > maxChars && buf.length > 0) {
          result.push(buf.trim());
          const tail = buf.slice(-overlap).trim();
          buf = tail ? tail + s : s;
        } else {
          buf += s;
        }
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

// ── OpenAI Embeddings (text-embedding-3-small) ──────────────────────

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
        model: 'text-embedding-3-small',
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

// ── Source: AI Context from Notion ──────────────────────────────────

async function getAiContextChunks(): Promise<{ content: string; metadata: Record<string, unknown> }[]> {
  const blocks = await fetchAllBlocks(NOTION_AI_CONTEXT_PAGE_ID);
  const results: { content: string; metadata: Record<string, unknown> }[] = [];

  let currentSection = 'General';
  let currentText = '';

  const flushSection = async () => {
    if (!currentText.trim()) return;
    const chunks = chunkText(currentText);
    for (const chunk of chunks) {
      const contentHash = await sha256(chunk);
      results.push({
        content: chunk,
        metadata: {
          source: 'ai_context',
          type: 'context',
          section: currentSection,
          content_hash: contentHash,
        },
      });
    }
  };

  for (const block of blocks) {
    const type = block.type;

    // Heading blocks start a new section
    if (type === 'heading_1' || type === 'heading_2' || type === 'heading_3') {
      await flushSection();
      currentSection = extractPlainText(block[type].rich_text) || 'General';
      currentText = '';
      continue;
    }

    // Extract text from common block types
    let blockText = '';
    if (type === 'paragraph') {
      blockText = extractPlainText(block.paragraph.rich_text);
    } else if (type === 'bulleted_list_item') {
      blockText = '• ' + extractPlainText(block.bulleted_list_item.rich_text);
    } else if (type === 'numbered_list_item') {
      blockText = extractPlainText(block.numbered_list_item.rich_text);
    } else if (type === 'quote') {
      blockText = extractPlainText(block.quote.rich_text);
    } else if (type === 'callout') {
      blockText = extractPlainText(block.callout.rich_text);
    } else if (type === 'toggle') {
      blockText = extractPlainText(block.toggle.rich_text);
    } else if (type === 'code') {
      blockText = extractPlainText(block.code.rich_text);
    }

    if (blockText) {
      currentText += (currentText ? '\n\n' : '') + blockText;
    }
  }

  // Flush the last section
  await flushSection();

  return results;
}

// ── Source: Newsletter articles ─────────────────────────────────────

async function getNewsletterChunks(): Promise<{ content: string; metadata: Record<string, unknown> }[]> {
  // Fetch article list via notion-articles edge function
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
      const contentHash = await sha256(chunk);
      results.push({
        content: chunk,
        metadata: {
          source: 'newsletter',
          type: 'article',
          title: article.title,
          article_id: article.id,
          content_hash: contentHash,
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

    if (!['ai_context', 'newsletter', 'all'].includes(source)) {
      return new Response(JSON.stringify({ error: 'Invalid source. Use: ai_context, newsletter, or all' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sources = source === 'all' ? ['ai_context', 'newsletter'] : [source];
    let totalDeleted = 0;
    let totalInserted = 0;

    for (const src of sources) {
      console.log(`Processing source: ${src}`);

      const chunks = src === 'ai_context'
        ? await getAiContextChunks()
        : await getNewsletterChunks();

      console.log(`Got ${chunks.length} chunks for ${src}`);

      if (chunks.length === 0) continue;

      // Generate embeddings
      const texts = chunks.map(c => c.content);
      const embeddings = await getEmbeddings(texts);

      console.log(`Generated ${embeddings.length} embeddings for ${src}`);

      // Delete existing documents for this source
      const { count: deleteCount } = await supabase
        .from('documents')
        .delete({ count: 'exact' })
        .eq('metadata->>source', src);

      totalDeleted += deleteCount || 0;

      // Insert new documents in batches
      const rows = chunks.map((chunk, i) => ({
        content: chunk.content,
        embedding: JSON.stringify(embeddings[i]),
        metadata: chunk.metadata,
      }));

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
    console.error('ingest-documents error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
