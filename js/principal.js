document.addEventListener("DOMContentLoaded", function () {
  inicio();
});

let player = 0;
let pregunta_actual = 0;
let pregunta = 0;
let animatedGif;
let initialDetermination=0;
let initialAlegria=0;
let initialApoyo=0;
let initialSalud=0;
let initialTiempo=0;
let initialDinero=0;

// Suponiendo que tienes un arreglo de coordenadas en JavaScript
let casillas = [
  [0, 0],
  [ 5.0 , 7.0 ],
[ -5.0 , 12.0 ],
[ -13.0 , 0.0 ],
[ -4.0 , -13.0 ],
[ 12.0 , -8.0 ],
[ 18.0 , 10.0 ],
[ 9.0 , 23.0 ],
[ -10.0 , 24.0 ],
[ -25.0 , 10.0 ],
[ -25.0 , -10.0 ],
[ -11.0 , -25.0 ],
[ 10.0 , -25.0 ],
[ 26.0 , -10.0 ],
[ 32.0 , 11.0 ],
[ 24.0 , 29.0 ],
[ 5.0 , 38.0 ],
[ -16.0 , 35.0 ],
[ -33.0 , 21.0 ],
[ -40.0 , 0.0 ],
[ -34.0 , -21.0 ],
[ -17.0 , -36.0 ],
[ 5.0 , -40.0 ],
[ 27.0 , -31.0 ],
[ 40.0 , -11.0 ],
[ 45.0 , 12.0 ],
[ 38.0 , 32.0 ],
[ 21.0 , 46.0 ],
[ -1.0 , 51.0 ],
[ -23.0 , 47.0 ],
[ -41.0 , 33.0 ],
[ -51.0 , 12.0 ],
[ -52.0 , -11.0 ],
[ -42.0 , -33.0 ],
[ -24.0 , -48.0 ],
[ -0.0 , -53.0 ],
[ 23.0 , -48.0 ],
[ 42.0 , -34.0 ],
[ 53.0 , -12.0 ],
[ 57.0 , 12.0 ],
[ 53.0 , 33.0 ],
[ 37.0 , 51.0 ],
[ 17.0 , 61.0 ],
[ -6.0 , 64.0 ],
[ -29.0 , 58.0 ],
[ -48.0 , 44.0 ],
[ -61.0 , 24.0 ],
[ -66.0 , 0.0 ],
[ -61.0 , -23.0 ],
[ -49.0 , -44.0 ],
[ -30.0 , -59.0 ],
[ -7.0 , -66.0 ],
[ 18.0 , -64.0 ],
[ 40.0 , -53.0 ],
[ 57.0 , -35.0 ],
[ 66.0 , -12.0 ]
];

async function inicio() {
  await cargarPlayer();
  initialDetermination = player.determinacion;
  initialAlegria = player.alegria;
  initialApoyo = player.apoyo;
  initialSalud = player.salud;
  initialTiempo = player.tiempo;
  initialDinero = player.dinero; 
}

function actualizarPlayerCard() {
  document.getElementById("nombre").innerHTML = player.nickname;
  actualizarColorProgress("determinacion");
  actualizarColorProgress("alegria");
  actualizarColorProgress("apoyo");
  actualizarColorProgress("salud");
  actualizarColorProgress("dinero");
  actualizarColorProgress("tiempo");
  let imgElement = document.getElementById("fotoPersonaje");
  let newImgElement = document.getElementById("fotoPersonaje-nueva");
  // Set the source of the new image element to the new image, and make it visible.
  newImgElement.src = getImagePath();
  newImgElement.style.opacity = 1;
  // After 1 second (the duration of the transition), set the source of the original image element
  // to the new image, make it visible, and hide the new image element.
  setTimeout(function () {
    imgElement.src = animatedGif;
    imgElement.style.opacity = 1;
    newImgElement.style.opacity = 0;
  }, 5000);
}

function actualizarColorProgress(atributo) {
  document.getElementById(atributo).value = player[atributo];
  var barra_progress = document.getElementById(atributo);
  var value = barra_progress.value;
  var max = barra_progress.max;
  var percent = (value / max) * 100;
  barra_progress.classList.remove("red", "yellow", "green");
  if (percent < 30) {
    barra_progress.classList.add("red");
  } else if (percent > 70) {
    barra_progress.classList.add("green");
  } else {
    barra_progress.classList.add("yellow");
  }
}

