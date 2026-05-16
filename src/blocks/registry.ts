import { FaqBlock } from './Faq'
import { HeroBlock } from './Hero'
import { PricingBlock } from './Pricing'
import { QuoteWizardBlock } from './QuoteWizard'
import type { AnyBlockDefinition } from './types'

export const blockRegistry: Record<string, AnyBlockDefinition> = {
  [HeroBlock.type]: HeroBlock,
  [PricingBlock.type]: PricingBlock,
  [FaqBlock.type]: FaqBlock,
  [QuoteWizardBlock.type]: QuoteWizardBlock
}

export type RegisteredBlockType = keyof typeof blockRegistry
