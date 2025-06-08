document.addEventListener("DOMContentLoaded", function() {
  inicio();
});

let personaje = 0;

async function inicio() {
  cargarNombre();
  cambiarPersonaje(personajes[personaje].rutaImagen);
}

function cambiarPersonaje(src) {
  personaje = personajes.find((p) => p.rutaImagen == src);
  document.getElementById("sel_personaje").src = "img/personajes/" + src + "/medium_average.webp";
  document.getElementById("determinacion").value = personaje.determinacion;
  document.getElementById("alegria").value = personaje.alegria;
  document.getElementById("apoyo").value = personaje.apoyo;
  document.getElementById("salud").value = personaje.salud;
  document.getElementById("dinero").value = personaje.dinero;
  document.getElementById("tiempo").value = personaje.tiempo;
  actualizarColorProgress("determinacion");
  actualizarColorProgress("alegria");
  actualizarColorProgress("apoyo");
  actualizarColorProgress("salud");
  actualizarColorProgress("dinero");
  actualizarColorProgress("tiempo");
  if (window.matchMedia("(max-width: 600px)").matches) { // La pantalla tiene un ancho máximo de 600px
    rightBtn();
  }
}

function actualizarColorProgress(atributo) {
  document.getElementById(atributo).value = personaje[atributo];
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

function guardarNombre(nombre) {
  localStorage.setItem('nombrePersonaje', nombre);
}

function cargarNombre() {
  const nombre = localStorage.getItem('nombrePersonaje');
  if (nombre) {
    document.getElementById('nombre').innerHTML = nombre;
  }
}

function editarNombre() {
  const nombre = document.getElementById('nombreInput').value;
  guardarNombre(nombre);
  cargarNombre();
}

function guardar() {
  localStorage.setItem("personaje_index", personaje.personajeID);
  window.location.replace("principal.html");
}
