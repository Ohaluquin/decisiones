// Variables globales para mantener el estado del juego.
let player = 0;
let pregunta_actual = 0;
let pregunta = 0;
let animatedGif;
let initialDetermination = 0;
let initialAlegria = 0;
let initialApoyo = 0;
let initialSalud = 0;
let initialTiempo = 0;
let initialDinero = 0;

// Arreglo de coordenadas representando las posiciones donde se debe colocar la ficha
// en las casillas del tablero del juego.
let casillas = [
    [0, 0],
    [8.0, 5.0],
    [-3.0, 8.0],
    [-11.0, -2.0],
    [-2.0, -19.0],
    [15.0, -12.0],
    [20.0, 7.0],
    [11.0, 18.0],
    [-8.0, 19.0],
    [-21.0, 8.0],
    [-25.0, -15.0], //10
    [-11.0, -34.0],
    [14.0, -35.0],
    [31.0, -15.0],
    [34.0, 7.0],
    [26.0, 22.0],
    [7.0, 31.0],
    [-12.0, 29.0],
    [-30.0, 16.0],
    [-38.0, -2.0],
    [-36.0, -29.0], //20
    [-19.0, -52.0],
    [8.0, -58.0],
    [35.0, -43.0],
    [46.0, -18.0],
    [46.0, 7.0],
    [38.0, 25.0],
    [21.0, 37.0],
    [2.0, 42.0],
    [-17.0, 39.0],
    [-35.0, 27.0], //30
    [-49.0, 9.0],
    [-54.0, -17.0],
    [-48.0, -44.0],
    [-28.0, -68.0],
    [-0.0, -78.0],
    [32.0, -68.0],
    [52.0, -45.0],
    [61.0, -19.0],
    [59.0, 7.0],
    [50.0, 27.0], //40
    [34.0, 42.0],
    [17.0, 49.0],
    [-2.0, 51.0],
    [-24.0, 48.0],
    [-40.0, 37.0],
    [-55.0, 21.0],
    [-66.0, -2.0],
    [-69.0, -31.0],
    [-62.0, -62.0],
    [-40.0, -87.0], //50
    [-7.0, -101.0],
    [27.0, -97.0],
    [54.0, -78.0],
    [70.0, -50.0],
    [74.0, -19.0],
  ];

//Definición de los botones "Siguiente" y los botones para las opciones de las preguntas
const nextButton = document.getElementById("siguiente");
const radioButtons = document.querySelectorAll('input[type="radio"]');
nextButton.disabled = true;
nextButton.style.display = "none";
radioButtons.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (Array.from(radioButtons).some((radio) => radio.checked)) {
      showExplanation();
    }
  });
});

// Definiciones para el manejo del tablero
let contenedor = document.getElementById("contenedor");
let tablero = document.getElementById("tablero");
let ficha = document.getElementById("ficha");

//Definicion de variables para el manejo del dado y ubicación de la ficha
let diceImage = document.getElementById("dado");
let contador = 0;
let dado_activo = true;

//Definicion de variables para el manejo de las situaciones de "dios"
let turno=0;
let god_factor = 2;
let necesity = "determinacion";

let letreroImagen = "";