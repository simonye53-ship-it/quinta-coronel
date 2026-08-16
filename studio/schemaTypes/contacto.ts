import {defineField, defineType} from 'sanity'

export const contacto = defineType({
  name: 'contacto',
  title: 'Contacto',
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
      name: 'seccionTitulo',
      title: 'Título de información de contacto',
      type: 'string',
    }),

    defineField({
      name: 'direccion',
      title: 'Dirección',
      type: 'string',
    }),

    defineField({
      name: 'correos',
      title: 'Correos electrónicos',
      type: 'array',
      of: [
        {
          type: 'string',
        },
      ],
    }),

    defineField({
      name: 'telefono',
      title: 'Teléfono o texto de contacto',
      type: 'string',
    }),

    defineField({
      name: 'postulacionTitulo',
      title: 'Título del bloque para postulantes',
      type: 'string',
    }),

    defineField({
      name: 'postulacionTexto',
      title: 'Texto del bloque para postulantes',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'formularioNombreLabel',
      title: 'Etiqueta del campo nombre',
      type: 'string',
    }),

    defineField({
      name: 'formularioEmailLabel',
      title: 'Etiqueta del campo correo',
      type: 'string',
    }),

    defineField({
      name: 'formularioMotivoLabel',
      title: 'Etiqueta del campo motivo',
      type: 'string',
    }),

    defineField({
      name: 'formularioMensajeLabel',
      title: 'Etiqueta del campo mensaje',
      type: 'string',
    }),

    defineField({
      name: 'botonTexto',
      title: 'Texto del botón',
      type: 'string',
    }),

    defineField({
      name: 'mensajeExito',
      title: 'Mensaje después de enviar',
      type: 'string',
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'Contacto',
      }
    },
  },
})