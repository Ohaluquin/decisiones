(() => {
  const COLORS = [
    "#e03131",
    "#0863ebff",
    "#0aab28ff",
    "#fd7e14",
    "#845ef7",
    "#f1c30bff",
  ];

  // ===== Animación de peones (estilo v3, suave) =====
  const STEP_MS = 240; // duración por paso
  const EASE = "cubic-bezier(.2,.8,.2,1)"; // ease-out con punch

  // DOM
  const boardEl = document.getElementById("board");
  const pawnsLayer = document.getElementById("pawns");
  const playersEl = document.getElementById("players");
  const confirmBtn = document.getElementById("confirmRoll");
  const resultsBtn = document.getElementById("btnResults");
  const diceValueEl = document.getElementById("diceValue");
  const turnLabel = document.getElementById("turnLabel");
  const roundLabel = document.getElementById("roundLabel");
  const qModal = document.getElementById("qModal");
  const qText = document.getElementById("qText");
  const qOpts = document.getElementById("qOpts");
  const qImg = document.getElementById("qImg");

  //////////////////////////////////////////////////
  // ---- Fallback de notificaciones (solo si no existen) ----
  if (typeof window.log !== "function") {
    window.ensureLogArea = function () {
      var el = document.getElementById("log");
      if (el) return el;
      var panel = document.querySelector(".side .panel");
      el = document.createElement("div");
      el.id = "log";
      el.className = "log";
      el.style.display = "none";
      el.setAttribute("aria-live", "polite");
      (panel || document.body).appendChild(el);
      return el;
    };
    window.log = function (msg) {
      var el = ensureLogArea();
      el.innerHTML = msg;
      el.style.display = "block";
    };
    window.clearLog = function () {
      var el = ensureLogArea();
      el.innerHTML = "";
      el.style.display = "none";
    };
  }

  /////////////////////////////////////////////////
  // Helpers comunes
  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function iconForAttr(attr) {
    const k = (attr || "").toLowerCase();
    const map = {
      salud: "salud",
      alegria: "alegria",
      apoyo: "apoyo",
      determinacion: "determinacion",
      tiempo: "tiempo",
      dinero: "dinero",
    };
    const name = map[k] || k || "salud";
    const alt = labelAttr(k);
    return `<img src="img/Iconos/${name}.webp" alt="${alt}" class="atributo" />`;
  }

  function labelAttr(attr) {
    const m = {
      salud: "Salud",
      alegria: "Alegría",
      apoyo: "Apoyo",
      determinacion: "Determinación",
      tiempo: "Tiempo",
      dinero: "Dinero",
    };
    return m[(attr || "").toLowerCase()] || attr;
  }

  function fmtDelta(n) {
    return n > 0 ? `+${n}` : String(n);
  }

  ///////////////////////////////////////////////////////////
  // ===== Botón ✕ para cerrar qModal (y bloqueo hasta responder) =====
  function ensureQCloseButton() {
    if (!qModal) return;
    if (document.getElementById("qCloseBtn")) return;
    const btn = document.createElement("button");
    btn.id = "qCloseBtn";
    btn.textContent = "✕";
    btn.setAttribute("aria-label", "Cerrar");
    Object.assign(btn.style, {
      position: "absolute",
      right: "10px",
      top: "10px",
      border: "1px solid #2a3140",
      background: "transparent",
      color: "#e6e9ef",
      borderRadius: "10px",
      padding: "4px 10px",
      cursor: "pointer",
      display: "none",
      zIndex: "10",
    });
    btn.addEventListener("click", () => qModal.close());
    qModal.style.position = "relative";
    qModal.appendChild(btn);

    // Bloquea ESC/cancel mientras no haya respuesta
    qModal.addEventListener("cancel", (e) => {
      if (qModal.dataset.answered !== "1") e.preventDefault();
    });
  }


  // ===== Modal único para Intercambio / Eliminación =====
  function ensureExchangeModal() {
    let css = document.getElementById("exchg-modal-css");
    if (!css) {
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
    if (!dlg) {
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
      dlg.querySelector("#exchg-close").onclick = () => dlg.close();
      dlg.querySelector("#exchg-ok").onclick = () => dlg.close();
      dlg.addEventListener("cancel", (e) => {
        e.preventDefault();
        dlg.close();
      });
    }
    return dlg;
  }

  function ensureFinalModal() {
    let dlg = document.getElementById("finalModal");
    if (dlg) return dlg;

    dlg = document.createElement("dialog");
    dlg.id = "finalModal";
    dlg.className = "modal";

    dlg.innerHTML = `
    <div class="card";>
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <h3 style="margin:0; width:90%;">🏁 Resultados finales</h3>
        <button class="close" aria-label="Cerrar" data-close>✕</button>
      </div>

      <div id="finalReason" class="soft" style="margin:8px 0 12px;">—</div>

      <div style="max-height:55vh;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="text-align:left; border-bottom:1px solid #2b3446;">
              <th style="padding:8px;">Jugador</th>
              <th style="padding:8px;">Salud</th>
              <th style="padding:8px;">Alegría</th>
              <th style="padding:8px;">Apoyo</th>
              <th style="padding:8px;">Dinero</th>
              <th style="padding:8px;">Tiempo</th>
              <th style="padding:8px;">Det.</th>
              <th style="padding:8px;">Total</th>
            </tr>
          </thead>
          <tbody id="finalRows"></tbody>
        </table>
      </div>

      <div id="finalWinner" style="margin-top:12px; font-weight:700;">—</div>

      <div style="margin-top:14px; display:flex; gap:10px; justify-content:flex-end;">
        <button class="primary" data-close>OK</button>
      </div>
    </div>
  `;

    dlg.addEventListener("click", (e) => {
      const t = e.target;
      if (t?.dataset?.close !== undefined) dlg.close();
    });

    document.body.appendChild(dlg);
    return dlg;
  }

  function computeTotal(attrs) {
    return (
      (attrs.salud || 0) +
      (attrs.alegria || 0) +
      (attrs.apoyo || 0) +
      (attrs.dinero || 0) +
      (attrs.tiempo || 0) +
      (attrs.determinacion || 0)
    );
  }

  // Desempate: total > cantidad de atributos positivos > determinación
  function pickWinner(players) {
    const score = (p) => {
      const a = p.attrs || {};
      const total = computeTotal(a);
      const positives =
        (a.salud > 0) +
        (a.alegria > 0) +
        (a.apoyo > 0) +
        (a.dinero > 0) +
        (a.tiempo > 0) +
        (a.determinacion > 0);
      const det = a.determinacion || 0;
      return { total, positives, det };
    };

    let best = null;
    for (const p of players) {
      const s = score(p);
      if (!best) {
        best = { p, s };
        continue;
      }

      if (s.total > best.s.total) best = { p, s };
      else if (s.total === best.s.total && s.positives > best.s.positives)
        best = { p, s };
      else if (
        s.total === best.s.total &&
        s.positives === best.s.positives &&
        s.det > best.s.det
      )
        best = { p, s };
    }
    return best;
  }

  function showFinalResultsModal(reason = "Fin del juego") {
    const dlg = ensureFinalModal();
    const reasonEl = dlg.querySelector("#finalReason");
    const rowsEl = dlg.querySelector("#finalRows");
    const winEl = dlg.querySelector("#finalWinner");

    reasonEl.textContent = reason;

    const players = (Game.players || []).slice(); // activos
    const best = pickWinner(players);

    rowsEl.innerHTML = "";
    for (const p of players) {
      const a = p.attrs || {};
      const total = computeTotal(a);
      const isWinner = best?.p?.id === p.id;

      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #1e2533";
      if (isWinner) tr.style.background = "rgba(30, 255, 160, 0.08)";

      tr.innerHTML = `
      <td style="padding:8px; font-weight:${isWinner ? 800 : 600};">${
        p.name
      }</td>
      <td style="padding:8px;">${a.salud ?? 0}</td>
      <td style="padding:8px;">${a.alegria ?? 0}</td>
      <td style="padding:8px;">${a.apoyo ?? 0}</td>
      <td style="padding:8px;">${a.dinero ?? 0}</td>
      <td style="padding:8px;">${a.tiempo ?? 0}</td>
      <td style="padding:8px;">${a.determinacion ?? 0}</td>
      <td style="padding:8px; font-weight:${
        isWinner ? 800 : 600
      };">${total}</td>
    `;
      rowsEl.appendChild(tr);
    }

    if (best?.p) {
      winEl.textContent = `🏆 Ganador: ${best.p.name} (Total ${best.s.total})`;
    } else {
      winEl.textContent = "No hay jugadores activos.";
    }

    dlg.showModal();
  }

  function storyForExchangeOp(op) {
    try {
      const recv = op?.receive?.attr; // atributo que gana +1
      const give = op?.give?.attr; // atributo que pierde -2
      const key = `${recv}-${give}`; // p.ej. "alegria-tiempo"
      if (window.historiasDeIntercambio && window.historiasDeIntercambio[key]) {
        return window.historiasDeIntercambio[key];
      }
    } catch (e) {}
    return null;
  }

  function waitClose(dlg) {
    return new Promise((res) =>
      dlg.addEventListener("close", () => res(), { once: true })
    );
  }

  async function showEmergencyExchange(payload) {
    const { fromName, operations, give, receive, reason } = payload || {};
    const dlg = ensureExchangeModal();
    dlg.querySelector("#exchg-title").textContent = "Intercambio de emergencia";

    const ops =
      Array.isArray(operations) && operations.length
        ? operations
        : [{ give, receive }];

    const rowsHtml = ops
      .map((op) => {
        const g = op?.give,
          r = op?.receive;
        return `<div class="row">
      <span class="pill"><span>${iconForAttr(g?.attr)}</span>${labelAttr(
          g?.attr
        )} <span class="delta minus">${fmtDelta(g?.delta ?? -2)}</span></span>
      <span class="arrow">→</span>
      <span class="pill"><span>${iconForAttr(r?.attr)}</span>${labelAttr(
          r?.attr
        )} <span class="delta plus">${fmtDelta(r?.delta ?? +1)}</span></span>
    </div>`;
      })
      .join("");

    const storiesHtml = ops
      .map((op) => {
        const s = storyForExchangeOp(op);
        return s ? `<div class="muted">• ${s}</div>` : "";
      })
      .join("");

    dlg.querySelector("#exchg-body").innerHTML = `
    <div class="muted">Se aplicó intercambio de emergencia para mantener al menos 1 en todos los atributos.</div>
    ${rowsHtml}
    ${storiesHtml ? `<div style="margin-top:8px">${storiesHtml}</div>` : ""}
    ${
      reason
        ? `<div class="muted" style="margin-top:6px">Motivo: ${reason}</div>`
        : ""
    }
  `;
    dlg.showModal();
    try {
      log(`Intercambio de emergencia: ${fromName || ""}`);
    } catch (e) {}
    await waitClose(dlg);
  }

  async function showEmergencyElimination(payload) {
    const { fromName, reason } = payload || {};
    const dlg = ensureExchangeModal();
    dlg.querySelector("#exchg-title").textContent = "Jugador eliminado";
    dlg.querySelector("#exchg-body").innerHTML = `
      <div><strong>${
        fromName || "El jugador"
      }</strong> no pudo completar los intercambios de emergencia requeridos y <strong>queda eliminado</strong>.</div>
      ${
        reason
          ? `<div class="muted" style="margin-top:6px">${reason}</div>`
          : ""
      }`;
    dlg.showModal();
    try {
      log(`Eliminado: ${fromName || ""}. ${reason || ""}`);
    } catch (e) {}
    await waitClose(dlg);
  }

  /////////////////////////////////////////////////////////
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
    gameOver: false,
  };

  Game.PAWN_SIZE = 16; // <-- ajusta: 14-18 recomendado

  ////////////////////////////////////////////////////////
  function initPawns() {
    pawnsLayer.innerHTML = "";
    Game.players.forEach((p) => {
      Game.positions.set(p.id, 0);
      const dot = document.createElement("div");
      dot.className = "pawn";
      dot.style.background = p.color;
      dot.style.left = "0px";
      dot.style.top = "0px";
      dot.style.transform = "translate3d(0,0,0)";
      dot.style.transition = `transform ${STEP_MS}ms ${EASE}`;
      dot.style.willChange = "transform";
      pawnsLayer.appendChild(dot);
      Game.pawns.set(p.id, dot);
      placePawn(p.id, 0, true);
    });
  }

  function placePawn(pid, idx, instant = false) {
    const pt = Game.centers[idx];
    if (!pt) return;

    const el = Game.pawns.get(pid);
    if (!el) return;

    // --- 1) Stack: ¿cuántos jugadores están en esta casilla?
    const same = [];
    for (const [otherPid, otherIdx] of Game.positions.entries()) {
      if (otherIdx === idx) same.push(otherPid);
    }
    const n = same.length;

    // --- 2) Offsets de stack (círculo pequeño)
    let ox = 0,
      oy = 0,
      ang = 0;
    if (n > 1) {
      const r = Math.min(14, Game.PAWN_SIZE * 0.9); // radio del anillo
      if (!instant) ang = (2 * Math.PI * n) / 5;
      else ang = (2 * Math.PI * same.indexOf(pid)) / 5;
      ox = r * Math.cos(ang);
      oy = r * Math.sin(ang);
    }

    // --- 3) Offset global + centrado por tamaño
    const half = Game.PAWN_SIZE / 2;
    const x = pt.x - half + ox;
    const y = pt.y - half + oy;

    // --- 4) Animación igual que antes
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
        salud: 5,
        alegria: 5,
        apoyo: 5,
        determinacion: 5,
        tiempo: 5,
        dinero: 5,
      },
    }));

    Game.cells = [
      { u: 0.579, v: 0.681, t: "inicio" },
      { u: 0.639, v: 0.641, t: "personal" },
      { u: 0.687, v: 0.603, t: "academico" },
      { u: 0.724, v: 0.555, t: "personal" },
      { u: 0.741, v: 0.488, t: "azar" },
      { u: 0.737, v: 0.424, t: "academico" },
      { u: 0.72, v: 0.365, t: "personal" },
      { u: 0.688, v: 0.316, t: "academico" },
      { u: 0.643, v: 0.277, t: "personal" },
      { u: 0.591, v: 0.246, t: "social" },
      { u: 0.538, v: 0.233, t: "academico" },
      { u: 0.487, v: 0.233, t: "personal" },
      { u: 0.434, v: 0.243, t: "academico" },
      { u: 0.383, v: 0.274, t: "personal" },
      { u: 0.337, v: 0.313, t: "academico" },
      { u: 0.303, v: 0.365, t: "personal" },
      { u: 0.282, v: 0.424, t: "social" },
      { u: 0.274, v: 0.493, t: "academico" },
      { u: 0.288, v: 0.565, t: "personal" },
      { u: 0.319, v: 0.631, t: "azar" },
      { u: 0.364, v: 0.688, t: "personal" },
      { u: 0.421, v: 0.73, t: "social" },
      { u: 0.482, v: 0.76, t: "academico" },
      { u: 0.549, v: 0.771, t: "personal" },
      { u: 0.612, v: 0.772, t: "social" },
      { u: 0.672, v: 0.764, t: "academico" },
      { u: 0.73, v: 0.737, t: "personal" },
      { u: 0.778, v: 0.696, t: "academico" },
      { u: 0.813, v: 0.631, t: "personal" },
      { u: 0.832, v: 0.556, t: "academico" },
      { u: 0.84, v: 0.48, t: "social" },
      { u: 0.829, v: 0.406, t: "academico" },
      { u: 0.805, v: 0.335, t: "personal" },
      { u: 0.767, v: 0.278, t: "academico" },
      { u: 0.726, v: 0.225, t: "social" },
      { u: 0.672, v: 0.187, t: "personal" },
      { u: 0.615, v: 0.158, t: "academico" },
      { u: 0.554, v: 0.145, t: "personal" },
      { u: 0.493, v: 0.145, t: "academico" },
      { u: 0.433, v: 0.151, t: "personal" },
      { u: 0.373, v: 0.174, t: "academico" },
      { u: 0.32, v: 0.205, t: "personal" },
      { u: 0.268, v: 0.243, t: "academico" },
      { u: 0.229, v: 0.303, t: "personal" },
      { u: 0.2, v: 0.359, t: "social" },
      { u: 0.182, v: 0.43, t: "academico" },
      { u: 0.179, v: 0.506, t: "personal" },
      { u: 0.189, v: 0.588, t: "academico" },
      { u: 0.224, v: 0.678, t: "academico" },
      { u: 0.264, v: 0.74, t: "social" },
      { u: 0.314, v: 0.805, t: "academico" },
      { u: 0.386, v: 0.853, t: "personal" },
      { u: 0.459, v: 0.884, t: "academico" },
      { u: 0.537, v: 0.904, t: "social" },
      { u: 0.537, v: 0.994, t: "inicio" },
    ];

    Game.N = Game.cells.length;
    Game.centersNorm = Game.cells.map(({ u, v }) => ({ u, v }));
    Game.types = Game.cells.map((c) => c.t);
    Game.gameOver = false;

    // 3) Inicializa peones (ya no necesitas drawBoard)
    rebuildCenters();
    initPawns();
    renderPlayers();
    updateTurnLabel();

    confirmBtn.addEventListener("click", onConfirmRoll);
    resultsBtn?.addEventListener("click", () => {
      showFinalResultsModal("Resultados por tiempo / consulta manual");
    });

    window.addEventListener("resize", () => {
      rebuildCenters();
      Game.players.forEach((p) =>
        placePawn(p.id, Game.positions.get(p.id) || 0, true)
      );
    });
  }

  function onConfirmRoll() {
    if (Game.gameOver) return;
    if (Game.busy) return;
    Game.busy = true;
    try {
      clearLog();
    } catch (e) {}
    if (typeof confirmBtn !== "undefined" && confirmBtn)
      confirmBtn.disabled = true;

    const steps = parseInt(diceValueEl && diceValueEl.value, 10) || 1;
    Game.lastDice = steps;
    const p = Game.players[Game.turnIdx];
    movePawn(p.id, steps);
  }

  async function movePawn(pid, steps) {
    //Movimiento del peon en el tablero
    let idx = Game.positions.get(pid) || 0;
    for (let s = 0; s < steps; s++) {
      idx = (idx + 1) % Game.N;
      Game.positions.set(pid, idx); // primero actualiza el estado lógico
      placePawn(pid, idx); // luego dibuja
      await sleep(STEP_MS);
    }
    Game.positions.set(pid, idx);
    onLand(pid, idx);
  }

  function onLand(pid, idx) {
    const kind = Game.types[idx];
    const player =
      Game.players.find((p) => p.id === pid) || Game.players[Game.turnIdx];
    const esAzar = kind === "azar";

    switch (kind) {
      case "inicio": {
        // Consideramos "última casilla" = última celda del arreglo
        if (idx === Game.N - 1 && !Game.gameOver) {
          Game.gameOver = true;
          confirmBtn.disabled = true;
          showFinalResultsModal("Un jugador llegó a la casilla final.");
        }
        return;
      }

      case "academico":
      case "personal":
      case "social":
      case "azar":
        askQuestion(kind, player, esAzar);
        return;

      default:
        log(`Casilla ${idx}: tipo inválido (${kind})`);
        nextTurn();
    }
  }

  /////////////////////////////////////////////////
  // ===== Preguntas (clic en opción ⇒ evaluar; cerrar con ✕) =====
  function askQuestion(kind, player, esAzar) {
    const kindNorm = normalize(kind);
    const filteredQuestions = preguntas.filter(
      (q) => normalize(q.kind) === kindNorm
    );
    if (!filteredQuestions.length) {
      log(`(No hay preguntas de tipo ${kind})`);
      nextTurn();
      return;
    }
    pregunta_actual = Math.floor(Math.random() * filteredQuestions.length);
    q = filteredQuestions[pregunta_actual];
    preguntas.splice(preguntas.indexOf(q), 1);

    //const kNorm = normalize(q.kind || kind);
    qModal.setAttribute("data-kind", kind);

    qText.innerHTML = q.text || "…";
    qImg.src = `img/Preguntas/${q.imageName || "inicio"}.webp`;

    // Construir opciones + explicación + evaluación (sin botones de acción)
    qOpts.innerHTML = `
      <div id="instruccionDado" class="hidden" style="color:white">
        Lanza el dado físico: PAR = opción de arriba, NON = opción de abajo
      </div>
      <div id="radioptions" class="opciones-marcadas">
        <label><input type="radio" id="option1" name="option" value="1" /> <span id="option1_text"></span></label><br />
        <label><input type="radio" id="option2" name="option" value="2" /> <span id="option2_text"></span></label><br />
        <label id="opt3wrap"><input type="radio" id="option3" name="option" value="3" /> <span id="option3_text"></span></label><br />
        <label id="opt4wrap"><input type="radio" id="option4" name="option" value="4" /> <span id="option4_text"></span></label><br />
      </div>
      <p id="explicacion" class="explicacion-pergamino"></p>
      <div id="evaluacion-final" class="evaluacion" style="display:none">
        <h3>Evaluación:</h3>
        <div class="atributos-evaluacion">
          <div class="atributo"><img src="img/Iconos/determinacion.webp" alt="Determinación" /><span id="eva-det">0</span></div>
          <div class="atributo"><img src="img/Iconos/alegria.webp"       alt="Alegría"       /><span id="eva-ale">0</span></div>
          <div class="atributo"><img src="img/Iconos/apoyo.webp"         alt="Apoyo"         /><span id="eva-apo">0</span></div>
          <div class="atributo"><img src="img/Iconos/salud.webp"         alt="Salud"         /><span id="eva-sal">0</span></div>
          <div class="atributo"><img src="img/Iconos/dinero.webp"        alt="Dinero"        /><span id="eva-din">0</span></div>
          <div class="atributo"><img src="img/Iconos/tiempo.webp"        alt="Tiempo"        /><span id="eva-tie">0</span></div>
        </div>
      </div>
    `;

    // Mostrar/ocultar opciones según tipo
    const setTxt = (i, txt) => {
      const lab = document.getElementById(`option${i}_text`);
      const wrapId = i === 3 ? "opt3wrap" : i === 4 ? "opt4wrap" : null;
      const wrap = wrapId ? document.getElementById(wrapId) : null;
      const inp = document.getElementById(`option${i}`);
      if (!txt) {
        if (wrap) wrap.style.display = "none";
        if (inp && inp.parentElement && !wrap)
          inp.parentElement.style.display = "none";
      } else if (lab) {
        lab.textContent = txt;
      }
    };

    if (esAzar) {
      setTxt(1, q.options?.[0]?.text || "Opción A");
      setTxt(2, q.options?.[1]?.text || "Opción B");
      setTxt(3, null);
      setTxt(4, null);
      const inst = document.getElementById("instruccionDado");
      if (inst) inst.style.display = "inline-block";
    } else {
      setTxt(1, q.options?.[0]?.text || null);
      setTxt(2, q.options?.[1]?.text || null);
      setTxt(3, q.options?.[2]?.text || null);
      setTxt(4, q.options?.[3]?.text || null);
      const inst = document.getElementById("instruccionDado");
      if (inst) inst.style.display = "none";
    }

    // Configurar botón ✕ y bloqueo de cierre hasta responder
    ensureQCloseButton();
    qModal.dataset.answered = "0";
    const qClose = document.getElementById("qCloseBtn");
    if (qClose) qClose.style.display = "none";

    // Evaluación inmediata al seleccionar
    const radiosWrap = document.getElementById("radioptions");
    const exp = document.getElementById("explicacion");
    const evaDiv = document.getElementById("evaluacion-final");

    /////////////////////// Evaluación
    function evaluateAndShow(idx) {
      const op = q.options[idx];
      if (!op) return;

      if (radiosWrap) radiosWrap.classList.add("hidden");

      exp.innerHTML = `<b>${op.text}:</b> ${op.explicacion || ""}`;

      // pinta evaluación
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

      evaDiv.style.display = "block";
      set("eva-det", eva.determinacion);
      set("eva-ale", eva.alegria);
      set("eva-apo", eva.apoyo);
      set("eva-sal", eva.salud);
      set("eva-din", eva.dinero);
      set("eva-tie", eva.tiempo);

      // aplica al jugador
      [
        "determinacion",
        "alegria",
        "apoyo",
        "salud",
        "dinero",
        "tiempo",
      ].forEach((k) => (player.attrs[k] += eva[k] || 0));
      renderPlayers();

      // prepara intercambio/eliminación pero NO lo muestres todavía
      const ex = checkExchangeOrLose(player);
      renderPlayers();

      Game.pendingAfterClose = null;

      if (ex?.operations?.length) {
        Game.pendingAfterClose = Game.pendingAfterClose || {};
        Game.pendingAfterClose.exchange = {
          fromName: player.name,
          operations: ex.operations,
          reason: "Restablecer atributos mínimos tras la pregunta",
        };
      }

      if (ex?.lost) {
        Game.pendingAfterClose = Game.pendingAfterClose || {};
        Game.pendingAfterClose.elimination = {
          fromName: player.name,
          reason:
            ex.reason ||
            "No tenía suficientes fichas para completar los intercambios necesarios",
          playerRef: player,
        };
      }

      // habilita cerrar con ✕
      qModal.dataset.answered = "1";
      if (qClose) {
        qClose.style.display = "inline-block";
        qClose.focus();
      }

      // Importante: secuencia al cerrar (retro ya se vio; ahora vienen intercambios)
      const onClose = async () => {
        const pending = Game.pendingAfterClose;
        Game.pendingAfterClose = null;

        if (pending?.exchange) {
          await showEmergencyExchange(pending.exchange);
        }

        if (pending?.elimination) {
          await showEmergencyElimination({
            fromName: pending.elimination.fromName,
            reason: pending.elimination.reason,
          });

          const idxJugador = Game.players.indexOf(
            pending.elimination.playerRef
          );
          if (idxJugador !== -1) retirarPlayer(idxJugador);
        }

        nextTurn();
      };

      qModal.addEventListener("close", onClose, { once: true });
    }

    qOpts.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const idx = parseInt(radio.value, 10) - 1;
        evaluateAndShow(idx);
      });
    });
    qModal.showModal();
  }

  // ===== Intercambio automático tras evaluación =====
  function checkExchangeOrLose(player) {
    const safe = (v) => (typeof v === "number" ? v : 0);
    const ORDER = [
      "salud",
      "alegria",
      "apoyo",
      "determinacion",
      "tiempo",
      "dinero",
    ];
    const swaps = [];
    const operations = [];
    for (let guard = 0; guard < 24; guard++) {
      const faltantes = ORDER.filter((k) => safe(player.attrs[k]) <= 0);
      if (!faltantes.length) break;

      for (const faltante of faltantes) {
        const donantes = ORDER.filter(
          (k) => k !== faltante && safe(player.attrs[k]) >= 2
        ).sort((a, b) => safe(player.attrs[b]) - safe(player.attrs[a]));

        if (!donantes.length) {
          return { lost: true, swaps, operations };
        }
        const d = donantes[0];
        player.attrs[d] = safe(player.attrs[d]) - 2;
        player.attrs[faltante] = safe(player.attrs[faltante]) + 1;
        swaps.push(
          `${player.name} intercambia <b>2</b> de <b>${labelAttr(
            d
          )}</b> por <b>1</b> de <b>${labelAttr(faltante)}</b>.`
        );
        operations.push({
          give: { attr: d, delta: -2 },
          receive: { attr: faltante, delta: +1 },
        });
      }
    }
    return { lost: false, swaps, operations };
  }

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
        ${attrCell(
          "determinacion",
          "img/Iconos/determinacion.webp",
          p.attrs.determinacion
        )}
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

  /**
   * Convierte centersNorm (u,v) -> pixeles dentro del boardEl real.
   */
  function centersNormToPixels(boardEl, centersNorm) {
    const r = boardEl.getBoundingClientRect();
    return centersNorm.map((p) => ({
      x: r.width * p.u,
      y: r.height * p.v,
    }));
  }

  // === Toggle de barra lateral (colapsa/expande grid y recalcula tablero) ===
  const appGrid = document.querySelector(".app-grid");
  const sidePanel = document.querySelector(".side");
  const abrirBtn = document.getElementById("abrirPanel");
  const ocultarBtn = document.getElementById("ocultarPanel");

  // Asegura estados iniciales coherentes
  if (abrirBtn) abrirBtn.style.display = "none";
  if (sidePanel) sidePanel.style.display = "flex";

  function recomputeSoon() {
    requestAnimationFrame(() => {
      rebuildCenters();
    });
  }

  function showSide() {
    if (!appGrid || !sidePanel || !abrirBtn) return;
    appGrid.classList.remove("no-side");
    sidePanel.style.display = "flex";
    abrirBtn.style.display = "none";
    recomputeSoon();
  }

  function hideSide() {
    if (!appGrid || !sidePanel || !abrirBtn) return;
    appGrid.classList.add("no-side");
    sidePanel.style.display = "none";
    abrirBtn.style.display = "block";
    recomputeSoon();
  }

  abrirBtn?.addEventListener("click", showSide);
  ocultarBtn?.addEventListener("click", hideSide);

  function rebuildCenters() {
    // Si hay calibración completa, usa eso. Si no, conserva lo que haya.
    if (Game.centersNorm && Game.centersNorm.length) {
      Game.centers = centersNormToPixels(boardEl, Game.centersNorm);
    } else {
      // fallback: si todavía no calibras, deja los centros existentes o vacíos
      Game.centers = Game.centers || [];
    }

    if (Game.players && Game.players.length) {
      Game.players.forEach((p) =>
        placePawn(p.id, Game.positions.get(p.id) || 0, true)
      );
    }
  }

  // start
  init();
})();
