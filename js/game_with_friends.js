// Funciones relacionadas con la lógica de juego.
const timerSound = new Audio("sounds/tick.mp3");
const stepsSound = new Audio("sounds/steps.mp3");
const winSound = new Audio("sounds/win.mp3");
const incorrectSound = new Audio("sounds/error_sound.mp3");
const pageSound = new Audio("sounds/change_page.mp3");
const diceSound = new Audio("sounds/dice.mp3");

// Función para cargar una pregunta basada en el tipo seleccionado
function cargarPregunta(category) {
  document.getElementById("explicacion").innerHTML = "";
  let filteredQuestions = preguntas.filter(
    (pregunta) => pregunta.kind === category
  );
  pregunta_actual = Math.floor(Math.random() * filteredQuestions.length);
  pregunta = filteredQuestions[pregunta_actual];
  preguntas.splice(preguntas.indexOf(pregunta), 1);
  document.getElementById("pregunta").innerHTML = "Contexto "+category+":<br><br>"+pregunta.text;
  if (pregunta.kind === "azar") {
    document.getElementById("option1").classList.add("hidden");
    document.getElementById("option2").classList.add("hidden");
    document.getElementById("option3").classList.add("hidden");
    document.getElementById("option4").classList.add("hidden");
    document.getElementById("option1_text").innerHTML = "";
    document.getElementById("option2_text").innerHTML = "";
    document.getElementById("option3_text").innerHTML = "";
    document.getElementById("option4_text").innerHTML = "";    
  } else {
    document.getElementById("option1").classList.remove("hidden");
    document.getElementById("option2").classList.remove("hidden");
    document.getElementById("option3").classList.remove("hidden");
    document.getElementById("option4").classList.remove("hidden");
    document.getElementById("option1_text").innerHTML = pregunta.options[0].text;
    document.getElementById("option2_text").innerHTML = pregunta.options[1].text;
    document.getElementById("option3_text").innerHTML = pregunta.options[2].text;
    document.getElementById("option4_text").innerHTML = pregunta.options[3].text;
  }
  document.getElementById("foto-pregunta").src = "img/Preguntas/" + pregunta.imageName + ".png";
  document.getElementById("foto-pregunta").alt = "img/Preguntas/" + pregunta.imageName + ".png";
  habilitarBotones();
  const card = document.querySelector(".card");
  card.classList.remove("red", "blue", "green", "yellow");
  if (pregunta.kind === "personal") {
    card.classList.add("blue");
  } else if (pregunta.kind === "social") {
    card.classList.add("red");
  } else if (pregunta.kind === "académico") {
    card.classList.add("yellow");
  } else {
    card.classList.add("green");
    showExplanation(card);
  }  
  pageSound.play();  
  rightBtn();
}

// Función que muestra una explicación a la opción elegida
function showExplanation() {
  deshabilitarBotones();
  let option;
  if (pregunta.kind === "azar") {
    option = pregunta.options[0];
  } else {
    let option_index = document.querySelector(
      'input[type="radio"]:checked'
    ).value;
    option = pregunta.options[option_index - 1];
  }
  let evaluacion = `
        <ul>
          <li>Determinación: ${option.determinacion}</li>
          <li>Alegría: ${option.alegria}</li>
          <li>Apoyo: ${option.apoyo}</li>
          <li>Salud: ${option.salud}</li>
          <li>Dinero: ${option.dinero}</li>
          <li>Tiempo: ${option.tiempo}</li>
        </ul>
      `;
  document.getElementById("explicacion").innerHTML = option.explicacion + " Evaluación: " + evaluacion;
  document.getElementById("foto-pregunta").src = "img/consecuencias.png";
}

// Función que deshabilita los botones de las opciones, se llama cuando el usuario ya eligió una opción
function deshabilitarBotones() {
  document.getElementById("option1").disabled = true;
  document.getElementById("option2").disabled = true;
  document.getElementById("option3").disabled = true;
  document.getElementById("option4").disabled = true;
  nextButton.disabled = false;
  nextButton.style.display = "block";
}

// Función que vuelve a habilitar los botones de las opciones, se llama una vez que se puede hacer otra pregunta
function habilitarBotones() {
  document.getElementById("option1").disabled = false;
  document.getElementById("option2").disabled = false;
  document.getElementById("option3").disabled = false;
  document.getElementById("option4").disabled = false;
  nextButton.disabled = true;
  nextButton.style.display = "none";
  document.getElementById("option1").checked = false;
  document.getElementById("option2").checked = false;
  document.getElementById("option3").checked = false;
  document.getElementById("option4").checked = false;
}