// Funciones relacionadas con la lógica de juego.
const timerSound = new Audio("sounds/tick.mp3");
const stepsSound = new Audio("sounds/steps.mp3");
const winSound = new Audio("sounds/win.mp3");
const incorrectSound = new Audio("sounds/error_sound.mp3");
const pageSound = new Audio("sounds/change_page.mp3");
const diceSound = new Audio("sounds/dice.mp3");

// === Botón ✕ para cerrar/avanzar (reemplaza "Siguiente") ===
(function(){
  function ensureFriendsCloseX(){
    if (document.getElementById("friendsCloseX")) return;
    const card = document.querySelector(".card") || document.body;
    const btn = document.createElement("button");
    btn.id = "friendsCloseX";
    btn.textContent = "✕";
    btn.setAttribute("aria-label", "Siguiente / cerrar explicación");
    Object.assign(btn.style, {
      position:"absolute", right:"10px", top:"10px",
      border:"1px solid #2a3140", background:"transparent",
      color:"#e6e9ef", borderRadius:"10px", padding:"4px 10px",
      cursor:"pointer", display:"none", zIndex:"100"
    });
    btn.addEventListener("click", function(){
      if (window.__friendsCloseBusy) return;
      window.__friendsCloseBusy = true;
      try {
        // Si existe el botón "Siguiente", aprovechamos su lógica
        var nb = (typeof nextButton !== "undefined") ? nextButton : document.getElementById("nextButton");
        if (nb && typeof nb.click === "function"){
          const wasDisabled = nb.disabled;
          // habilita temporalmente por si estaba deshabilitado
          nb.disabled = false;
          nb.dispatchEvent(new MouseEvent("click", {bubbles:true}));
          // reestablece estado visual (igual lo actualizará la UI de destino)
          nb.disabled = wasDisabled;
        } else {
          // Fallback: cerrar explicación sin avanzar, dejar UI lista
          try { document.getElementById("evaluacion-final").style.display = "none"; } catch(e){}
          try { document.getElementById("explicacion").innerHTML = ""; } catch(e){}
          try { document.getElementById("foto-pregunta").style.display = "block"; } catch(e){}
          try { document.getElementById("radioptions").classList.remove("hidden"); } catch(e){}
          try { habilitarBotones(); } catch(e){}
        }
      } finally {
        // Oculta la X momentáneamente para evitar dobles clics
        try { document.getElementById("friendsCloseX").style.display = "none"; } catch(e){}
        setTimeout(()=>{ window.__friendsCloseBusy = false; }, 500);
      }
    });
    if (card && getComputedStyle(card).position === "static"){
      card.style.position = "relative";
    }
    card.appendChild(btn);

    // ESC actúa como clic en ✕ si está visible
    document.addEventListener("keydown", (ev)=>{
      if (ev.key === "Escape"){
        const x = document.getElementById("friendsCloseX");
        if (x && x.style.display !== "none"){
          ev.preventDefault();
          x.click();
        }
      }
    });
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ensureFriendsCloseX);
  } else {
    ensureFriendsCloseX();
  }

  // Exponer por si necesitamos re-asegurar tras reconstrucciones del DOM
  window.ensureFriendsCloseX = ensureFriendsCloseX;
})();


// Función para cargar una pregunta basada en el tipo seleccionado
function cargarPregunta(category) {
  try { ensureFriendsCloseX(); } catch(e){}
  document.getElementById("explicacion").innerHTML = "";
  document.getElementById("foto-pregunta").style.display = "block";
  document.getElementById("evaluacion-final").style.display = "none";

  let filteredQuestions = preguntas.filter(
    (pregunta) => pregunta.kind === category
  );
  if (necesity) {
    //Filtra las preguntas de dios
    filteredQuestions = filteredQuestions.filter((pregunta) =>
      pregunta.options.some((option) => option[necesity] >= 1)
    );
    necesity = "";
  }
  if (filteredQuestions.length == 0) {
    actualizarContadores();
    return;
  }
  pregunta_actual = Math.floor(Math.random() * filteredQuestions.length);
  pregunta = filteredQuestions[pregunta_actual];
  preguntas.splice(preguntas.indexOf(pregunta), 1);
  document.getElementById("pregunta").innerHTML =
    "Contexto " + category + ":<br><br>" + pregunta.text;

  if (pregunta.kind === "azar") {
    document.getElementById("radioptions").classList.remove("hidden");
    document.getElementById("option1_text").innerHTML = pregunta.options[0].text;
    document.getElementById("option2_text").innerHTML = pregunta.options[1].text;
    document.getElementById("option3_text").innerHTML = "";
    document.getElementById("option4_text").innerHTML = "";
    document.getElementById("option3").style.display = "none";
    document.getElementById("option4").style.display = "none";
  } else {
    document.getElementById("option3").style.display = "inline-block";
    document.getElementById("option4").style.display = "inline-block";
    document.getElementById("radioptions").classList.remove("hidden");
    document.getElementById("option1_text").innerHTML = pregunta.options[0].text;
    document.getElementById("option2_text").innerHTML = pregunta.options[1].text;
    document.getElementById("option3_text").innerHTML = pregunta.options[2].text;
    document.getElementById("option4_text").innerHTML = pregunta.options[3].text;
  }
  document.getElementById("foto-pregunta").src = "img/Preguntas/" + pregunta.imageName + ".webp";
  document.getElementById("foto-pregunta").alt = "img/Preguntas/" + pregunta.imageName + ".webp";

  habilitarBotones();
  if (pregunta.kind === "azar") {
    document.getElementById("instruccionDado").style.display = "block";
  } else {
    document.getElementById("instruccionDado").style.display = "none";
  }

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
  rightBtn();
}

