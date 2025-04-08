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
  document.getElementById("foto-pregunta").style.display = "block";
  document.getElementById("evaluacion-final").style.display = "none";

  let filteredQuestions = preguntas.filter(
    (pregunta) => pregunta.kind === category
  );
  if (necesity) {//Filtra las preguntas de dios
    filteredQuestions = filteredQuestions.filter((pregunta) =>
      pregunta.options.some((option) => option[necesity] >= 1)
    );
    necesity = "";
  }
  if(filteredQuestions.length ==0) {
    actualizarContadores();
    return;
    }
  pregunta_actual = Math.floor(Math.random() * filteredQuestions.length);
  pregunta = filteredQuestions[pregunta_actual];
  preguntas.splice(preguntas.indexOf(pregunta), 1);
  document.getElementById("pregunta").innerHTML = "Contexto "+category+":<br><br>"+pregunta.text;
  if (pregunta.kind === "azar") {
    document.getElementById("radioptions").classList.add("hidden");    
  } else {
    document.getElementById("radioptions").classList.remove("hidden");
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

  // Ocultar imagen de contexto
  document.getElementById("foto-pregunta").style.display = "none";

  let option;
  if (pregunta.kind === "azar") {
    option = pregunta.options[0];
  } else {
    let option_index = document.querySelector(
      'input[type="radio"]:checked'
    ).value;
    option = pregunta.options[option_index - 1];  
    document.getElementById("radioptions").classList.add("hidden");  
  }

  // Mostrar retroalimentación
  document.getElementById("explicacion").innerHTML =
    "<br /><b>" + option.text + ":</b><br /><br /> " + option.explicacion + "<br /><br />";

  // Mostrar evaluación con íconos
  mostrarEvaluacion({
    determinacion: option.determinacion,
    alegria: option.alegria,
    apoyo: option.apoyo,
    salud: option.salud,
    dinero: option.dinero,
    tiempo: option.tiempo
  });
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

function godQuestion(atributo) {
  necesity = atributo;
  actualizarContadores();
}

function actualizarContadores() {
  const categorias = ['personal', 'social', 'académico', 'azar'];
  categorias.forEach((categoria) => {
    let filteredQuestions = preguntas.filter(
      (pregunta) => pregunta.kind === categoria
    );
    if (necesity) {
      filteredQuestions = filteredQuestions.filter((pregunta) =>
        pregunta.options.some((option) => option[necesity] >= 1)
      );
    }
    document.getElementById(`${categoria}-count`).innerText = filteredQuestions.length;
  });
}

function mostrarEvaluacion(evals) {
  const evaDiv = document.getElementById("evaluacion-final");
  evaDiv.style.display = "block";

  const asigna = (id, val) => {
    const span = document.getElementById(id);
    span.innerText = val;
    span.style.color = val > 0 ? "green" : (val < 0 ? "red" : "black");
  };

  asigna("eva-det", evals.determinacion);
  asigna("eva-ale", evals.alegria);
  asigna("eva-apo", evals.apoyo);
  asigna("eva-sal", evals.salud);
  asigna("eva-din", evals.dinero);
  asigna("eva-tie", evals.tiempo);
}

// Inicializar contadores al cargar la página
actualizarContadores();