# TODO

## Current Progress

- Next.js App Router scaffold is in place.
- Payload is installed and mounted at `/admin`.
- Postgres Docker Compose config exists in `docker-compose.yml`.
- Shared block rendering exists through `BlockRenderer`.
- Registered prototype blocks:
  - Hero
  - Pricing Table
  - FAQ
  - Quote Wizard
- Public page currently renders `demoPage.blocks`.
- Preview page currently renders the same demo blocks through `BlockRenderer`.
- Standalone `/editor` route exists as a local prototype.
- `/editor` supports:
  - add blocks
  - select blocks
  - move blocks up/down
  - delete blocks
  - edit basic props
  - live preview through the real renderer
  - localStorage persistence

## What Payload Does Next

Payload should become the source of truth for stored content, users, media, drafts, and publishing.

The target flow is:

```txt
Editor changes blocks
  -> Save draft to Payload page document
  -> Preview reads draft page document
  -> Publish promotes draft
  -> Public route reads published page document
  -> BlockRenderer renders the page
```

## Required Work To Use Payload Fully

1. Create `.env`

   Copy `.env.example` to `.env` and set:

   ```env
   DATABASE_URI=postgres://postgres:postgres@localhost:5432/web_creator
   PAYLOAD_SECRET=your-long-random-secret
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. Start Postgres

   ```bash
   docker compose up -d postgres
   ```

3. Verify Payload admin

   Open:

   ```txt
   http://localhost:3000/admin
   ```

   Create the first admin user.

4. Replace demo-only page rendering

   Current:

   ```txt
   / and /preview/demo read src/content/demoPage.ts
   ```

   Needed:

   ```txt
   /[slug] reads published page data from Payload
   /preview/[slug] reads draft page data from Payload
   ```

5. Improve the `pages` collection

   Current field:

   ```txt
   blocks: json
   ```

   Needed for a better admin experience:

   - Keep the stored document shape compatible with `BlockRenderer`.
   - Add validation for block documents.
   - Consider replacing the raw JSON field with Payload block fields or a custom field UI.
   - Add preview URL support.
   - Keep drafts enabled.

6. Connect `/editor` to Payload

   Current:

   ```txt
   /editor uses demo data and localStorage
   ```

   Needed:

   - Load a page document from Payload by slug or ID.
   - Add Save Draft.
   - Add Publish.
   - Add Reset/Revert to latest saved draft.
   - Show save/publish errors.
   - Prevent anonymous edits unless intentionally allowed.

7. Add server actions or API routes

   Needed operations:

   - fetch page draft
   - fetch published page
   - create page
   - update draft blocks
   - publish page
   - upload/select media

8. Add media support

   Current Hero media is only a CSS placeholder.

   Needed:

   - Use Payload `media` collection.
   - Add media picker or media relationship field.
   - Render real uploaded images in blocks.

9. Add block schema validation

   Current validation happens at render time with Zod schemas.

   Needed:

   - Validate before saving to Payload.
   - Surface validation errors in the editor.
   - Prevent publishing invalid blocks.

10. Add production page routing

    Needed:

    - Dynamic route for page slugs.
    - 404 for missing/unpublished pages.
    - Draft preview mode.
    - Cache/revalidation strategy after publishing.

## Later Improvements

- Drag-and-drop block reordering.
- Inline text editing inside the preview.
- Full workflow editor for Quote Wizard.
- Rich text fields.
- Role-based permissions.
- Autosave.
- Version history UI.
- Preview iframe/device sizes.
- Custom Payload admin field for block editing.
- Generated TypeScript types from Payload documents.

