// Boot + game loop for The Copper Ladle. Screens: title -> play -> paused /
// shift-over. ?shot=cover|play|rush|serve stages one fixed frame for screenshots
// and exposes window.__game so automated play-tests can drive it.
import { W, H, SHIFT_SECONDS, CRATES } from './config.js';
import { makeRng } from './random.js';
import { Sfx } from './audio.js';
import { Input } from './input.js';
import { OrderBoard } from './orders.js';
import { Kitchen } from './kitchen.js';
import { drawKitchen, drawHud, drawOrders, drawTitle, drawPaused, drawShiftOver } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || Date.now() % 2147483647);

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const sfx = new Sfx();
const input = new Input(canvas);
const rng = makeRng(seed);
const board = new OrderBoard(rng);
let kitchen = new Kitchen(board, sfx, seed);

let screen = 'title';
let best = 0;
try { best = Number(localStorage.getItem('copper-ladle-best') || 0); } catch { /* storage unavailable */ }
let last = performance.now();
let statusTimer = 0;

function newShift() {
  const freshBoard = new OrderBoard(makeRng((Date.now() % 2147483647) || 1));
  board.orders = freshBoard.orders;
  board.served = 0;
  board.lost = 0;
  board.spawnIn = 2.0;
  board._elapsed = 0;
  kitchen = new Kitchen(board, sfx, (Date.now() % 2147483647) || 1);
  screen = 'play';
}

function startGame() {
  sfx.unlock();
  newShift();
}

input.onKey = (code) => {
  if (screen === 'title' && (code === 'Enter' || code === 'Space')) { startGame(); return; }
  if (code === 'KeyP' && (screen === 'play' || screen === 'paused')) {
    screen = screen === 'play' ? 'paused' : 'play';
    return;
  }
  if (code === 'KeyM') { sfx.toggleMute(); return; }
  if (code.startsWith('Digit')) {
    const n = Number(code.slice(5));
    if (screen === 'play' && n >= 1 && n <= CRATES.length) kitchen.selectCrate(CRATES[n - 1].id);
    return;
  }
  if (code === 'KeyR' && (screen === 'over' || screen === 'paused')) { startGame(); return; }
  if (screen === 'play' && code === 'KeyQ') {
    if (kitchen.carried) { kitchen.carried = null; sfx.place(); }
    else if (kitchen.plateCarried) { kitchen.plate = []; kitchen.plateCarried = false; sfx.place(); }
  }
  if (screen === 'play' && (code === 'KeyE' || code === 'Space')) {
    // E is held for chopping; a tap also interacts once.
    kitchen.interact();
  }
};

canvas.addEventListener('pointerdown', () => {
  if (screen === 'title') startGame();
});

function announce() {
  if (!statusEl) return;
  statusEl.textContent = `Score ${kitchen.score}. ${board.orders.length} orders open. ${Math.ceil(kitchen.timeLeft)} seconds left in the shift.`;
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (screen === 'play') {
    kitchen.update(dt, input);
    if (kitchen.shiftOver) {
      screen = 'over';
      if (kitchen.score > best) {
        best = kitchen.score;
        try { localStorage.setItem('copper-ladle-best', String(best)); } catch { /* storage unavailable */ }
      }
      sfx.stopSizzle();
    }
    statusTimer -= dt;
    if (statusTimer <= 0) { statusTimer = 2; announce(); }
  }
  draw(now / 1000);
  requestAnimationFrame(frame);
}

function draw(nowSeconds) {
  ctx.clearRect(0, 0, W, H);
  if (screen === 'title') {
    drawTitle(ctx, best);
    return;
  }
  drawKitchen(ctx, kitchen, board, nowSeconds);
  drawOrders(ctx, board, nowSeconds);
  drawHud(ctx, kitchen, board);
  if (screen === 'paused') drawPaused(ctx);
  if (screen === 'over') drawShiftOver(ctx, kitchen, board);
}

// Screenshot mode: stage one fixed scene, draw it once, stop the loop.
if (shotName) {
  const staged = stageShot(shotName, kitchen, board);
  screen = staged;
  // Let steam and particles settle for a few frames so the shot has life.
  for (let i = 0; i < 30; i += 1) {
    for (const p of kitchen.particles) p.step(1 / 30);
    kitchen.particles = kitchen.particles.filter((p) => p.alive);
  }
  draw(1.2);
  document.title = `The Copper Ladle — ${shotName}`;
} else {
  requestAnimationFrame(frame);
}

// Test hook: play-tests drive the real game through this.
window.__game = {
  get screen() { return screen; },
  get kitchen() { return kitchen; },
  get board() { return board; },
  start: startGame,
  newShift,
  interact: () => kitchen.interact(),
  keys: input.keys,
  setChef(x, y) { kitchen.chef.x = x; kitchen.chef.y = y; },
};
