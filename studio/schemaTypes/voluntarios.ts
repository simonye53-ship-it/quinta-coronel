import {defineField, defineType} from 'sanity'

export const voluntarios = defineType({
  name: 'voluntarios',
  title: 'Voluntarios',
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
      name: 'listaVoluntarios',
      title: 'Voluntarios',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'voluntario',
          title: 'Voluntario',

          fields: [
            defineField({
              name: 'nombre',
              title: 'Nombre',
              type: 'string',
            }),

            defineField({
              name: 'designacion',
              title: 'Designación',
              type: 'string',

              options: {
                list: [
                  {
                    title: 'Voluntario Insigne',
                    value: 'insigne',
                  },
                  {
                    title: 'Voluntario Honorario',
                    value: 'honorario',
                  },
                  {
                    title: '20 a 10 años de servicio',
                    value: '20-10',
                  },
                  {
                    title: '10 a 5 años de servicio',
                    value: '10-5',
                  },
                  {
                    title: 'Voluntario Nuevo',
                    value: 'nuevo',
                  },
                ],
              },

              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'rol',
              title: 'Rol o reconocimiento',
              type: 'string',
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
              subtitle: 'designacion',
              media: 'foto',
            },

            prepare({title, subtitle, media}) {
              const nombres = {
                insigne: 'Voluntario Insigne',
                honorario: 'Voluntario Honorario',
                '20-10': '20 a 10 años de servicio',
                '10-5': '10 a 5 años de servicio',
                nuevo: 'Voluntario Nuevo',
              }

              return {
                title: title || 'Nombre por agregar',
                subtitle:
                  nombres[subtitle as keyof typeof nombres] ||
                  'Sin designación',
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
        title: 'Voluntarios',
      }
    },
  },
})