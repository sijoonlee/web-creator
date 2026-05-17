# Layout Editor Design

## Goal

The Layout Editor creates reusable layout skeletons. A layout defines structure, spacing, alignment, responsive behavior, slots, and optional advanced hooks. It does not own page-specific content.

Content belongs to the Element Editor. Layout belongs to the Layout Editor.

## Core Concepts

### Layout

A layout is a pure skeleton. It can contain other layout containers and slots.

Layouts should not include:

- heading text
- input placeholders
- button labels
- images
- final page copy
- page-specific business meaning

Layouts can include:

- sections
- stacks
- rows
- grids
- slots
- spacing
- alignment
- responsive behavior
- custom classes and safe attributes

### Slot

A slot is a named empty region where the Element Editor can place elements later.

Slots are part of the layout skeleton, but the content inside each slot is stored separately by the page or element document.

### Element

An element is actual content or a control, such as:

- Heading
- Text
- Input
- Button
- Image

Elements are placed into layout slots by the Element Editor.

## Basic Layout Types

V1 should support five layout node types:

- `section`: page region or outer wrapper. It controls width, outer padding, and high-level alignment.
- `stack`: vertical flex container. This should be the default layout type for simple compositions.
- `row`: horizontal flex container. It supports side-by-side regions, action bars, split areas, wrapping, and mobile stacking behavior.
- `grid`: column-based CSS Grid container. It supports responsive columns and slot spans.
- `slot`: empty insertion area where the Element Editor places elements.

These five types are enough for the first version while keeping the model understandable.

Do not use `table` as a layout primitive. Tables should be reserved for tabular data only. If table authoring is needed later, add it as a `table` Element, not as a Layout type.

Optional future layout types:

- `spacer`: controlled empty space.
- `divider`: structural visual separator.
- `frame`: visual grouping container with border, background, and radius.
- `columns`: simplified preset wrapper around grid.

## Data Model

```ts
type LayoutTemplate = {
  id: string
  name: string
  root: LayoutNode
  customCss?: string
}

type LayoutNode = LayoutContainerNode | LayoutSlotNode

type LayoutContainerNode = {
  id: string
  type: 'section' | 'stack' | 'row' | 'grid'
  props: LayoutProps
  attributes?: LayoutAttributes
  children: LayoutNode[]
}

type LayoutSlotNode = {
  id: string
  type: 'slot'
  props: SlotProps
  attributes?: LayoutAttributes
}

type LayoutAttributes = {
  id?: string
  className?: string
  data?: Record<string, string>
  aria?: Record<string, string>
}
```

Important distinction:

- `node.id` is the internal stable editor/database id.
- `attributes.id` is the rendered DOM id and may be customized by the user.

## Supported Layout Nodes

### Section

Top-level or nested region. Usually controls width and outer padding.

```ts
type SectionProps = {
  width: 'medium' | 'wide' | 'full'
  padding: Spacing
  align: Align
}
```

### Stack

Vertical flex layout.

```ts
type StackProps = {
  gap: Spacing
  padding: Spacing
  align: Align
}
```

### Row

Horizontal flex layout. Should automatically stack, wrap, or scroll on smaller screens based on the selected mobile behavior.

```ts
type RowProps = {
  gap: Spacing
  padding: Spacing
  align: Align
  justify: Justify
  wrap: boolean
  mobile: 'stack' | 'wrap' | 'scroll'
}
```

### Grid

Column-based CSS Grid layout. Use this for layout skeletons that need columns, responsive behavior, and slot spans.

Do not use HTML tables for this. Tables are for actual tabular content and should be represented as an Element if needed later.

```ts
type GridProps = {
  columns: 2 | 3 | 4 | 6 | 12
  mobileColumns: 1 | 2
  gap: Spacing
  padding: Spacing
  align: Align
}
```

### Slot

Empty region where elements can be inserted later.

```ts
type SlotProps = {
  name: string
  padding: Spacing
  align: Align
  span?: 1 | 2 | 3 | 4 | 6 | 8 | 12
  minHeight?: 'none' | 'sm' | 'md' | 'lg'
}
```

