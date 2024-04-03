// Funciones relacionadas con la lógica de juego.
const timerSound = new Audio("sounds/tick.mp3");
const stepsSound = new Audio("sounds/steps.mp3");
const winSound = new Audio("sounds/win.mp3");
const incorrectSound = new Audio("sounds/error_sound.mp3");
const pageSound = new Audio("sounds/change_page.mp3");
const diceSound = new Audio("sounds/dice.mp3");

// Función que cambia la carta de pregunta que se muestra, de acuerdo a la casilla del tablero en que
// se encuentre la ficha
function actualizarQuestionCard() {
  let category;
  if (contador % 7 === 0) {
    category = "azar";
  } else if (contador % 3 === 1) {
    category = "académico";
  } else if (contador % 3 === 2) {
    category = "personal";
  } else if (contador % 3 === 0) {
    category = "social";
  }
  let filteredQuestions = preguntas.filter(
    (pregunta) => pregunta.kind === category
  );
  if (category === "personal" && turno % god_factor === 0) {
    filteredQuestions = filteredQuestions.filter((pregunta) =>
      pregunta.options.some((option) => option[necesity] >= 1)
    );
  }
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
    document.getElementById("option1_text").innerHTML =
      pregunta.options[0].text;
    document.getElementById("option2_text").innerHTML =
      pregunta.options[1].text;
    document.getElementById("option3_text").innerHTML =
      pregunta.options[2].text;
    document.getElementById("option4_text").innerHTML =
      pregunta.options[3].text;
  }
  document.getElementById("foto-pregunta").src =
    "img/Preguntas/" + pregunta.imageName + ".png";
  document.getElementById("foto-pregunta").alt =
    "img/Preguntas/" + pregunta.imageName + ".png";
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
    mostrarOpcionTirarDado();
  }
  pageSound.play();
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
    let evaluacion = evalua(option);
    if(evaluacion>1) winSound.play();
    else if(evaluacion<-1) incorrectSound.play();
  }
  let evaluacion = `Determinación: ${option.determinacion}
          <br>Alegría: ${option.alegria}
          <br>Apoyo: ${option.apoyo}
          <br>Salud: ${option.salud}
          <br>Dinero: ${option.dinero}
          <br>Tiempo: ${option.tiempo}
      `;
  document.getElementById("explicacion").innerHTML = option.explicacion + "<br><h2>Evaluación:</h2>" + evaluacion;      
  actualizarPlayer(option);
  actualizarPlayerCard();
  document.getElementById("foto-pregunta").src = "img/consecuencias.png";
  mostrarPerfil();
  if (option.determinacion) mostrarValor("determinacion", option.determinacion);
  if (option.alegria) mostrarValor("alegria", option.alegria);
  if (option.apoyo) mostrarValor("apoyo", option.apoyo);
  if (option.salud) mostrarValor("salud", option.salud);
  if (option.dinero) mostrarValor("dinero", option.dinero);
  if (option.tiempo) mostrarValor("tiempo", option.tiempo);
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

// Función que permite ir a la siguiente pregunta, activando el dado
function siguiente() {
  if (preguntas.length > 0) {
    dado_activo = true;
    document.getElementById("explicacion").innerHTML = "";
    diceImage.src = "img/dado-animado.gif";    
    rightBtn();    
  } else {
    alert("Se terminaron las preguntas.");
  }
  nextButton.style.display = "none";
}

// Función coloca el gif de la ficha en la casilla correspondiente
function colocarFichaEnCasilla(casillaIndex) {
  stepsSound.play();
  if (casillaIndex >= casillas.length) {
    // Fin del juego
    getFeedback();
    document.getElementById("summaryModal").style.display = "block";
  } else {
    var coordenadas = casillas[casillaIndex]; // Obtener las coordenadas de la casilla seleccionada
    var offsetX = contenedor.offsetWidth * 0.5 - 60; // Centrar la ficha horizontalmente en el contenedor
    var offsetY = contenedor.offsetHeight * 0.25 - 40; // Centrar la ficha verticalmente en el contenedor
    // Ajustar la posición del contenedor si es necesario
    var contenedorLeft = contenedor.offsetLeft;
    var contenedorTop = contenedor.offsetTop;
    var factorX = (1.55 * contenedor.offsetWidth) / 256; // anchoReferencia es el ancho del contenedor en tu ventana de referencia
    var factorY = (1.38 * contenedor.offsetHeight) / 405; // altoReferencia es el alto del contenedor en tu ventana de referencia
    var posicionX = factorX * coordenadas[0] + offsetX + contenedorLeft;
    var posicionY = -factorY * coordenadas[1] + offsetY + contenedorTop;
    // Establecer la posición de la ficha
    ficha.style.left = posicionX + "px";
    ficha.style.top = posicionY + "px";
  }
}

