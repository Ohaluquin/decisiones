# utils.py
import json
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from pathlib import Path
from config import ANCHO_TARJETA, ALTO_TARJETA

def cargar_preguntas(ruta):
    with open(ruta, "r", encoding="utf-8") as f:
        return json.load(f)

def guardar_imagenes_png(imagenes, carpeta, prefijo):
    for i, img in enumerate(imagenes):
        img.save(carpeta / f"{prefijo}_{i+1}.png")

def agrupar_en_pdf(imagenes, ruta_pdf):
    c = canvas.Canvas(str(ruta_pdf), pagesize=letter)
    for i in range(0, len(imagenes), 2):
        for j in range(2):
            if i + j < len(imagenes):
                temp_path = Path(f"temp_{i+j}.png")
                imagenes[i + j].save(temp_path)
                c.drawImage(str(temp_path), 0, letter[1] - (j + 1) * ALTO_TARJETA,
                            width=ANCHO_TARJETA, height=ALTO_TARJETA)
                temp_path.unlink()
        c.showPage()
    c.save()
    return ruta_pdf