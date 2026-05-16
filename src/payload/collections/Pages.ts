import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title'
  },
  access: {
    read: () => true
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true
    },
    {
      name: 'blocks',
      type: 'json',
      required: true,
      admin: {
        description:
          'Structured page document consumed by the shared React BlockRenderer.'
      }
    }
  ]
}
