import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import time
from pathlib import Path

from pypdf import PdfReader


TAMANO_FRAGMENTO = 2400
SOLAPAMIENTO = 300
TAMANO_LOTE = 40
TESSERACT_PREDETERMINADO = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
PDFTOPPM_PREDETERMINADO = Path(
    r"C:\Users\simon\.cache\codex-runtimes\codex-primary-runtime"
    r"\dependencies\native\poppler\Library\bin\pdftoppm.exe"
)


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


def ejecutar(comando):
    resultado = subprocess.run(
        [str(valor) for valor in comando],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if resultado.returncode:
        raise RuntimeError(resultado.stderr.strip() or f"Falló: {' '.join(comando)}")
    return resultado.stdout


def ocr_pagina(
    pdf: Path,
    pagina: int,
    trabajo: Path,
    tesseract: Path,
    tessdata: Path,
    dpi: int,
    pdftoppm: Path,
):
    base = trabajo / f"pagina-{pagina:04d}"
    ejecutar([
        pdftoppm, "-f", pagina, "-l", pagina, "-r", dpi, "-png",
        "-singlefile", pdf, base,
    ])
    imagen = base.with_suffix(".png")
    try:
        texto = ejecutar([
            tesseract, imagen, "stdout", "--tessdata-dir", tessdata,
            "-l", "spa", "--psm", "3",
        ])
        return normalizar_texto(texto)
    finally:
        imagen.unlink(missing_ok=True)


def lineas_visuales_nuevas(texto_nativo: str, texto_ocr: str):
    if not texto_nativo:
        return texto_ocr
    palabras_nativas = set(re.findall(r"[\wáéíóúñü]+", texto_nativo.casefold()))
    nuevas = []
    for linea in texto_ocr.splitlines():
        palabras = set(re.findall(r"[\wáéíóúñü]+", linea.casefold()))
        if len(palabras) < 2:
            continue
        cobertura = len(palabras & palabras_nativas) / len(palabras)
        if cobertura < 0.7:
            nuevas.append(linea)
    return "\n".join(nuevas)


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
    ultimo_error = None
    for intento in range(1, 4):
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detalle = error.read().decode("utf-8", errors="replace")
            ultimo_error = RuntimeError(f"{error.code} al llamar {url}: {detalle}")
            if error.code < 500 or intento == 3:
                raise ultimo_error from error
        except (TimeoutError, urllib.error.URLError) as error:
            ultimo_error = error
            if intento == 3:
                raise
        time.sleep(2 ** intento)
    raise RuntimeError(f"Falló la solicitud a {url}: {ultimo_error}")


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
    parser.add_argument(
        "--ocr",
        choices=("off", "missing", "all"),
        default="off",
        help="Aplica OCR solo a páginas sin texto o a todas las páginas.",
    )
    parser.add_argument("--ocr-dpi", type=int, default=180)
    parser.add_argument(
        "--tesseract",
        default=str(TESSERACT_PREDETERMINADO),
    )
    parser.add_argument(
        "--tessdata",
        default=str(Path(__file__).parents[1] / ".ocr-tools" / "tessdata"),
    )
    parser.add_argument("--pdftoppm", default=str(PDFTOPPM_PREDETERMINADO))
    parser.add_argument(
        "--ocr-cache",
        default=str(Path(__file__).parents[1] / ".ocr-work" / "cache"),
    )
    parser.add_argument("--report", help="Ruta opcional para guardar el informe JSON.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Extrae y mide el OCR sin modificar el índice remoto.",
    )
    args = parser.parse_args()

    token = os.environ.get("VERONICA_ADMIN_TOKEN", "")
    if not args.dry_run and len(token) < 32:
        raise RuntimeError("Falta VERONICA_ADMIN_TOKEN en el entorno.")

    raiz = Path(args.directory)
    manifiesto = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    if args.manual:
        manifiesto = [item for item in manifiesto if item["id"] == args.manual]
    if not manifiesto:
        raise RuntimeError("No hay manuales seleccionados para indexar.")

    resumen = []
    tesseract = Path(args.tesseract)
    tessdata = Path(args.tessdata)
    pdftoppm = Path(args.pdftoppm)
    raiz_cache = Path(args.ocr_cache)
    if args.ocr != "off":
        if not tesseract.is_file() or not (tessdata / "spa.traineddata").is_file():
            raise RuntimeError("Tesseract o el modelo español no están disponibles.")
        if not pdftoppm.is_file():
            raise RuntimeError("pdftoppm no está disponible.")

    for item in manifiesto:
        ruta = raiz / item["archivo"]
        if not ruta.is_file():
            print(f"OMITIDO (no encontrado): {ruta}")
            continue

        print(f"EXTRAYENDO: {item['archivo']}", flush=True)
        lector = PdfReader(str(ruta))
        cache_manual = raiz_cache / item["id"] / str(ruta.stat().st_size)
        fragmentos = []
        paginas_sin_texto = 0
        paginas_con_ocr = 0
        paginas_con_texto_visual = 0
        caracteres_ocr = 0
        with tempfile.TemporaryDirectory(prefix="veronica-ocr-") as temporal:
            trabajo = Path(temporal)
            for numero, pagina in enumerate(lector.pages, start=1):
                nativo = normalizar_texto(pagina.extract_text() or "")
                texto = nativo
                requiere_ocr = args.ocr == "all" or (args.ocr == "missing" and len(nativo) < 80)
                if requiere_ocr:
                    archivo_cache = cache_manual / f"{numero:04d}.txt"
                    if archivo_cache.is_file():
                        ocr = archivo_cache.read_text(encoding="utf-8")
                    else:
                        ocr = ocr_pagina(
                            ruta, numero, trabajo, tesseract, tessdata, args.ocr_dpi,
                            pdftoppm,
                        )
                        archivo_cache.parent.mkdir(parents=True, exist_ok=True)
                        archivo_cache.write_text(ocr, encoding="utf-8")
                    paginas_con_ocr += 1
                    caracteres_ocr += len(ocr)
                    if len(nativo) < 80:
                        texto = ocr
                    else:
                        visual = lineas_visuales_nuevas(nativo, ocr)
                        if visual:
                            paginas_con_texto_visual += 1
                            texto = f"{nativo}\n\n[Texto detectado en elementos visuales]\n{visual}"
                    print(
                        f"  OCR página {numero}/{len(lector.pages)} ({len(ocr)} caracteres)",
                        flush=True,
                    )
                if len(texto) < 80:
                    paginas_sin_texto += 1
                    continue
                fragmentos.extend(dividir_pagina(texto, numero))

        if not fragmentos:
            print(f"PENDIENTE_OCR: {item['archivo']} ({len(lector.pages)} páginas)")
            resumen.append({"id": item["id"], "estado": "pendiente_ocr", "paginas": len(lector.pages)})
            continue

        total = 0
        if args.dry_run:
            total = len(fragmentos)
        else:
            solicitar(
                f"{args.api_url}/admin/manuales/{item['id']}/reiniciar",
                token,
            )
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
            "estado": "auditado" if args.dry_run else "indexado",
            "fragmentos": total,
            "paginas_sin_texto": paginas_sin_texto,
            "paginas_con_ocr": paginas_con_ocr,
            "paginas_con_texto_visual": paginas_con_texto_visual,
            "caracteres_ocr": caracteres_ocr,
        })
        if args.report:
            Path(args.report).parent.mkdir(parents=True, exist_ok=True)
            Path(args.report).write_text(
                json.dumps(resumen, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        print(f"INDEXADO: {item['archivo']} ({total} fragmentos)", flush=True)

    if args.report:
        Path(args.report).write_text(
            json.dumps(resumen, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    print("RESUMEN_JSON=" + json.dumps(resumen, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise
