export type ElementType = 'heading' | 'text' | 'input' | 'button'

export type ElementNode =
  | {
      id: string
      props: {
        level: 1 | 2 | 3 | 4 | 5 | 6
        text: string
      }
      type: 'heading'
    }
  | {
      id: string
      props: {
        text: string
      }
      type: 'text'
    }
  | {
      id: string
      props: {
        name: string
        placeholder: string
      }
      type: 'input'
    }
  | {
      id: string
      props: {
        text: string
        variant: 'primary' | 'secondary'
      }
      type: 'button'
    }

export type ElementPage = {
  id: string
  layoutId: string
  selectedElementId?: string
  selectedSlotId: string
  slots: Record<string, ElementNode[]>
}
