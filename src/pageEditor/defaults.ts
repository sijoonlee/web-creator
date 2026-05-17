import { mockElementLayout } from '@/elements/defaults'
import { cloneLayout, refreshNodeIds } from '@/layouts/tree'
import type { LayoutTemplate } from '@/layouts/types'

import type { PageDocument } from './types'
import { collectSlotsFromLayout } from './layoutUtils'

export const pageStorageKey = 'web-creator-pages'

export const builtInPageLayouts: LayoutTemplate[] = [
  mockElementLayout,
  {
    id: 'built-in-single-column',
    name: 'Single Column',
    root: {
      id: 'single-section',
      type: 'section',
      props: {
        align: 'stretch',
        padding: 'lg',
        width: 'medium'
      },
      children: [
        {
          id: 'single-stack',
          type: 'stack',
          props: {
            align: 'stretch',
            gap: 'md',
            padding: 'none'
          },
          children: [
            {
              id: 'single-slot',
              type: 'slot',
              props: {
                align: 'stretch',
                minHeight: 'lg',
                name: 'Main',
                padding: 'md'
              }
            }
          ]
        }
      ]
    }
  }
]

export function createPageId() {
  return `page-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

export function createPageFromLayout(
  layout: LayoutTemplate,
  index = 1
): PageDocument {
  const layoutSnapshot = {
    ...cloneLayout(layout),
    id: `${layout.id}-snapshot-${Date.now().toString(36)}`,
    root: refreshNodeIds(layout.root)
  }
  const slots = collectSlotsFromLayout(layoutSnapshot.root)
  const selectedSlotId = slots[0]?.id || layoutSnapshot.root.id

  return {
    id: createPageId(),
    layout: layoutSnapshot,
    name: `Page ${index}`,
    selectedNodeId: selectedSlotId,
    selectedSlotId,
    slug: `page-${index}`,
    slots: Object.fromEntries(slots.map((slot) => [slot.id, []]))
  }
}

export function createDefaultPageDocument(): PageDocument {
  return {
    id: 'page-default',
    layout: mockElementLayout,
    name: 'Page 1',
    selectedNodeId: 'slot-1',
    selectedSlotId: 'slot-1',
    slug: 'page-1',
    slots: {
      'slot-1': [],
      'slot-2': [],
      'slot-3': [],
      'slot-4': []
    }
  }
}
