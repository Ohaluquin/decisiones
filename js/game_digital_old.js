// FILE: js/game_digital.js
(() => {
  const ROWS = 6,
    COLS = 6;
  const ATTRS = [
    "salud",
    "alegria",
    "apoyo",
    "determinacion",
    "tiempo",
    "dinero",
  ];
  const COLORS = [
    "#e03131",
    "#0863ebff",
    "#0aab28ff",
    "#fd7e14",
    "#845ef7",
    "#f1c30bff",
  ];
  const TILE_KINDS = {
    INICIO: "inicio",
    SOCIAL: "social",
    ACADEMICO: "academico",
    PERSONAL: "personal",
    AZAR: "azar",
  };
  const TILE_CLASS = {
    inicio: "inicio",
    social: "social",
    academico: "academico",
    personal: "personal",
    azar: "azar",
  };

  // DOM
  const boardEl = document.getElementById("board");
  const pawnsLayer = document.getElementById("pawns");
  const playersEl = document.getElementById("players");
  const confirmBtn = document.getElementById("confirmRoll");
  const diceValueEl = document.getElementById("diceValue");
  const turnLabel = document.getElementById("turnLabel");
  const roundLabel = document.getElementById("roundLabel");
  const logEl = document.getElementById("log");
  const qModal = document.getElementById("qModal");
  const qTitle = document.getElementById("qTitle");
  const qKind = document.getElementById("qKind");
  const qText = document.getElementById("qText");
  const qOpts = document.getElementById("qOpts");
  const qImg = document.getElementById("qImg");
  
  // ===== Animación de peones (estilo v3, suave) =====
  const STEP_MS = 240; // duración por paso
  const EASE    = 'cubic-bezier(.2,.8,.2,1)'; // ease-out con punch

  // ---- Fallback de notificaciones (solo si no existen) ----
  if (typeof window.log !== "function") {
    window.ensureLogArea = function() {
      var el = document.getElementById("log");
      if (el) return el;
      var panel = document.querySelector(".side .panel");
      el = document.createElement("div");
      el.id = "log"; el.className = "log"; el.style.display = "none";
      el.setAttribute("aria-live","polite");
      (panel || document.body).appendChild(el);
      return el;
    };
    window.log = function(msg){ var el=ensureLogArea(); el.innerHTML=msg; el.style.display="block"; };
    window.clearLog = function(){ var el=ensureLogArea(); el.innerHTML=""; el.style.display="none"; };
  }

  // Helpers comunes
function iconForAttr(attr){
  switch((attr||'').toLowerCase()){
    case 'determinacion': return '🧭';
    case 'alegria': return '😊';
    case 'apoyo': return '🤝';
    case 'salud': return '❤️';
    case 'dinero': return '💵';
    case 'tiempo': return '⏳';
    default: return '🔁';
  }
}
function labelAttr(attr){
  const m = {salud:'Salud', alegria:'Alegría', apoyo:'Apoyo', determinacion:'Determinación', tiempo:'Tiempo', dinero:'Dinero'};
  return m[(attr||'').toLowerCase()] || attr;
}

function fmtDelta(n){ return n>0 ? `+${n}` : String(n); }

// ===== Modal único para Intercambio / Eliminación =====
function ensureExchangeModal(){
  let css = document.getElementById("exchg-modal-css");
  if(!css){
    css = document.createElement("style");
    css.id = "exchg-modal-css";
    css.textContent = `
    dialog.exchg { border:0; border-radius:16px; background:#0f131c; color:#e6e9ef; box-shadow:0 24px 80px rgba(0,0,0,.65); max-width:560px; width:calc(100% - 32px); padding:0; }
    .exchg .hd { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #232733; }
    .exchg .hd h3 { margin:0; font-size:18px; }
    .exchg .bd { padding:14px 16px; display:grid; gap:12px; }
    .exchg .ft { display:flex; gap:10px; justify-content:flex-end; padding:14px 16px; border-top:1px solid #232733; }
    .pill { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; background:#151b27; border:1px solid #2a3140; font-weight:700; }
    .delta.plus{ color:#51cf66; } .delta.minus{ color:#f03e3e; }
    .muted{ color:#9aa3b2; } .row{ display:flex; align-items:center; gap:10px; } .arrow{ opacity:.6; }
    .btn{ appearance:none; border:none; border-radius:12px; padding:10px 14px; font-weight:800; cursor:pointer; }
    .btn.primary{ background:linear-gradient(180deg,#14b8a6,#10938a); color:#fff; }
    .btn.ghost{ background:transparent; color:#e6e9ef; border:1px solid #2a3140; }
    `;
    document.head.appendChild(css);
  }  
  let dlg = document.getElementById("exchg-modal");
  if(!dlg){
    dlg = document.createElement("dialog");
    dlg.id = "exchg-modal";
    dlg.className = "exchg";
    dlg.innerHTML = `
      <div class="hd"><h3 id="exchg-title">Intercambio de emergencia</h3>
        <button class="btn ghost" id="exchg-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="bd" id="exchg-body"></div>
      <div class="ft"><button class="btn primary" id="exchg-ok">Continuar</button></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector("#exchg-close").onclick = ()=> dlg.close();
    dlg.querySelector("#exchg-ok").onclick = ()=> dlg.close();
    dlg.addEventListener("cancel", (e)=>{ e.preventDefault(); dlg.close(); });
  }
  return dlg;
}

function waitClose(dlg){
  return new Promise(res => dlg.addEventListener('close', () => res(), {once:true}));
}

// --- API limpia a usar ---
async function showEmergencyExchange(payload){
  const {fromName, operations, give, receive, reason} = payload || {};
  const dlg = ensureExchangeModal();
  dlg.querySelector("#exchg-title").textContent = "Intercambio de emergencia";
  let rowsHtml = "";
  const ops = Array.isArray(operations) && operations.length ? operations : [{give, receive}];
  rowsHtml = ops.map(op => {
    const g = op?.give, r = op?.receive;
    return `<div class="row">
      <span class="pill"><span>${iconForAttr(g?.attr)}</span>${labelAttr(g?.attr)} <span class="delta minus">${fmtDelta(g?.delta ?? -2)}</span></span>
      <span class="arrow">→</span>
      <span class="pill"><span>${iconForAttr(r?.attr)}</span>${labelAttr(r?.attr)} <span class="delta plus">${fmtDelta(r?.delta ?? +1)}</span></span>
    </div>`;
  }).join("");
  dlg.querySelector("#exchg-body").innerHTML = `
    <div class="muted">Se aplicó intercambio de emergencia para mantener al menos 1 en todos los atributos.</div>
    ${rowsHtml}
    ${reason ? `<div class="muted">Motivo: ${reason}</div>` : ""}`;
  dlg.showModal();
  try { log(`Intercambio de emergencia: ${fromName||''}`); } catch(e){}
  await waitClose(dlg);
}

async function showEmergencyElimination(payload){
  const {fromName, reason} = payload || {};
  const dlg = ensureExchangeModal();
  dlg.querySelector("#exchg-title").textContent = "Jugador eliminado";
  dlg.querySelector("#exchg-body").innerHTML = `
    <div><strong>${fromName||'El jugador'}</strong> no pudo completar los intercambios de emergencia requeridos y <strong>queda eliminado</strong>.</div>
    ${reason ? `<div class="muted" style="margin-top:6px">${reason}</div>` : ""}`;
  dlg.showModal();
  try { log(`Eliminado: ${fromName||''}. ${reason||''}`); } catch(e){}
  await waitClose(dlg);
}

// --- Aliases por compatibilidad (si en algún lado los llamabas) ---
window.notifyEmergencyExchange        = showEmergencyExchange;
window.notifyEmergencyExchangeDenied  = showEmergencyElimination;

  // Estado
  const Game = {
    players: [],
    turnIdx: 0,
    round: 1,
    lastDice: 1,
    busy: false,
    positions: new Map(),
    pawns: new Map(),
    centers: [],
    types: [],
    spiral: [],
  };

  // ===== Utilidades =====
  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  // Fuente de preguntas compatible con: let preguntas = [...]  (o window.preguntas)
  function qsrc() {
    try {
      if (typeof preguntas !== "undefined" && Array.isArray(preguntas))
        return preguntas;
    } catch (e) {}
    if (Array.isArray(window.preguntas)) return window.preguntas;
    if (window.database && Array.isArray(window.database.preguntas))
      return window.database.preguntas;
    return [];
  }
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }    

  // ===== Tablero =====
  function spiralOrder(rows, cols) {
    const path = [];
    let t = 0,
      b = rows - 1,
      l = 0,
      r = cols - 1;
    while (t <= b && l <= r) {
      for (let j = l; j <= r; j++) path.push([t, j]);
      t++;
      for (let i = t; i <= b; i++) path.push([i, r]);
      r--;
      if (t <= b) {
        for (let j = r; j >= l; j--) path.push([b, j]);
        b--;
      }
      if (l <= r) {
        for (let i = b; i >= t; i--) path.push([i, l]);
        l++;
      }
    }
    return path;
  }

  function drawBoard() {
    boardEl.innerHTML = "";
    const idxOf = new Map();
    Game.spiral.forEach((rc, i) => idxOf.set(rc.join(","), i));
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const spIdx = idxOf.get(`${r},${c}`);
        const kind = Game.types[spIdx];
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.classList.add(TILE_CLASS[kind]);
        tile.dataset.idx = spIdx;
        tile.innerHTML = `<span>${
          kind === TILE_KINDS.INICIO ? "INICIO" : kind.toUpperCase()
        }</span><span class="idx">${spIdx}</span>`;
        boardEl.appendChild(tile);
      }
    }
    computeCentersAndReposition();
  }

  function computeCentersAndReposition() {
    const tiles = [...boardEl.children];
    if (!tiles.length) return;

    // tile size
    const cellW = tiles[0].getBoundingClientRect().width;
    const cellH = tiles[0].getBoundingClientRect().height;
    Game.cellW = cellW;
    Game.cellH = cellH;

    // grid gaps
    const cs = getComputedStyle(boardEl);
    const rowGap = parseFloat(cs.rowGap || cs.gap || 0) || 0;
    const colGap = parseFloat(cs.columnGap || cs.gap || 0) || 0;
    Game.rowGap = rowGap;
    Game.colGap = colGap;    

    // centers using gaps
    const posByIdx = new Map();
    Game.spiral.forEach((rc, i) => posByIdx.set(i, rc));
    Game.centers = [];
    for (let i = 0; i < Game.spiral.length; i++) {
      const [r, c] = posByIdx.get(i);
      const x = c * (cellW + colGap) + cellW / 2;
      const y = r * (cellH + rowGap) + cellH / 2;
      Game.centers[i] = { x, y };
    }

    // Reposition pawns instantly
    Game.players.forEach((p) =>
      placePawn(p.id, Game.positions.get(p.id) || 0, true)
    );

    // Draw connectors after centers are known
    ensurePathLayer();
    drawConnectors();

    // Reposicionar peones instantáneo
    Game.players.forEach((p) =>
      placePawn(p.id, Game.positions.get(p.id) || 0, true)
    );
  }

  
  function initPawns() {
    pawnsLayer.innerHTML = "";
    Game.players.forEach((p) => {
      Game.positions.set(p.id, 0);
      const dot = document.createElement("div");
      dot.className = "pawn";
      dot.style.background = p.color;
      dot.style.left = "0px";
      dot.style.top  = "0px";
      dot.style.transform = "translate3d(0,0,0)";
      dot.style.transition = `transform ${STEP_MS}ms ${EASE}`;
      dot.style.willChange = "transform";
      pawnsLayer.appendChild(dot);
      Game.pawns.set(p.id, dot);
      placePawn(p.id, 0, true);
    });
  }

    function jitter(pid) {
    const i = pid % 6,
      d = 12;
    const ofs = [
      [-3*d, -d],
      [-3*d, d],
      [0, -d],
      [0, d],
      [3*d, -d],
      [3*d, d],
    ][i];
    return { x: ofs[0], y: ofs[1] };
  }

  
  function placePawn(pid, idx, instant = false) {
    const pt = Game.centers[idx];
    if (!pt) return;
    const el = Game.pawns.get(pid);
    if (!el) return;
    const j = jitter(pid);
    const x = pt.x - 11 + j.x;
    const y = pt.y - 11 + j.y;

    if (instant) {
      const prev = el.style.transition;
      el.style.transition = "none";
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      void el.offsetWidth;
      el.style.transition = prev || `transform ${STEP_MS}ms ${EASE}`;
    } else {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }

  // ===== Juego =====
  function init() {
    // Siempre 6 jugadores; si sobran, los retiras con ⏏︎
    const names = ["J1", "J2", "J3", "J4", "J5", "J6"];
    Game.players = names.map((n, i) => ({
      id: i,
      name: n,
      color: COLORS[i % COLORS.length],
      attrs: {
        salud: 3,
        alegria: 3,
        apoyo: 3,
        determinacion: 3,
        tiempo: 3,
        dinero: 3,
      },
    }));

    Game.spiral = spiralOrder(ROWS, COLS);
    const base = [
      TILE_KINDS.PERSONAL,
      TILE_KINDS.ACADEMICO,
      TILE_KINDS.PERSONAL,
      TILE_KINDS.SOCIAL,
      TILE_KINDS.PERSONAL,
      TILE_KINDS.ACADEMICO,
      TILE_KINDS.AZAR,
      TILE_KINDS.PERSONAL,
      TILE_KINDS.ACADEMICO,
      TILE_KINDS.SOCIAL,
    ];
    Game.types = Array(Game.spiral.length)
      .fill(null)
      .map((_, i) => base[i % base.length]);
    Game.types[0] = TILE_KINDS.INICIO;

    drawBoard();
    initPawns();
    renderPlayers();
    updateTurnLabel();

    // Logs de verificación de preguntas (como pediste)
    const _all = qsrc();    

    confirmBtn.addEventListener("click", onConfirmRoll);
    window.addEventListener("resize", computeCentersAndReposition);
  }


  function onConfirmRoll() {
    if (Game.busy) return;
    Game.busy = true;
    try { clearLog(); } catch(e) {}
    if (typeof confirmBtn !== 'undefined' && confirmBtn) confirmBtn.disabled = true;

    const steps = parseInt(diceValueEl && diceValueEl.value, 10) || 1;
    Game.lastDice = steps;
    const p = Game.players[Game.turnIdx];
    movePawn(p.id, steps);
  }

  async function movePawn(pid, steps) {
    let idx = Game.positions.get(pid) || 0;
    for (let s = 0; s < steps; s++) {
      idx = (idx + 1) % Game.spiral.length;
      placePawn(pid, idx);
      await sleep(STEP_MS);
    }
    Game.positions.set(pid, idx);
    onLand(pid, idx);
  }

  function onLand(pid, idx) {
    const kind = Game.types[idx];
    const player = Game.players.find((p) => p.id === pid);

    if (kind === TILE_KINDS.INICIO) {
      log(`${player.name} está en INICIO.`);
      nextTurn();
      return;
    }
    if (kind === TILE_KINDS.AZAR) {
      // Igual que el híbrido: pregunta de AZAR con dado par/non
      askQuestion("azar", player, true);
      return;
    }
    // Resto de categorías → pregunta normal
    askQuestion(kind, player, false);
  }

  // ===== Preguntas (estilo híbrido, sin auto-cerrar) =====
  function askQuestion(kind, player, esAzar) {
    const pool = qsrc().filter(
      (q) => normalize(q.kind || q.tipo) === normalize(kind)
    );    

    if (!pool.length) {
      log(`(No hay preguntas de tipo ${kind})`);
      nextTurn();
      return;
    }
    const q = pool[Math.floor(Math.random() * pool.length)];
    const kNorm = normalize(q.kind || kind);
    qModal.setAttribute("data-kind", kNorm);

    // Pergamino dentro del <dialog>
    //qTitle.textContent = `Pregunta para ${player.name}`;
    //qKind.textContent = (q.kind || kind).toUpperCase();
    qText.innerHTML = q.text || "…";
    qImg.src = `img/Preguntas/${q.imageName || "inicio"}.webp`;

    qOpts.innerHTML = `
        <div id=\"instruccionDado\" class=\"hidden\" style=\"color: white\">Lanza el dado para obtener PAR (selecciona opción de arriba) o NON (selecciona opción de abajo)</div>
      </div>
      <div id=\"radioptions\" class=\"opciones-marcadas\">
        <label><input type=\"radio\" id=\"option1\" name=\"option\" value=\"1\" /> <span id=\"option1_text\"></span></label><br />
        <label><input type=\"radio\" id=\"option2\" name=\"option\" value=\"2\" /> <span id=\"option2_text\"></span></label><br />
        <label id=\"opt3wrap\"><input type=\"radio\" id=\"option3\" name=\"option\" value=\"3\" /> <span id=\"option3_text\"></span></label><br />
        <label id=\"opt4wrap\"><input type=\"radio\" id=\"option4\" name=\"option\" value=\"4\" /> <span id=\"option4_text\"></span></label><br />
      </div>
      <p id=\"explicacion\" class=\"explicacion-pergamino\"></p>
      <div id=\"evaluacion-final\" class=\"evaluacion\" style=\"display:none\">
        <h3>Evaluación:</h3>
        <div class=\"atributos-evaluacion\">
          <div class=\"atributo\"><img src=\"img/Iconos/determinacion.webp\" alt=\"Determinación\" /><span id=\"eva-det\">0</span></div>
          <div class=\"atributo\"><img src=\"img/Iconos/alegria.webp\"       alt=\"Alegría\"       /><span id=\"eva-ale\">0</span></div>
          <div class=\"atributo\"><img src=\"img/Iconos/apoyo.webp\"         alt=\"Apoyo\"         /><span id=\"eva-apo\">0</span></div>
          <div class=\"atributo\"><img src=\"img/Iconos/salud.webp\"         alt=\"Salud\"         /><span id=\"eva-sal\">0</span></div>
          <div class=\"atributo\"><img src=\"img/Iconos/dinero.webp\"        alt=\"Dinero\"        /><span id=\"eva-din\">0</span></div>
          <div class=\"atributo\"><img src=\"img/Iconos/tiempo.webp\"        alt=\"Tiempo\"        /><span id=\"eva-tie\">0</span></div>
        </div>
      </div>
      <div class=\"actions\" style=\"display:flex; gap:8px; margin-top:10px\">
        <button id=\"btnResponder\" class=\"primary\" disabled>Responder</button>
        <button id=\"btnSiguiente\" style=\"display:none\">Siguiente ▶</button>
      </div>
    `;

    const setTxt = (i, txt) => {
      const lab = document.getElementById(`option${i}_text`);
      const wrapId = i === 3 ? "opt3wrap" : i === 4 ? "opt4wrap" : null;
      const wrap = wrapId ? document.getElementById(wrapId) : null;
      const inp = document.getElementById(`option${i}`);
      if (!txt) {
        if (wrap) wrap.style.display = "none";
        if (inp && inp.parentElement && !wrap)
          inp.parentElement.style.display = "none";
      } else {
        if (lab) lab.textContent = txt;
      }
    };

    if (esAzar) {
      setTxt(1, q.options?.[0]?.text || "Opción A");
      setTxt(2, q.options?.[1]?.text || "Opción B");
      setTxt(3, null);
      setTxt(4, null);
    } else {
      setTxt(1, q.options?.[0]?.text || null);
      setTxt(2, q.options?.[1]?.text || null);
      setTxt(3, q.options?.[2]?.text || null);
      setTxt(4, q.options?.[3]?.text || null);
    }

    const radios = qOpts.querySelectorAll('input[type="radio"]');
    const btnResponder = document.getElementById("btnResponder");
    const btnSiguiente = document.getElementById("btnSiguiente");

    radios.forEach((r) =>
      r.addEventListener("change", () => {
        btnResponder.disabled = false;
      })
    );

    if (esAzar) {
      document.getElementById("instruccionDado").style.display = "inline-block";
    }
    else {
      document.getElementById("instruccionDado").style.display = "none";
    }

    btnResponder.addEventListener("click", () => {
      const checked = qOpts.querySelector('input[type="radio"]:checked');
      if (!checked) return;
      const idx = parseInt(checked.value, 10) - 1;
      const op = q.options[idx];

      const radiosWrap = document.getElementById("radioptions");
      if (radiosWrap) radiosWrap.classList.add("hidden");
      
      const exp = document.getElementById("explicacion");
      exp.innerHTML = esAzar
        ? `<b>Azar:</b> ${op.explicacion || ""}`
        : `<b>${op.text}:</b> ${op.explicacion || ""}`;

      const evaDiv = document.getElementById("evaluacion-final");
      evaDiv.style.display = "block";
      const set = (id, val) => {
        const s = document.getElementById(id);
        if (!s) return;
        s.innerText = val;
        s.style.color = val > 0 ? "green" : val < 0 ? "red" : "#e6e9ef";
      };

      const eva = {
        determinacion: op.determinacion || 0,
        alegria: op.alegria || 0,
        apoyo: op.apoyo || 0,
        salud: op.salud || 0,
        dinero: op.dinero || 0,
        tiempo: op.tiempo || 0,
      };
      set("eva-det", eva.determinacion);
      set("eva-ale", eva.alegria);
      set("eva-apo", eva.apoyo);
      set("eva-sal", eva.salud);
      set("eva-din", eva.dinero);
      set("eva-tie", eva.tiempo);

      [
        "determinacion",
        "alegria",
        "apoyo",
        "salud",
        "dinero",
        "tiempo",
      ].forEach((k) => (player.attrs[k] += eva[k] || 0));
      renderPlayers();

      
      // Intercambio automático si quedaron atributos en 0
      const ex = checkExchangeOrLose(player);
      renderPlayers();
      if (ex && ex.swaps && ex.swaps.length) {
        //log(`${player.name} realizó un intercambio de emergencia.`);        
        showEmergencyExchange({fromName: player.name, operations: ex.operations,
          reason: "Restablecer atributos mínimos tras la pregunta"});
        }
      if (ex && ex.lost) {
        //log(`${player.name} no puede intercambiar: queda <b>eliminado</b>.`);
        showEmergencyElimination({fromName: player.name, reason: ex.reason || "No tenía suficientes fichas para completar los intercambios necesarios"});
        // El jugador pierde: retirarlo y cerrar modal
        const idxJugador = Game.players.indexOf(player);
        if (idxJugador !== -1) retirarPlayer(idxJugador);
        try { qModal.close(); } catch(e) {}
        //nextTurn();
        Game.busy = false;
        if (typeof confirmBtn !== 'undefined' && confirmBtn) confirmBtn.disabled = false;
        updateTurnLabel();
        return;
      }
      btnResponder.disabled = true;
      btnSiguiente.style.display = "inline-block";
      btnSiguiente.focus();
    });

    btnSiguiente.addEventListener("click", () => {
      qModal.close();
      nextTurn();
    });

    qModal.showModal();
  }

// ===== Intercambio automático tras evaluación =====
function checkExchangeOrLose(player) {
  const safe = (v) => (typeof v === "number" ? v : 0);
  const ORDER = ["salud","alegria","apoyo","determinacion","tiempo","dinero"];
  const swaps = [];
  const operations = [];
  for (let guard = 0; guard < 24; guard++) {
    const faltantes = ORDER.filter((k) => safe(player.attrs[k]) <= 0);
    if (!faltantes.length) break;

    for (const faltante of faltantes) {
      const donantes = ORDER
        .filter((k) => k !== faltante && safe(player.attrs[k]) >= 2)
        .sort((a, b) => safe(player.attrs[b]) - safe(player.attrs[a]));

      if (!donantes.length) {
        return { lost: true, swaps, operations };
      }
      const d = donantes[0];
      player.attrs[d] = safe(player.attrs[d]) - 2;
      player.attrs[faltante] = safe(player.attrs[faltante]) + 1;
      swaps.push(`${player.name} intercambia <b>2</b> de <b>${labelAttr(d)}</b> por <b>1</b> de <b>${labelAttr(faltante)}</b>.`);
      operations.push({ give: { attr: d, delta: -2 }, receive: { attr: faltante, delta: +1 } });
    }
  }
  return { lost: false, swaps, operations };
};


  function nextTurn() {
    Game.turnIdx = (Game.turnIdx + 1) % Game.players.length;
    if (Game.turnIdx === 0) Game.round++;
    updateTurnLabel();
    Game.busy = false;
    confirmBtn.disabled = false;
  }

  function updateTurnLabel() {
    const p = Game.players[Game.turnIdx];
    turnLabel.textContent = `${p.name}`;
    roundLabel.textContent = `Ronda ${Game.round}`;
    highlight();
  }

  function renderPlayers() {
    playersEl.innerHTML = "";
    Game.players.forEach((p, idx) => {
      const row = document.createElement("div");
      row.className = "player-row";
      if (idx === Game.turnIdx) row.classList.add("active");
      row.innerHTML = `
        <div class="dot" style="background:${p.color}"></div>
        <div class="name">${p.name}</div>
        ${attrCell("determinacion", "img/Iconos/determinacion.webp", p.attrs.determinacion)}
        ${attrCell("alegria", "img/Iconos/alegria.webp", p.attrs.alegria)}
        ${attrCell("apoyo", "img/Iconos/apoyo.webp", p.attrs.apoyo)}
        ${attrCell("salud", "img/Iconos/salud.webp", p.attrs.salud)}
        ${attrCell("dinero", "img/Iconos/dinero.webp", p.attrs.dinero)}
        ${attrCell("tiempo", "img/Iconos/tiempo.webp", p.attrs.tiempo)}        
      `;
      const btn = document.createElement("button");
      btn.className = "retirar";
      btn.title = "Retirar jugador";
      btn.textContent = "⏏︎";
      btn.addEventListener("click", () => retirarPlayer(idx));
      row.appendChild(btn);
      playersEl.appendChild(row);
    });
  }

  function retirarPlayer(idx) {
    if (idx < Game.turnIdx) {
      Game.turnIdx--;
    }
    Game.players.splice(idx, 1);
    if (Game.players.length < 2) {
      alert("La partida necesita al menos 2 jugadores.");
      location.reload();
      return;
    }
    Game.turnIdx =
      ((Game.turnIdx % Game.players.length) + Game.players.length) %
      Game.players.length;
    renderPlayers();
    highlight();
  }

  function highlight() {
    [...playersEl.children].forEach((el, i) =>
      el.classList.toggle("active", i === Game.turnIdx)
    );
  }
  function attrCell(name, icon, val) {
    return `<div class="val" title="${name}"><img class="icon" src="${icon}" alt="${name}"/><span>${val}</span></div>`;
  }

  function ensurePathLayer() {
    let layer = document.getElementById("path");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "path";
      layer.className = "path";
      const container =
        (pawnsLayer && pawnsLayer.parentElement) ||
        (boardEl && boardEl.parentElement) ||
        document.body;
      if (pawnsLayer && pawnsLayer.parentElement) {
        pawnsLayer.parentElement.insertBefore(layer, pawnsLayer);
      } else if (boardEl && boardEl.parentElement) {
        boardEl.parentElement.appendChild(layer);
      } else {
        document.body.appendChild(layer);
      }
    }
    return layer;
  }

  function drawConnectors(){
  const layer = ensurePathLayer();
  if(!layer || !Game.centers.length || !Game.spiral.length) return;
  layer.innerHTML = "";

  const thick = 10;
  const inset = 3; // separa un poco el puente del borde de cada “isla”

  for (let i = 0; i < Game.spiral.length - 1; i++) {
    const [r1, c1] = Game.spiral[i],   [r2, c2] = Game.spiral[i + 1];
    const p1 = Game.centers[i],        p2       = Game.centers[i + 1];
    if (!p1 || !p2) continue;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) continue; // solo ortogonales

    // Tipo del SEGMENTO: usa la casilla destino (i+1)
    const segKind = (Game.types[i + 1] || "social"); // fallback cualquiera
    const conn = document.createElement("div");

    if (r1 === r2) {
      // Horizontal
      const width = Math.abs(p2.x - p1.x) - (Game.cellW + inset * 2);
      const left  = Math.min(p1.x, p2.x) + Game.cellW / 2 + inset;
      const top   = p1.y - thick / 2;
      if (width <= 0) continue;
      conn.className = "conn h";
      conn.style.left = `${left}px`;
      conn.style.top  = `${top}px`;
      conn.style.width = `${width}px`;
    } else {
      // Vertical
      const height = Math.abs(p2.y - p1.y) - (Game.cellH + inset * 2);
      const left   = p1.x - thick / 2;
      const top    = Math.min(p1.y, p2.y) + Game.cellH / 2 + inset;
      if (height <= 0) continue;
      conn.className = "conn v";
      conn.style.left   = `${left}px`;
      conn.style.top    = `${top}px`;
      conn.style.height = `${height}px`;
    }

    conn.classList.add(`k-${segKind}`); // <<— color por tipo
    layer.appendChild(conn);
  }
}


  // start
  init();
})();