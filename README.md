# sethgagnon.com

Personal portfolio and AI-queryable site for Seth Gagnon — Cloud Engineering Director & AI Strategist.

## Tech Stack

- React + Vite + TypeScript + Tailwind CSS
- Lovable Cloud (database, edge functions, vector search)
- Notion API (newsletter articles)
- Anthropic Claude + OpenAI embeddings (AI chat, JD fit assessment)

## Development

```sh
npm i
npm run dev
```

## Custom Domain Setup

To connect `sethgagnon.com`:

1. In Lovable: go to **Project Settings → Domains → Connect Domain**
2. Add `sethgagnon.com` and `www.sethgagnon.com`
3. At your DNS provider, add:
   - **A record** for `@` → `185.158.133.1`
   - **A record** for `www` → `185.158.133.1`
   - **TXT record** for `_lovable` → the verification value shown in Lovable
4. Wait for DNS propagation (up to 72 hours) and SSL provisioning
5. Once live, update `og:url` and `canonical` in `index.html` if needed (already set to `https://sethgagnon.com`)
