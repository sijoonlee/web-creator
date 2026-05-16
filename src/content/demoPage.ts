import type { BlockDocument } from '@/blocks/types'

export const demoPage: { blocks: BlockDocument[] } = {
  blocks: [
    {
      id: 'hero-1',
      type: 'hero',
      props: {
        title: 'One renderer from draft to production',
        subtitle:
          'Developers define typed React blocks. Editors compose pages. The same runtime renders preview and public output.',
        cta: {
          label: 'Open admin',
          href: '/admin'
        },
        variant: 'split'
      }
    },
    {
      id: 'pricing-1',
      type: 'pricing',
      props: {
        eyebrow: 'Product model',
        title: 'Composable blocks with production rendering',
        plans: [
          {
            name: 'Starter',
            price: '$99',
            description: 'A focused site with structured page blocks.'
          },
          {
            name: 'Studio',
            price: '$299',
            description: 'Reusable sections, drafts, preview, and media.'
          },
          {
            name: 'Platform',
            price: 'Custom',
            description: 'Workflow-driven forms and advanced publishing.'
          }
        ]
      }
    },
    {
      id: 'wizard-1',
      type: 'quoteWizard',
      props: {
        title: 'Quote wizard',
        description:
          'The editor preview and public route should run this same workflow engine.',
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
                },
                {
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                  required: true
                }
              ]
            },
            {
              id: 'project',
              title: 'Project details',
              fields: [
                {
                  name: 'budget',
                  label: 'Budget',
                  type: 'number'
                }
              ]
            }
          ]
        }
      }
    },
    {
      id: 'faq-1',
      type: 'faq',
      props: {
        title: 'Why this shape?',
        items: [
          {
            question: 'Where does truth live?',
            answer:
              'In the public React renderer. The admin controls data, but does not duplicate presentation logic.'
          },
          {
            question: 'What is stored?',
            answer:
              'Structured intent: block types plus props, validated by the same schemas developers own.'
          }
        ]
      }
    }
  ]
}
