const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY')!;
const NOTION_DATABASE_ID = Deno.env.get('NOTION_DATABASE_ID')!;
const NOTION_VERSION = '2022-06-28';

const notionFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

function extractPlainText(richTextArray: any[]): string {
  if (!richTextArray) return '';
  return richTextArray.map((rt: any) => rt.plain_text || '').join('');
}

function richTextToHtml(richTextArray: any[]): string {
  if (!richTextArray) return '';
  return richTextArray.map((rt: any) => {
    let text = rt.plain_text || '';
    if (!text) return '';
    // Escape HTML
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const a = rt.annotations || {};
    if (a.bold) text = `<strong>${text}</strong>`;
    if (a.italic) text = `<em>${text}</em>`;
    if (a.strikethrough) text = `<s>${text}</s>`;
    if (a.underline) text = `<u>${text}</u>`;
    if (a.code) text = `<code>${text}</code>`;
    if (rt.href) text = `<a href="${rt.href}" target="_blank" rel="noopener">${text}</a>`;
    return text;
  }).join('');
}

async function fetchAllBlocks(pageId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined;
  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const res = await notionFetch(url);
    const data = await res.json();
    blocks.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

function blocksToHtml(blocks: any[]): string {
  const parts: string[] = [];
  let inList: string | null = null;

  const flushList = () => {
    if (inList) { parts.push(inList === 'bulleted' ? '</ul>' : '</ol>'); inList = null; }
  };

  for (const block of blocks) {
    const type = block.type;

    if (type === 'bulleted_list_item') {
      if (inList !== 'bulleted') { flushList(); parts.push('<ul>'); inList = 'bulleted'; }
      parts.push(`<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`);
      continue;
    }
    if (type === 'numbered_list_item') {
      if (inList !== 'numbered') { flushList(); parts.push('<ol>'); inList = 'numbered'; }
      parts.push(`<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`);
      continue;
    }

    flushList();

    switch (type) {
      case 'paragraph':
        parts.push(`<p>${richTextToHtml(block.paragraph.rich_text)}</p>`);
        break;
      case 'heading_1':
        parts.push(`<h1>${richTextToHtml(block.heading_1.rich_text)}</h1>`);
        break;
      case 'heading_2':
        parts.push(`<h2>${richTextToHtml(block.heading_2.rich_text)}</h2>`);
        break;
      case 'heading_3':
        parts.push(`<h3>${richTextToHtml(block.heading_3.rich_text)}</h3>`);
        break;
      case 'quote':
        parts.push(`<blockquote>${richTextToHtml(block.quote.rich_text)}</blockquote>`);
        break;
      case 'callout':
        parts.push(`<blockquote>${richTextToHtml(block.callout.rich_text)}</blockquote>`);
        break;
      case 'code':
        parts.push(`<pre><code>${richTextToHtml(block.code.rich_text)}</code></pre>`);
        break;
      case 'divider':
        parts.push('<hr />');
        break;
      case 'toggle':
        parts.push(`<details><summary>${richTextToHtml(block.toggle.rich_text)}</summary></details>`);
        break;
      case 'image': {
        const url = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
        const caption = block.image.caption ? extractPlainText(block.image.caption) : '';
        parts.push(`<figure><img src="${url}" alt="${caption}" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`);
        break;
      }
      default:
        break;
    }
  }
  flushList();
  return parts.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try { body = await req.json(); } catch { /* no body = list mode */ }

    const { pageId } = body;

    // DETAIL MODE
    if (pageId) {
      const blocks = await fetchAllBlocks(pageId);
      const content = blocksToHtml(blocks);
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LIST MODE
    const { type } = body;
    const formatValue = type === 'quick-takes' ? 'Quick Take' : 'Newsletter Article';

    const res = await notionFetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Format', select: { equals: formatValue } },
            { property: 'Status', select: { equals: 'Posted' } },
          ],
        },
        sorts: [{ property: 'Date Posted', direction: 'descending' }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Notion API error:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let articles = (data.results || []).map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        title: extractPlainText(props.Title?.title || props.Name?.title || []),
        date: props['Date Posted']?.date?.start || null,
        description: extractPlainText(props['SEO Description']?.rich_text || []),
        tags: (props['Topic Tags']?.multi_select || []).map((t: any) => t.name),
        postUrl: props['Post URL']?.url || null,
        bodyExcerpt: '',
      };
    });

    // For quick-takes, fetch body excerpts
    if (type === 'quick-takes') {
      await Promise.all(articles.map(async (article) => {
        try {
          const url = `https://api.notion.com/v1/blocks/${article.id}/children?page_size=5`;
          const blockRes = await notionFetch(url);
          const blockData = await blockRes.json();
          const blocks = blockData.results || [];
          const plainText = blocks
            .map((b: any) => {
              const rt = b[b.type]?.rich_text;
              return rt ? extractPlainText(rt) : '';
            })
            .filter(Boolean)
            .join(' ');
          article.bodyExcerpt = plainText.length > 300 ? plainText.slice(0, 300) + '…' : plainText;
        } catch { /* skip excerpt on error */ }
      }));
    }

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
