// campaña.js — Modo historia basado en el prototipo rieles.js
const x_position = 220;
const y_position = 100;

class CampañaScene extends Scene {
  constructor(game) {
    super(game);
    this.locations = {};
    this.currentId = 0;
    this.fadeAlpha = 0;
    this.isFading = false;
    this.background = null;
    this.eventosActivos = new Set();
    this.eventTypes = ["personal", "académico", "social", "azar"];
  }

  init() {
    this.player = new RielesPlayer(x_position, y_position);
    this.add(this.player, "ui");
    this.generarMapaBase();
    this.generarEventosAleatorios();
    this.loadLocation(this.currentId);
  }

  generarMapaBase() {
    this.locations = {
      0: { name: "Patio", image: "fondo0", neighbors: { right: 1, up: 5 } },
      1: {
        name: "Biblioteca",
        image: "fondo1",
        neighbors: { left: 0, down: 2 },
      },
      2: {
        name: "Laboratorio",
        image: "fondo2",
        neighbors: { up: 1, right: 3 },
      },
      3: { name: "Cafetería", image: "fondo3", neighbors: { left: 2, up: 4 } },
      4: { name: "Azotea", image: "fondo4", neighbors: { down: 3 } },
      5: { name: "Puente", image: "fondo5", neighbors: { down: 0 } },
    };
  }

  generarEventosAleatorios() {
    this.eventosActivos.clear();
    const posibles = Object.keys(this.locations).filter(
      (id) => id != this.currentId
    );
    const elegidos = this._shuffle(posibles).slice(0, 3);

    let tipos = ["personal", "académico", "social"];
    if (Math.random() < 0.5) tipos.push("azar");
    tipos = this._shuffle(tipos);

    elegidos.forEach((id, i) => {
      const tipo = tipos[i % tipos.length];
      this.locations[id].evento = tipo;
      this.eventosActivos.add(parseInt(id));
    });
  }

  loadLocation(id) {
    const loc = this.locations[id];
    this.currentId = id;
    this.startFadeOut(() => {
      this.background = this.game.assets.getImage(loc.image);
      this.player.x = x_position;
      this.player.y = y_position;
      this.startFadeIn();

      if (loc.evento) {
        this.mostrarPregunta(loc.evento, () => {
          delete loc.evento;
          this.eventosActivos.delete(id);
          if (this.eventosActivos.size === 0) {
            setTimeout(() => this.generarEventosAleatorios(), 500);
          }
        });
        delete loc.evento;
        this.eventosActivos.delete(id);
        if (this.eventosActivos.size === 0) {
          setTimeout(() => this.generarEventosAleatorios(), 500);
        }
      }
    });
  }

  mostrarPregunta(tipo, callback) {
    actualizarQuestionCard(tipo);
    centerBtn();
    // Guardar callback para ejecutarse después de responder
    siguienteCallback = callback;
  }

  update(dt) {
    if (this.isFading) return;

    this.player.update(dt, this.game.input);

    if (this.player.moveComplete) {
      const dir = this.player.lastDirection;
      const next = this.locations[this.currentId].neighbors[dir];
      if (next !== undefined) {
        this.loadLocation(next);
      }
      this.player.moveComplete = false;
    }
  }

  startFadeOut(callback) {
    this.isFading = true;
    this.fadeAlpha = 0;
    const fade = () => {
      this.fadeAlpha += 0.05;
      if (this.fadeAlpha >= 1) {
        this.fadeAlpha = 1;
        this.isFading = false;
        callback();
      } else {
        requestAnimationFrame(fade);
      }
    };
    fade();
  }

  startFadeIn() {
    this.isFading = true;
    this.fadeAlpha = 1;
    const fade = () => {
      this.fadeAlpha -= 0.05;
      if (this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.isFading = false;
      } else {
        requestAnimationFrame(fade);
      }
    };
    fade();
  }

  draw(ctx) {
    if (this.background) {
      ctx.drawImage(
        this.background,
        0,
        0,
        this.game.canvas.width,
        this.game.canvas.height
      );
    }
    super.draw(ctx);
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
      ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    }
  }

  _shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }
}

class RielesPlayer extends Sprite {
  constructor(x, y) {
    super(x, y, 200, 280, "#ffffff00");
    this.speed = 100;
    this.facing = "down";
    this.frame = 0;
    this.frameElapsed = 0;
    this.isMoving = false;
    this.moveTarget = null;
    this.lastDirection = null;
    this.moveComplete = false;

    this.sprites = {
      idle: this._sheet("img/personaje/idle.webp", 4, 9, 200),
      walk: this._sheet("img/personaje/side.webp", 5, 6, 40),
      back: this._sheet("img/personaje/back.webp", 3, 6, 90),
      front: this._sheet("img/personaje/front.webp", 4, 8, 90),
      bored: this._sheet("img/personaje/bored.webp", 3, 9, 120),
    };

    this.fsm = new StateMachine({
      initial: "idle",
      states: {
        idle: {
          onEnter: () => {
            this.frame = 0;
          },
        },
        walk: {
          onEnter: () => {
            this.frame = 0;
          },
        },
        back: {
          onEnter: () => {
            this.frame = 0;
          },
        },
        front: {
          onEnter: () => {
            this.frame = 0;
          },
        },
      },
    });
  }

