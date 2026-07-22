# Nodalis

A personal research tool that turns trending topics into full stories and
connects them across domains. Where a marketing trend tool asks "what should
I post about," Nodalis asks "what's actually going on, and how does it
connect to everything else."

Single-user, no auth — this is meant to run as your own local/private
instance.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4
- Postgres via Prisma, using the `@prisma/adapter-pg` driver adapter (any
  Postgres works — Prisma Postgres, Vercel Postgres, Neon, Supabase, or
  your own). SQLite doesn't survive Vercel's ephemeral/read-only serverless
  filesystem, so this needs a real hosted database even for solo use.
- Claude API (`@anthropic-ai/sdk`) for narrative synthesis, via structured
  outputs (`output_config.format` + Zod schema) — no fragile JSON parsing
- Firecrawl for source-article scraping and trend-candidate discovery

## Setup

1. Get a Postgres database. Easiest path: in your Vercel project → **Storage**
   → **Connect Database** → **Prisma Postgres** (or Neon/Supabase/Vercel
   Postgres — any of them work identically here). Copy the connection
   string.
2.
   ```bash
   npm install
   cp .env.example .env
   # fill in DATABASE_URL (from step 1), ANTHROPIC_API_KEY, FIRECRAWL_API_KEY, CRON_SECRET
   npx prisma migrate deploy   # creates all tables
   npx prisma db seed          # optional — loads 6 mock stories so the UI has something to show
   npm run dev
   ```

Open http://localhost:3000.

On Vercel, set the same env vars as project Environment Variables — the
build script (`prisma migrate deploy && next build`) applies any pending
migrations automatically on every deploy, so you don't need a separate
migration step in CI.

### Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL` | Everything | A Postgres connection string. On Supabase specifically, use the **Transaction pooler** string (port 6543) when deploying to Vercel — Supabase's direct connection is IPv6-only, which Vercel's serverless functions can't reach. Other providers' direct connection strings work fine. |
| `ANTHROPIC_API_KEY` | Synthesis (Explore, refresh job) | Get one at console.anthropic.com. Without it, `/explore`'s "Research this" and the refresh job will fail — browsing the feed/saved/themes still works against seeded/existing data |
| `FIRECRAWL_API_KEY` | Real source scraping | Without it, synthesis still runs but with no sources — Claude writes from general knowledge and is prompted to hedge accordingly. Get one at firecrawl.dev |
| `CRON_SECRET` | The refresh endpoint | Shared secret required to call `/api/cron/refresh` |
| `ANTHROPIC_MODEL` | optional | Defaults to `claude-opus-4-8`. Set to `claude-sonnet-5` for a cheaper/faster daily refresh |
| `ANTHROPIC_EFFORT` | optional | `low`\|`medium`\|`high`\|`xhigh`\|`max`, defaults to `medium` |

## How it's put together

- **Data model** (`prisma/schema.prisma`): `Story` (the layered narrative),
  `Theme` (abstract cross-domain tags, many-to-many via `StoryTheme`),
  `Thread` + `ThreadEntry` (the durable, evolving story a `Story` attaches
  to), `Source` (scraped articles backing a story), `SavedItem` (a saved
  story or thread + your personal note).
- **Synthesis pipeline** (`src/lib/`):
  - `firecrawl.ts` — scrapes/search source articles for a topic
  - `trends.ts` — "what's trending": searches a few broad news queries via
    Firecrawl, then asks Claude to cluster the results into distinct topic
    candidates (a substitute for a Google Trends API key)
  - `synthesis.ts` — the actual narrative-writing call: topic + scraped
    sources → structured JSON (what happened, why now, background, who's
    involved, what's next, themes, talking points, trend, and a proposed
    thread title)
  - `threads.ts` — matches a new story's proposed thread title against
    existing threads (token-overlap heuristic) to decide attach-vs-create
  - `ingest.ts` — orchestrates the above into one `Story` write
- **UI** (`src/app/`): feed (`/`), full story (`/story/[slug]`), themes
  (`/themes`, `/theme/[slug]`), thread timeline (`/thread/[id]`), on-demand
  research (`/explore`), personal knowledge base (`/saved`).
- **Refresh job** (`src/app/api/cron/refresh/route.ts`): pulls today's trend
  candidates and runs the full pipeline for each, then archives stories
  that have gone stale (14+ days untouched).

## Scheduling the daily refresh

The route is a plain authenticated GET, so use whatever scheduler you like:

**Vercel** — already configured in `vercel.json` (daily at 8am UTC). Just
set `CRON_SECRET` as a project env var; Vercel Cron sends it automatically
as `Authorization: Bearer $CRON_SECRET`.

**Any other host** — a crontab entry:

```bash
0 8 * * * curl -s "https://your-domain/api/cron/refresh?secret=$CRON_SECRET"
```

**GitHub Actions** (`.github/workflows/refresh.yml`):

```yaml
on:
  schedule:
    - cron: "0 8 * * *"
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - run: curl -sf "${{ secrets.NODALIS_URL }}/api/cron/refresh?secret=${{ secrets.CRON_SECRET }}"
```

## Notes on scope / deviations from the original brief

- **Trend detection** doesn't use a Google Trends API — this repo uses
  Firecrawl search results as the raw "what's happening" signal and lets
  Claude name the distinct stories in them. Swap `src/lib/trends.ts` for a
  real Google Trends integration if you have one.
- **Thread matching** is a simple word-overlap heuristic on Claude's
  proposed thread title, not semantic search. Fine at single-user scale
  (dozens–low hundreds of threads); revisit if that stops being true.
