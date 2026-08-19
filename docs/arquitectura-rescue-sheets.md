# Arquitectura segura para Rescue Sheets

## Decisión principal

La IA generativa no determinará por sí sola dónde cortar. Su función será conversar,
identificar el vehículo, recuperar la hoja correcta y explicar datos previamente extraídos y
validados. La geometría, los símbolos y las zonas de riesgo procederán de la hoja oficial
exacta y de anotaciones humanas trazables.

Si falta una coincidencia exacta o una validación crítica, el sistema debe abstenerse.

## Lo que aporta la guía CTIF / Euro NCAP de 2020

La guía enseña a leer el formato de las Rescue Sheets y contiene cuatro bloques relevantes:

1. Las páginas PDF 8 a 13 presentan las secciones normalizadas de la hoja. Los colores de
   estas franjas organizan capítulos; no representan por sí solos una autorización de corte.
2. Las páginas PDF 14 a 21 forman una leyenda multilingüe de pictogramas: fuente de energía,
   airbags, pretensores, infladores, resortes precargados, zonas de alta resistencia, baterías,
   alta tensión, depósitos, válvulas, advertencias y otros componentes.
3. Las páginas PDF 22 a 25 muestran una Rescue Sheet completa de ejemplo para un vehículo
   determinado.
4. Las páginas PDF 26 a 40 muestran ejemplos de uso y ubicación de los símbolos.

Una distinción crítica aparece en la página PDF 29: el pictograma `Cable cut` identifica un
cable específico cuya doble sección desconecta alta tensión y componentes SRS. No significa
que cualquier elemento estructural cercano, ni un pilar del mismo color, sea un punto de corte.

## Limitaciones documentales

- La guía analizada tiene versión 2020-06-12.
- ISO 17840-1:2022 reemplazó a ISO 17840-1:2015 para automóviles y vehículos comerciales
  ligeros.
- Euro NCAP publicó directrices de Rescue Sheets versión 2.2 en marzo de 2025.
- La guía de 2020 sirve como material pedagógico y ontología inicial, pero no debe ser la
  única autoridad para importar hojas nuevas.
- Una Rescue Sheet es información rápida. La ERG aporta información textual más profunda y
  debe vincularse como documento separado cuando exista.

## Modelo de datos propuesto

### Identidad del vehículo

- fabricante;
- modelo comercial;
- generación o código de plataforma;
- intervalo de años;
- carrocería y número de puertas;
- mercado o región;
- tipo de propulsión;
- variante de batería o combustible cuando corresponda;
- VIN o patrón VIN, si una fuente oficial permite relacionarlo;
- idioma;
- fuente oficial, versión, fecha y hash del documento.

### Documento

- PDF original inmutable;
- páginas renderizadas en alta resolución;
- número de página y vista del vehículo;
- enlace a la ERG correspondiente;
- estado: borrador, en revisión, aprobado, reemplazado o retirado.

### Ontología visual versionada

Cada pictograma debe tener un código interno estable, nombre oficial, traducción, versión de
la norma y categoría. Algunos grupos mínimos son:

- sistemas de retención: airbag, inflador, pretensor, SRS;
- elementos mecánicos peligrosos: resorte precargado y protección antivuelco;
- estructura: zona de alta resistencia y zona de atención especial;
- baja y alta tensión: batería, cable, componente, desconexión, fusible y cable de corte;
- combustibles y gases: depósitos, líneas, válvulas y dirección de venteo;
- energía de propulsión: diésel, gasolina/etanol, eléctrico, híbrido, CNG, LPG, LNG e H2;
- advertencias y agentes de extinción.

Los colores se almacenarán como parte del símbolo o de la sección normalizada. Nunca se
interpretarán aisladamente mediante reglas del tipo “azul significa cortar”.

### Anotación por hoja

Cada componente detectado debe conservar:

- página y vista (superior, lateral, frontal o posterior);
- pictograma canónico;
- polígono o caja delimitadora sobre la imagen original;
- relación con otros objetos, por ejemplo cable conectado a batería;
- texto fuente asociado;
- autor y fecha de la anotación;
- revisiones independientes y resolución de conflictos.

