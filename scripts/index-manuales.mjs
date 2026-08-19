import {createHash} from "node:crypto";
import {readdir, readFile, stat} from "node:fs/promises";
import path from "node:path";

import {GoogleGenAI} from "@google/genai";

const LIMITE_ARCHIVO = 100 * 1024 * 1024;
const STORE_PREDETERMINADO =
  "fileSearchStores/asistente-de-emergencias-bi-zkzggfh9zv74";
const argumentos = process.argv.slice(2);
const valorArgumento = (nombre) => {
  const indice = argumentos.indexOf(nombre);
  return indice >= 0 ? argumentos[indice + 1] : undefined;
};

const directorio = valorArgumento("--directory");
const archivoSolicitado = valorArgumento("--file");
const subirTodos = argumentos.includes("--all");
const confirmar = argumentos.includes("--confirm");
const listar = argumentos.includes("--list") || (!archivoSolicitado && !subirTodos);

const apiKey = process.env.GEMINI_API_KEY;
const storeName = process.env.GEMINI_FILE_SEARCH_STORE || STORE_PREDETERMINADO;

if (!apiKey) {
  throw new Error("Falta GEMINI_API_KEY en el entorno.");
}

const ai = new GoogleGenAI({apiKey});

const obtenerDocumentos = async () => {
  const documentos = [];
  const pagina = await ai.fileSearchStores.documents.list({parent: storeName});

  for await (const documento of pagina) documentos.push(documento);
  return documentos;
};

const normalizar = (valor = "") =>
  valor.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es").trim();

const estado = await ai.fileSearchStores.get({name: storeName});
const documentosExistentes = await obtenerDocumentos();

console.log(`Almacén: ${estado.displayName || estado.name}`);
console.log(`Documentos activos: ${estado.activeDocumentsCount || 0}`);
console.log(`Tamaño original indexado: ${Number(estado.sizeBytes || 0).toLocaleString("es-CL")} bytes`);

if (listar) {
  for (const documento of documentosExistentes) {
    console.log(`- ${documento.displayName || documento.name}`);
  }
}

if (!archivoSolicitado && !subirTodos) process.exit(0);
if (!directorio) throw new Error("Usa --directory con la carpeta que contiene los PDF.");
if (!confirmar) {
  throw new Error("Modo seguro: agrega --confirm para iniciar una subida real.");
}

const entradas = await readdir(directorio, {withFileTypes: true});
const pdfDisponibles = entradas
  .filter((entrada) => entrada.isFile() && path.extname(entrada.name).toLowerCase() === ".pdf")
  .map((entrada) => entrada.name)
  .sort((a, b) => a.localeCompare(b, "es"));

const seleccionados = archivoSolicitado
  ? pdfDisponibles.filter((nombre) => normalizar(nombre) === normalizar(archivoSolicitado))
  : pdfDisponibles;

if (archivoSolicitado && seleccionados.length === 0) {
  throw new Error(`No se encontró el archivo: ${archivoSolicitado}`);
}

const nombresExistentes = new Set(
  documentosExistentes.map((documento) => normalizar(documento.displayName || "")),
);

for (const nombre of seleccionados) {
  const ruta = path.join(directorio, nombre);
  const informacion = await stat(ruta);

  if (informacion.size > LIMITE_ARCHIVO) {
    console.warn(`OMITIDO (>100 MB): ${nombre}`);
    continue;
  }

  if (nombresExistentes.has(normalizar(nombre))) {
    console.warn(`OMITIDO (ya existe): ${nombre}`);
    continue;
  }

  const hash = createHash("sha256").update(await readFile(ruta)).digest("hex");
  console.log(`Subiendo: ${nombre}`);

  let operacion = await ai.fileSearchStores.uploadToFileSearchStore({
    fileSearchStoreName: storeName,
    file: ruta,
    config: {
      displayName: nombre,
      mimeType: "application/pdf",
      customMetadata: [
        {key: "sha256", stringValue: hash},
        {key: "origen", stringValue: "biblioteca-quinta-coronel"},
      ],
    },
  });

  while (!operacion.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    operacion = await ai.operations.get({operation: operacion});
  }

  if (operacion.error) {
    console.error(`ERROR: ${nombre}`, operacion.error);
    continue;
  }

  nombresExistentes.add(normalizar(nombre));
  console.log(`INDEXADO: ${nombre}`);
}
