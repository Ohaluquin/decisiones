/* ─────────────────────────  EventEmitter  ───────────────────────── */
class EventEmitter {
  constructor() {
    this._evt = {};
  }

  /** Suscribe y devuelve una función para desuscribirse */
  on(evt, fn) {
    (this._evt[evt] ||= []).push(fn);
    return () => this.off(evt, fn);
  }

  off(evt, fn) {
    const list = this._evt[evt];
    if (!list) return;
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  }

  emit(evt, ...args) {
    const list = this._evt[evt];
    if (list) [...list].forEach((cb) => cb(...args));
  }
}

/**
 * Game: controlador principal del bucle de juego (fixed timestep)
 */
class Game {
  constructor(canvasId, width, height, fps = 60) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = width;
    this.canvas.height = height;
    this.fps = fps;
    this.interval = 1000 / fps;
    this.accumulator = 0;
    this.lastTime = 0;
    this.sceneManager = new SceneManager(this);
    this.input = new InputManager(this.canvas);
    this.assets = new AssetLoader();
    this._boundLoop = this.loop.bind(this);
    this.paused = false;
    this.zoom = 1; // ← valor por defecto
    this.events = new EventEmitter(); //  ← NUEVO
  }

  /**
   * Inicia el juego después de cargar assets opcionales
   */
  async start(assetList = []) {
    if (assetList.length) {
      await Promise.all(assetList.map((a) => this.assets.loadAsset(a)));
    }
    this.lastTime = performance.now();
    requestAnimationFrame(this._boundLoop);
  }

  /**
   * Bucle principal con fixed timestep y separación de update/render
   */
  loop(timestamp) {
    if (this.paused) return;
    const frameTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += frameTime;

    while (this.accumulator >= this.interval) {
      this.update(this.interval / 1000);
      this.accumulator -= this.interval;
    }
    this.render();
    requestAnimationFrame(this._boundLoop);
  }

  update(dt) {
    this.input.update();
    this.sceneManager.update(dt);
  }

  render() {
    const scene = this.sceneManager.current;
    if (!scene) return;
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-scene.camera.x, -scene.camera.y);

    scene.draw(this.ctx);
    this.ctx.restore();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      this.lastTime = performance.now();
      this.accumulator = 0;
      requestAnimationFrame(this._boundLoop);
    }
  }

  setZoom(factor) {
    this.zoom = factor;
  }
}

/********************************************************************************************
 * SceneManager: administra múltiples escenas
 */
class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = {};
    this.current = null;
  }

  register(name, scene) {
    this.scenes[name] = scene;
    scene.game = this.game;
  }

  switch(name) {
    if (this.current && this.current.destroy) this.current.destroy();
    this.current = this.scenes[name];
    this.current.init();
  }

  update(dt) {
    if (this.current) this.current.update(dt);
  }
}

/***************************************************************************************
 * Camera mejorada con seguimiento suave y límites
 */
class Camera {
  constructor(x, y, width, height, game = null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.target = null;
    this.bounds = null;
    this.followLerp = 0.1;
    this.lockX = false;
    this.lockY = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.game = game;
  }

  follow(
    target,
    lerp = 0.1,
    offsetX = 0,
    offsetY = 0,
    lockX = false,
    lockY = false
  ) {
    this.target = target;
    this.followLerp = lerp;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.lockX = lockX;
    this.lockY = lockY;
  }

  centerOn(target) {
    const zoom = this.game?.zoom || 1;
    const vw = this.game.canvas.width / zoom;
    const vh = this.game.canvas.height / zoom;
    this.offsetX = -vw / 2 + target.width / 2;
    this.offsetY = -vh / 2 + target.height / 2;
  }

  setBounds(minX, minY, maxX, maxY) {
    this.bounds = { minX, minY, maxX, maxY };
  }

  updateDimensionsFromZoom() {
    const zoom = this.game?.zoom || 1;
    this.width = this.game.canvas.width / zoom;
    this.height = this.game.canvas.height / zoom;
  }

  setDeadZone(factorX = 0.25, factorY = 0.25) {
    this.deadZoneX = this.width * factorX;
    this.deadZoneY = this.height * factorY;
  }

