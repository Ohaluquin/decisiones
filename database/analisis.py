import re
import numpy as np
import matplotlib.pyplot as plt

def analyze_attribute_frequencies(file_path, attribute):
    frequencies = {value: 0 for value in range(-3, 4)}  # Initialize frequency counts

    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Find all instances of the attribute and their associated values
    pattern = rf'{attribute}:\s*(-?\d)'
    values = re.findall(pattern, content)

    # Count the frequencies of each value
    for value in values:
        value_int = int(value)
        if value_int in frequencies:
            frequencies[value_int] += 1
        else:
            frequencies[value_int] = 1  # Just in case, though shouldn't be needed

    return frequencies

def plot_frequencies(frequencies, attribute):
    values = list(frequencies.keys())
    counts = list(frequencies.values())

    plt.bar(values, counts, color=plt.cm.RdYlGn((np.array(values) + 3) / 6))
    plt.xlabel('Valor')
    plt.ylabel('Frecuencia')
    plt.title(f'Frecuencias de {attribute.capitalize()}')
    plt.xticks(values)
    plt.ylim(0, max(counts) + 10)

# Path to your file
file_path = 'F:\Programacion\decisiones y azares\database\questions.js'

# List of attributes to analyze
attributes = ['determinacion', 'alegria', 'apoyo', 'salud', 'tiempo', 'dinero']

plt.figure(figsize=(15, 10))  # Set the figure size to fit all subplots neatly
for i, attribute in enumerate(attributes, 1):
    frequencies = analyze_attribute_frequencies(file_path, attribute)
    plt.subplot(2, 3, i)  # Subplot for each attribute
    plot_frequencies(frequencies, attribute)
plt.tight_layout()
plt.show()
