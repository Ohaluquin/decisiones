# config.py
from pathlib import Path

# Rutas de entrada y salida
RUTA_JSON = Path("preguntas.json")
SALIDA_PDFS = Path("salida/pdfs")
SALIDA_IMGS = Path("salida/imagenes")

# Rutas de recursos
RUTA_PREGUNTAS = Path("../img/Preguntas")
RUTA_ICONOS = Path("../img/Iconos")
RUTA_CARATULAS = Path("../img/Categorias")
RUTA_FONDO_RETRO = Path("../img/fondo.png")
RUTA_FUENTE_TTF = Path("C:/Windows/Fonts/arial.ttf")
RUTA_FUENTE_NEGRITA_TTF = Path("C:/Windows/Fonts/arialbd.ttf")

# Tamaño en puntos (1 pulgada = 72 pts)
ANCHO_TARJETA = 612   # 8.5 pulgadas
ALTO_TARJETA = 396    # 5.5 pulgadas (mitad de carta)
PUNTOS_POR_PULGADA = 72