  update() {
    if (!this.target) return;

    const zoom = this.game?.zoom || 1;

    const deadZoneX = this.deadZoneX ?? this.width * 0.25;
    const deadZoneY = this.deadZoneY ?? this.height * 0.25;

    const targetCenterX = this.target.x + this.target.width / 2;
    const targetCenterY = this.target.y + this.target.height / 2;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    let desiredX = this.x;
    let desiredY = this.y;

    if (!this.lockX) {
      if (targetCenterX < centerX - deadZoneX) {
        desiredX =
          this.x - (centerX - deadZoneX - targetCenterX) + this.offsetX;
      } else if (targetCenterX > centerX + deadZoneX) {
        desiredX =
          this.x + (targetCenterX - (centerX + deadZoneX)) + this.offsetX;
      }
    }

    if (!this.lockY) {
      if (targetCenterY < centerY - deadZoneY) {
        desiredY =
          this.y - (centerY - deadZoneY - targetCenterY) + this.offsetY;
      } else if (targetCenterY > centerY + deadZoneY) {
        desiredY =
          this.y + (targetCenterY - (centerY + deadZoneY)) + this.offsetY;
      }
    }

    // Movimiento suave
    this.x += (desiredX - this.x) * this.followLerp;
    this.y += (desiredY - this.y) * this.followLerp;

    if (this.bounds) {
      this.x = Math.max(
        this.bounds.minX,
        Math.min(this.x, this.bounds.maxX - this.width)
      );
      this.y = Math.max(
        this.bounds.minY,
        Math.min(this.y, this.bounds.maxY - this.height)
      );
    }
  }
}

/* ----------------------─────────────────────────  QuadTree  ───────────────────────── */
class QuadTree {
  constructor(bounds, maxObjects = 8, maxLevels = 4, level = 0) {
    this.bounds = bounds; // {x,y,w,h}
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.objects = [];
    this.nodes = [];
  }

  clear() {
    this.objects.length = 0;
    for (const n of this.nodes) n.clear();
    this.nodes.length = 0;
  }

  _split() {
    const { x, y, w, h } = this.bounds;
    const hw = w / 2,
      hh = h / 2,
      nl = this.level + 1;
    this.nodes[0] = new QuadTree(
      { x: x + hw, y, w: hw, h: hh },
      this.maxObjects,
      this.maxLevels,
      nl
    ); // NE
    this.nodes[1] = new QuadTree(
      { x, y, w: hw, h: hh },
      this.maxObjects,
      this.maxLevels,
      nl
    ); // NW
    this.nodes[2] = new QuadTree(
      { x, y: y + hh, w: hw, h: hh },
      this.maxObjects,
      this.maxLevels,
      nl
    ); // SW
    this.nodes[3] = new QuadTree(
      { x: x + hw, y: y + hh, w: hw, h: hh },
      this.maxObjects,
      this.maxLevels,
      nl
    ); // SE
  }

  _index(obj) {
    const verticalMid = this.bounds.x + this.bounds.w / 2;
    const horizontalMid = this.bounds.y + this.bounds.h / 2;

    const ox = obj.collisionBox ? obj.x + obj.collisionBox.offset.x : obj.x;
    const oy = obj.collisionBox ? obj.y + obj.collisionBox.offset.y : obj.y;
    const ow = obj.collisionBox ? obj.collisionBox.width : obj.width;
    const oh = obj.collisionBox ? obj.collisionBox.height : obj.height;

    const top = oy + oh <= horizontalMid;
    const bottom = oy >= horizontalMid;
    const left = ox + ow <= verticalMid;
    const right = ox >= verticalMid;

    if (top && right) return 0; // NE
    if (top && left) return 1; // NW
    if (bottom && left) return 2; // SW
    if (bottom && right) return 3; // SE
    return -1;
  }

  insert(obj) {
    if (this.nodes.length) {
      const i = this._index(obj);
      if (i !== -1) return this.nodes[i].insert(obj);
    }

    this.objects.push(obj);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (!this.nodes.length) this._split();
      let j = 0;
      while (j < this.objects.length) {
        const idx = this._index(this.objects[j]);
        if (idx !== -1) this.nodes[idx].insert(this.objects.splice(j, 1)[0]);
        else ++j;
      }
    }
  }

  retrieve(list, obj) {
    const i = this._index(obj);
    if (i !== -1 && this.nodes.length) this.nodes[i].retrieve(list, obj);
    list.push(...this.objects);
    return list;
  }
}

/*********************************************************************************************
 * Scene: capa base para objetos, colisiones y renderizado
 */
