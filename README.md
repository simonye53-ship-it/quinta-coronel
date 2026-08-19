# Verónica FireRescue

Verónica FireRescue es un proyecto de asistente consultivo y operativo para Bomberos. Su objetivo final es ofrecer una conversación natural por voz y en tiempo real, respaldada por documentación autorizada, datos verificables y herramientas especializadas.

El nombre Verónica está inspirado en la idea de una asistente tecnológica conversacional como la mostrada en las películas de Iron Man. El proyecto es independiente y está orientado al contexto bomberil.

## Principio rector

> Verónica conversa y coordina; las fuentes autorizadas, las bases de datos y las funciones verificables aportan los hechos. En decisiones críticas, informa, muestra evidencia y solicita confirmación; nunca asume el mando ni actúa autónomamente.

Este principio es obligatorio en todas las etapas del proyecto. Una respuesta técnica no puede completarse con conocimiento general del modelo cuando la fuente requerida no contiene la información. Ante evidencia insuficiente, Verónica debe abstenerse y comunicarlo claramente.

## Reglas operativas permanentes

- Los procedimientos técnicos deben provenir exclusivamente de documentos autorizados e identificables.
- Toda afirmación operativa debe conservar trazabilidad hacia su fuente, versión y página cuando sea posible.
- Los datos en tiempo real deben indicar su organismo de origen y la hora de actualización.
- La información contextual no puede inventar, sustituir ni modificar un procedimiento documentado.
- Los cálculos deben ser realizados por funciones programadas y verificables; la IA solo los solicita y explica.
- Las Rescue Sheets deben coincidir con el vehículo, generación, año y motorización antes de ofrecer orientación.
- La interfaz debe mostrar la evidencia visual original en decisiones críticas.
- Ante ambigüedad, falta de fuente o datos desactualizados, el asistente debe pedir confirmación o abstenerse.
- Verónica no reemplaza al mando, los protocolos institucionales ni la evaluación del personal competente en la escena.
- Las funciones que escriban registros o modifiquen estados deben solicitar confirmación del usuario.

## Etapas del proyecto

### 1. Biblioteca consultiva ANB

Construcción de una biblioteca de manuales de la Academia Nacional de Bomberos con búsqueda documental, respuestas fundamentadas y referencias verificables.

### 2. Rescue Sheets

Biblioteca visual y asesoramiento consultivo para rescates vehiculares. Incluirá recuperación exacta de la ficha, análisis multimodal y visualización de sus páginas originales, con énfasis en vehículos eléctricos e híbridos.

### 3. Asistente de grifos

Base geográfica para ubicar, mostrar y recomendar alternativas de grifos según posición, distancia, accesibilidad, estado conocido y fecha de actualización.

### 4. Meteorología y emergencias en tiempo real

Integración controlada de información oficial procedente de SENAPRED y otros organismos autorizados: meteorología, alertas, eventos, tránsito y condiciones relevantes para la emergencia. Cada dato deberá conservar procedencia y vigencia.

### 5. Modo Comandante

Creación de bitácoras mediante voz, registro cronológico confirmado y generación de un informe de emergencia en PDF. La IA ayudará a estructurar el informe, sin inventar hechos ni validar automáticamente las observaciones dictadas.

### 6. Cálculo hidráulico

Herramientas verificables para cálculos basados en las unidades presentes: capacidad de bombas, convoy, estanques, caudales y otros parámetros autorizados. Las fórmulas deberán estar documentadas, probadas y acompañadas de sus unidades.

### 7. Modo entrenamiento

Módulo independiente que podrá incorporarse en cualquier momento. Permitirá simular comunicaciones por radio, con Verónica desempeñando el rol de central de alarmas y el usuario actuando como oficial a cargo. Toda simulación deberá identificarse claramente como entrenamiento.

### Fase final: asistente de voz en tiempo real

Cuando los módulos anteriores estén suficientemente validados, la interacción principal evolucionará desde texto hacia audio bidireccional en streaming. Verónica podrá escuchar, mantener contexto, hacer preguntas aclaratorias, utilizar las herramientas autorizadas y responder por voz sin perder la trazabilidad documental y operativa.

## Alcance de Sanity

Sanity se utilizará únicamente como CMS para textos, títulos, fotografías, portadas y contenido visual menor del sitio. La biblioteca técnica, los datos operacionales, los índices de búsqueda y las fuentes en tiempo real tendrán almacenamiento y procesos independientes.

## Arquitectura documental actual

- Cloudflare R2 conserva los PDF.
- Cloudflare D1 conserva el catálogo y los fragmentos asociados a páginas.
- Cloudflare Vectorize recupera fragmentos por similitud semántica.
- FTS5 en D1 refuerza números, códigos y coincidencias textuales exactas.
- Workers AI genera embeddings multilingües con BGE-M3.
- Gemini recibe solamente la pregunta y la evidencia recuperada; no almacena ni busca los manuales.
- El backend rechaza respuestas sin evidencia y entrega al frontend las fuentes y páginas recuperadas.

El indexador conserva el texto nativo de las páginas legibles y aplica OCR en español a las
páginas escaneadas o sin una capa de texto confiable. El OCR también recupera rótulos
rasterizados dentro de tablas y diagramas.

El OCR no interpreta por sí solo el significado de colores, flechas, zonas de corte o
fotografías. Esas relaciones visuales no se incorporan automáticamente como hechos
operativos: deben pasar por análisis multimodal y revisión antes de habilitarse para el chatbot.

## Estado actual

El proyecto se encuentra en la etapa 1: construcción y endurecimiento de la biblioteca consultiva documental. Las etapas siguientes se incorporarán de forma modular para evitar rehacer la arquitectura existente.