  _sheet(src, rows, cols, interval = 100) {
    const img = new Image();
    img.src = src;
    const s = { image: img, rows, cols, fw: null, fh: null, interval };
    img.onload = () => {
      s.fw = img.width / cols;
      s.fh = img.height / rows;
    };
    return s;
  }

  update(dt, input) {
    if (this.isMoving) {
      const dx = this.moveTarget.x - this.x;
      const dy = this.moveTarget.y - this.y;
      const dist = Math.hypot(dx, dy);
      const step = this.speed * dt;

      if (dist <= step) {
        this.x = this.moveTarget.x;
        this.y = this.moveTarget.y;
        this.isMoving = false;

        const stillHolding =
          input.isDown("ArrowUp") ||
          input.isDown("ArrowDown") ||
          input.isDown("ArrowLeft") ||
          input.isDown("ArrowRight");
        if (!stillHolding) this.fsm.transition("idle");

        this.moveComplete = true;
        return;
      }

      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * step;
      this.y += Math.sin(angle) * step;
    } else {
      this.moveComplete = false;
      if (input.isDown("ArrowUp")) {
        this.facing = "up";
        this._startMove(0, -64);
        this.fsm.transition("back");
      } else if (input.isDown("ArrowDown")) {
        this.facing = "down";
        this._startMove(0, 64);
        this.fsm.transition("front");
      } else if (input.isDown("ArrowLeft")) {
        this.facing = "left";
        this._startMove(-64, 0);
        this.fsm.transition("walk");
      } else if (input.isDown("ArrowRight")) {
        this.facing = "right";
        this._startMove(64, 0);
        this.fsm.transition("walk");
      }
    }

    const anim = this.sprites[this.fsm.state];
    const interval = anim?.interval ?? 100;
    if (anim && anim.fw) {
      this.frameElapsed += dt * 1000;
      if (this.frameElapsed >= interval) {
        this.frameElapsed = 0;
        const total = anim.rows * anim.cols;
        this.frame = (this.frame + 1) % total;
      }
    }
  }

  _startMove(dx, dy) {
    if (this.isMoving) return;

    const nextX = this.x + dx;
    const nextY = this.y + dy;

    // Limitar a los bordes del canvas
    const maxX = this.scene.game.canvas.width - this.width;
    const maxY = this.scene.game.canvas.height - this.height;

    if (nextX < 0 || nextX > maxX || nextY < 0 || nextY > maxY) return;

    this.moveTarget = { x: nextX, y: nextY };
    this.isMoving = true;
    this.lastDirection = this.facing;
  }

  draw(ctx) {
    const anim = this.sprites[this.fsm.state];
    if (!anim || !anim.fw) return;

    const col = this.frame % anim.cols;
    const row = Math.floor(this.frame / anim.cols);

    let dx = this.x;
    const dy = this.y;

    // 🔴 Sombra antes del sprite
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height - 10,
      this.width / 2.8,
      8,
      0,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();
    ctx.restore();

    // 🔵 Sprite del personaje
    ctx.save();
    if (this.facing === "right") {
      ctx.scale(-1, 1);
      dx = -(dx + this.width);
    }
    ctx.drawImage(
      anim.image,
      col * anim.fw,
      row * anim.fh,
      anim.fw,
      anim.fh,
      dx,
      dy,
      this.width,
      this.height
    );
    ctx.restore();
  }
}

// Bootstrap

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game("gameCanvas", 640, 480);
  window.escena = new CampañaScene(game);
  game.sceneManager.register("campaña", escena);
  game
    .start([
      { type: "image", key: "fondo0", src: "img/fondos/fondo0.png" },
      { type: "image", key: "fondo1", src: "img/fondos/fondo1.png" },
      { type: "image", key: "fondo2", src: "img/fondos/fondo2.png" },
      { type: "image", key: "fondo3", src: "img/fondos/fondo3.png" },
      { type: "image", key: "fondo4", src: "img/fondos/fondo4.png" },
      { type: "image", key: "fondo5", src: "img/fondos/fondo5.png" },
      { type: "image", key: "player", src: "img/personaje/idle.webp" },
    ])
    .then(() => {
      game.sceneManager.switch("campaña");
    });
});

function mover(direccion) {
  const player = window.escena?.player;
  if (!player || player.isMoving) return;

  switch (direccion) {
    case "up":
      player.facing = "up";
      player._startMove(0, -64);
      player.fsm.transition("back");
      break;
    case "down":
      player.facing = "down";
      player._startMove(0, 64);
      player.fsm.transition("front");
      break;
    case "left":
      player.facing = "left";
      player._startMove(-64, 0);
      player.fsm.transition("walk");
      break;
    case "right":
      player.facing = "right";
      player._startMove(64, 0);
      player.fsm.transition("walk");
      break;
  }
}
