// Funciones relacionadas con el jugador.

// Función que actualiza la visualización de la carta del perfil del jugador
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
  document.getElementById("letreroImagen").innerHTML = letreroImagen;
  // After 1 second (the duration of the transition), set the source of the original image element
  // to the new image, make it visible, and hide the new image element.
  setTimeout(function () {
    imgElement.src = animatedGif;
    imgElement.style.opacity = 1;
    newImgElement.style.opacity = 0;
  }, 6000);
}

// Función que cambia de color las barras de atributos del personaje
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

// Función que lee los datos del personaje elegido, crea el player y llama a que se visualice la tarjeta del perfil del jugador
function cargarPlayer() {
  const ID = localStorage.getItem("personaje_index"); // Obtener el índice del personaje elegido desde localStorage
  let personajeElegido = null;
  if (ID !== null) { // Verificar si el índice existe
    for (i = 0; i < personajes.length; i++) { 
      if (personajes[i].personajeID == ID) {
        personajeElegido = personajes[i];
        break;
      }
    }
    if (personajeElegido === null) return;
    player = { // Crear el objeto player con los datos necesarios
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

  // Función que actualiza los atributos del jugador después de responder una pregunta
function actualizarPlayer(option) {
  // Actualizar los atributos del jugador
  player.determinacion += option.determinacion;
  player.alegria += option.alegria;
  player.apoyo += option.apoyo;
  player.salud += option.salud;
  player.dinero += option.dinero;
  player.tiempo += option.tiempo;
  player.imageName = getImageName( // Obtener el nuevo nombre de la imagen
    player.determinacion,
    player.alegria,
    player.apoyo,
    player.salud,
    player.dinero,
    player.tiempo
  );
}

// Función que elige una nueva imágen de acuerdo a los atributos que tenga le jugador
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
      necesity = "determinacion";
      letreroImagen = "Indecis@"
      return "low_determinacion.png";
    } else if (minimo == atributo2) {
      necesity = "alegria";
      letreroImagen = "Triste";
      return "low_alegria.png";
    } else if (minimo == atributo3) {
      necesity = "apoyo";
      letreroImagen = "Aislad@";
      return "low_apoyo.png";
    } else if (minimo == atributo4) {
      necesity = "salud";
      letreroImagen = "Enferm@";
      return "low_salud.png";
    } else if (minimo == atributo5) {
      necesity = "dinero";
      letreroImagen = "Pobre";
      return "low_dinero.png";
    } else {
      necesity = "tiempo";
      letreroImagen = "Apurad@";
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
  // Si el valor máximo es mayor que 12, devuelve el nombre correspondiente al atributo con un prefijo de "high_"
  if (maximo > 12) {
    if (maximo == atributo1) {
      letreroImagen = "Determinad@";
      return "high_determinacion.png";
    } else if (maximo == atributo2) {
      letreroImagen = "Alegre";
      return "high_alegria.png";
    } else if (maximo == atributo3) {
      letreroImagen = "Apoyad@";
      return "high_apoyo.png";
    } else if (maximo == atributo4) {
      letreroImagen = "Saludable";
      return "high_salud.png";
    } else if (maximo == atributo5) {
      letreroImagen = "Adinerad@";
      return "high_dinero.png";
    } else {
      letreroImagen = "Libre";
      return "high_tiempo.png";
    }
  }
  // Calcula el valor promedio de los atributos
  let promedio =
    (atributo1 + atributo2 + atributo3 + atributo4 + atributo5 + atributo6) /
    6.0;
  // Si el valor promedio es mayor o igual a cierto umbral, devuelve un nombre específico. De lo contrario, devuelve otro nombre.
  if (promedio >= 10) {
    letreroImagen = "Bien";
    return "high_average.png";
  } else if (promedio >= 8) {
    letreroImagen = "Regular";
    return "medium_average.png";
  } else {
    letreroImagen = "Mal";
    return "low_average.png";
  }
}

// Función que regresa el nombre de la imagen uniendo ruta + nombre_personaje + estado_atributos_jugador
 function getImagePath() {
  return "img/personajes/" + player.rutaImagen + "/" + player.imageName;
}

// Muestra momentaneamente el valor de la evaluacion del elemento en la barra de progreso del atributo
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