import {defineField, defineType} from 'sanity'

export const oficialidad = defineType({
  name: 'oficialidad',
  title: 'Oficialidad',
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
      name: 'seccionTitulo',
      title: 'Título de la sección',
      type: 'string',
    }),

    defineField({
      name: 'seccionDescripcion',
      title: 'Descripción de la sección',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'oficiales',
      title: 'Oficiales',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'oficial',
          title: 'Oficial',

          fields: [
            defineField({
              name: 'nombre',
              title: 'Nombre',
              type: 'string',
            }),

            defineField({
              name: 'cargo',
              title: 'Cargo',
              type: 'string',
              options: {
                list: [
                  {title: 'Director de Compañía', value: 'Director de Compañía'},
                  {title: 'Capitán', value: 'Capitán'},
                  {title: 'Teniente 1°', value: 'Teniente 1°'},
                  {title: 'Teniente 2°', value: 'Teniente 2°'},
                  {title: 'Teniente 3°', value: 'Teniente 3°'},
                  {title: 'Teniente 4°', value: 'Teniente 4°'},
                  {title: 'Secretario', value: 'Secretario'},
                  {title: 'Tesorero', value: 'Tesorero'},
                  {title: 'Ayudante de Compañía', value: 'Ayudante de Compañía'},
                ],
              },
            }),

            defineField({
              name: 'descripcion',
              title: 'Descripción',
              type: 'text',
              rows: 4,
            }),

            defineField({
              name: 'foto',
              title: 'Fotografía',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),

            defineField({
              name: 'fotoAlt',
              title: 'Texto alternativo de la fotografía',
              type: 'string',
            }),
          ],

          preview: {
            select: {
              title: 'nombre',
              subtitle: 'cargo',
              media: 'foto',
            },

            prepare({title, subtitle, media}) {
              return {
                title: title || 'Nombre por agregar',
                subtitle: subtitle || 'Cargo por definir',
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
        title: 'Oficialidad',
      }
    },
  },
})