## Flujo obligatorio de una consulta

1. Solicitar fabricante, modelo, año/generación, carrocería y propulsión. Cuando exista,
   utilizar VIN u otro identificador oficial.
2. Buscar una coincidencia exacta. No interpolar entre años, versiones o motorizaciones.
3. Mostrar al usuario la identidad encontrada y exigir confirmación.
4. Recuperar la hoja oficial exacta y su versión vigente.
5. Mostrar la página original junto con una superposición de anotaciones validadas.
6. Permitir que Gemini explique únicamente los objetos estructurados recuperados.
7. Citar fabricante, modelo, variante, versión y página en la respuesta.
8. Si cualquier condición falla, mostrar la hoja como referencia o abstenerse; nunca inferir
   una ubicación de corte.

## Niveles de confianza

- `SIN_COINCIDENCIA`: no existe hoja exacta; no se entrega orientación visual.
- `CANDIDATA`: posible coincidencia; se solicita más identificación.
- `HOJA_CONFIRMADA`: documento exacto confirmado, pero anotaciones aún no aprobadas; se
  muestra el original sin convertir análisis automático en instrucciones.
- `VALIDADA`: identidad, documento y anotaciones críticas poseen revisiones concordantes.
- `CONFLICTO`: existe desacuerdo entre revisores; el contenido crítico queda bloqueado.
- `RETIRADA`: una versión más nueva reemplazó el documento; no se usa en respuestas.

## Validación humana

La interfaz de anotación debe mostrar, lado a lado, la página original y la capa estructurada.
Los revisores podrán ampliar, dibujar polígonos, asignar pictogramas, corregir relaciones y
marcar elementos omitidos. Para contenido crítico se requieren al menos dos revisiones
independientes concordantes; cualquier desacuerdo exige arbitraje y bloquea su uso.

Las descripciones libres enviadas hoy desde el chatbot sirven para descubrir errores, pero no
son suficientes para aprobar coordenadas o zonas de corte.

## Función de cada tecnología

- R2 conserva PDF, imágenes y capas de anotación.
- D1 conserva identidad, versiones, geometría, relaciones, estados y auditoría.
- Vectorize encuentra conceptos y documentos candidatos, pero no decide la identidad final.
- OCR ayuda a localizar texto y códigos; no interpreta geometría.
- Un modelo visual propone símbolos y polígonos para acelerar el etiquetado; nunca los
  aprueba.
- Gemini formula preguntas aclaratorias y explica evidencia estructurada; no inventa zonas.

## Puertas de calidad antes de una prueba operacional

- conjunto de evaluación con vehículos, años y motorizaciones parecidas;
- rechazo correcto de vehículos sin hoja exacta;
- cero confusiones de identidad en el conjunto crítico aprobado;
- comprobación visual de todos los componentes de alta tensión, SRS, gas, depósitos y zonas
  estructurales anotadas;
- pruebas de documentos reemplazados y versiones contradictorias;
- registro reproducible de fuente, hash, revisor y fecha;
- revisión en teléfonos y uso con conectividad degradada;
- aprobación institucional y operativa antes de emplearlo en una emergencia real.

## Secuencia de construcción recomendada

1. Actualizar la ontología con ISO 17840 vigente y las directrices Euro NCAP 2.2 de 2025.
2. Incorporar un conjunto piloto pequeño de hojas oficiales que incluya combustión, híbrido,
   eléctrico y al menos dos generaciones visualmente similares.
3. Construir el anotador visual y el control de versiones.
4. Realizar doble validación humana de ese conjunto.
5. Integrar una consulta cerrada en el chatbot que solo recupere hojas confirmadas.
6. Ejecutar evaluaciones adversariales antes de ampliar la biblioteca.

Ningún sistema puede prometer ausencia absoluta de errores. La arquitectura debe reducir el
riesgo haciendo que cada incertidumbre produzca una abstención y que ninguna inferencia del
modelo tenga autoridad para crear una indicación operativa.
