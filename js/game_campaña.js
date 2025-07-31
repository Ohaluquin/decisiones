let preguntaID = null;
let siguienteCallback = null;

// Funciones relacionadas con la lógica de juego.
const timerSound = new Audio("sounds/tick.mp3");
const stepsSound = new Audio("sounds/steps.mp3");
const winSound = new Audio("sounds/win.mp3");
const incorrectSound = new Audio("sounds/error_sound.mp3");
const pageSound = new Audio("sounds/change_page.mp3");
const diceSound = new Audio("sounds/dice.mp3");
const endMusic = document.getElementById("end-music");
const personalMusic = document.getElementById("personal-music");
const academicMusic = document.getElementById("academic-music");
const socialMusic = document.getElementById("social-music");
const randomMusic = document.getElementById("random-music");
personalMusic.volume = 0.2;
academicMusic.volume = 0.2;
socialMusic.volume = 0.2;
randomMusic.volume = 0.2;

let currentMusic = null;

const playMusic = (music) => {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }
  currentMusic = music;
  currentMusic.play();
};

function actualizarQuestionCard(tipo) {
  document.getElementById("user_stats").style.display = "none";
  document.getElementById("abrirUserStats").style.display = "none";
  let category = tipo;
  if (contador > 15) {
    playMusic(endMusic);
    getFeedback();
    document.getElementById("summaryModal").style.display = "block";
    return;
  } else {
    contador++;
    playMusic(
      {
        personal: personalMusic,
        académico: academicMusic,
        social: socialMusic,
        azar: randomMusic,
      }[tipo]
    );
  }
  
  // Paso 1: filtrar solo por tipo (kind)
  let tipoFiltradas = preguntas.filter((p) => p.kind === category);  

  // Paso 2: Filtrar las preguntas del jugador
  let playerQuestions = tipoFiltradas.filter((pregunta) =>
    player.preguntas.includes(pregunta.questionID)
  );  

  if(playerQuestions.length > 0) {
    // Si hay preguntas del personaje, elige una y la borra
    pregunta_actual = Math.floor(Math.random() * playerQuestions.length);
    preguntaID = playerQuestions[pregunta_actual].questionID;
    player.preguntas = player.preguntas.filter((id) => id !== preguntaID);
    pregunta = tipoFiltradas.find((p) => p.questionID === preguntaID);
  } else {
    // Paso 3: intentar filtrar por categorías del jugador
    let filteredQuestions = tipoFiltradas.filter((pregunta) =>
       pregunta.categorias?.some((cat) => player.categorias.includes(cat))
    );    

    // Si no hay preguntas con categorías compatibles, usamos todas las del tipo
    if (filteredQuestions.length === 0) {filteredQuestions = tipoFiltradas;}
        
    //Filtra para ver si hay preguntas Dios
    godQuestions = filteredQuestions.filter((pregunta) =>
      pregunta.options.some((option) => option[necesity] >= 1)
      );
    if (godQuestions.length > 0) filteredQuestions = godQuestions;    
    
    // Seleccionar una pregunta al azar de las filtradas
    pregunta_actual = Math.floor(Math.random() * filteredQuestions.length);
    pregunta = filteredQuestions[pregunta_actual];
  }
  // Eliminar la pregunta seleccionada del conjunto global de preguntas
  preguntas = preguntas.filter((p) => p.questionID !== pregunta.questionID);
  document.getElementById("pregunta").innerHTML =
    "Contexto " + category + ":<br><br>" + pregunta.text;
  if (pregunta.kind === "azar") {
    // Mostrar solo las dos primeras opciones
    document.getElementById("radioptions").classList.remove("hidden");
    document.getElementById("option1_text").innerHTML =
      pregunta.options[0].text;
    document.getElementById("option2_text").innerHTML =
      pregunta.options[1].text;
    document.getElementById("option3_text").innerHTML = "";
    document.getElementById("option4_text").innerHTML = "";
    document.getElementById("option3").style.display = "none";
    document.getElementById("option4").style.display = "none";
    document.getElementById("option1").disabled = true;
    document.getElementById("option2").disabled = true;
    // Mostrar botón para lanzar dado
    document.getElementById("contenedor-dado").style.display = "block";
  } else {
    // Mostrar las 4 opciones normales
    document.getElementById("radioptions").classList.remove("hidden");
    document.getElementById("option1_text").innerHTML =
      pregunta.options[0].text;
    document.getElementById("option2_text").innerHTML =
      pregunta.options[1].text;
    document.getElementById("option3_text").innerHTML =
      pregunta.options[2].text;
    document.getElementById("option4_text").innerHTML =
      pregunta.options[3].text;
    document.getElementById("option3").style.display = "inline-block";
    document.getElementById("option4").style.display = "inline-block";

    // Ocultar dado si no es pregunta de azar
    document.getElementById("contenedor-dado").style.display = "none";
  }
  document.getElementById("foto-pregunta").src =
    "img/Preguntas/" + pregunta.imageName + ".webp";
  document.getElementById("foto-pregunta").alt =
    "img/Preguntas/" + pregunta.imageName + ".webp";
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
  }
  pageSound.play();
}

