import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

from pypdf import PdfReader


TAMANO_FRAGMENTO = 2400
SOLAPAMIENTO = 300
TAMANO_LOTE = 40


def normalizar_texto(texto: str) -> str:
    texto = texto.replace("\x00", " ").replace("\ufffd", "")
    texto = re.sub(r"[ \t]+", " ", texto)
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    return texto.strip()


def dividir_pagina(texto: str, pagina: int):
    if not texto:
        return []
    lineas = [linea.strip() for linea in texto.splitlines() if linea.strip()]
    encabezado = lineas[0][:300] if lineas else ""
    fragmentos = []
    inicio = 0
    while inicio < len(texto):
        fin = min(len(texto), inicio + TAMANO_FRAGMENTO)
        if fin < len(texto):
            corte = texto.rfind(" ", inicio + TAMANO_FRAGMENTO // 2, fin)
            if corte > inicio:
                fin = corte
        contenido = texto[inicio:fin].strip()
        if len(contenido) >= 80:
            fragmentos.append({
                "pageStart": pagina,
                "pageEnd": pagina,
                "heading": encabezado,
                "content": contenido,
            })
        if fin >= len(texto):
            break
        inicio = max(inicio + 1, fin - SOLAPAMIENTO)
    return fragmentos


def solicitar(url: str, token: str, cuerpo=None):
    datos = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8") if cuerpo else b"{}"
    request = urllib.request.Request(
        url,
        data=datos,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "VeronicaFireRescue-Indexer/1.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detalle = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{error.code} al llamar {url}: {detalle}") from error


def main():
    parser = argparse.ArgumentParser(description="Indexa los manuales en Cloudflare Vectorize.")
    parser.add_argument("--directory", required=True, help="Carpeta que contiene los PDF.")
    parser.add_argument(
        "--manifest",
        default=str(Path(__file__).with_name("manuales-vectorize.json")),
    )
    parser.add_argument(
        "--api-url",
        default="https://veronica-biblioteca.veronica-firerescue-simon.workers.dev",
    )
    parser.add_argument("--manual", help="ID de un único manual para reindexar.")
    args = parser.parse_args()

    token = os.environ.get("VERONICA_ADMIN_TOKEN", "")
    if len(token) < 32:
        raise RuntimeError("Falta VERONICA_ADMIN_TOKEN en el entorno.")

    raiz = Path(args.directory)
    manifiesto = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    if args.manual:
        manifiesto = [item for item in manifiesto if item["id"] == args.manual]
    if not manifiesto:
        raise RuntimeError("No hay manuales seleccionados para indexar.")

    resumen = []
    for item in manifiesto:
        ruta = raiz / item["archivo"]
        if not ruta.is_file():
            print(f"OMITIDO (no encontrado): {ruta}")
            continue

        print(f"EXTRAYENDO: {item['archivo']}", flush=True)
        lector = PdfReader(str(ruta))
        fragmentos = []
        paginas_sin_texto = 0
        for numero, pagina in enumerate(lector.pages, start=1):
            texto = normalizar_texto(pagina.extract_text() or "")
            if len(texto) < 80:
                paginas_sin_texto += 1
                continue
            fragmentos.extend(dividir_pagina(texto, numero))

        if not fragmentos:
            print(f"PENDIENTE_OCR: {item['archivo']} ({len(lector.pages)} páginas)")
            resumen.append({"id": item["id"], "estado": "pendiente_ocr", "paginas": len(lector.pages)})
            continue

        solicitar(
            f"{args.api_url}/admin/manuales/{item['id']}/reiniciar",
            token,
        )
        total = 0
        for inicio in range(0, len(fragmentos), TAMANO_LOTE):
            lote = fragmentos[inicio:inicio + TAMANO_LOTE]
            resultado = solicitar(
                f"{args.api_url}/admin/indexar",
                token,
                {"manualId": item["id"], "fragmentos": lote},
            )
            total += int(resultado.get("indexados", 0))
            print(f"  {total}/{len(fragmentos)} fragmentos", flush=True)

        resumen.append({
            "id": item["id"],
            "estado": "indexado",
            "fragmentos": total,
            "paginas_sin_texto": paginas_sin_texto,
        })
        print(f"INDEXADO: {item['archivo']} ({total} fragmentos)", flush=True)

    print("RESUMEN_JSON=" + json.dumps(resumen, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise
