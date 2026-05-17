import type { LayoutTemplate } from '@/layouts/types'

import type { ElementNode, ElementPage, ElementType } from './types'

export const elementStorageKey = 'web-creator-element-page'

export const mockElementLayout: LayoutTemplate = {
  id: 'mock-layout-2x2',
  name: 'Mock 2x2 Grid',
  root: {
    id: 'mock-section',
    type: 'section',
    props: {
      align: 'stretch',
      padding: 'lg',
      width: 'wide'
    },
    children: [
      {
        id: 'mock-grid',
        type: 'grid',
        props: {
          align: 'stretch',
          columns: 2,
          gap: 'md',
          mobileColumns: 1,
          padding: 'none'
        },
        children: [
          {
            id: 'slot-1',
            type: 'slot',
            props: {
              align: 'stretch',
              minHeight: 'md',
              name: 'Slot 1',
              padding: 'md',
              span: 1
            }
          },
          {
            id: 'slot-2',
            type: 'slot',
            props: {
              align: 'stretch',
              minHeight: 'md',
              name: 'Slot 2',
              padding: 'md',
              span: 1
            }
          },
          {
            id: 'slot-3',
            type: 'slot',
            props: {
              align: 'stretch',
              minHeight: 'md',
              name: 'Slot 3',
              padding: 'md',
              span: 1
            }
          },
          {
            id: 'slot-4',
            type: 'slot',
            props: {
              align: 'stretch',
              minHeight: 'md',
              name: 'Slot 4',
              padding: 'md',
              span: 1
            }
          }
        ]
      }
    ]
  }
}

export function createElementId(type: ElementType) {
  return `${type}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

export function createDefaultElement(type: ElementType): ElementNode {
  const id = createElementId(type)

  if (type === 'heading') {
    return {
      id,
      type,
      props: {
        level: 2,
        text: 'Heading'
      }
    }
  }

  if (type === 'text') {
    return {
      id,
      type,
      props: {
        text: 'Text content'
      }
    }
  }

  if (type === 'input') {
    return {
      id,
      type,
      props: {
        name: 'field',
        placeholder: 'Type here'
      }
    }
  }

  return {
    id,
    type: 'button',
    props: {
      text: 'Button',
      variant: 'primary'
    }
  }
}

export function createDefaultElementPage(): ElementPage {
  return {
    id: 'element-page-default',
    layoutId: mockElementLayout.id,
    selectedSlotId: 'slot-1',
    slots: {
      'slot-1': [],
      'slot-2': [],
      'slot-3': [],
      'slot-4': []
    }
  }
}