Only show `span` when the slot is inside a grid parent.

## Shared Types

```ts
type Spacing = 'none' | 'sm' | 'md' | 'lg'

type Align = 'start' | 'center' | 'end' | 'stretch'

type Justify = 'start' | 'center' | 'end' | 'between'

type LayoutProps = SectionProps | StackProps | RowProps | GridProps
```

Use tokenized values instead of arbitrary pixel values in the main UI. This keeps layouts consistent and responsive.

## Example Layout

```ts
const layout: LayoutTemplate = {
  id: 'layout-responsive-split',
  name: 'Responsive Split',
  root: {
    id: 'section-1',
    type: 'section',
    props: {
      width: 'wide',
      padding: 'lg',
      align: 'stretch'
    },
    attributes: {
      id: 'main-section',
      className: 'custom-section',
      data: {
        name: 'main'
      }
    },
    children: [
      {
        id: 'row-1',
        type: 'row',
        props: {
          gap: 'lg',
          padding: 'none',
          align: 'center',
          justify: 'start',
          wrap: false,
          mobile: 'stack'
        },
        children: [
          {
            id: 'slot-1',
            type: 'slot',
            props: {
              name: 'Slot 1',
              padding: 'md',
              align: 'stretch',
              minHeight: 'sm'
            }
          },
          {
            id: 'slot-2',
            type: 'slot',
            props: {
              name: 'Slot 2',
              padding: 'md',
              align: 'stretch',
              minHeight: 'sm'
            }
          }
        ]
      }
    ]
  }
}
```

## Page or Element Document Using a Layout

The layout only stores the skeleton. Filled slot content is stored separately.

```ts
type ElementPage = {
  id: string
  layoutId: string
  slots: Record<string, ElementNode[]>
}

type ElementNode = {
  id: string
  type: 'heading' | 'text' | 'input' | 'button' | 'image'
  props: Record<string, unknown>
}
```

Example:

```ts
const page: ElementPage = {
  id: 'page-1',
  layoutId: 'layout-responsive-split',
  slots: {
    'slot-1': [
      {
        id: 'element-1',
        type: 'heading',
        props: {
          text: 'Contact us',
          level: 1
        }
      }
    ],
    'slot-2': [
      {
        id: 'element-2',
        type: 'button',
        props: {
          text: 'Send'
        }
      }
    ]
  }
}
```

## Layout Editor UI

The editor should have three main areas.

### 1. Layout Tree

Shows the layout skeleton as a selectable tree.

Supported actions:

- add section
- add stack
- add row
- add grid
- add slot
- duplicate node
- delete node
- move node up/down
- move node into another container

Guardrails:

- max nesting depth, such as 4 or 5
- slots cannot contain layout nodes in the Layout Editor
- only containers can have layout children
- root should usually be a section

### 2. Canvas

Renders the layout skeleton visually.

Behavior:

- selecting a container highlights its boundary
- selecting a slot highlights the slot
- empty slots show their slot name
- layout nodes render without real content
- optional preview mode can show sample filler blocks, but those fillers are not stored as content

### 3. Settings Panel

Shows controls for the selected node.

For all nodes:

- internal id, read-only
- display name, where applicable
- DOM id
- class name
- data attributes
- aria attributes

For containers:

- layout type
- padding
- gap
- align
- justify, only for row
- wrap, only for row
- mobile behavior, only for row
- columns, only for grid
- mobile columns, only for grid
- width, only for section

For slots:

- name
- padding
- align
- span, only when parent is grid
- min height

## Responsive Behavior

Avoid exposing full breakpoint controls in v1.

Instead, responsive behavior should be built into layout types:

- stack stays vertical
- row can stack, wrap, or scroll on mobile
- grid uses `mobileColumns` on mobile
- section width becomes full on small screens

Advanced breakpoint overrides can be added later if needed.

## Custom CSS

Support custom CSS as an advanced escape hatch.

Recommended v1 support:

- custom class name per layout node
- custom CSS per layout template
- CSS should be scoped to the layout instance

