// Funciones relacionadas con la lógica de juego.
const timerSound = new Audio("sounds/tick.mp3");
const stepsSound = new Audio("sounds/steps.mp3");
const winSound = new Audio("sounds/win.mp3");
const incorrectSound = new Audio("sounds/error_sound.mp3");
const pageSound = new Audio("sounds/change_page.mp3");
const diceSound = new Audio("sounds/dice.mp3");
const endMusic = document.getElementById('end-music');
const personalMusic = document.getElementById('personal-music');
const academicMusic = document.getElementById('academic-music');
const socialMusic = document.getElementById('social-music');
const randomMusic = document.getElementById('random-music');
personalMusic.volume = 0.5;
academicMusic.volume = 0.5;
socialMusic.volume = 0.5;
randomMusic.volume = 0.5;

let currentMusic = null;

const playMusic = (music) => {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    currentMusic = music;
    currentMusic.play();
};

// Función que cambia la carta de pregunta que se muestra, de acuerdo a la casilla del tablero en que
// se encuentre la ficha
function actualizarQuestionCard() {
  let category;
  if(contador > 55) playMusic(endMusic);
  else if (contador % 3 === 2) {
    category = "personal";
    playMusic(personalMusic);
  }
  else if (contador % 7 === 0) {
    category = "azar";
    playMusic(randomMusic);
  } else if (contador % 3 === 1) {
    category = "académico";
    playMusic(academicMusic);   
  } else if (contador % 3 === 0) {
    category = "social";
    playMusic(socialMusic);
  }
  
  let filteredQuestions = preguntas.filter((pregunta) => pregunta.kind === category);  
  // Filtrar las preguntas del jugador
  let playerQuestions = filteredQuestions.filter(pregunta => player.preguntas.includes(pregunta.questionID));
  if (playerQuestions.length > 0) { // Si hay preguntas del personaje, elige una y la borra        
    pregunta_actual = Math.floor(Math.random() * playerQuestions.length);    
    preguntaID = playerQuestions[pregunta_actual].questionID;    
    player.preguntas = player.preguntas.filter(id => id !== preguntaID);  
    pregunta = filteredQuestions.find(p => p.questionID === preguntaID);    
  } else {//Si no hay preguntas del personaje   
    if (turno % god_factor === 0) {//Filtra para ver si hay preguntas de dios
      godQuestions = filteredQuestions.filter((pregunta) =>
        pregunta.options.some((option) => option[necesity] >= 1));
      if (godQuestions.length>0) filteredQuestions=godQuestions;
    } 
    // Seleccionar una pregunta al azar de las filtradas (incluyendo las normales si no hay de "dios")   
    pregunta_actual = Math.floor(Math.random() * filteredQuestions.length); 
    pregunta = filteredQuestions[pregunta_actual];
  }
  // Eliminar la pregunta seleccionada del conjunto global de preguntas
  preguntas = preguntas.filter(p => p.questionID !== pregunta.questionID);  

  document.getElementById("pregunta").innerHTML = "Contexto "+category+":<br><br>"+pregunta.text;
  if (pregunta.kind === "azar") {
    document.getElementById("radioptions").classList.add("hidden");
  } else {
    document.getElementById("radioptions").classList.remove("hidden");    
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
    showExplanation(card);
  }
  pageSound.play();
}

// Función que muestra una explicación a la opción elegida
function showExplanation() {
  deshabilitarBotones();
  let option, option_index;
  if (pregunta.kind === "azar") {
    option_index = 1;
    option = pregunta.options[0];
  } else {
    option_index = document.querySelector(
      'input[type="radio"]:checked'
    ).value;
    option = pregunta.options[option_index - 1];
    let evaluacion = evalua(option);
    if(evaluacion>1) winSound.play();
    else if(evaluacion<-1) incorrectSound.play();
    document.getElementById("radioptions").classList.add("hidden"); 
  }
  // Convertir option_index (1, 2, 3, 4) en A, B, C, D
  let letras = ['A', 'B', 'C', 'D'];
  let letraOpcion = letras[option_index - 1]; // Restamos 1 porque los índices de arrays empiezan en 0  
  registrarRespuesta(pregunta.questionID, letraOpcion); // REGISTRAR LA RESPUESTA
  let evaluacion = `Determinación: ${option.determinacion}
          <br>Alegría: ${option.alegria}
          <br>Apoyo: ${option.apoyo}
          <br>Salud: ${option.salud}
          <br>Dinero: ${option.dinero}
          <br>Tiempo: ${option.tiempo}
      `;
  if (pregunta.kind === "azar") {    
    document.getElementById("explicacion").innerHTML = "<b>A veces, el azar interviene en nuestras vidas sin darnos la oportunidad de elegir:</b> " + option.explicacion + "<br><h2>Evaluación:</h2>" + evaluacion;      
  } else {
    document.getElementById("explicacion").innerHTML = "<b>" + option.text + ":</b> " + option.explicacion + "<br><h2>Evaluación:</h2>" + evaluacion;      
  }
  actualizarPlayer(option);
  actualizarPlayerCard();
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
    if(casillaIndex > 0) {
      ficha.style.width = "4rem";
      ficha.style.height = "5rem";
    }
  }
}