// Función que se activa al darle click al dado
diceImage.addEventListener("click", function () {
  if (dado_activo) {
    diceSound.play();
    document.getElementById("tablero").src = "img/tablero.png";
    habilitarBotones();
    turno++;
    let diceRoll = Math.floor(Math.random() * 4) + 1;
    diceImage.src = "img/dado" + diceRoll + ".png";
    // Move the piece according to the dice roll
    for (let i = 1; i <= diceRoll; i++) {
      setTimeout(() => {
        contador++;
        colocarFichaEnCasilla(contador);
        if (i == diceRoll) {
          actualizarQuestionCard();
          setTimeout(() => {centerBtn();}, 1500); // 2000 milliseconds = 2 seconds          
        }
      }, i * 500);
    }
    dado_activo = false;
  }
});

//Si el dado está activo muestra el gif animado
diceImage.addEventListener("mouseover", function () {
  if (dado_activo) diceImage.src = "img/dado-animado.gif";
});

// Función que muestra un mensaje de feedback, de acuerdo a la comparación entre cómo empezo el
// atributo y cómo terminó
function getFeedbackAC(atributo, change) {
  if (change >= 6)
    return "¡Excelente! Tu " + atributo + " ha aumentado significativamente.";
  if (change >= 3) return "Bien hecho. Tu " + atributo + " ha mejorado.";
  if (change >= 0) return "Tu " + atributo + " se mantuvo constante.";
  if (change >= -3)
    return (
      "Tu " + atributo + " ha disminuido ligeramente. Considera tus elecciones."
    );
  return (
    "Cuidado, tu " +
    atributo +
    " ha disminuido. ¿Qué decisiones crees que contribuyeron a esto? ¿Cómo podrías mejorar tu " +
    atributo +
    " en el futuro?"
  );
}

// Función que solicita el feedback de los atributos del player
function getFeedback() {
  var determinationChange = player.determinacion - initialDetermination;
  var determinationFeedback = getFeedbackAC("Determinación", determinationChange);
  var alegriaChange = player.alegria - initialAlegria;
  var alegriaFeedback = getFeedbackAC("Alegria", alegriaChange);
  var apoyoChange = player.apoyo - initialApoyo;
  var apoyoFeedback = getFeedbackAC("Apoyo", apoyoChange);
  var saludChange = player.salud - initialSalud;
  var saludFeedback = getFeedbackAC("Salud", saludChange);
  var tiempoChange = player.tiempo - initialTiempo;
  var tiempoFeedback = getFeedbackAC("Tiempo", tiempoChange);
  var dineroChange = player.dinero - initialDinero;
  var dineroFeedback = getFeedbackAC("Dinero", dineroChange);
  document.getElementById("determinacionFeedback").innerText = determinationFeedback;
  document.getElementById("alegriaFeedback").innerText = alegriaFeedback;
  document.getElementById("apoyoFeedback").innerText = apoyoFeedback;
  document.getElementById("saludFeedback").innerText = saludFeedback;
  document.getElementById("tiempoFeedback").innerText = tiempoFeedback;
  document.getElementById("dineroFeedback").innerText = dineroFeedback;
}

function tirarDados() {
  diceSound.play();
  let resultadoDado = Math.floor(Math.random() * 6) + 1; // Genera un número entre 1 y 6
  if (resultadoDado % 2 === 0) { // Si el resultado es par
    showExplanation(); // Se aplica la carta de azar
  } else {
    deshabilitarBotones();
    document.getElementById("explicacion").innerHTML = "La suerte decidió: No aplicar la carta";
  }
  document.getElementById("diceModal").style.display = "none"; // Cierra el modal  
}

function mostrarOpcionTirarDado() {
  document.getElementById("diceModal").style.display = "block";
}

function mostrarPerfil() {
  pageSound.play();
  document.getElementById("user_stats").style.display = "block";
  setTimeout(() => {
    document.getElementById("user_stats").style.display = "none";  
  }, 6000);
}
