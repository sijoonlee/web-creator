import type { z } from 'zod'

import type { BlockDefinition } from './types'

export function registerBlock<const Type extends string, Schema extends z.ZodTypeAny>(
  definition: BlockDefinition<Type, Schema>
) {
  return definition
}
