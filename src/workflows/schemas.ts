import { z } from 'zod'

export const workflowFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'email', 'tel', 'number']).default('text'),
  required: z.boolean().default(false)
})

export const workflowStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  fields: z.array(workflowFieldSchema)
})

export const workflowSchema = z.object({
  id: z.string(),
  steps: z.array(workflowStepSchema).min(1)
})

export type WorkflowDefinition = z.infer<typeof workflowSchema>
