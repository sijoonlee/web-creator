# Web Creator

A starter structure for a shared-runtime CMS: Payload provides the admin and data model, while Next.js renders both public pages and previews through the same React block renderer.

## Structure

- `src/blocks`: typed React blocks and the block registry.
- `src/components`: reusable UI primitives such as Button, Input, Heading, and Label.
- `src/layouts`: reusable layout skeleton types, defaults, tree helpers, renderer, and Layout Editor.
- `src/elements`: basic element types, defaults, renderer, and Element Editor.
- `src/pageEditor`: Page Editor data model and editor implementation.
- `src/renderer/BlockRenderer.tsx`: the shared renderer used by public and preview routes.
- `src/workflows`: a small shared workflow schema and runtime for form/wizard blocks.
- `src/payload`: Payload collections for users, media, and pages.
- `src/app/(site)`: public and preview routes.
- `src/app/(payload)`: Payload admin and REST routes.

## Editors

The project currently has two generations of editor surfaces.

### Content Editor

Route: `http://localhost:3000/editor`

The Content Editor is the original block-based prototype. It edits predefined blocks such as Hero, Pricing, FAQ, and Quote Wizard. Each block owns both its content and its layout. This is still useful as a reference implementation for preview rendering, localStorage persistence, and block editing patterns.

Storage key:

- `web-creator-editor`

### Layout Editor

Route: `http://localhost:3000/editor/layouts`

The Layout Editor creates reusable pure layout skeletons. Layouts do not contain final content like button text, input placeholders, or headings. They define structure and empty slots that can later be filled by pages.

Supported layout node types:

- `section`: outer wrapper for width and padding
- `stack`: vertical flex layout
- `row`: horizontal flex layout
- `grid`: CSS Grid layout
- `slot`: insertion area for elements

Supported layout settings include padding, gap, alignment, width, columns, mobile grid columns, slot min height, slot span, safe DOM attributes, custom class names, and scoped custom CSS.

Storage key:

- `web-creator-layouts`

### Element Editor

Route: `http://localhost:3000/editor/elements`

The Element Editor is a focused prototype for filling slots in a mocked layout. It uses a hardcoded Section + 2x2 Grid layout and lets the user select a slot, add basic elements, and edit their props.

Supported basic elements:

- Heading
- Text
- Input
- Button

Storage key:

- `web-creator-element-page`

### Page Editor

Route: `http://localhost:3000/editor/pages`

The Page Editor is the main direction for the new builder model. It manages multiple pages, lets the user choose a layout, copies that layout into the page as a snapshot, fills layout slots with elements, and allows page-specific layout adjustments.

The copied layout snapshot is important: changing padding, gap, slot names, min height, and similar parameters in Page Editor changes only that page, not the reusable layout template from Layout Editor.

Page Editor can currently use:

- built-in Mock 2x2 Grid layout
- built-in Single Column layout
- saved layouts from Layout Editor

Storage key:

- `web-creator-pages`

## Builder Model

The intended long-term model is:

- Layout Editor owns reusable structure.
- Page Editor owns page metadata, selected layout snapshot, slot content, and page-specific layout tweaks.
- Element rendering owns the basic UI pieces inside slots.
- The old Content Editor can eventually be deprecated or converted into smart elements/blocks.

## Run locally

1. Copy `.env.example` to `.env` and set `DATABASE_URI` and `PAYLOAD_SECRET`.
2. Start Postgres with `docker compose up -d postgres`.
3. Install dependencies with `pnpm install`.
4. Run `pnpm dev`.
5. Open `http://localhost:3000` for the site, `http://localhost:3000/editor/pages` for the Page Editor, or `http://localhost:3000/admin` for Payload.
