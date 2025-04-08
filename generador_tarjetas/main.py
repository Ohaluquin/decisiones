# main.py
from tarjeta import generar_anverso, generar_reverso
from utils import agrupar_en_pdf, cargar_preguntas, guardar_imagenes_png
from config import RUTA_JSON, SALIDA_PDFS, SALIDA_IMGS
from pathlib import Path

# Cargar preguntas desde el JSON
tarjetas = cargar_preguntas(RUTA_JSON)

# Tomar solo 2 tarjetas como prueba
seleccion = tarjetas[:150]

# Generar anversos y reversos
anversos = [generar_anverso(t) for t in seleccion]
reversos = [generar_reverso(t) for t in seleccion]

# Crear carpetas de salida
Path(SALIDA_PDFS).mkdir(parents=True, exist_ok=True)
Path(SALIDA_IMGS).mkdir(parents=True, exist_ok=True)

# Guardar como PNG también
guardar_imagenes_png(anversos, SALIDA_IMGS, "anverso")
guardar_imagenes_png(reversos, SALIDA_IMGS, "reverso")

# Generar PDFs
pdf_anverso = agrupar_en_pdf(anversos, SALIDA_PDFS / "anversos.pdf")
pdf_reverso = agrupar_en_pdf(reversos, SALIDA_PDFS / "reversos.pdf")

print("PDFs generados:", pdf_anverso, pdf_reverso)