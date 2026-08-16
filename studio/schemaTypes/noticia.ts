import {defineField, defineType} from 'sanity'

export const noticia = defineType({
  name: 'noticia',
  title: 'Noticias',
  type: 'document',

  groups: [
    {
      name: 'escritura',
      title: 'Escritura',
      default: true,
    },
    {
      name: 'ajustes',
      title: 'Ajustes',
    },
  ],

  fields: [
    // =====================================================
    // ESCRITURA
    // =====================================================

    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      group: 'escritura',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'imagenPrincipal',
      title: 'Imagen de portada',
      type: 'image',
      group: 'escritura',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'contenido',
      title: 'Escribe la noticia',
      type: 'array',
      group: 'escritura',

      of: [
        {
          type: 'block',

          styles: [
            {
              title: 'Texto normal',
              value: 'normal',
            },
            {
              title: 'Título',
              value: 'h2',
            },
            {
              title: 'Subtítulo',
              value: 'h3',
            },
            {
              title: 'Cita',
              value: 'blockquote',
            },
          ],

          lists: [
            {
              title: 'Lista',
              value: 'bullet',
            },
            {
              title: 'Lista numerada',
              value: 'number',
            },
          ],

          marks: {
            decorators: [
              {
                title: 'Negrita',
                value: 'strong',
              },
              {
                title: 'Cursiva',
                value: 'em',
              },
            ],

            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Enlace',

                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Dirección del enlace',
                  },
                ],
              },
            ],
          },
        },

        {
          type: 'image',
          title: 'Imagen dentro de la noticia',

          options: {
            hotspot: true,
          },

          fields: [
            {
              name: 'pie',
              title: 'Pie de foto',
              type: 'string',
            },
          ],
        },
      ],
    }),

    // =====================================================
    // AJUSTES
    // =====================================================

    defineField({
      name: 'slug',
      title: 'Dirección URL',
      type: 'slug',
      group: 'ajustes',

      description:
        'Pulsa Generate para crear automáticamente la dirección de esta noticia.',

      options: {
        source: 'titulo',
        maxLength: 96,
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'fecha',
      title: 'Fecha de publicación',
      type: 'date',
      group: 'ajustes',

      initialValue: () =>
        new Date().toISOString().slice(0, 10),

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'categoria',
      title: 'Categoría',
      type: 'string',
      group: 'ajustes',

      options: {
        list: [
          {
            title: 'Institucional',
            value: 'Institucional',
          },
          {
            title: 'Entrenamiento',
            value: 'Entrenamiento',
          },
          {
            title: 'Comunidad',
            value: 'Comunidad',
          },
          {
            title: 'Equipamiento',
            value: 'Equipamiento',
          },
          {
            title: 'Emergencias',
            value: 'Emergencias',
          },
          {
            title: 'Actividades',
            value: 'Actividades',
          },
        ],
      },
    }),
  ],

  orderings: [
    {
      title: 'Más recientes primero',
      name: 'fechaDesc',
      by: [
        {
          field: 'fecha',
          direction: 'desc',
        },
      ],
    },
  ],

  preview: {
    select: {
      title: 'titulo',
      fecha: 'fecha',
      media: 'imagenPrincipal',
    },

    prepare({title, fecha, media}) {
      return {
        title: title || 'Nueva noticia',
        subtitle: fecha || 'Sin fecha',
        media,
      }
    },
  },
})