function actualizarQuestionCard() {
  let category;
  if (contador % 4 === 1) {
    category = "académico";
  } else if (contador % 4 === 2) {
    category = "personal";
  } else if (contador % 4 === 3) {
    category = "social";
  } else {
    category = "azar";
  }
  let filteredQuestions = preguntas.filter(
    (pregunta) => pregunta.kind === category
  );
  pregunta_actual = Math.floor(Math.random() * filteredQuestions.length);
  pregunta = filteredQuestions[pregunta_actual];
  preguntas.splice(preguntas.indexOf(pregunta), 1);
  document.getElementById("pregunta").innerHTML = pregunta.text;
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
    showExplanation();
  }
}

function cargarPlayer() {
  const ID = localStorage.getItem("personaje_index"); // Obtener el índice del personaje elegido desde localStorage
  let personajeElegido = null;
  if (ID !== null) {
    // Verificar si el índice existe
    for (i = 0; i < personajes.length; i++) {
      if (personajes[i].personajeID == ID) {
        personajeElegido = personajes[i];
        break;
      }
    }
    if (personajeElegido === null) return;
    player = {
      // Crear el objeto player con los datos necesarios
      id: personajeElegido.personajeID,
      imageName: "animated.gif",
      determinacion: personajeElegido.determinacion,
      alegria: personajeElegido.alegria,
      apoyo: personajeElegido.apoyo,
      salud: personajeElegido.salud,
      dinero: personajeElegido.dinero,
      tiempo: personajeElegido.tiempo,
      rutaImagen: personajeElegido.rutaImagen,
      nickname: localStorage.getItem("nombrePersonaje"),
    };
    animatedGif = getImagePath();
    actualizarPlayerCard();
  }
}

function actualizarPlayer(option) {
  // Actualizar los atributos del jugador
  player.determinacion += option.determinacion;
  player.alegria += option.alegria;
  player.apoyo += option.apoyo;
  player.salud += option.salud;
  player.dinero += option.dinero;
  player.tiempo += option.tiempo;
  player.imageName = getImageName(
    // Obtener el nuevo nombre de la imagen
    player.determinacion,
    player.alegria,
    player.apoyo,
    player.salud,
    player.dinero,
    player.tiempo
  );
}

function getImageName(
  atributo1,
  atributo2,
  atributo3,
  atributo4,
  atributo5,
  atributo6
) {
  // Encuentra el atributo con el valor más bajo
  let minimo = Math.min(
    Math.min(
      Math.min(Math.min(Math.min(atributo1, atributo2), atributo3), atributo4),
      atributo5
    ),
    atributo6
  );
  // Si el valor mínimo es menor que 7, devuelve el nombre correspondiente al atributo
  if (minimo < 7) {
    if (minimo == atributo1) {
      return "low_determinacion.png";
    } else if (minimo == atributo2) {
      return "low_alegria.png";
    } else if (minimo == atributo3) {
      return "low_apoyo.png";
    } else if (minimo == atributo4) {
      return "low_salud.png";
    } else if (minimo == atributo5) {
      return "low_dinero.png";
    } else {
      return "low_tiempo.png";
    }
  }
  // Encuentra el atributo con el valor más alto
  let maximo = Math.max(
    Math.max(
      Math.max(Math.max(Math.max(atributo1, atributo2), atributo3), atributo4),
      atributo5
    ),
    atributo6
  );
  // Si el valor máximo es mayor que 20, devuelve el nombre correspondiente al atributo con un prefijo de "high_"
  if (maximo > 12) {
    if (maximo == atributo1) {
      return "high_determinacion.png";
    } else if (maximo == atributo2) {
      return "high_alegria.png";
    } else if (maximo == atributo3) {
      return "high_apoyo.png";
    } else if (maximo == atributo4) {
      return "high_salud.png";
    } else if (maximo == atributo5) {
      return "high_dinero.png";
    } else {
      return "high_tiempo.png";
    }
  }
  // Calcula el valor promedio de los atributos
  let promedio =
    (atributo1 + atributo2 + atributo3 + atributo4 + atributo5 + atributo6) /
    6.0;
  // Si el valor promedio es mayor o igual a cierto umbral, devuelve un nombre específico. De lo contrario, devuelve otro nombre.
  if (promedio >= 10) {
    return "high_average.png";
  } else if (promedio >= 8) {
    return "medium_average.png";
  } else {
    return "low_average.png";
  }
}

