import {defineField, defineType} from 'sanity'

export const redesSociales = defineType({
  name: 'redesSociales',
  title: 'Redes sociales',
  type: 'document',

  fields: [
    defineField({
      name: 'facebook',
      title: 'Facebook',
      type: 'url',
    }),

    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
    }),

    defineField({
      name: 'youtube',
      title: 'YouTube',
      type: 'url',
    }),
  ],
})