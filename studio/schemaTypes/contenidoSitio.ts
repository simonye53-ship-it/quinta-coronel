import {defineField, defineType} from 'sanity'

export const contenidoSitio = defineType({
  name: 'contenidoSitio',
  title: 'Contenido del sitio',
  type: 'document',

  fields: [
    defineField({
      name: 'pagina',
      title: 'Página',
      type: 'string',
      options: {
        list: [
          {title: 'Inicio', value: 'inicio'},
          {title: 'Historia', value: 'historia'},
          {title: 'Especialidades', value: 'especialidades'},
          {title: 'Oficialidad', value: 'oficialidad'},
          {title: 'Material Mayor', value: 'materialMayor'},
          {title: 'Voluntarios', value: 'voluntarios'},
          {title: 'Hazte Socio', value: 'hazteSocio'},
          {title: 'Contacto', value: 'contacto'},
        ],
      },
    }),

    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
    }),

    defineField({
      name: 'subtitulo',
      title: 'Subtítulo',
      type: 'string',
    }),

    defineField({
      name: 'texto',
      title: 'Texto',
      type: 'text',
      rows: 8,
    }),

    defineField({
      name: 'imagen',
      title: 'Fotografía',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
})