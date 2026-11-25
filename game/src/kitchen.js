// The kitchen itself: the chef, what they carry, the plate, the burners, the
// chopping board, and every interaction. Render only reads this state.
import {
  W, H, CHEF, STATIONS, CRATES, CHOP_SECONDS, COOK_SECONDS, BURN_SECONDS,
  COMBO_WINDOW, SHIFT_SECONDS, INGREDIENTS,
} from './config.js';
import { makeRng, range } from './random.js';

export const CARRY_NONE = null;

function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

function stationCentre(st) { return { x: st.x + st.w / 2, y: st.y + st.h / 2 }; }

export class Particle {
  constructor(x, y, vx, vy, life, size, color, gravity) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life; this.size = size; this.color = color;
    this.gravity = gravity || 0;
  }
  step(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt; this.vy += this.gravity * dt;
    this.life -= dt;
  }
  get alive() { return this.life > 0; }
}

export class FloatText {
  constructor(x, y, text, color, big) {
    this.x = x; this.y = y; this.text = text; this.color = color;
    this.life = 1.4; this.maxLife = 1.4; this.big = !!big;
  }
  step(dt) { this.y -= 42 * dt; this.life -= dt; }
  get alive() { return this.life > 0; }
}

export class Kitchen {
  constructor(board, sfx, seed) {
    this.board = board;
    this.sfx = sfx;
    this.rng = makeRng(seed);
    this.chef = { x: W / 2, y: 560, facing: 1, moving: false, bob: 0 };
    this.carried = CARRY_NONE; // {id, prep} prep: 'raw' | 'chopped' | 'cooked' | 'burnt'
    this.plate = []; // steps on the plating counter, e.g. 'tomato:chopped'
    this.plateCarried = false; // the chef is carrying the plate
    this.burners = [
      { item: null, progress: 0, state: 'empty' }, // state: empty|cooking|cooked|burnt
      { item: null, progress: 0, state: 'empty' },
    ];
    this.chopping = null; // {id, progress} while the board is being worked
    this.chopPulse = 0;
    this.particles = [];
    this.texts = [];
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.timeLeft = SHIFT_SECONDS;
    this.elapsed = 0;
    this.servedFlash = 0;
    this.wrongFlash = 0;
    this.steamTimer = 0;
    this.trauma = 0; // screen shake, decays to rest
    this.alarmPlayed = new Set();
  }

  get shiftOver() { return this.timeLeft <= 0; }
  get rush() { return this.timeLeft <= 30 && this.timeLeft > 0; }

  nearestStation() {
    let best = null;
    let bestD = 1e9;
    for (const [name, st] of Object.entries(STATIONS)) {
      // Distance from the chef to the closest point of the station's rect.
      const cx = Math.max(st.x, Math.min(this.chef.x, st.x + st.w));
      const cy = Math.max(st.y, Math.min(this.chef.y, st.y + st.h));
      const d = dist(this.chef.x, this.chef.y, cx, cy);
      if (d < bestD) { bestD = d; best = name; }
    }
    return bestD < 85 ? best : null;
  }

  crateAt(x, y) {
    let best = null;
    let bestD = 120;
    for (const crate of CRATES) {
      const d = dist(x, y, crate.x, crate.y);
      if (d < bestD) { bestD = d; best = crate.id; }
    }
    return best;
  }

  burst(x, y, n, color, speed, size, gravity) {
    for (let i = 0; i < n; i += 1) {
      const a = this.rng() * Math.PI * 2;
      const v = range(this.rng, speed * 0.4, speed);
      this.particles.push(new Particle(x, y, Math.cos(a) * v, Math.sin(a) * v - 30, range(this.rng, 0.4, 0.9), range(this.rng, size * 0.6, size * 1.4), color, gravity ?? 220));
    }
  }

  steam(x, y) {
    this.particles.push(new Particle(x + range(this.rng, -8, 8), y, range(this.rng, -6, 6), range(this.rng, -55, -35), range(this.rng, 0.7, 1.2), range(this.rng, 5, 9), 'rgba(255,255,255,0.55)', -20));
  }

  addScore(points, x, y) {
    this.score += points;
    this.texts.push(new FloatText(x, y, `+${points}`, '#e8b23a', true));
  }

  /** Pick a specific crate (mouse click on it, or keys 1-6 near the pantry). */
  selectCrate(id) {
    if (this.nearestStation() !== 'pantry') return false;
    if (this.carried || this.plateCarried) return false;
    this.carried = { id, prep: 'raw' };
    this.sfx.pickup();
    const crate = CRATES.find((c) => c.id === id);
    this.burst(crate.x, crate.y + 20, 6, INGREDIENTS[id].color, 90, 4);
    return true;
  }