class Scene {
  constructor(game) {
    this.game = game;
    this.camera = new Camera(0, 0, game.canvas.width, game.canvas.height, game);
    this.layers = new Map();
    this.groups = new Map();
    this.objects = new Set();
    this.quadTree = new QuadTree({
      x: 0,
      y: 0,
      w: this.game.canvas.width,
      h: this.game.canvas.height,
    });
  }

  init() {}

  add(obj, layer = "default", group = null) {
    obj.scene = this;
    if (!this.layers.has(layer)) this.layers.set(layer, []);
    this.layers.get(layer).push(obj);
    if (group) {
      if (!this.groups.has(group)) this.groups.set(group, []);
      this.groups.get(group).push(obj);
    }
    this.objects.add(obj);
    if (obj.init) obj.init();
  }

  remove(obj) {
    this.objects.delete(obj);
    for (let arr of this.layers.values()) {
      const i = arr.indexOf(obj);
      if (i >= 0) arr.splice(i, 1);
    }
    for (let arr of this.groups.values()) {
      const i = arr.indexOf(obj);
      if (i >= 0) arr.splice(i, 1);
    }
    if (obj.destroy) obj.destroy();
  }

  getGroup(name) {
    return this.groups.get(name) || [];
  }

  update(dt) {
    for (let obj of this.objects) obj.update && obj.update(dt);
    this.camera.update();
    this._handleCollisions();
  }

  draw(ctx) {
    [...this.layers.keys()].sort().forEach((layer) => {
      this.layers.get(layer).forEach((obj) => obj.draw && obj.draw(ctx));
    });
  }

  _handleCollisions() {
    // 1) Reconstruir el QuadTree con los objetos colisionables de esta escena
    this.quadTree.clear();
    for (const obj of this.objects) {
      if (obj.collisionBox) this.quadTree.insert(obj);
    }

    // 2) Para cada objeto, solo revisa contra candidatos cercanos
    for (const a of this.objects) {
      if (!a.collidesWith) continue;

      const possibles = this.quadTree.retrieve([], a);

      for (const b of possibles) {
        if (a === b || !b.collidesWith) continue;
        if (a.collidesWith(b)) {
          // Delega la resolución en cada sprite (si existe el callback)
          a.onCollision?.(b);
          b.onCollision?.(a);
        }
      }
    }
  }
}

/**************************************************************************************
 * Sprite base con física mejorada y colisiones más precisas
 */
