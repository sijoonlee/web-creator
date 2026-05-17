import type { LayoutNode, LayoutNodeType, LayoutTemplate } from './types'

export const layoutStorageKey = 'web-creator-layouts'

export function createLayoutId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

export function createDefaultLayout(): LayoutTemplate {
  return {
    id: 'layout-default',
    name: 'Untitled layout',
    root: {
      id: 'section-default',
      type: 'section',
      props: {
        align: 'stretch',
        padding: 'lg',
        width: 'wide'
      },
      children: [
        {
          id: 'stack-default',
          type: 'stack',
          props: {
            align: 'stretch',
            gap: 'md',
            padding: 'none'
          },
          children: [
            {
              id: 'slot-default',
              type: 'slot',
              props: {
                align: 'stretch',
                minHeight: 'md',
                name: 'Slot 1',
                padding: 'md'
              }
            }
          ]
        }
      ]
    }
  }
}

export function createDefaultLayoutNode(type: LayoutNodeType): LayoutNode {
  const id = createLayoutId(type)

  if (type === 'section') {
    return {
      id,
      type,
      props: {
        align: 'stretch',
        padding: 'md',
        width: 'wide'
      },
      children: []
    }
  }

  if (type === 'stack') {
    return {
      id,
      type,
      props: {
        align: 'stretch',
        gap: 'md',
        padding: 'none'
      },
      children: []
    }
  }

  if (type === 'row') {
    return {
      id,
      type,
      props: {
        align: 'stretch',
        gap: 'md',
        justify: 'start',
        mobile: 'stack',
        padding: 'none',
        wrap: false
      },
      children: []
    }
  }

  if (type === 'grid') {
    return {
      id,
      type,
      props: {
        align: 'stretch',
        columns: 2,
        gap: 'md',
        mobileColumns: 1,
        padding: 'none'
      },
      children: []
    }
  }

  return {
    id,
    type: 'slot',
    props: {
      align: 'stretch',
      minHeight: 'md',
      name: 'New slot',
      padding: 'md'
    }
  }
}

export const defaultLayouts: LayoutTemplate[] = [createDefaultLayout()]