function getImagePath() {
  return "img/personajes/" + player.rutaImagen + "/" + player.imageName;
}

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
  document.getElementById("explicacion").innerHTML =
    option.explicacion +
    " Evaluación: " +
    "determinación: " +
    option.determinacion +
    ", " +
    "alegria: " +
    option.alegria +
    ", " +
    "apoyo: " +
    option.apoyo +
    ", " +
    "salud: " +
    option.salud +
    ", " +
    "dinero: " +
    option.dinero +
    ", " +
    "tiempo: " +
    option.tiempo;
  actualizarPlayer(option);
  actualizarPlayerCard();
  if (option.determinacion) mostrarValor("determinacion", option.determinacion);
  if (option.alegria) mostrarValor("alegria", option.alegria);
  if (option.apoyo) mostrarValor("apoyo", option.apoyo);
  if (option.salud) mostrarValor("salud", option.salud);
  if (option.dinero) mostrarValor("dinero", option.dinero);
  if (option.tiempo) mostrarValor("tiempo", option.tiempo);
}

function deshabilitarBotones() {
  document.getElementById("option1").disabled = true;
  document.getElementById("option2").disabled = true;
  document.getElementById("option3").disabled = true;
  document.getElementById("option4").disabled = true;
  nextButton.disabled = false;
  nextButton.style.display = "block";
}

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

function siguiente() {
  if (preguntas.length > 0) {
    dado_activo = true;
    document.getElementById("explicacion").innerHTML = "";
    diceImage.src = "img/dado-animado.gif";
    if (window.innerWidth <= 768) {
      rightBtn();
    }
  } else {
    alert("Se terminaron las preguntas.");
  }
  nextButton.style.display = "none";
}

let contenedor = document.getElementById("contenedor");
let tablero = document.getElementById("tablero");
let ficha = document.getElementById("ficha");

function colocarFichaEnCasilla(casillaIndex) {
  if (casillaIndex >= casillas.length) { // Fin del juego
    getFeedback();
    document.getElementById("summaryModal").style.display = "block";
  } else {
    var coordenadas = casillas[casillaIndex]; // Obtener las coordenadas de la casilla seleccionada
    var offsetX = contenedor.offsetWidth * 0.5 - 53; // Centrar la ficha horizontalmente en el contenedor
    var offsetY = contenedor.offsetHeight * 0.25 - 70; // Centrar la ficha verticalmente en el contenedor
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

let diceImage = document.getElementById("dado");
let contador = 0;
let dado_activo = true;
colocarFichaEnCasilla(0);

diceImage.addEventListener("click", function () {
  if (dado_activo) {
    document.getElementById("tablero").src = "img/tablero.png";
    habilitarBotones();
    let diceRoll = Math.floor(Math.random() * 4) + 1;
    diceImage.src = "img/dado" + diceRoll + ".png";
    // Move the piece according to the dice roll
    for (let i = 1; i <= diceRoll; i++) {
      setTimeout(() => {
        contador++;
        colocarFichaEnCasilla(contador);
        if (i == diceRoll) {
          actualizarQuestionCard();
          if (window.innerWidth <= 768) {
            setTimeout(() => {
              centerBtn();
            }, 1500); // 2000 milliseconds = 2 seconds
          }
        }
      }, i * 500);
    }
    dado_activo = false;
  }
});

diceImage.addEventListener("mouseover", function () {
  if (dado_activo) diceImage.src = "img/dado-animado.gif";
});

// Muestra el valor en el elemento span de las barras de progreso
function mostrarValor(atributo, valor) {
  var span = document.getElementById(atributo + "-value");
  if (valor > 0) {
    span.textContent = "+" + valor;
  } else if (valor == 0) {
    span.textContent = " ";
  } else {
    span.textContent = valor;
  }
  setTimeout(function () {
    // Después de 2 segundos, borra el contenido del elemento span
    span.textContent = "";
  }, 5000);
}

function getFeedbackAC(atributo, change) {
  if (change >= 6) return "¡Excelente! Tu " + atributo + " ha aumentado significativamente.";
  if (change >= 3) return "Bien hecho. Tu " + atributo + " ha mejorado.";
  if (change >= 0) return "Tu " + atributo + " se mantuvo constante.";
  if (change >= -3) return "Tu " + atributo + " ha disminuido ligeramente. Considera tus elecciones.";
  return "Cuidado, tu " + atributo +  " ha disminuido. ¿Qué decisiones crees que contribuyeron a esto? ¿Cómo podrías mejorar tu " + atributo + " en el futuro?";
}

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