// Función que muestra una explicación a la opción elegida
function showExplanation() {
  deshabilitarBotones();
  let option, option_index;
  if (pregunta.kind === "azar") {
    option_index = document.querySelector('input[type="radio"]:checked').value;
    option = pregunta.options[option_index - 1];
  } else {
    option_index = document.querySelector('input[type="radio"]:checked').value;
    option = pregunta.options[option_index - 1];
    let evaluacion = evalua(option);
    if (evaluacion > 1) winSound.play();
    else if (evaluacion < -1) incorrectSound.play();
    document.getElementById("radioptions").classList.add("hidden");
  }
  // Convertir option_index (1, 2, 3, 4) en A, B, C, D
  let letras = ["A", "B", "C", "D"];
  let letraOpcion = letras[option_index - 1]; // Restamos 1 porque los índices de arrays empiezan en 0
  registrarRespuesta(pregunta.questionID, letraOpcion); // REGISTRAR LA RESPUESTA
  if (pregunta.kind === "azar") {
    document.getElementById("explicacion").innerHTML =
      "<b>A veces, el azar interviene en nuestras vidas sin darnos la oportunidad de elegir:</b> " +
      option.explicacion;
  } else {
    document.getElementById("explicacion").innerHTML =
      "<b>" + option.text + ":</b> " + option.explicacion;
  }
  actualizarPlayer(option);
  actualizarPlayerCard();
  pageSound.play();  
  mostrarValor("determinacion", option.determinacion);
  mostrarValor("alegria", option.alegria);
  mostrarValor("apoyo", option.apoyo);
  mostrarValor("salud", option.salud);
  mostrarValor("dinero", option.dinero);
  mostrarValor("tiempo", option.tiempo);
  mostrarEvaluacion({
    determinacion: option.determinacion,
    alegria: option.alegria,
    apoyo: option.apoyo,
    salud: option.salud,
    dinero: option.dinero,
    tiempo: option.tiempo,
  });
  document.getElementById("foto-pregunta").style.display = "none";
}

function mostrarEvaluacion(evals) {
  const evaDiv = document.getElementById("evaluacion-final");
  evaDiv.style.display = "block";

  const asigna = (id, val) => {
    const span = document.getElementById(id);
    span.innerText = val;
    span.style.color = val > 0 ? "green" : val < 0 ? "red" : "black";
  };

  asigna("eva-det", evals.determinacion);
  asigna("eva-ale", evals.alegria);
  asigna("eva-apo", evals.apoyo);
  asigna("eva-sal", evals.salud);
  asigna("eva-din", evals.dinero);
  asigna("eva-tie", evals.tiempo);
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
  document.getElementById("option3").style.display = "inline-block";
  document.getElementById("option4").style.display = "inline-block";
  document.getElementById("contenedor-dado").style.display = "none";
  document.getElementById("btnLanzarDado").disabled = false;
}

function siguiente() {
  rightBtn();
  habilitarBotones();
  nextButton.style.display = "none";
  document.getElementById("foto-pregunta").style.display = "block";
  document.getElementById("evaluacion-final").style.display = "none";
  verificarAtributos();
  mostrarPerfilToggle(true);
}

function mostrarPerfilToggle(forzarMostrar = null) {
  const panel = document.getElementById("user_stats");
  const boton = document.getElementById("abrirUserStats");

  const estaVisible = panel.style.display !== "none";

  if (forzarMostrar === true || (!estaVisible && forzarMostrar === null)) {
    panel.style.display = "block";
    boton.style.display = "none";
  } else {
    panel.style.display = "none";
    boton.style.display = "block";
  }
}

function mostrarHistoria() {
  document.getElementById("modal_historia").style.display = "flex";
  document.getElementById("historia-img").src = getImagePath();
  document.getElementById("historia-texto").innerHTML = player.historia;

  document.getElementById("h_det").innerText = player.determinacion;
  document.getElementById("h_ale").innerText = player.alegria;
  document.getElementById("h_apo").innerText = player.apoyo;
  document.getElementById("h_sal").innerText = player.salud;
  document.getElementById("h_din").innerText = player.dinero;
  document.getElementById("h_tie").innerText = player.tiempo;
}

function cerrarHistoria() {
  document.getElementById("modal_historia").style.display = "none";
}

function mostrarModalFinal(atributoPerdido) {
  dado_activo = false;
  document.getElementById("atributo-perdido").textContent = atributoPerdido;
  let imagenAtributo = getImagePath();
  document.getElementById("imagen-perdida").src = imagenAtributo;
  document.getElementById("modal-final-triste").style.display = "block";
}

