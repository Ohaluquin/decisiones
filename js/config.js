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
    [5.0, 7.0],
    [-5.0, 12.0],
    [-13.0, 0.0],
    [-4.0, -13.0],
    [12.0, -8.0],
    [18.0, 10.0],
    [9.0, 23.0],
    [-10.0, 24.0],
    [-25.0, 10.0],
    [-25.0, -10.0],
    [-11.0, -25.0],
    [10.0, -25.0],
    [26.0, -10.0],
    [32.0, 11.0],
    [24.0, 29.0],
    [5.0, 38.0],
    [-16.0, 35.0],
    [-33.0, 21.0],
    [-40.0, 0.0],
    [-34.0, -21.0],
    [-17.0, -36.0],
    [5.0, -40.0],
    [27.0, -31.0],
    [40.0, -11.0],
    [45.0, 12.0],
    [38.0, 32.0],
    [21.0, 46.0],
    [-1.0, 51.0],
    [-23.0, 47.0],
    [-41.0, 33.0],
    [-51.0, 12.0],
    [-52.0, -11.0],
    [-42.0, -33.0],
    [-24.0, -48.0],
    [-0.0, -53.0],
    [23.0, -48.0],
    [42.0, -34.0],
    [53.0, -12.0],
    [57.0, 12.0],
    [53.0, 33.0],
    [37.0, 51.0],
    [17.0, 61.0],
    [-6.0, 64.0],
    [-29.0, 58.0],
    [-48.0, 44.0],
    [-61.0, 24.0],
    [-66.0, 0.0],
    [-61.0, -23.0],
    [-49.0, -44.0],
    [-30.0, -59.0],
    [-7.0, -66.0],
    [18.0, -64.0],
    [40.0, -53.0],
    [57.0, -35.0],
    [66.0, -12.0],
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