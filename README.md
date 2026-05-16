# Web Creator

A starter structure for a shared-runtime CMS: Payload provides the admin and data model, while Next.js renders both public pages and previews through the same React block renderer.

## Structure

- `src/blocks`: typed React blocks and the block registry.
- `src/renderer/BlockRenderer.tsx`: the shared renderer used by public and preview routes.
- `src/workflows`: a small shared workflow schema and runtime for form/wizard blocks.
- `src/payload`: Payload collections for users, media, and pages.
- `src/app/(site)`: public and preview routes.
- `src/app/(payload)`: Payload admin and REST routes.

## Run locally

1. Copy `.env.example` to `.env` and set `DATABASE_URI` and `PAYLOAD_SECRET`.
2. Start Postgres with `docker compose up -d postgres`.
3. Install dependencies with `pnpm install`.
4. Run `pnpm dev`.
5. Open `http://localhost:3000` for the site or `http://localhost:3000/admin` for Payload.
