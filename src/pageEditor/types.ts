import type { ElementNode } from '@/elements/types'
import type { LayoutTemplate } from '@/layouts/types'

export type PageDocument = {
  id: string
  layout: LayoutTemplate
  name: string
  selectedElementId?: string
  selectedNodeId: string
  selectedSlotId: string
  slug: string
  slots: Record<string, ElementNode[]>
}