  /** One interaction press at the chef's current station. */
  interact() {
    const station = this.nearestStation();
    if (!station) return;
    if (station === 'pantry') {
      if (this._pendingCrate) {
        if (this.selectCrate(this._pendingCrate)) this._pendingCrate = null;
        return;
      }
      const crate = this.crateAt(this.chef.x, this.chef.y);
      if (!crate) return;
      if (this.carried || this.plateCarried) return;
      this.carried = { id: crate, prep: 'raw' };
      this.sfx.pickup();
      this.burst(this.chef.x, this.chef.y - 20, 6, INGREDIENTS[crate].color, 90, 4);
      return;
    }
    if (station === 'trash') {
      if (this.carried) { this.carried = CARRY_NONE; this.sfx.place(); }
      else if (this.plateCarried) { this.plate = []; this.plateCarried = false; this.sfx.place(); }
      return;
    }
    if (station === 'chop') {
      if (this.carried && INGREDIENTS[this.carried.id].chop && this.carried.prep === 'raw' && !this.chopping) {
        this.chopping = { id: this.carried.id, progress: 0 };
        this.carried = CARRY_NONE;
        this.sfx.place();
      }
      return;
    }
    if (station === 'stove') {
      if (this.carried && INGREDIENTS[this.carried.id].cook && this.carried.prep === 'raw') {
        const burner = this.burners.find((b) => b.state === 'empty');
        if (burner) {
          burner.item = this.carried.id; burner.progress = 0; burner.state = 'cooking';
          this.carried = CARRY_NONE;
          this.sfx.place();
          this.sfx.startSizzle();
        }
      } else if (!this.carried) {
        const burner = this.burners.find((b) => b.state === 'cooked' || b.state === 'burnt');
        if (burner) {
          this.carried = { id: burner.item, prep: burner.state === 'cooked' ? 'cooked' : 'burnt' };
          burner.item = null; burner.progress = 0; burner.state = 'empty';
          this.sfx.pickup();
          if (!this.burners.some((b) => b.state === 'cooking')) this.sfx.stopSizzle();
        }
      }
      return;
    }
    if (station === 'assembly') {
      if (this.plateCarried) {
        this.plateCarried = false; // put the plate back down
        this.sfx.place();
      } else if (this.carried) {
        if (this.carried.prep === 'burnt') { this.wrongFlash = 0.5; this.sfx.wrong(); return; }
        this.plate.push(`${this.carried.id}:${this.carried.prep}`);
        this.carried = CARRY_NONE;
        this.sfx.place();
        this.burst(934, 244, 8, '#e8b23a', 80, 3.5);
      } else if (this.plate.length > 0) {
        this.plateCarried = true;
        this.sfx.pickup();
      }
      return;
    }
    if (station === 'serve') {
      if (!this.plateCarried || this.plate.length === 0) return;
      const order = this.board.servePlate(this.plate);
      if (order) {
        const timeBonus = Math.round(order.patience * 2);
        this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
        this.comboTimer = COMBO_WINDOW;
        const points = (order.recipe.base + timeBonus) * Math.min(this.combo, 5);
        this.addScore(points, 1174, 300);
        this.texts.push(new FloatText(1174, 330, this.combo > 1 ? `COMBO x${Math.min(this.combo, 5)}` : 'SERVED!', '#4c9a6d', true));
        this.sfx.serve();
        this.burst(1174, 280, 26, '#e8b23a', 170, 5);
        this.burst(1174, 280, 14, '#4c9a6d', 130, 4);
        this.servedFlash = 0.9;
        this.trauma = Math.min(1, this.trauma + 0.25);
        this.plate = [];
        this.plateCarried = false;
      } else {
        this.wrongFlash = 0.7;
        this.sfx.wrong();
        this.texts.push(new FloatText(1174, 300, 'NO ORDER MATCHES', '#c22f1e', true));
        this.trauma = Math.min(1, this.trauma + 0.35);
      }
    }
  }

