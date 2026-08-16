import {defineField, defineType} from 'sanity'

export const inicio = defineType({
  name: 'inicio',
  title: 'Inicio',
  type: 'document',

  groups: [
    {name: 'slider', title: 'Slider principal'},
    {name: 'accesos', title: 'Accesos rápidos'},
    {name: 'novedades', title: 'Novedades'},
    {name: 'redes', title: 'Redes sociales'},
    {name: 'socio', title: 'Hazte socio'},
  ],

  fields: [

    // =====================================================
    // SLIDER PRINCIPAL
    // =====================================================

    defineField({
      name: 'slider1Titulo',
      title: 'Slide 1 - Título',
      type: 'string',
      group: 'slider',
      initialValue: 'Honor y Sacrificio',
    }),

    defineField({
      name: 'slider1Subtitulo',
      title: 'Slide 1 - Subtítulo',
      type: 'string',
      group: 'slider',
      initialValue: 'Quinta Compañía del Cuerpo de Bomberos de Coronel',
    }),

    defineField({
      name: 'slider1Descripcion',
      title: 'Slide 1 - Descripción',
      type: 'text',
      group: 'slider',
      initialValue: 'Desde 1951 al servicio de nuestra comunidad',
    }),

    defineField({
      name: 'slider1Imagen',
      title: 'Slide 1 - Fotografía',
      type: 'image',
      group: 'slider',
      options: {hotspot: true},
    }),

    defineField({
      name: 'slider2Titulo',
      title: 'Slide 2 - Título',
      type: 'string',
      group: 'slider',
      initialValue: 'Rescate Vehicular',
    }),

    defineField({
      name: 'slider2Subtitulo',
      title: 'Slide 2 - Subtítulo',
      type: 'string',
      group: 'slider',
      initialValue: 'Especialistas en salvar vidas',
    }),

    defineField({
      name: 'slider2Descripcion',
      title: 'Slide 2 - Descripción',
      type: 'text',
      group: 'slider',
      initialValue: 'Formación continua en técnicas de rescate de última generación',
    }),

    defineField({
      name: 'slider2Imagen',
      title: 'Slide 2 - Fotografía',
      type: 'image',
      group: 'slider',
      options: {hotspot: true},
    }),

    defineField({
      name: 'slider3Titulo',
      title: 'Slide 3 - Título',
      type: 'string',
      group: 'slider',
      initialValue: 'Nuestro Cuartel',
    }),

    defineField({
      name: 'slider3Subtitulo',
      title: 'Slide 3 - Subtítulo',
      type: 'string',
      group: 'slider',
      initialValue: 'Bomba Reino de Bélgica',
    }),

    defineField({
      name: 'slider3Descripcion',
      title: 'Slide 3 - Descripción',
      type: 'text',
      group: 'slider',
      initialValue: 'Equipamiento y tecnología al servicio de Coronel',
    }),

    defineField({
      name: 'slider3Imagen',
      title: 'Slide 3 - Fotografía',
      type: 'image',
      group: 'slider',
      options: {hotspot: true},
    }),

    // =====================================================
    // ACCESOS RÁPIDOS
    // =====================================================

    defineField({
      name: 'accesoHistoria',
      title: 'Nuestra Historia',
      type: 'string',
      group: 'accesos',
      initialValue: 'Nuestra Historia',
    }),

    defineField({
      name: 'accesoOficialidad',
      title: 'Oficialidad',
      type: 'string',
      group: 'accesos',
      initialValue: 'Oficialidad',
    }),

    defineField({
      name: 'accesoMaterial',
      title: 'Material Mayor',
      type: 'string',
      group: 'accesos',
      initialValue: 'Material Mayor',
    }),

    defineField({
      name: 'accesoContacto',
      title: 'Contacto',
      type: 'string',
      group: 'accesos',
      initialValue: 'Contacto',
    }),

    // =====================================================
    // NOVEDADES
    // =====================================================

    defineField({
      name: 'novedadesTitulo',
      title: 'Título de la sección',
      type: 'string',
      group: 'novedades',
      initialValue: 'Novedades',
    }),

    defineField({
      name: 'novedadesDescripcion',
      title: 'Descripción de la sección',
      type: 'string',
      group: 'novedades',
      initialValue: 'Últimas noticias y actividades de la Quinta Compañía',
    }),

    // NOTICIA 1

    defineField({
      name: 'noticia1Titulo',
      title: 'Noticia 1 - Título',
      type: 'string',
      group: 'novedades',
      initialValue: 'Entrenamiento de Rescate Vehicular 2025',
    }),

    defineField({
      name: 'noticia1Fecha',
      title: 'Noticia 1 - Fecha',
      type: 'string',
      group: 'novedades',
      initialValue: '15 Mar 2025',
    }),

    defineField({
      name: 'noticia1Texto',
      title: 'Noticia 1 - Texto',
      type: 'text',
      group: 'novedades',
      initialValue:
        'Nuestros voluntarios completaron con éxito la última jornada de capacitación en rescate vehicular con herramientas Holmatro.',
    }),

    defineField({
      name: 'noticia1Imagen',
      title: 'Noticia 1 - Fotografía',
      type: 'image',
      group: 'novedades',
      options: {hotspot: true},
    }),

    // NOTICIA 2

    defineField({
      name: 'noticia2Titulo',
      title: 'Noticia 2 - Título',
      type: 'string',
      group: 'novedades',
      initialValue: 'Jornada Comunitaria en Lagunillas',
    }),

    defineField({
      name: 'noticia2Fecha',
      title: 'Noticia 2 - Fecha',
      type: 'string',
      group: 'novedades',
      initialValue: '28 Feb 2025',
    }),

    defineField({
      name: 'noticia2Texto',
      title: 'Noticia 2 - Texto',
      type: 'text',
      group: 'novedades',
      initialValue:
        'La compañía participó en una actividad comunitaria con los vecinos del sector, acercando la labor bomberil a los más pequeños.',
    }),

    defineField({
      name: 'noticia2Imagen',
      title: 'Noticia 2 - Fotografía',
      type: 'image',
      group: 'novedades',
      options: {hotspot: true},
    }),

    // NOTICIA 3

    defineField({
      name: 'noticia3Titulo',
      title: 'Noticia 3 - Título',
      type: 'string',
      group: 'novedades',
      initialValue: 'Nuevo Equipamiento para la Compañía',
    }),

    defineField({
      name: 'noticia3Fecha',
      title: 'Noticia 3 - Fecha',
      type: 'string',
      group: 'novedades',
      initialValue: '10 Feb 2025',
    }),

    defineField({
      name: 'noticia3Texto',
      title: 'Noticia 3 - Texto',
      type: 'text',
      group: 'novedades',
      initialValue:
        'Gracias al apoyo de nuestros socios, la compañía recibió nuevo equipamiento de protección personal para sus voluntarios.',
    }),

    defineField({
      name: 'noticia3Imagen',
      title: 'Noticia 3 - Fotografía',
      type: 'image',
      group: 'novedades',
      options: {hotspot: true},
    }),

    // NOTICIA 4

    defineField({
      name: 'noticia4Titulo',
      title: 'Noticia 4 - Título',
      type: 'string',
      group: 'novedades',
      initialValue: 'Ceremonia de Aniversario 74°',
    }),

    defineField({
      name: 'noticia4Fecha',
      title: 'Noticia 4 - Fecha',
      type: 'string',
      group: 'novedades',
      initialValue: '20 Feb 2025',
    }),

    defineField({
      name: 'noticia4Texto',
      title: 'Noticia 4 - Texto',
      type: 'text',
      group: 'novedades',
      initialValue:
        'La Quinta Compañía celebró su 74° aniversario con una emotiva ceremonia en el cuartel de Lagunillas 2.',
    }),

    defineField({
      name: 'noticia4Imagen',
      title: 'Noticia 4 - Fotografía',
      type: 'image',
      group: 'novedades',
      options: {hotspot: true},
    }),

    defineField({
      name: 'novedadesBoton',
      title: 'Texto del botón',
      type: 'string',
      group: 'novedades',
      initialValue: 'Ver Todas las Noticias',
    }),

    // =====================================================
    // REDES SOCIALES
    // =====================================================

    defineField({
      name: 'redesTitulo',
      title: 'Título',
      type: 'string',
      group: 'redes',
      initialValue: 'Síguenos en Redes Sociales',
    }),

    defineField({
      name: 'redesTexto',
      title: 'Texto',
      type: 'text',
      group: 'redes',
      initialValue:
        'Mantente informado sobre nuestras actividades, entrenamientos y servicios a la comunidad de Coronel.',
    }),
defineField({
  name: 'facebookUrl',
  title: 'Facebook - Enlace',
  type: 'url',
  group: 'redes',
}),

defineField({
  name: 'instagramUrl',
  title: 'Instagram - Enlace',
  type: 'url',
  group: 'redes',
}),

defineField({
  name: 'youtubeUrl',
  title: 'YouTube - Enlace',
  type: 'url',
  group: 'redes',
}),

    defineField({
      name: 'redesImagen1',
      title: 'Fotografía 1 - Equipo de rescate',
      type: 'image',
      group: 'redes',
      options: {hotspot: true},
    }),

    defineField({
      name: 'redesImagen2',
      title: 'Fotografía 2 - Comunidad',
      type: 'image',
      group: 'redes',
      options: {hotspot: true},
    }),

    defineField({
      name: 'redesImagen3',
      title: 'Fotografía 3 - Formación',
      type: 'image',
      group: 'redes',
      options: {hotspot: true},
    }),

    defineField({
      name: 'redesImagen4',
      title: 'Fotografía 4 - Rescate',
      type: 'image',
      group: 'redes',
      options: {hotspot: true},
    }),

    // =====================================================
    // HAZTE SOCIO
    // =====================================================

    defineField({
      name: 'socioTitulo',
      title: 'Título',
      type: 'string',
      group: 'socio',
      initialValue: '¿Quieres apoyar a tu Quinta Compañía?',
    }),

    defineField({
      name: 'socioTexto',
      title: 'Texto',
      type: 'text',
      group: 'socio',
      initialValue:
        'Hazte socio colaborador con un aporte mensual y ayúdanos a seguir sirviendo a Coronel.',
    }),

    defineField({
      name: 'socioBoton',
      title: 'Texto del botón',
      type: 'string',
      group: 'socio',
      initialValue: 'Hazte Socio Ahora',
    }),

    defineField({
      name: 'socioLink',
      title: 'Enlace del botón',
      type: 'url',
      group: 'socio',
      initialValue: 'https://app.reveniu.com/quintacoronel',
    }),
  ],
})