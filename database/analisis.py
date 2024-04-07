import re
import matplotlib.pyplot as plt

def analyze_tiempo_frequencies(file_path):
    tiempo_frequencies = {value: 0 for value in range(-3, 4)}  # Initialize frequency counts

    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Find all instances of "tiempo" and their associated values
    #tiempo_values = re.findall(r'determinacion:\s*(-?\d)', content)
    tiempo_values = re.findall(r'tiempo:\s*(-?\d)', content)

    # Count the frequencies of each value
    for value in tiempo_values:
        value_int = int(value)
        if value_int in tiempo_frequencies:
            tiempo_frequencies[value_int] += 1
        else:
            # Initialize count for values outside the expected range, just in case
            tiempo_frequencies[value_int] = 1

    return tiempo_frequencies

def plot_frequencies(frequencies):
    values = list(frequencies.keys())
    counts = list(frequencies.values())

    plt.bar(values, counts, color='skyblue')
    plt.xlabel('Valor de Tiempo')
    plt.ylabel('Frecuencia')
    plt.title('Frecuencias de Evaluaciones de Tiempo')
    plt.xticks(values)
    plt.show()

# Path to your file
file_path = 'F:\Programacion\decisiones y azares\database\questions.js'

# Perform the analysis of "tiempo" frequencies directly from the file
tiempo_frequencies_analysis = analyze_tiempo_frequencies(file_path)

# Plot the frequencies
plot_frequencies(tiempo_frequencies_analysis)