  update(dt, input) {
    if (this.shiftOver) return;
    this.elapsed += dt;
    this.timeLeft = Math.max(0, SHIFT_SECONDS - this.elapsed);

    // Movement: keys win over click-to-move.
    const axis = input.axis();
    let mx = axis.x;
    let my = axis.y;
    if (mx === 0 && my === 0 && input.moveTarget) {
      const dx = input.moveTarget.x - this.chef.x;
      const dy = input.moveTarget.y - this.chef.y;
      const d = Math.hypot(dx, dy);
      if (d < 8) input.clearMoveTarget();
      else { mx = dx / d; my = dy / d; }
    }
    const len = Math.hypot(mx, my) || 1;
    const speed = CHEF.speed;
    const nx = this.chef.x + (mx / len) * speed * dt;
    const ny = this.chef.y + (my / len) * speed * dt;
    // Keep the chef on the floor, out of the counters and the HUD.
    const inCounter = (x, y) => Object.values(STATIONS).some((st) => x > st.x - CHEF.radius * 0.7 && x < st.x + st.w + CHEF.radius * 0.7 && y > st.y - CHEF.radius * 0.7 && y < st.y + st.h + CHEF.radius * 0.7);
    if (nx > 40 && nx < W - 40 && !inCounter(nx, this.chef.y)) this.chef.x = nx;
    if (ny > 330 && ny < H - 34 && !inCounter(this.chef.x, ny)) this.chef.y = ny;
    this.chef.moving = mx !== 0 || my !== 0;
    if (mx !== 0) this.chef.facing = mx > 0 ? 1 : -1;
    if (this.chef.moving) this.chef.bob += dt * 11;

    // Click on a crate: walk to the pantry, then pick that crate.
    // Click on a station: walk there, then interact on arrival.
    const click = input.consumeClick();
    if (click) {
      const crate = CRATES.find((c) => dist(click.x, click.y, c.x, c.y) < 40);
      if (crate) {
        this._pendingCrate = crate.id;
        input.moveTarget = { x: crate.x, y: STATIONS.pantry.y + STATIONS.pantry.h + 60 };
      } else {
        const station = Object.entries(STATIONS).find(([, st]) => click.x >= st.x && click.x <= st.x + st.w && click.y >= st.y && click.y <= st.y + st.h);
        if (station) {
          const c = stationCentre(station[1]);
          input.moveTarget = { x: c.x, y: c.y + station[1].h / 2 + 60 };
          this._pendingInteract = station[0];
        }
      }
    }
    if (this._pendingCrate && this.nearestStation() === 'pantry') {
      this.selectCrate(this._pendingCrate);
      this._pendingCrate = null;
      input.clearMoveTarget();
    }
    if (this._pendingInteract) {
      if (this.nearestStation() === this._pendingInteract) {
        this.interact();
        this._pendingInteract = null;
        input.clearMoveTarget();
      } else if (!input.moveTarget) this._pendingInteract = null;
    }

    // Chopping: hold E near the board.
    if (this.chopping) {
      if (input.interactHeld && this.nearestStation() === 'chop') {
        this.chopping.progress += dt / CHOP_SECONDS;
        this.chopPulse += dt;
        if (this.chopPulse > 0.28) {
          this.chopPulse = 0;
          this.sfx.chop();
          this.burst(378, 244, 7, INGREDIENTS[this.chopping.id].color, 110, 4);
          this.trauma = Math.min(1, this.trauma + 0.06);
        }
        if (this.chopping.progress >= 1) {
          this.carried = { id: this.chopping.id, prep: 'chopped' };
          this.chopping = null;
          this.sfx.chopDone();
          this.burst(378, 244, 12, '#e8b23a', 120, 4);
        }
      } else if (this.chopping.progress > 0 && this.chopping.progress < 1) {
        // Walked away mid-chop: the piece stays on the board, progress kept.
      }
    }

    // Burners cook in real time.
    for (const burner of this.burners) {
      if (burner.state === 'cooking' || burner.state === 'cooked') {
        burner.progress += dt;
        if (burner.state === 'cooking' && burner.progress >= COOK_SECONDS) {
          burner.state = 'cooked';
          this.sfx.cookDone();
          this.burst(656, 244, 10, '#e8b23a', 100, 4);
        } else if (burner.state === 'cooked' && burner.progress >= COOK_SECONDS + BURN_SECONDS) {
          burner.state = 'burnt';
          this.sfx.burn();
          this.texts.push(new FloatText(656, 220, 'BURNT!', '#c22f1e', true));
        }
      }
    }

    // Steam over anything cooking.
    this.steamTimer -= dt;
    if (this.steamTimer <= 0) {
      this.steamTimer = 0.12;
      for (const [i, burner] of this.burners.entries()) {
        if (burner.state === 'cooking' || burner.state === 'cooked') this.steam(606 + i * 100, 232);
      }
    }

    // Orders + alarms.
    const expired = this.board.tick(dt, this.elapsed);
    for (const order of expired) {
      this.combo = 0;
      this.comboTimer = 0;
      this.texts.push(new FloatText(640, 180, `Lost: ${order.recipe.name}`, '#c22f1e', true));
      this.sfx.alarm();
    }
    for (const order of this.board.orders) {
      if (order.urgent && !this.alarmPlayed.has(order.id)) {
        this.alarmPlayed.add(order.id);
        this.sfx.alarm();
      }
    }

    // Combo decay, flashes, shake decay, particles.
    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.combo = 0; }
    if (this.servedFlash > 0) this.servedFlash -= dt;
    if (this.wrongFlash > 0) this.wrongFlash -= dt;
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    for (const p of this.particles) p.step(dt);
    this.particles = this.particles.filter((p) => p.alive);
    for (const t of this.texts) t.step(dt);
    this.texts = this.texts.filter((t) => t.alive);

    // Last-10-seconds tick.
    if (this.timeLeft <= 10 && this.timeLeft > 0) {
      const whole = Math.ceil(this.timeLeft);
      if (this._lastTick !== whole) { this._lastTick = whole; this.sfx.tick(); }
    }
  }
}