// Función que muestra una explicación a la opción elegida
function showExplanation() {
  deshabilitarBotones();

  
  // Mostrar ✕ en lugar de "Siguiente"
  try { ensureFriendsCloseX(); document.getElementById("friendsCloseX").style.display = "block"; } catch(e){}
  try { if (typeof nextButton !== "undefined" && nextButton) { nextButton.style.display = "none"; nextButton.disabled = true; } } catch(e){}// Ocultar imagen de contexto
  document.getElementById("foto-pregunta").style.display = "none";

  let option;

  let option_index = document.querySelector('input[type="radio"]:checked').value;
  option = pregunta.options[option_index - 1];
  document.getElementById("radioptions").classList.add("hidden");

  // Mostrar retroalimentación
  document.getElementById("explicacion").innerHTML =
    "<br /><b>" +
    option.text +
    ":</b><br /><br /> " +
    option.explicacion +
    "<br /><br />";

  // Mostrar evaluación con íconos
  mostrarEvaluacion({
    determinacion: option.determinacion,
    alegria: option.alegria,
    apoyo: option.apoyo,
    salud: option.salud,
    dinero: option.dinero,
    tiempo: option.tiempo,
  });
}

// Función que deshabilita los botones de las opciones, se llama cuando el usuario ya eligió una opción
function deshabilitarBotones(){
  document.getElementById("option1").disabled = true;
  document.getElementById("option2").disabled = true;
  document.getElementById("option3").disabled = true;
  document.getElementById("option4").disabled = true;
  // nextButton.disabled = false; (reemplazado por ✕)
  // nextButton.style.display = "block"; (reemplazado por ✕)
  document.getElementById("instruccionDado").style.display = "none";  

  try { ensureFriendsCloseX(); document.getElementById("friendsCloseX").style.display = "block"; } catch(e){}
}

// Función que vuelve a habilitar los botones de las opciones, se llama una vez que se puede hacer otra pregunta
function habilitarBotones(){
  document.getElementById("option1").disabled = false;
  document.getElementById("option2").disabled = false;
  document.getElementById("option3").disabled = false;
  document.getElementById("option4").disabled = false;
  try { if (typeof nextButton !== "undefined" && nextButton) nextButton.disabled = true; } catch(e){}
  try { if (typeof nextButton !== "undefined" && nextButton) nextButton.style.display = "none"; } catch(e){}
  document.getElementById("option1").checked = false;
  document.getElementById("option2").checked = false;
  document.getElementById("option3").checked = false;
  document.getElementById("option4").checked = false;  

  try { document.getElementById("friendsCloseX").style.display = "none"; } catch(e){}
}

function godQuestion(atributo) {
  necesity = atributo;
  actualizarContadores();
}

function actualizarContadores() {
  const categorias = ["personal", "social", "académico", "azar"];
  categorias.forEach((categoria) => {
    let filteredQuestions = preguntas.filter(
      (pregunta) => pregunta.kind === categoria
    );
    if (necesity) {
      filteredQuestions = filteredQuestions.filter((pregunta) =>
        pregunta.options.some((option) => option[necesity] >= 1)
      );
    }
    document.getElementById(`${categoria}-count`).innerText =
      filteredQuestions.length;
  });
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

// Inicializar contadores al cargar la página
actualizarContadores();
