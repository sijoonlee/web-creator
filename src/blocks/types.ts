import type { z } from 'zod'

export type RenderMode = 'public' | 'preview'

export type BlockDefinition<
  Type extends string,
  Schema extends z.ZodTypeAny
> = {
  type: Type
  label: string
  schema: Schema
  component: React.ComponentType<z.infer<Schema> & { mode?: RenderMode }>
}

export type AnyBlockDefinition = {
  type: string
  label: string
  schema: z.ZodTypeAny
  component: React.ComponentType<any>
}

export type BlockDocument = {
  id?: string
  type: string
  props: unknown
}
