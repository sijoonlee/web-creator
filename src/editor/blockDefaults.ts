import type { BlockDocument } from '@/blocks/types'

export const editorStorageKey = 'web-creator.editor.blocks'

export const blockOptions = [
  { label: 'Hero', type: 'hero' },
  { label: 'Pricing Table', type: 'pricing' },
  { label: 'FAQ', type: 'faq' },
  { label: 'Quote Wizard', type: 'quoteWizard' }
] as const

export type EditableBlockType = (typeof blockOptions)[number]['type']

export function createDefaultBlock(type: EditableBlockType): BlockDocument {
  const id = `${type}-${crypto.randomUUID()}`

  if (type === 'hero') {
    return {
      id,
      type,
      props: {
        title: 'New hero section',
        subtitle: 'Describe the offer or page goal here.',
        cta: {
          label: 'Call to action',
          href: '#'
        },
        variant: 'split'
      }
    }
  }

  if (type === 'pricing') {
    return {
      id,
      type,
      props: {
        eyebrow: 'Plans',
        title: 'Simple pricing',
        plans: [
          {
            name: 'Starter',
            price: '$99',
            description: 'A concise plan description.'
          }
        ]
      }
    }
  }

  if (type === 'faq') {
    return {
      id,
      type,
      props: {
        title: 'Frequently asked questions',
        items: [
          {
            question: 'What can I edit?',
            answer: 'You can add blocks and adjust their basic content.'
          }
        ]
      }
    }
  }

  return {
    id,
    type,
    props: {
      title: 'Quote wizard',
      description: 'Collect project information with a shared workflow runtime.',
      workflow: {
        id: 'quote',
        steps: [
          {
            id: 'business',
            title: 'Business info',
            fields: [
              {
                name: 'company',
                label: 'Company',
                type: 'text',
                required: true
              }
            ]
          }
        ]
      }
    }
  }
}
