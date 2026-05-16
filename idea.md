The core idea is:
Problem
Traditional CMS systems (especially headless WordPress) create a rendering gap.
Content editor view ≠ actual public website
Because:
CMS stores content
frontend independently interprets content
Example:
WordPress Gutenberg
  ↓
JSON / HTML
  ↓
Next.js custom renderer
Problems:
editor preview differs from production
CSS behaves differently
responsive layout differs
interaction behavior differs
form/wizard behavior differs
"looks okay in editor, broken live"
This destroys trust.

Principle
Public renderer is the source of truth.
Not:
editor simulates website
But:
editor controls actual website renderer
Meaning:
same React components
same design tokens
same layout engine
same routing/runtime behavior
same workflow engine
for both:
editor preview
public site

Architecture
Developer layer (internal truth)
Developers define reusable blocks.
Example:
Hero.tsx
Pricing.tsx
Faq.tsx
QuoteWizard.tsx
BookingFlow.tsx
Each block includes metadata:
registerBlock({
 type: "hero",
 component: Hero,
 schema: {
   title: text(),
   subtitle: richText(),
   image: media(),
   cta: link(),
   variant: enum(["center", "split"])
 }
})
This gives:
rendering
validation
editor controls
serialization
preview support

Content layer (stored document)
Content is structured data.
Example:
{
 "blocks": [
   {
     "type": "hero",
     "props": {
       "title": "Build faster",
       "variant": "split"
     }
   }
 ]
}
This stores intent, not HTML.

Editor layer (non-developer UX)
User sees Gutenberg-style interface:
+ Add Block
+ Drag reorder
+ Inline text editing
+ Sidebar controls
+ Media picker
+ Publish
Blocks look like:
Hero
Pricing Table
FAQ
Contact Form
Booking Wizard
Testimonials
Not code.

Rendering model
Editor preview:
Admin shell
 ├── left: page structure
 ├── center: live preview
 └── right: block settings
The center preview renders:
<BlockRenderer blocks={draft.blocks} />
Public website:
<BlockRenderer blocks={published.blocks} />
Same renderer.
Same components.
Different data.

For wizard / form pages
Same principle.
Do NOT fake wizard preview.
Instead:
editor edits workflow definition
preview runs actual workflow engine
public page runs same workflow engine
Example:
Step 1 → business info
Step 2 → theme
Step 3 → review
Same runtime in both environments.

Why this works
Because the architecture becomes:
content editor = control panel
public renderer = actual runtime
instead of:
editor = separate fake renderer
frontend = separate implementation
That eliminates:
visual mismatch
behavioral mismatch
CSS mismatch
layout mismatch
state mismatch

Product model
This becomes:
Developer defines building blocks
↓
Non-developer composes content visually
↓
Same runtime renders preview + production
Best analogy:
Gutenberg UX + React/Compose architecture
Gutenberg gives:
easy content editing
React/Compose gives:
single rendering truth
Together:
what you see in editor is what actually ships.

