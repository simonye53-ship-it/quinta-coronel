import {defineField, defineType} from 'sanity'

export const historia = defineType({
  name: 'historia',
  title: 'Historia',
  type: 'document',

  fields: [
    defineField({
      name: 'heroTitulo',
      title: 'Título principal',
      type: 'string',
    }),

    defineField({
      name: 'heroSubtitulo',
      title: 'Subtítulo',
      type: 'text',
      rows: 2,
    }),

    defineField({
      name: 'heroImagen',
      title: 'Imagen principal',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'heroAlt',
      title: 'Texto alternativo de la imagen principal',
      type: 'string',
    }),

    defineField({
      name: 'periodos',
      title: 'Períodos históricos',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'periodoHistorico',
          title: 'Período histórico',

          fields: [
            defineField({
              name: 'periodo',
              title: 'Período o año',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'titulo',
              title: 'Título',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'descripcion',
              title: 'Descripción',
              type: 'text',
              rows: 6,
            }),

            defineField({
              name: 'imagen',
              title: 'Imagen',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),

            defineField({
              name: 'imagenAlt',
              title: 'Texto alternativo de la imagen',
              type: 'string',
            }),

            defineField({
              name: 'hitos',
              title: 'Hitos destacados',
              type: 'array',
              of: [
                {
                  type: 'string',
                },
              ],
            }),
          ],

          preview: {
            select: {
              title: 'titulo',
              periodo: 'periodo',
              media: 'imagen',
            },

            prepare({title, periodo, media}) {
              return {
                title: title || 'Período histórico',
                subtitle: periodo || '',
                media,
              }
            },
          },
        },
      ],
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'Historia',
      }
    },
  },
})