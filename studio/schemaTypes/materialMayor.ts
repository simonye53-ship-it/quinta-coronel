import {defineField, defineType} from 'sanity'

export const materialMayor = defineType({
  name: 'materialMayor',
  title: 'Material Mayor',
  type: 'document',

  fields: [
    // =====================================================
    // HERO
    // =====================================================

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
      title: 'Imagen principal del hero',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'heroAlt',
      title: 'Texto alternativo de la imagen del hero',
      type: 'string',
    }),

    // =====================================================
    // FOTO PRINCIPAL
    // =====================================================

    defineField({
      name: 'fotoPrincipal',
      title: 'Fotografía principal',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'fotoPrincipalAlt',
      title: 'Texto alternativo de la fotografía principal',
      type: 'string',
    }),

    // =====================================================
    // VEHÍCULOS ACTUALES
    // =====================================================

    defineField({
      name: 'actualesTitulo',
      title: 'Título de vehículos actuales',
      type: 'string',
    }),

    defineField({
      name: 'vehiculosActuales',
      title: 'Vehículos actuales',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'vehiculoActual',
          title: 'Vehículo actual',

          fields: [
            defineField({
              name: 'nombre',
              title: 'Nombre de la unidad',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'tipo',
              title: 'Tipo de vehículo',
              type: 'string',
            }),

            defineField({
              name: 'descripcion',
              title: 'Descripción',
              type: 'text',
              rows: 5,
            }),

            defineField({
              name: 'imagen',
              title: 'Fotografía del vehículo',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),

            defineField({
              name: 'imagenAlt',
              title: 'Texto alternativo de la fotografía',
              type: 'string',
            }),

            defineField({
              name: 'especificaciones',
              title: 'Características o equipamiento',
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
              title: 'nombre',
              subtitle: 'tipo',
              media: 'imagen',
            },

            prepare({title, subtitle, media}) {
              return {
                title: title || 'Vehículo sin nombre',
                subtitle: subtitle || 'Tipo por definir',
                media,
              }
            },
          },
        },
      ],
    }),

    // =====================================================
    // VEHÍCULOS HISTÓRICOS
    // =====================================================

    defineField({
      name: 'historicosTitulo',
      title: 'Título de vehículos históricos',
      type: 'string',
    }),

    defineField({
      name: 'historicosSubtitulo',
      title: 'Subtítulo de vehículos históricos',
      type: 'string',
    }),

    defineField({
      name: 'vehiculosHistoricos',
      title: 'Vehículos históricos',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'vehiculoHistorico',
          title: 'Vehículo histórico',

          fields: [
            defineField({
              name: 'nombre',
              title: 'Nombre',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: 'descripcion',
              title: 'Descripción',
              type: 'text',
              rows: 5,
            }),

            defineField({
              name: 'imagen',
              title: 'Fotografía',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),

            defineField({
              name: 'imagenAlt',
              title: 'Texto alternativo de la fotografía',
              type: 'string',
            }),
          ],

          preview: {
            select: {
              title: 'nombre',
              media: 'imagen',
            },

            prepare({title, media}) {
              return {
                title: title || 'Vehículo histórico',
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
        title: 'Material Mayor',
      }
    },
  },
})