// Función que se activa al darle click al dado
diceImage.addEventListener("click", function () {  
  if (dado_activo) {
    diceSound.play();
    document.getElementById("tablero").src = "img/tablero.webp";
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
          setTimeout(() => {centerBtn();}, 1500);     
        }
      }, i * 500);
    }
    dado_activo = false;
  }
});

//Si el dado está activo muestra el gif animado
diceImage.addEventListener("mouseover", function () {
  verificarAtributos();
  if (dado_activo) diceImage.src = "img/dado-animado.gif";
});

// Función que muestra un mensaje de feedback, de acuerdo a la comparación entre cómo empezo el
// atributo y cómo terminó
function getFeedbackAC(atributo, change) {  
  if (change >= 6) return "¡Excelente! Tu " + atributo + " ha aumentado " + change;
  if (change >= 3) return "Bien hecho. Tu " + atributo + " ha mejorado " + change;
  if (change >= 0) return "Tu " + atributo + " se mantuvo constante: " + change;
  if (change >= -3) return "Tu " + atributo + " ha disminuido ligeramente " + change;
  return "Cuidado, tu " + atributo + " ha disminuido " + change;
}

// Función que solicita el feedback de los atributos del player
function getFeedback() {
  let cadenaBinaria = codificarRespuestas(respuestas);
  let codigoBase64 = binarioABase64(cadenaBinaria);
  document.getElementById("codigoRespuestas").innerText = `Código: ${codigoBase64}`;
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
  var gifElement = document.getElementById("animatedGif");
  gifElement.src = animatedGif;
  gifElement.style.display = "block";
}

function mostrarPerfil() {
  pageSound.play();
  document.getElementById("user_stats").style.display = "block";
  document.getElementById("siguiente").style.display = "none";  
  setTimeout(() => {
    document.getElementById("user_stats").style.display = "none";
    document.getElementById("siguiente").style.display = "block";
  }, 4000);
}

function mostrarPerfilToggle() {
  const tarjeta = document.getElementById("user_stats"); // ID de la tarjeta de atributos
  const boton = document.getElementById("ver-atributos-toggle"); // ID del botón de toggle
  if (!atributosVisibleToggle) {
      tarjeta.style.display = "block"; // Mostrar tarjeta
      boton.innerHTML = "Ocultar Atributos"; // Cambiar texto del botón
      atributosVisibleToggle = true;
  } else {
      tarjeta.style.display = "none"; // Ocultar tarjeta
      boton.innerHTML = "Ver Atributos"; // Cambiar texto del botón
      atributosVisibleToggle = false;
  }
}

// Abre el modal de intercambio
function intercambiarAtributos() {
  // Verificar si la tarjeta de atributos está visible y cerrarla si es así
  if (document.getElementById("user_stats").style.display === "block") {
    mostrarPerfilToggle();
    }
  document.getElementById("intercambio-modal").style.display = "block";
}

// Cierra el modal de intercambio
function cerrarIntercambio() {
  document.getElementById("intercambio-modal").style.display = "none";
}

// Realiza el intercambio de atributos
function realizarIntercambio() {
  const atributoADisminuir = document.getElementById("atributo-a-disminuir").value;
  const atributoAAumentar = document.getElementById("atributo-a-aumentar").value;
  if (atributoADisminuir === atributoAAumentar) {
      alert("No puedes intercambiar el mismo atributo.");
      return;
  }
  // Verificar que el atributo a disminuir tenga al menos 3 puntos
  if (player[atributoADisminuir.toLowerCase()] < 3) {
      alert(`No tienes suficientes puntos en ${atributoADisminuir} para disminuir.`);
      return;
  }
  player[atributoADisminuir.toLowerCase()] -= 2;
  player[atributoAAumentar.toLowerCase()] += 1;  
  cerrarIntercambio();
  actualizarPlayerCard();
  mostrarPerfilToggle();
}

function mostrarModalFinal(atributoPerdido) {
  dado_activo = false;  
  document.getElementById("atributo-perdido").textContent = atributoPerdido;  
  let imagenAtributo = getImagePath();  
  document.getElementById("imagen-perdida").src = imagenAtributo;  
  document.getElementById("modal-final-triste").style.display = "block";
}

function verificarAtributos() {
  if (player.alegria <= 0) {
      mostrarModalFinal("alegria");
  } else if (player.tiempo <= 0) {
      mostrarModalFinal("tiempo");
  } else if (player.dinero <= 0) {
      mostrarModalFinal("dinero");
  } else if (player.salud <= 0) {
      mostrarModalFinal("salud");
  } else if (player.determinacion <= 0) {
      mostrarModalFinal("determinacion");
  } else if (player.apoyo <= 0) {
      mostrarModalFinal("apoyo");
  }
}

function reiniciarJuego() {
  document.getElementById("modal-final-triste").style.display = "none";
  window.location.href = "select_player.html";
}

function codificarRespuestas(respuestas) {
  let cadenaBinaria = '';
  respuestas.forEach((respuesta) => {
    // Convertir número de pregunta a binario (8 bits)
    let preguntaBin = respuesta.pregunta.toString(2).padStart(8, '0');
    // Convertir opción a binario (2 bits)
    let opcionBin = '';
    switch (respuesta.opcion) {
      case 'A': opcionBin = '00'; break;
      case 'B': opcionBin = '01'; break;
      case 'C': opcionBin = '10'; break;
      case 'D': opcionBin = '11'; break;
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