class Sprite {
  constructor(x, y, width, height, color = "black") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0;
    this.friction = 0;
    this.onGround = false;
    this.animations = {}; // { nombre : Animation }
    this.currentAnim = null; // string  (clave de la animación activa)
    this.collisions = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    };
    this.collisionBox = {
      x: x,
      y: y,
      width: width,
      height: height,
      offset: { x: 0, y: 0 },
    };
  }

  /** Define una animación nueva */
  addAnimation(name, opts) {
    this.animations[name] = new Animation(opts);
  }

  /** Reproduce la animación indicada */
  play(name, reset = false) {
    if (this.currentAnim !== name) {
      this.currentAnim = name;
      if (reset) this.animations[name]?.reset();
    }
  }

  /** Solo lo usa update() para avanzar frames */
  _updateAnimation(dt) {
    if (this.currentAnim) this.animations[this.currentAnim].update(dt);
  }

  update(dt) {
    // Física básica
    this.vy += this.gravity * dt;

    // Movimiento horizontal
    const oldX = this.x;
    this.x += this.vx * dt;
    this._handleHorizontalCollisions();

    // Movimiento vertical
    const oldY = this.y;
    this.y += this.vy * dt;
    this._handleVerticalCollisions();

    // Rozamiento
    const f = Math.exp(-this.friction * dt);
    this.vx *= f;
    this.vy *= f;

    this._updateAnimation(dt);
  }

  /** Devuelve un objeto con flags laterales y la llave .hit  */
  _checkCollision(other) {
    const r1 = {
      x: this.x + this.collisionBox.offset.x,
      y: this.y + this.collisionBox.offset.y,
      w: this.collisionBox.width,
      h: this.collisionBox.height,
    };
    const r2 = { x: other.x, y: other.y, w: other.width, h: other.height };

    const collision = {
      top: false,
      bottom: false,
      left: false,
      right: false,
      hit: false,
    };

    // ¿Hay intersección AABB?
    if (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    ) {
      collision.hit = true;

      // Determinar el lado predominante de la colisión
      const dx = r1.x + r1.w / 2 - (r2.x + r2.w / 2);
      const dy = r1.y + r1.h / 2 - (r2.y + r2.h / 2);
      const wy = (r1.w + r2.w) / 2;
      const hx = (r1.h + r2.h) / 2;

      if (Math.abs(dx) <= wy && Math.abs(dy) <= hx) {
        const wyDy = wy * dy;
        const hxDx = hx * dx;

        if (wyDy > hxDx) {
          if (wyDy > -hxDx) collision.top = true; // r1 encima de r2
          else collision.right = true; // r1 a la derecha
        } else {
          if (wyDy > -hxDx) collision.left = true; // r1 a la izquierda
          else collision.bottom = true; // r1 debajo
        }
      }
    }
    return collision;
  }

  /** Ajustado: devuelve booleano para las rutinas genéricas de la escena */
  collidesWith(other) {
    return this._checkCollision(other).hit;
  }

  /** Colisiones horizontales */
  _handleHorizontalCollisions() {
    const oldX = this.x;
    this.collisions.left = this.collisions.right = false;

    if (this.scene) {
      for (const obj of this.scene.objects) {
        if (obj !== this && obj.collidesWith) {
          const col = this._checkCollision(obj);
          if (col.hit) {
            if (col.left && this.vx > 0) {
              // golpeando su lado izquierdo
              this.x = oldX;
              this.collisions.right = true;
              this.vx = 0;
            }
            if (col.right && this.vx < 0) {
              // golpeando su lado derecho
              this.x = oldX;
              this.collisions.left = true;
              this.vx = 0;
            }
          }
        }
      }
    }
  }

  /** Colisiones verticales */
  _handleVerticalCollisions() {
    const oldY = this.y;
    this.collisions.top = this.collisions.bottom = false;
    this.onGround = false;

    if (this.scene) {
      for (const obj of this.scene.objects) {
        if (obj !== this && obj.collidesWith) {
          const col = this._checkCollision(obj);
          if (col.hit) {
            if (col.top && this.vy > 0) {
              // cayó sobre el objeto
              this.y = oldY;
              this.collisions.bottom = true;
              this.vy = 0;
              this.onGround = true;
            }
            if (col.bottom && this.vy < 0) {
              // golpeó desde abajo
              this.y = oldY;
              this.collisions.top = true;
              this.vy = 0;
            }
          }
        }
      }
    }
  }

  draw(ctx) {
    if (!this.image) return;
    const cam = this.scene?.camera ?? { x: 0, y: 0 };
    if (this.currentAnim) {
      const { x, y, w, h } = this.animations[this.currentAnim].frame;
      ctx.drawImage(
        this.image, // sprite-sheet
        x,
        y,
        w,
        h, // recorte fuente
        this.x - cam.x,
        this.y - cam.y,
        w,
        h // tamaño destino (≈ igual al frame)
      );
    } else {
      ctx.drawImage(
        this.image,
        this.x - cam.x,
        this.y - cam.y,
        this.width,
        this.height
      );
    }
  }

  // Métodos para ajustar la caja de colisión
  setCollisionBox(width, height, offsetX = 0, offsetY = 0) {
    this.collisionBox.width = width;
    this.collisionBox.height = height;
    this.collisionBox.offset.x = offsetX;
    this.collisionBox.offset.y = offsetY;
  }

  // Métodos para ajustar física
  setGravity(gravity) {
    this.gravity = gravity;
  }

  setFriction(friction) {
    this.friction = friction;
  }

  // Métodos para control de movimiento
  moveLeft(speed) {
    this.vx = -speed;
  }

  moveRight(speed) {
    this.vx = speed;
  }

  jump(force) {
    if (this.onGround) {
      this.vy = -force;
      this.onGround = false;
    }
  }

  stopMovement() {
    this.vx = 0;
    this.vy = 0;
  }

  // Propiedad para activar/desactivar depuración
  get debug() {
    return this._debug;
  }

  set debug(value) {
    this._debug = value;
  }
}

/********************************************************************************************
 * InputManager: teclado, ratón y gamepad básico
 */
class InputManager {
  constructor(canvas) {
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    window.addEventListener("keydown", (e) => (this.keys[e.key] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.key] = false));
    canvas.addEventListener("mousedown", (e) => {
      this.mouse.down = true;
      this._setMousePos(e);
    });
    canvas.addEventListener("mouseup", (e) => {
      this.mouse.down = false;
      this._setMousePos(e);
    });
    canvas.addEventListener("mousemove", (e) => this._setMousePos(e));
  }

  _setMousePos(e) {
    const rect = e.target.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  isDown(key) {
    return !!this.keys[key];
  }

  update() {
    // aquí podríamos añadir gamepad poll
  }
}

