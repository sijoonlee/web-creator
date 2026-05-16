import { blockRegistry } from '@/blocks/registry'
import type { BlockDocument, RenderMode } from '@/blocks/types'

type BlockRendererProps = {
  blocks: BlockDocument[]
  mode?: RenderMode
}

export function BlockRenderer({
  blocks,
  mode = 'public'
}: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const definition = blockRegistry[block.type]

        if (!definition) {
          return null
        }

        const parsed = definition.schema.safeParse(block.props)

        if (!parsed.success) {
          if (mode === 'preview') {
            return (
              <pre key={block.id || `${block.type}-${index}`}>
                Invalid block props for {block.type}
              </pre>
            )
          }

          return null
        }

        const Component = definition.component
        const props = parsed.data as Record<string, unknown>

        return (
          <Component
            key={block.id || `${block.type}-${index}`}
            mode={mode}
            {...props}
          />
        )
      })}
    </>
  )
}
