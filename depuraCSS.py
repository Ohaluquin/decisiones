# Utilizaremos Beautiful Soup para analizar los archivos HTML y detectar las clases y ID utilizados.
# Luego, compararemos estas clases y ID con las reglas definidas en el archivo CSS.
import os
from bs4 import BeautifulSoup
os.chdir('f:\decisiones y azares')
# Leer los archivos HTML
with open("principal.html", "r") as file:
    principal_html = file.read()

with open("select_player.html", "r") as file:
    select_player_html = file.read()

with open("index.html", "r") as file:
    index_html = file.read()

with open("instrucciones.html", "r") as file:
    instrucciones_html = file.read()

# Analizar los archivos HTML con Beautiful Soup
principal_soup = BeautifulSoup(principal_html, 'html.parser')
select_player_soup = BeautifulSoup(select_player_html, 'html.parser')
index_soup = BeautifulSoup(index_html, 'html.parser')
instrucciones_soup = BeautifulSoup(instrucciones_html, 'html.parser')

# Extraer todas las clases y ID utilizados en los archivos HTML
used_classes_and_ids = set()
for soup in [principal_soup, select_player_soup, index_soup, instrucciones_soup]:
    for element in soup.find_all(True):
        for attr in ['class', 'id']:
            if element.has_attr(attr):
                used_classes_and_ids.update(element[attr])

# Leer el archivo CSS
with open("css/my_css.css", "r") as css_file:
    css_content = css_file.read()

# Extraer todas las clases y ID definidos en el archivo CSS
defined_classes_and_ids = set()
for line in css_content.split("\n"):
    line = line.strip()
    if line.startswith(".") or line.startswith("#"):
        selector = line.split(" ")[0].split("{")[0].strip()
        defined_classes_and_ids.add(selector)

# Encontrar clases y ID definidos pero no utilizados
unused_classes_and_ids = defined_classes_and_ids - used_classes_and_ids

unused_classes_and_ids
