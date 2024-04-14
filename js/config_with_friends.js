// Variables globales para mantener el estado del juego.
let pregunta_actual = 0;
let pregunta = 0;

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

let letreroImagen = "";
let necesity = "";