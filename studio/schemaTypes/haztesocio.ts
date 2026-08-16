import {defineField, defineType} from 'sanity'

export const hazteSocio = defineType({
  name: 'hazteSocio',
  title: 'Hazte Socio',
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
      type: 'string',
    }),

    defineField({
      name: 'seccionTitulo',
      title: 'Título principal de la sección',
      type: 'string',
    }),

    defineField({
      name: 'texto1',
      title: 'Primer párrafo',
      type: 'text',
      rows: 5,
    }),

    defineField({
      name: 'texto2',
      title: 'Segundo párrafo',
      type: 'text',
      rows: 5,
    }),

    defineField({
      name: 'botonTexto',
      title: 'Texto del botón',
      type: 'string',
    }),

    defineField({
      name: 'botonLink',
      title: 'Enlace para pagar cuota',
      type: 'url',
    }),

    defineField({
      name: 'imagen',
      title: 'Imagen principal',
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
      name: 'beneficios',
      title: 'Beneficios o destinos del aporte',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'beneficio',
          title: 'Beneficio',

          fields: [
            defineField({
              name: 'tipo',
              title: 'Ícono',
              type: 'string',
              options: {
                list: [
                  {
                    title: 'Equipamiento',
                    value: 'equipamiento',
                  },
                  {
                    title: 'Capacitación',
                    value: 'capacitacion',
                  },
                  {
                    title: 'Comunidad',
                    value: 'comunidad',
                  },
                ],
                layout: 'dropdown',
              },
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
              rows: 4,
            }),
          ],

          preview: {
            select: {
              title: 'titulo',
              subtitle: 'tipo',
            },

            prepare({title, subtitle}) {
              return {
                title: title || 'Beneficio',
                subtitle: subtitle || '',
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
        title: 'Hazte Socio',
      }
    },
  },
})