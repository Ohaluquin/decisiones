// Evento que se dispara cuando el contenido del DOM está completamente cargado.
document.addEventListener("DOMContentLoaded", function () {
  inicio();
  mostrarHistoria();
});

// Función que se ejectua al inicio
async function inicio() {
  await cargarPlayer();
  // Hacer una copia del estado inicial del jugador
  initialDetermination = player.determinacion;
  initialAlegria = player.alegria;
  initialApoyo = player.apoyo;
  initialSalud = player.salud;
  initialTiempo = player.tiempo;
  initialDinero = player.dinero;  
}