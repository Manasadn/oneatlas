$readme = @'
# OneAtlas

AI model discovery and intelligence platform. Discover, compare and evaluate AI models across labs and providers.

**Live demo:** https://oneatlas-rho.vercel.app

> Model data (prices, latency, benchmark scores) is sample data seeded for demonstration. It is approximate and not a live feed.

## Features

| Area | What it does |
|---|---|
| Model discovery | Search, filter by lab / provider / capability / type / license, sort by price, context window, release date, name, with pagination |
| Model detail | Specs, modalities, capabilities, per-provider pricing table, benchmark scores with rank |
| Comparison | Compare 2 to 4 models side by side, best value per row highlighted, shareable URL |
| Rankings | Leaderboards per benchmark, filter by category or benchmark |
| Labs and providers | Directory pages plus detail pages listing models, prices, latency and throughput |
| Global search | Debounced navbar search (Ctrl+K) across models, labs and providers |

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript, TailwindCSS
- Next.js Route Handlers for the API
- PostgreSQL on Neon, Prisma ORM
- Zod for request validation
- Deployed on Vercel

## Architecture

```mermaid
flowchart LR
  B[Browser] -->|client components fetch| A[Next.js API routes]
  B -->|server components| P[Prisma]
  A --> V[Zod validation]
  V --> P
  P --> D[(PostgreSQL / Neon)]
