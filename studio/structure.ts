import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Inicio')
        .id('inicio')
        .child(
          S.document()
            .schemaType('inicio')
            .documentId('inicio')
        ),

      S.listItem()
        .title('Historia')
        .id('historia')
        .child(
          S.document()
            .schemaType('historia')
            .documentId('historia')
        ),

      S.listItem()
        .title('Oficialidad')
        .id('oficialidad')
        .child(
          S.document()
            .schemaType('oficialidad')
            .documentId('oficialidad')
        ),

      S.listItem()
        .title('Voluntarios')
        .id('voluntarios')
        .child(
          S.document()
            .schemaType('voluntarios')
            .documentId('voluntarios')
        ),

      S.listItem()
        .title('Especialidades')
        .id('especialidades')
        .child(
          S.document()
            .schemaType('especialidades')
            .documentId('especialidades')
        ),

      S.listItem()
        .title('Material Mayor')
        .id('materialMayor')
        .child(
          S.document()
            .schemaType('materialMayor')
            .documentId('materialMayor')
        ),

      S.listItem()
        .title('Contacto')
        .id('contacto')
        .child(
          S.document()
            .schemaType('contacto')
            .documentId('contacto')
        ),

      S.listItem()
        .title('Hazte Socio')
        .id('hazteSocio')
        .child(
          S.document()
            .schemaType('hazteSocio')
            .documentId('hazteSocio')
        ),

      S.listItem()
        .title('Noticias')
        .id('noticias')
        .child(
          S.documentTypeList('noticia')
            .title('Noticias')
            .defaultOrdering([
              {
                field: 'fecha',
                direction: 'desc',
              },
            ])
        ),

      S.listItem()
        .title('Redes sociales')
        .id('redesSociales')
        .child(
          S.document()
            .schemaType('redesSociales')
            .documentId('redesSociales')
        ),
    ])