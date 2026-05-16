import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true
  },
  upload: {
    focalPoint: true,
    imageSizes: [
      {
        name: 'card',
        width: 768,
        height: 576,
        position: 'centre'
      }
    ]
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true
    }
  ]
}
