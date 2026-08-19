import {defineArrayMember, defineField, defineType} from 'sanity'

export const asistente = defineType({
  name: 'asistente',
  title: 'Asistente IA',
  type: 'document',
  initialValue: {
    bibliotecaTitulo: 'Biblioteca disponible',
    bibliotecaDescripcion:
      'Documentos actualmente indexados y disponibles para las consultas del asistente.',
    manuales: [
      {
        _key: 'gre-2024',
        _type: 'manualAsistente',
        identificador: 'gre2024',
        titulo: 'GRE 2024',
      },
      {
        _key: 'gases-combustibles-anb',
        _type: 'manualAsistente',
        identificador: 'gasesCombustibles',
        titulo: 'Control de emergencias con gases combustibles',
      },
      {
        _key: 'control-fuego-vehiculos-anb',
        _type: 'manualAsistente',
        identificador: 'controlFuegoVehiculos',
        titulo: 'Control de fuego en vehículos',
      },
    ],
  },
  fields: [
    defineField({
      name: 'bibliotecaTitulo',
      title: 'Título de la biblioteca',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'bibliotecaDescripcion',
      title: 'Descripción de la biblioteca',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'manuales',
      title: 'Títulos de los manuales',
      type: 'array',
      validation: (rule) => rule.max(3).unique(),
      of: [
        defineArrayMember({
          name: 'manualAsistente',
          title: 'Manual',
          type: 'object',
          fields: [
            defineField({
              name: 'identificador',
              title: 'Documento',
              type: 'string',
              options: {
                list: [
                  {title: 'GRE 2024', value: 'gre2024'},
                  {
                    title: 'Control de emergencias con gases combustibles',
                    value: 'gasesCombustibles',
                  },
                  {
                    title: 'Control de fuego en vehículos',
                    value: 'controlFuegoVehiculos',
                  },
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'titulo',
              title: 'Título visible',
              type: 'string',
              validation: (rule) => rule.required().max(140),
            }),
            defineField({
              name: 'portada',
              title: 'Portada o logo',
              description: 'Imagen que identifica este documento en la biblioteca del sitio.',
              type: 'image',
              options: {hotspot: true},
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Texto alternativo',
                  type: 'string',
                  description: 'Describe brevemente la portada o el logo para accesibilidad.',
                  validation: (rule) => rule.required().warning('Recomendado para accesibilidad.'),
                }),
              ],
            }),
          ],
          preview: {
            select: {title: 'titulo', subtitle: 'identificador', media: 'portada'},
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Asistente IA'}),
  },
})
