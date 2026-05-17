export type LayoutNodeType = 'section' | 'stack' | 'row' | 'grid' | 'slot'

export type Spacing = 'none' | 'sm' | 'md' | 'lg'

export type Align = 'start' | 'center' | 'end' | 'stretch'

export type Justify = 'start' | 'center' | 'end' | 'between'

export type LayoutAttributes = {
  id?: string
  className?: string
  data?: Record<string, string>
  aria?: Record<string, string>
}

export type SectionProps = {
  align: Align
  padding: Spacing
  width: 'medium' | 'wide' | 'full'
}

export type StackProps = {
  align: Align
  gap: Spacing
  padding: Spacing
}

export type RowProps = {
  align: Align
  gap: Spacing
  justify: Justify
  mobile: 'stack' | 'wrap' | 'scroll'
  padding: Spacing
  wrap: boolean
}

export type GridProps = {
  align: Align
  columns: 2 | 3 | 4 | 6 | 12
  gap: Spacing
  mobileColumns: 1 | 2
  padding: Spacing
}

export type SlotProps = {
  align: Align
  minHeight: 'none' | 'sm' | 'md' | 'lg'
  name: string
  padding: Spacing
  span?: 1 | 2 | 3 | 4 | 6 | 8 | 12
}

export type LayoutContainerNode =
  | {
      attributes?: LayoutAttributes
      children: LayoutNode[]
      id: string
      props: SectionProps
      type: 'section'
    }
  | {
      attributes?: LayoutAttributes
      children: LayoutNode[]
      id: string
      props: StackProps
      type: 'stack'
    }
  | {
      attributes?: LayoutAttributes
      children: LayoutNode[]
      id: string
      props: RowProps
      type: 'row'
    }
  | {
      attributes?: LayoutAttributes
      children: LayoutNode[]
      id: string
      props: GridProps
      type: 'grid'
    }

export type LayoutSlotNode = {
  attributes?: LayoutAttributes
  id: string
  props: SlotProps
  type: 'slot'
}

export type LayoutNode = LayoutContainerNode | LayoutSlotNode

export type LayoutTemplate = {
  customCss?: string
  id: string
  name: string
  root: LayoutNode
}
