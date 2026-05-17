import { isContainerNode } from '@/layouts/tree'
import type { LayoutNode, LayoutSlotNode } from '@/layouts/types'

export function collectSlotsFromLayout(node: LayoutNode): LayoutSlotNode[] {
  if (node.type === 'slot') {
    return [node]
  }

  if (!isContainerNode(node)) {
    return []
  }

  return node.children.flatMap(collectSlotsFromLayout)
}

export function getLayoutNodeLabel(node: LayoutNode) {
  if (node.type === 'slot') {
    return node.props.name || 'Slot'
  }

  return node.type[0].toUpperCase() + node.type.slice(1)
}