Do not let custom CSS leak globally.

Preferred authoring pattern:

```css
:scope .custom-section {
  background: #f6f8fb;
}
```

Renderer can transform `:scope` into a layout-specific selector:

```css
[data-layout-template-id="layout-responsive-split"] .custom-section {
  background: #f6f8fb;
}
```

Custom CSS guardrails:

- disable by default or place under Advanced
- block external `@import`
- avoid global selectors such as `body`, `html`, and `*`
- do not allow event handlers
- keep system classes and custom classes merged

## Custom Attributes

Users should be able to add safe attributes for analytics, accessibility, testing, anchors, and CSS hooks.

Supported attributes:

```ts
attributes: {
  id?: string
  className?: string
  data?: Record<string, string>
  aria?: Record<string, string>
}
```

Renderer output:

- `attributes.id` becomes `id`
- `attributes.className` is merged with system classes
- `attributes.data.name` becomes `data-name`
- `attributes.aria.label` becomes `aria-label`

Do not support arbitrary attributes in v1.

Do not support event handler attributes such as:

- `onclick`
- `onmouseover`
- `onload`

## Rendering Approach

Rendering should be recursive.

```tsx
function LayoutRenderer({
  node,
  slots
}: {
  node: LayoutNode
  slots: Record<string, ElementNode[]>
}) {
  if (node.type === 'slot') {
    return (
      <SlotRenderer node={node}>
        {(slots[node.id] || []).map((element) => (
          <ElementRenderer key={element.id} node={element} />
        ))}
      </SlotRenderer>
    )
  }

  return (
    <LayoutContainer node={node}>
      {node.children.map((child) => (
        <LayoutRenderer key={child.id} node={child} slots={slots} />
      ))}
    </LayoutContainer>
  )
}
```

## CSS Mapping

The renderer should map tokenized props to classes.

Example:

```tsx
const className = [
  'layout-node',
  `layout-${node.type}`,
  `layout-padding-${node.props.padding}`,
  `layout-gap-${node.props.gap}`,
  `layout-align-${node.props.align}`,
  node.attributes?.className
]
  .filter(Boolean)
  .join(' ')
```

Example CSS:

```css
.layout-stack {
  display: flex;
  flex-direction: column;
}

.layout-row {
  display: flex;
  flex-direction: row;
}

.layout-grid {
  display: grid;
}

.layout-gap-none {
  gap: 0;
}

.layout-gap-sm {
  gap: 12px;
}

.layout-gap-md {
  gap: 20px;
}

.layout-gap-lg {
  gap: 32px;
}

.layout-padding-none {
  padding: 0;
}

.layout-padding-sm {
  padding: 12px;
}

.layout-padding-md {
  padding: 20px;
}

.layout-padding-lg {
  padding: 32px;
}

.layout-align-start {
  align-items: flex-start;
}

.layout-align-center {
  align-items: center;
}

.layout-align-end {
  align-items: flex-end;
}

.layout-align-stretch {
  align-items: stretch;
}

.layout-justify-start {
  justify-content: flex-start;
}

.layout-justify-center {
  justify-content: center;
}

.layout-justify-end {
  justify-content: flex-end;
}

.layout-justify-between {
  justify-content: space-between;
}

.layout-columns-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.layout-columns-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.layout-columns-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 760px) {
  .layout-row.layout-mobile-stack {
    flex-direction: column;
  }

  .layout-grid {
    grid-template-columns: 1fr;
  }

  .layout-grid.layout-mobile-columns-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

## Recommended V1 Scope

Build this first:

- recursive layout tree
- basic layout types: section, stack, row, grid, slot
- tokenized spacing
- basic alignment
- row mobile behavior
- grid mobile columns
- selectable slots
- safe custom attributes
- custom class name per node
- scoped custom CSS per layout
- localStorage persistence

Avoid in v1:

- arbitrary pixel inputs
- arbitrary CSS properties as form fields
- full breakpoint editor
- absolute positioning
- negative margins
- raw HTML injection
- global CSS injection
- slots containing layout nodes in the Element Editor
