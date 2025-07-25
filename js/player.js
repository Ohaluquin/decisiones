// Funciones relacionadas con el jugador.

// Función que actualiza la visualización de la carta del perfil del jugador
function actualizarPlayerCard() {
  let imgElement = document.getElementById("fotoPersonaje");
  let newImgElement = document.getElementById("fotoPersonaje-nueva");
  // Set the source of the new image element to the new image, and make it visible.
  newImgElement.src = getImagePath();
  newImgElement.style.opacity = 1;
  document.getElementById("letreroImagen").innerHTML = "" + letreroImagen;
  document.getElementById("determinacion").innerText = player.determinacion;    
  document.getElementById("alegria").innerText = player.alegria;
  document.getElementById("apoyo").innerText = player.apoyo;
  document.getElementById("salud").innerText = player.salud;
  document.getElementById("dinero").innerText = player.dinero;
  document.getElementById("tiempo").innerText = player.tiempo;
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
      imageName: "medium_average.webp",
      determinacion: personajeElegido.determinacion,
      alegria: personajeElegido.alegria,
      apoyo: personajeElegido.apoyo,
      salud: personajeElegido.salud,
      dinero: personajeElegido.dinero,
      tiempo: personajeElegido.tiempo,
      rutaImagen: personajeElegido.rutaImagen,
      preguntas: personajeElegido.preguntas,
      nickname: localStorage.getItem("nombrePersonaje"),
      historia: personajeElegido.historia,
      categorias: personajeElegido.categorias,
    };
    animatedGif = "img/personajes/" + player.rutaImagen + "/" + "animated.gif"; //getImagePath();
    actualizarPlayerCard();
  }
}

function evalua(option) {
  return option.determinacion + option.alegria + option.apoyo + option.salud + option.dinero + option.tiempo;
}

// Función que actualiza los atributos del jugador después de responder una pregunta
function actualizarPlayer(option) {
  oldImage = player.imageName;
  // Actualizar los atributos del jugador
  player.determinacion += option.determinacion;
  player.alegria += option.alegria;
  player.apoyo += option.apoyo;
  player.salud += option.salud;
  player.dinero += option.dinero;
  player.tiempo += option.tiempo;  
  player.imageName = getImageName(player.determinacion, player.alegria, player.apoyo,
     player.salud, player.dinero, player.tiempo);
  if(oldImage == player.imageName) {
     player.imageName =getImageName(5+option.determinacion, 5+option.alegria, 
      5+option.apoyo, 5+option.salud, 5+option.dinero, 5+option.tiempo);
     }
}

// Función que elige una nueva imágen de acuerdo a los atributos que tenga le jugador
function getImageName(atributo1, atributo2, atributo3, atributo4, atributo5, atributo6) {
  // Encuentra el atributo con el valor más bajo
  let minimo = Math.min(Math.min(Math.min(Math.min(Math.min
    (atributo1, atributo2), atributo3), atributo4), atributo5), atributo6);
  // Si el valor mínimo es menor que 3, devuelve el nombre correspondiente al atributo
  if (minimo < 4) {
    if (minimo == atributo1) {
      necesity = "determinacion";
      letreroImagen = "Indecis@"
      return "low_determinacion.webp";
    } else if (minimo == atributo2) {
      necesity = "alegria";
      letreroImagen = "Triste";
      return "low_alegria.webp";
    } else if (minimo == atributo3) {
      necesity = "apoyo";
      letreroImagen = "Aislad@";
      return "low_apoyo.webp";
    } else if (minimo == atributo4) {
      necesity = "salud";
      letreroImagen = "Enferm@";
      return "low_salud.webp";
    } else if (minimo == atributo5) {
      necesity = "dinero";
      letreroImagen = "Pobre";
      return "low_dinero.webp";
    } else {
      necesity = "tiempo";
      letreroImagen = "Apurad@";
      return "low_tiempo.webp";
    }
  }
  // Encuentra el atributo con el valor más alto
  let maximo = Math.max(Math.max(Math.max(Math.max(Math.max(
    atributo1, atributo2), atributo3), atributo4), atributo5), atributo6);
  // Si el valor máximo es mayor que 7, devuelve el nombre correspondiente al atributo con un prefijo de "high_"
  if (maximo > 8) {
    if (maximo == atributo1) {
      letreroImagen = "Determinad@";
      return "high_determinacion.webp";
    } else if (maximo == atributo2) {
      letreroImagen = "Alegre";
      return "high_alegria.webp";
    } else if (maximo == atributo3) {
      letreroImagen = "Apoyad@";
      return "high_apoyo.webp";
    } else if (maximo == atributo4) {
      letreroImagen = "Saludable";
      return "high_salud.webp";
    } else if (maximo == atributo5) {
      letreroImagen = "Adinerad@";
      return "high_dinero.webp";
    } else {
      letreroImagen = "Libre";
      return "high_tiempo.webp";
    }
  }
  // Calcula el valor promedio de los atributos
  let promedio =
    (atributo1 + atributo2 + atributo3 + atributo4 + atributo5 + atributo6) /
    6.0;
  // Si el valor promedio es mayor o igual a cierto umbral, devuelve un nombre específico. De lo contrario, devuelve otro nombre.
  if (promedio >= 6) {
    letreroImagen = "Bien";
    return "high_average.webp";
  } else if (promedio >= 5) {
    letreroImagen = "Regular";
    return "medium_average.webp";
  } else {
    letreroImagen = "Mal";
    return "low_average.webp";
  }
}

// Función que regresa el nombre de la imagen uniendo ruta + nombre_personaje + estado_atributos_jugador
 function getImagePath() {
  return "img/personajes/" + player.rutaImagen + "/" + player.imageName;
}

// Función que regresa el nombre de la imagen uniendo ruta + nombre_personaje + estado_atributos_jugador
function getFicha() {
  return "img/personajes/" + player.rutaImagen + "/ficha.gif";
}

// Muestra momentaneamente el valor de la evaluacion del elemento en la barra de progreso del atributo
function mostrarValor(atributo, valor) {
  var span = document.getElementById(atributo);
  if (valor > 0) {
    span.style.color = "green";    
  } else if (valor < 0) {
    span.style.color = "red";    
  } else {
    span.style.color = "black";    
  }
}
