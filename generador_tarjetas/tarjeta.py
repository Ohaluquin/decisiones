# tarjeta.py
from PIL import Image, ImageDraw, ImageFont
from config import ANCHO_TARJETA, ALTO_TARJETA, RUTA_CARATULAS, RUTA_PREGUNTAS, RUTA_ICONOS, RUTA_FONDO_RETRO, RUTA_FUENTE_TTF, RUTA_FUENTE_NEGRITA_TTF

# Fuente Arial desde el sistema
FONT_TEXTO = ImageFont.truetype(str(RUTA_FUENTE_TTF), 10)
FONT_NEGRITA = ImageFont.truetype(str(RUTA_FUENTE_NEGRITA_TTF), 12)


def draw_multiline_text(draw, text, box, font, fill="black", line_spacing=0.6):
    x, y, w, h = box
    lines = []
    words = text.split()
    line = ""
    for word in words:
        test_line = f"{line} {word}".strip()
        if draw.textlength(test_line, font=font) <= w:
            line = test_line
        else:
            lines.append(line)
            line = word
    lines.append(line)

    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += font.getsize(line)[1] + line_spacing


def generar_anverso(tarjeta):
    fondo = Image.open(RUTA_FONDO_RETRO).resize((ANCHO_TARJETA + 20, ALTO_TARJETA+20))
    img = fondo.crop((0, 10, ANCHO_TARJETA, ALTO_TARJETA+10)).copy()
    draw = ImageDraw.Draw(img)

    caratula = Image.open(RUTA_CARATULAS / f"{tarjeta['kind']}.png").resize((ANCHO_TARJETA // 2, ALTO_TARJETA))
    img.paste(caratula, (0, 0))

    x_base = ANCHO_TARJETA // 2 + 10
    ancho_col = ANCHO_TARJETA // 2 - 30
    draw_multiline_text(draw, tarjeta["text"], (x_base, 15, ancho_col, 60), FONT_NEGRITA)

    imagen = Image.open(RUTA_PREGUNTAS / f"{tarjeta['imageName']}.png").resize((125, 125))
    img.paste(imagen, (x_base + (ancho_col - 125) // 2, 60))

    # Línea entre imagen y opciones
    draw.line((x_base, 190, ANCHO_TARJETA - 14, 190), fill="#855E42", width=1)

    for i, opcion in enumerate(tarjeta["options"]):
        y_offset = 195 + i * 50
        draw.text((x_base, y_offset), f"{chr(65+i)}.", font=FONT_NEGRITA, fill="black")
        draw_multiline_text(draw, opcion['text'], (x_base + 20, y_offset, ancho_col - 20, 35), FONT_TEXTO)

    return img


def generar_reverso(tarjeta):
    img = Image.new("RGB", (ANCHO_TARJETA, ALTO_TARJETA), "white")
    draw = ImageDraw.Draw(img)
    fondo = Image.open(RUTA_FONDO_RETRO).resize((330, 205))
    fondo_opcion = fondo.crop((10,5,325,203)).copy()
    efectos = ["determinacion", "alegria", "apoyo", "salud", "dinero", "tiempo"]

    for i, opcion in enumerate(tarjeta["options"]):
        col = i % 2
        row = i // 2
        x = col * (ANCHO_TARJETA // 2)
        y = row * 198

        img.paste(fondo_opcion, (x, y))

        texto_completo = f"{chr(65 + i)}. {opcion['text']}"
        draw_multiline_text(draw, texto_completo, (x + 16, y + 8, 280, 60), FONT_NEGRITA)
        draw_multiline_text(draw, opcion['explicacion'], (x + 16, y + 70, 280, 80), FONT_TEXTO)

        for j, efecto in enumerate(efectos):
            icono = Image.open(RUTA_ICONOS / f"{efecto}.png").resize((22, 22))
            img.paste(icono, (x + 14 + j * 50, y + 158), mask=icono)
            if opcion[efecto] != 0:
                draw.text((x + 37 + j * 50, y + 163), str(opcion[efecto]), font=FONT_TEXTO, fill="black")

    # Líneas divisoras reverso
    draw.line((ANCHO_TARJETA // 2, 0, ANCHO_TARJETA // 2, ALTO_TARJETA), fill="#855E42", width=1)  # vertical
    draw.line((0, 198, ANCHO_TARJETA, 198), fill="#855E42", width=1)  # horizontal superior
    draw.line((0, 396, ANCHO_TARJETA, 396), fill="#855E42", width=1)  # horizontal inferior

    return img

