import { createLayoutId } from './defaults'
import type { LayoutNode, LayoutTemplate } from './types'

export function cloneLayout<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function isContainerNode(
  node: LayoutNode | undefined
): node is Extract<LayoutNode, { children: LayoutNode[] }> {
  return Boolean(node && 'children' in node)
}

export function findLayoutNode(
  node: LayoutNode,
  id: string
): LayoutNode | undefined {
  if (node.id === id) {
    return node
  }

  if (!isContainerNode(node)) {
    return undefined
  }

  for (const child of node.children) {
    const match = findLayoutNode(child, id)
    if (match) {
      return match
    }
  }

  return undefined
}

export function findParentNode(
  node: LayoutNode,
  id: string
): Extract<LayoutNode, { children: LayoutNode[] }> | undefined {
  if (!isContainerNode(node)) {
    return undefined
  }

  if (node.children.some((child) => child.id === id)) {
    return node
  }

  for (const child of node.children) {
    const parent = findParentNode(child, id)
    if (parent) {
      return parent
    }
  }

  return undefined
}

export function updateLayoutNode(
  node: LayoutNode,
  id: string,
  updater: (node: LayoutNode) => LayoutNode
): LayoutNode {
  if (node.id === id) {
    return updater(node)
  }

  if (!isContainerNode(node)) {
    return node
  }

  return {
    ...node,
    children: node.children.map((child) => updateLayoutNode(child, id, updater))
  } as LayoutNode
}

export function removeLayoutNode(
  node: LayoutNode,
  id: string
): { next: LayoutNode; removed: boolean } {
  if (!isContainerNode(node)) {
    return { next: node, removed: false }
  }

  const filtered = node.children.filter((child) => child.id !== id)

  if (filtered.length !== node.children.length) {
    return {
      next: {
        ...node,
        children: filtered
      } as LayoutNode,
      removed: true
    }
  }

  let removed = false
  const children = node.children.map((child) => {
    const result = removeLayoutNode(child, id)
    removed = removed || result.removed
    return result.next
  })

  return {
    next: {
      ...node,
      children
    } as LayoutNode,
    removed
  }
}

export function refreshNodeIds(node: LayoutNode): LayoutNode {
  if (!isContainerNode(node)) {
    return {
      ...node,
      id: createLayoutId(node.type)
    }
  }

  return {
    ...node,
    id: createLayoutId(node.type),
    children: node.children.map(refreshNodeIds)
  } as LayoutNode
}

export function getFirstNodeId(node: LayoutNode): string {
  return node.id
}

export function getLayoutName(layouts: LayoutTemplate[], name: string) {
  const trimmed = name.trim()
  return trimmed || `Layout ${layouts.length + 1}`
}
