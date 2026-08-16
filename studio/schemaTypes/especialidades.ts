import {defineField, defineType} from 'sanity'

export const especialidades = defineType({
  name: 'especialidades',
  title: 'Especialidades',
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

    // =====================================================
    // VIDEO
    // =====================================================

    defineField({
      name: 'videoTitulo',
      title: 'Título del video',
      type: 'string',
    }),

    defineField({
      name: 'videoSubtitulo',
      title: 'Subtítulo del video',
      type: 'string',
    }),

    defineField({
      name: 'videoArchivo',
      title: 'Archivo de video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description:
        'Sube aquí el video que se mostrará en la sección. Recomendado: MP4.',
    }),

    // =====================================================
    // ESPECIALIDADES
    // =====================================================

    defineField({
      name: 'seccionTitulo',
      title: 'Título de la sección de especialidades',
      type: 'string',
    }),

    defineField({
      name: 'listaEspecialidades',
      title: 'Especialidades',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'especialidad',
          title: 'Especialidad',

          fields: [
            defineField({
              name: 'titulo',
              title: 'Título',
              type: 'string',
              validation: (Rule) => Rule.required(),
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
          ],

          preview: {
            select: {
              title: 'titulo',
            },

            prepare({title}) {
              return {
                title: title || 'Especialidad sin título',
              }
            },
          },
        },
      ],
    }),

    // =====================================================
    // GALERÍA
    // =====================================================

    defineField({
      name: 'galeriaTitulo',
      title: 'Título de la galería',
      type: 'string',
    }),

    defineField({
      name: 'galeria',
      title: 'Galería de imágenes',
      type: 'array',

      of: [
        {
          type: 'object',
          name: 'imagenGaleria',
          title: 'Imagen',

          fields: [
            defineField({
              name: 'imagen',
              title: 'Imagen',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),

            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            }),
          ],

          preview: {
            select: {
              title: 'alt',
              media: 'imagen',
            },

            prepare({title, media}) {
              return {
                title: title || 'Imagen de galería',
                media,
              }
            },
          },
        },
      ],
    }),

    // =====================================================
    // CTA FINAL
    // =====================================================

    defineField({
      name: 'ctaTitulo',
      title: 'Título del bloque final',
      type: 'string',
    }),

    defineField({
      name: 'ctaBoton',
      title: 'Texto del botón',
      type: 'string',
    }),

    defineField({
      name: 'ctaLink',
      title: 'Enlace del botón',
      type: 'url',
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'Especialidades',
      }
    },
  },
})