function verificarAtributos() {
  const atributos = [
    "alegria",
    "tiempo",
    "dinero",
    "salud",
    "determinacion",
    "apoyo",
  ];
  const critico = atributos.find((attr) => player[attr] <= 0);

  if (!critico) return; // Ningún atributo está en 0

  // Buscar atributo con mayor valor y al menos 2 puntos (para que se le puedan restar 2)
  const intercambiable = atributos
    .filter((attr) => attr !== critico && player[attr] >= 2)
    .sort((a, b) => player[b] - player[a])[0];

  if (intercambiable) {
    player[intercambiable] -= 2;
    player[critico] += 1;
    mostrarIntercambioAutomatico(intercambiable, critico);
    actualizarPlayerCard();
  } else {
    // No se pudo intercambiar, se pierde
    mostrarModalFinal(critico);
  }
  verificarAtributos();
}

function mostrarIntercambioAutomatico(attrMenos, attrMas) {
  const modal = document.getElementById("modal-intercambio-auto");

  // Obtener elementos
  document.getElementById("icono-perdido").src = getIconPath(attrMas);
  document.getElementById("icono-disminuido").src = getIconPath(attrMenos);
  document.getElementById("nombre-perdido").textContent = attrMas;
  document.getElementById("nombre-disminuido").textContent = attrMenos;

  const clave = `${attrMas}-${attrMenos}`;
  const mensaje =
    historiasDeIntercambio[clave] ||
    `Se usaron 2 puntos de ${attrMenos} para recuperar 1 de ${attrMas}.`;
  document.getElementById("mensaje-intercambio").textContent = mensaje;

  modal.style.display = "block";
}

function getIconPath(attr) {
  return `img/Iconos/${attr}.webp`;
}

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// Función que muestra un mensaje de feedback, de acuerdo a la comparación entre cómo empezo el
// atributo y cómo terminó
function getFeedbackAC(atributo, change) {
  if (change >= 6)
    return "¡Excelente! Tu " + atributo + " ha aumentado " + change;
  if (change >= 3)
    return "Bien hecho. Tu " + atributo + " ha mejorado " + change;
  if (change >= 0) return "Tu " + atributo + " se mantuvo constante: " + change;
  if (change >= -3)
    return "Tu " + atributo + " ha disminuido ligeramente " + change;
  return "Cuidado, tu " + atributo + " ha disminuido " + change;
}

// Función que solicita el feedback de los atributos del player
function getFeedback() {
  let cadenaBinaria = codificarRespuestas(respuestas);
  let codigoBase64 = binarioABase64(cadenaBinaria);
  document.getElementById(
    "codigoRespuestas"
  ).innerText = `Código: ${codigoBase64}`;
  var determinationChange = player.determinacion - initialDetermination;
  var determinationFeedback = getFeedbackAC(
    "Determinación",
    determinationChange
  );
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
  var gifElement = document.getElementById("animatedGif");
  gifElement.src = animatedGif;
  gifElement.style.display = "block";
}

function reiniciarJuego() {
  document.getElementById("modal-final-triste").style.display = "none";
  window.location.href = "select_player.html";
}

function codificarRespuestas(respuestas) {
  let cadenaBinaria = "";
  respuestas.forEach((respuesta) => {
    // Convertir número de pregunta a binario (8 bits)
    let preguntaBin = respuesta.pregunta.toString(2).padStart(8, "0");
    // Convertir opción a binario (2 bits)
    let opcionBin = "";
    switch (respuesta.opcion) {
      case "A":
        opcionBin = "00";
        break;
      case "B":
        opcionBin = "01";
        break;
      case "C":
        opcionBin = "10";
        break;
      case "D":
        opcionBin = "11";
        break;
    }
    // Concatenar número de pregunta y opción
    cadenaBinaria += preguntaBin + opcionBin;
  });
  return cadenaBinaria;
}

function binarioABase64(cadenaBinaria) {
  // Convertir la cadena binaria en bloques de 8 bits a bytes
  let byteArray = [];
  for (let i = 0; i < cadenaBinaria.length; i += 8) {
    let byte = cadenaBinaria.substring(i, i + 8);
    byteArray.push(parseInt(byte, 2)); // Convertir a entero de 8 bits
  }
  // Crear un buffer a partir del array de bytes
  let buffer = new Uint8Array(byteArray);
  // Codificar el buffer a Base 64 usando btoa (browser built-in)
  return btoa(String.fromCharCode.apply(null, buffer));
}

function registrarRespuesta(preguntaID, letraOpcion) {
  respuestas.push({ pregunta: preguntaID, opcion: letraOpcion });
}

function lanzarDado() {
  diceSound.play();
  const resultado = Math.floor(Math.random() * 6) + 1;
  document.getElementById("btnLanzarDado").disabled = true;

  const gif = document.getElementById("gif-dado");  
  gif.src = "img/dado.gif?" + new Date().getTime();
  gif.style.display = "inline-block";

  setTimeout(() => {
    const index = resultado % 2 === 0 ? 0 : 1;
    // Marcar automáticamente la opción
    document.getElementById("option1").checked = index === 0;
    document.getElementById("option2").checked = index === 1;
    // Ahora sí llamar a showExplanation para continuar
    document.getElementById("contenedor-dado").style.display = "none";    
    showExplanation();
    gif.style.display = "none";
  }, 1500);  
}
