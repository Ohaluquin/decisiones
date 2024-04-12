import re

def count_questions_by_context(file_path):
    # Diccionario para contar preguntas por contexto
    context_counts = {
        'personal': 0,
        'social': 0,
        'académico': 0,
        'azar': 0
    }

    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Encontrar todas las instancias de "kind" y su contexto asociado
    contexts = re.findall(r'kind: "(\w+)"', content)

    # Contar las frecuencias de cada contexto
    for context in contexts:
        if context in context_counts:
            context_counts[context] += 1

    return context_counts

# Path to your file
file_path = 'F:\Programacion\decisiones y azares\database\questions.js'

# Count the number of questions for each context
context_question_counts = count_questions_by_context(file_path)

# Print the results
for context, count in context_question_counts.items():
    print(f'{context.capitalize()}: {count}')
