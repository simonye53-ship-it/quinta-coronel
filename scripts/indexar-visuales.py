import argparse
import hashlib
import json
import os
import re
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image
from pypdf import PdfReader


PDFTOPPM_PREDETERMINADO = Path(
    r"C:\Users\simon\.cache\codex-runtimes\codex-primary-runtime"
    r"\dependencies\native\poppler\Library\bin\pdftoppm.exe"
)
TAMANO_LOTE = 40


def normalizar_texto(texto: str) -> str:
    texto = texto.replace("\x00", " ").replace("\ufffd", "")
    texto = re.sub(r"[ \t]+", " ", texto)
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    return texto.strip()[:20000]


def solicitar_json(url: str, token: str, cuerpo: dict):
    datos = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=datos,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "VeronicaFireRescue-VisualIndexer/1.0",
        },
    )
    return ejecutar_solicitud(request)


def subir_imagen(api_url: str, token: str, activo: dict, ruta: Path):
    parametros = urllib.parse.urlencode({
        "manualId": activo["manualId"],
        "pageNumber": activo["pageNumber"],
        "width": activo["width"],
        "height": activo["height"],
        "sha256": activo["sha256"],
    })
    url = f"{api_url}/admin/visuales/{urllib.parse.quote(activo['id'])}/imagen?{parametros}"
    request = urllib.request.Request(
        url,
        data=ruta.read_bytes(),
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "image/jpeg",
            "User-Agent": "VeronicaFireRescue-VisualIndexer/1.0",
        },
    )
    return ejecutar_solicitud(request)


def ejecutar_solicitud(request: urllib.request.Request):
    ultimo_error = None
    for intento in range(1, 3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detalle = error.read().decode("utf-8", errors="replace")
            ultimo_error = RuntimeError(f"{error.code} al llamar {request.full_url}: {detalle}")
            if error.code < 500 or intento == 2:
                raise ultimo_error from error
        except (TimeoutError, urllib.error.URLError) as error:
            ultimo_error = error
            if intento == 2:
                raise
        time.sleep(2 ** intento)
    raise RuntimeError(f"Falló la solicitud: {ultimo_error}")


def dividir_en_lotes(valores, tamano):
    for indice in range(0, len(valores), tamano):
        yield valores[indice:indice + tamano]


def renderizar_manual(pdftoppm: Path, pdf: Path, salida: Path, dpi: int):
    resultado = subprocess.run(
        [
            str(pdftoppm), "-r", str(dpi), "-jpeg",
            "-jpegopt", "quality=82,progressive=y,optimize=y",
            str(pdf), str(salida / "pagina"),
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if resultado.returncode:
        raise RuntimeError(resultado.stderr.strip() or f"No se pudo renderizar {pdf.name}")
    return sorted(salida.glob("pagina-*.jpg"))


def main():
    parser = argparse.ArgumentParser(
        description="Conserva cada página de los manuales como activo visual verificable.",
    )
    parser.add_argument("--directory", required=True, help="Carpeta que contiene los PDF.")
    parser.add_argument(
        "--manifest",
        default=str(Path(__file__).with_name("manuales-vectorize.json")),
    )
    parser.add_argument(
        "--api-url",
        default="https://veronica-biblioteca.veronica-firerescue-simon.workers.dev",
    )
    parser.add_argument("--manual", help="ID de un único manual.")
    parser.add_argument("--start-at", help="Comienza en este ID y continúa con los siguientes.")
    parser.add_argument("--dpi", type=int, default=110)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--pdftoppm", default=str(PDFTOPPM_PREDETERMINADO))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    token = os.environ.get("VERONICA_ADMIN_TOKEN", "")
    if not args.dry_run and len(token) < 32:
        raise RuntimeError("Falta VERONICA_ADMIN_TOKEN en el entorno.")

    carpeta = Path(args.directory).resolve()
    pdftoppm = Path(args.pdftoppm).resolve()
    manifiesto = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    if args.manual:
        manifiesto = [item for item in manifiesto if item["id"] == args.manual]
    elif args.start_at:
        indices = [indice for indice, item in enumerate(manifiesto) if item["id"] == args.start_at]
        if not indices:
            raise RuntimeError(f"No existe el manual inicial {args.start_at}.")
        manifiesto = manifiesto[indices[0]:]
    if not manifiesto:
        raise RuntimeError("No hay manuales seleccionados.")
    if not pdftoppm.is_file():
        raise RuntimeError(f"No se encontró pdftoppm: {pdftoppm}")

    total_paginas = 0
    total_bytes = 0
    api_url = args.api_url.rstrip("/")

    for posicion, item in enumerate(manifiesto, start=1):
        pdf = carpeta / item["archivo"]
        if not pdf.is_file():
            raise FileNotFoundError(f"No se encontró {pdf}")
        lector = PdfReader(str(pdf))
        print(f"[{posicion}/{len(manifiesto)}] {pdf.name}: {len(lector.pages)} páginas", flush=True)

        with tempfile.TemporaryDirectory(prefix="veronica-visual-") as temporal:
            imagenes = renderizar_manual(pdftoppm, pdf, Path(temporal), args.dpi)
            if len(imagenes) != len(lector.pages):
                raise RuntimeError(
                    f"{pdf.name}: se renderizaron {len(imagenes)} de {len(lector.pages)} páginas.",
                )

            activos = []
            rutas = {}
            for numero, (pagina, imagen) in enumerate(zip(lector.pages, imagenes), start=1):
                datos = imagen.read_bytes()
                with Image.open(imagen) as abierta:
                    width, height = abierta.size
                activo_id = f"{item['id']}-p{numero:04d}"
                activo = {
                    "id": activo_id,
                    "manualId": item["id"],
                    "pageNumber": numero,
                    "r2Key": f"visuales/{item['id']}/pagina-{numero:04d}.jpg",
                    "sha256": hashlib.sha256(datos).hexdigest(),
                    "width": width,
                    "height": height,
                    "ocrText": normalizar_texto(pagina.extract_text() or ""),
                }
                activos.append(activo)
                rutas[activo_id] = imagen
                total_bytes += len(datos)

            if not args.dry_run:
                completadas = 0
                with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 8))) as executor:
                    futuros = {
                        executor.submit(subir_imagen, api_url, token, activo, rutas[activo["id"]]): activo
                        for activo in activos
                    }
                    for futuro in as_completed(futuros):
                        futuro.result()
                        completadas += 1
                        if completadas % 25 == 0 or completadas == len(activos):
                            print(f"  imágenes: {completadas}/{len(activos)}", flush=True)

                for lote in dividir_en_lotes(activos, TAMANO_LOTE):
                    solicitar_json(f"{api_url}/admin/visuales", token, {"activos": lote})

            total_paginas += len(activos)
            print(
                f"  listo: {len(activos)} activos visuales"
                f"{' (simulación)' if args.dry_run else ''}",
                flush=True,
            )

    print(
        f"Dataset visual: {total_paginas} páginas, {total_bytes:,} bytes renderizados.",
        flush=True,
    )


if __name__ == "__main__":
    main()
