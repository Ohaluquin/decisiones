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
let respuestas = [];
let atributosVisibleToggle = true;

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