/********************************************************************************************
 * AssetLoader: imágenes y audio
 */
class AssetLoader {
  constructor() {
    this.images = {};
    this.sounds = {};
    this.masterVolume = 1;
    this.currentMusic = null;
  }

  loadAsset({ type, key, src }) {
    if (type === "image") return this.loadImage(key, src);
    if (type === "audio") return this.loadAudio(key, src);
  }

  loadImage(key, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        resolve(img);
      };
      img.src = src;
    });
  }

  loadAudio(key, src) {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.oncanplaythrough = () => {
        this.sounds[key] = audio;
        resolve(audio);
      };
      audio.load();
    });
  }

  getImage(key) {
    return this.images[key];
  }

  /** Reproduce un sonido con opciones */
  playSound(key, { volume = 1, loop = false, restart = true } = {}) {
    const original = this.sounds[key];
    if (!original) return;
    const s = original.cloneNode(); // nuevo Audio ⇒ varias instancias
    s.volume = Math.max(0, Math.min(1, volume)) * this.masterVolume;
    s.loop = loop;
    if (restart) s.currentTime = 0;
    s.play().catch(() => {}); // ignora bloqueo de autoplay
  }

  /** Detiene y rebobina */
  stopSound(key) {
    const s = this.sounds[key];
    if (s) {
      s.pause();
      s.currentTime = 0;
    }
  }

  /** Volumen maestro 0-1 para todo el juego */
  setMasterVolume(v) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    for (const s of Object.values(this.sounds))
      s.volume = Math.min(s.volume, 1) * this.masterVolume;
  }

  playMusic(key, { loop = true, volume = 1 } = {}) {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
    const original = this.sounds[key];
    if (!original) return;
    const music = original.cloneNode();
    music.loop = loop;
    music.volume = volume * this.masterVolume;
    music.play().catch(() => {});
    this.currentMusic = music;
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }
}

/* ─────────────────────────  Animation  ───────────────────────── */
class Animation {
  /**
   * @param {Object[]} frames  Array de rects fuente: {x,y,w,h}
   * @param {number}   fps     Fotogramas por segundo (≅ 12 – 24)
   * @param {boolean}  loop    ¿Se repite al terminar?
   */
  constructor({ frames, fps = 12, loop = true }) {
    this.frames = frames;
    this.fps = fps;
    this.loop = loop;
    this.index = 0;
    this._elapsed = 0;
    this._delay = 1 / fps; // tiempo de cada frame en segundos
  }
  /** Avanza la animación en función de dt (segundos) */
  update(dt) {
    this._elapsed += dt;
    while (this._elapsed >= this._delay) {
      this._elapsed -= this._delay;
      this.index++;
      if (this.index >= this.frames.length) {
        this.index = this.loop ? 0 : this.frames.length - 1;
      }
    }
  }
  reset() {
    this.index = 0;
    this._elapsed = 0;
  }
  /** Rectángulo fuente actual {x,y,w,h} */
  get frame() {
    return this.frames[this.index];
  }
}

/**
 * Exportamos para uso con módulos si deseado
 */
// Las clases ahora están disponibles globalmente
//export { Game, Scene, Sprite, Camera, QuadTree, AssetLoader, Animation };

// motor2D.js – añadido soporte para máquinas de estado reutilizables

class StateMachine {
  constructor({ initial, states = {} }) {
    this.states = states;
    this.current = initial;
    this.previous = null;

    if (this.states[this.current]?.onEnter) {
      this.states[this.current].onEnter();
    }
  }

  transition(newState) {
    if (newState === this.current) return;
    if (!this.states[newState]) return;

    if (this.states[this.current]?.onExit) {
      this.states[this.current].onExit();
    }

    this.previous = this.current;
    this.current = newState;

    if (this.states[this.current]?.onEnter) {
      this.states[this.current].onEnter();
    }
  }

  get state() {
    return this.current;
  }

  get last() {
    return this.previous;
  }
}

// Export (si se usa con módulos, opcional)
// export { StateMachine };

// Ahora puedes usar StateMachine dentro de tus clases del motor o escenas como:
// this.fsm = new StateMachine({ initial: "idle", states: { idle: { onEnter: ... }, ... } });