// Every pixel the player sees: the kitchen, the food, the chef, the order
// board, the HUD and the title / pause / shift-over screens. Canvas 2D only.
import { W, H, PALETTE, STATIONS, CRATES, INGREDIENTS, RECIPES, SHIFT_SECONDS } from './config.js';
import { stepsKey } from './orders.js';

const P = PALETTE;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight, align, font) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 700} ${size}px ${font || 'system-ui, sans-serif'}`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function shadowText(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = `${weight || 700} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x + 2, y + 2);
  text(ctx, s, x, y, size, color, weight, align);
}

/** Draw one ingredient as a small vector dish, size s across. prep: raw|chopped|cooked|burnt. */
export function drawFood(ctx, id, x, y, s, prep) {
  ctx.save();
  ctx.translate(x, y);
  const u = s / 40;
  if (prep === 'burnt') {
    ctx.fillStyle = '#241a12';
    ctx.beginPath(); ctx.arc(0, 0, 15 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2c1e';
    ctx.beginPath(); ctx.arc(-4 * u, -3 * u, 5 * u, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }
  if (prep === 'chopped') {
    // Three neat pieces, same colours, sliced look.
    const col = INGREDIENTS[id].color;
    ctx.fillStyle = col;
    for (const [dx, dy, w] of [[-11, -4, 13], [2, -8, 12], [8, 6, 13]]) {
      ctx.save();
      ctx.translate(dx * u, dy * u);
      ctx.rotate(0.4);
      ctx.beginPath(); ctx.ellipse(0, 0, w * u / 2, 6 * u, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(-6 * u, -6 * u, 4 * u, 2 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }
  switch (id) {
    case 'tomato': {
      ctx.fillStyle = '#d94f3d';
      ctx.beginPath(); ctx.arc(0, 2 * u, 14 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b93a2c';
      ctx.beginPath(); ctx.arc(5 * u, 7 * u, 8 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4c9a6d';
      ctx.beginPath(); ctx.ellipse(0, -11 * u, 7 * u, 3.5 * u, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5da24a';
      ctx.beginPath(); ctx.ellipse(-6 * u, -8 * u, 5 * u, 2.5 * u, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(6 * u, -8 * u, 5 * u, 2.5 * u, 0.6, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#5da24a';
      for (const a of [0, 1.1, 2.2, 3.3, 4.4, 5.5]) {
        ctx.beginPath(); ctx.arc(Math.cos(a) * 10 * u, Math.sin(a) * 10 * u + 2 * u, 7 * u, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#7cbf63';
      ctx.beginPath(); ctx.arc(0, 2 * u, 9 * u, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#4c8a3e'; ctx.lineWidth = 1.5 * u;
      ctx.beginPath(); ctx.arc(0, 2 * u, 5 * u, 0.3, 2.4); ctx.stroke();
      break;
    }
    case 'onion': {
      ctx.fillStyle = '#b678c2';
      ctx.beginPath(); ctx.arc(0, 2 * u, 13 * u, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e3c4ea'; ctx.lineWidth = 2 * u;
      ctx.beginPath(); ctx.arc(0, 2 * u, 8 * u, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 2 * u, 4 * u, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#8fb573';
      ctx.beginPath(); ctx.ellipse(0, -12 * u, 4 * u, 5 * u, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath(); ctx.moveTo(-14 * u, 8 * u); ctx.lineTo(14 * u, 8 * u); ctx.lineTo(14 * u, -4 * u); ctx.lineTo(-2 * u, -12 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e0a52e';
      ctx.beginPath(); ctx.arc(2 * u, 0, 2.5 * u, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(8 * u, 3 * u, 2 * u, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-6 * u, 2 * u, 2 * u, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'patty': {
      ctx.fillStyle = prep === 'cooked' ? '#6b4426' : '#a06a48';
      ctx.beginPath(); ctx.ellipse(0, 2 * u, 15 * u, 10 * u, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = prep === 'cooked' ? '#8a5a33' : '#c08a5e';
      ctx.beginPath(); ctx.ellipse(-3 * u, 0, 9 * u, 5 * u, 0, 0, Math.PI * 2); ctx.fill();
      if (prep === 'cooked') {
        ctx.strokeStyle = '#4a2f1a'; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(-8 * u, -2 * u); ctx.lineTo(8 * u, -2 * u); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6 * u, 4 * u); ctx.lineTo(6 * u, 4 * u); ctx.stroke();
      }
      break;
    }
    case 'bun': {
      ctx.fillStyle = '#c98d4a';
      ctx.beginPath(); ctx.ellipse(0, 8 * u, 15 * u, 5 * u, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8b96a';
      ctx.beginPath(); ctx.arc(0, 4 * u, 14 * u, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f7d795';
      ctx.beginPath(); ctx.ellipse(-5 * u, -4 * u, 4 * u, 2.5 * u, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3cf';
      ctx.beginPath(); ctx.arc(-4 * u, -7 * u, 1.6 * u, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4 * u, -9 * u, 1.6 * u, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7 * u, -3 * u, 1.4 * u, 0, Math.PI * 2); ctx.fill();
      break;
    }
    default: break;
  }
  ctx.restore();
}

function drawTicket(ctx, order, x, y, w, h, now) {
  const urgent = order.patienceRatio < 0.22;
  const blink = urgent && Math.floor(now * 3) % 2 === 0;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = blink ? '#ffe1d6' : P.ticket;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = urgent ? P.danger : P.ticketEdge;
  ctx.lineWidth = urgent ? 3 : 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  // Ticket number + name.
  text(ctx, `#${order.id}`, x + 12, y + 16, 12, '#8a6a3a', 800, 'left');
  text(ctx, order.recipe.name.toUpperCase(), x + w / 2, y + 18, 15, P.ink, 800);
  // Recipe steps as food icons.
  const stepW = Math.min(44, (w - 24) / order.recipe.steps.length);
  order.recipe.steps.forEach((step, i) => {
    const [id, prep] = step.split(':');
    drawFood(ctx, id, x + 22 + stepW * (i + 0.5), y + 48, 30, prep === 'raw' ? 'raw' : prep);
  });
  // Patience bar + seconds, both inside the ticket.
  const bw = w - 58;
  const bx = x + 12;
  const by = y + h - 16;
  rr(ctx, bx, by, bw, 9, 4);
  ctx.fillStyle = '#e3d3ae';
  ctx.fill();
  const ratio = order.patienceRatio;
  rr(ctx, bx, by, Math.max(6, bw * ratio), 9, 4);
  ctx.fillStyle = ratio > 0.5 ? P.greenLight : ratio > 0.22 ? P.gold : P.danger;
  ctx.fill();
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 10, by + 5, 11, urgent ? P.danger : '#8a6a3a', 800, 'right');
}

function drawCounter(ctx, st, label) {
  ctx.fillStyle = P.counterSide;
  rr(ctx, st.x, st.y, st.w, st.h, 8);
  ctx.fill();
  ctx.fillStyle = P.counterTop;
  rr(ctx, st.x, st.y, st.w, 26, 8);
  ctx.fill();
  ctx.fillStyle = P.counterEdge;
  ctx.fillRect(st.x, st.y + 22, st.w, 4);
  text(ctx, label, st.x + st.w / 2, st.y + st.h - 14, 12, 'rgba(255,255,255,0.85)', 800);
}

/** Bottom counter run along the south wall — decor only, no gameplay:
 *  sink with taps, spice rack, prep board, stacked copper pots. */
function drawSouthCounter(ctx) {
  const x0 = 120, y0 = 652, w = 1136, h = 56;
  ctx.fillStyle = P.counterSide;
  rr(ctx, x0, y0, w, h, 8);
  ctx.fill();
  ctx.fillStyle = P.counterTop;
  rr(ctx, x0, y0, w, 26, 8);
  ctx.fill();
  ctx.fillStyle = P.counterEdge;
  ctx.fillRect(x0, y0 + 22, w, 4);
  // Section dividers.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (const dx of [340, 700, 980]) ctx.fillRect(x0 + dx, y0 + 26, 3, h - 26);

  // Sink: steel basin inset in the counter top, gooseneck tap above it.
  ctx.fillStyle = '#7d8891';
  rr(ctx, 182, 654, 146, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#aeb8bf';
  rr(ctx, 188, 657, 134, 16, 5);
  ctx.fill();
  ctx.fillStyle = '#8fa8c8';
  ctx.beginPath(); ctx.ellipse(255, 665, 52, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5d6a72';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(255, 656); ctx.lineTo(255, 636); ctx.lineTo(283, 636); ctx.lineTo(283, 645); ctx.stroke();
  ctx.fillStyle = P.copper;
  ctx.beginPath(); ctx.arc(232, 654, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(278, 654, 5, 0, Math.PI * 2); ctx.fill();
  // Clean plates stacked beside the sink.
  ctx.fillStyle = '#fdfbf4';
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath(); ctx.ellipse(392, 672 - i * 5, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#c9b98f';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(392, 662, 26, 6, 0, 0, Math.PI * 2); ctx.stroke();

  // Spice rack: back plank with five little jars.
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(500, 644, 300, 8);
  const jarCols = ['#d94f3d', '#5da24a', '#e8b23a', '#8a5a3b', '#f2e3c2'];
  jarCols.forEach((col, i) => {
    const jx = 522 + i * 58;
    ctx.fillStyle = 'rgba(251,243,223,0.85)';
    rr(ctx, jx, 618, 34, 26, 4);
    ctx.fill();
    ctx.fillStyle = col;
    rr(ctx, jx + 4, 630, 26, 14, 3);
    ctx.fill();
    ctx.fillStyle = '#8a5a33';
    rr(ctx, jx + 2, 614, 30, 6, 3);
    ctx.fill();
  });

  // Prep board: cutting board with chopped bits, a knife, whole veg beside it.
  ctx.fillStyle = '#e8d9b0';
  rr(ctx, 860, 640, 150, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#b89a68';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath(); ctx.ellipse(905, 656, 9, 5, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(925, 666, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b678c2';
  ctx.beginPath(); ctx.arc(955, 660, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e3c4ea';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(955, 660, 3.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#5da24a';
  ctx.beginPath(); ctx.ellipse(985, 668, 8, 4, 0.5, 0, Math.PI * 2); ctx.fill();
  // Knife lying across the board's corner.
  ctx.save();
  ctx.translate(948, 650);
  ctx.rotate(0.5);
  ctx.fillStyle = '#c8ccd0';
  ctx.fillRect(0, -3, 26, 6);
  ctx.fillStyle = '#5d341f';
  ctx.fillRect(-14, -3, 14, 6);
  ctx.restore();
  drawFood(ctx, 'tomato', 1046, 652, 26, 'raw');
  drawFood(ctx, 'onion', 1078, 664, 26, 'raw');

  // Stacked copper pots + a ladle leaning on the end.
  ctx.fillStyle = P.copperDark;
  rr(ctx, 1140, 648, 96, 24, 6);
  ctx.fill();
  ctx.fillStyle = P.copper;
  rr(ctx, 1148, 630, 80, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#5d341f';
  ctx.beginPath(); ctx.arc(1188, 630, 24, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(1236, 626); ctx.lineTo(1250, 664); ctx.stroke();
  ctx.fillStyle = P.copper;
  ctx.beginPath(); ctx.arc(1251, 666, 6, 0, Math.PI * 2); ctx.fill();
}

/** Floor-level props in the open middle band: a veg crate and a herb pot. */
function drawFloorProps(ctx) {
  // Wooden crate of vegetables, bottom-left of the rug.
  ctx.fillStyle = '#8a5a33';
  rr(ctx, 118, 470, 78, 52, 6);
  ctx.fill();
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(118, 492, 78, 4);
  ctx.fillRect(152, 470, 4, 52);
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath(); ctx.arc(140, 466, 11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(172, 462, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5da24a';
  ctx.beginPath(); ctx.arc(156, 468, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4c9a6d';
  ctx.beginPath(); ctx.ellipse(156, 460, 6, 3, -0.5, 0, Math.PI * 2); ctx.fill();

  // Potted herb plant, bottom-right — clear of the serve flash text.
  ctx.fillStyle = '#b65a2e';
  ctx.beginPath(); ctx.moveTo(1128, 516); ctx.lineTo(1172, 516); ctx.lineTo(1166, 548); ctx.lineTo(1134, 548); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a3f1d';
  ctx.fillRect(1126, 512, 48, 7);
  ctx.strokeStyle = '#2f6b4f';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(1150, 514); ctx.lineTo(1150, 492); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1150, 500); ctx.lineTo(1138, 488); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1150, 500); ctx.lineTo(1162, 488); ctx.stroke();
  ctx.fillStyle = '#4c9a6d';
  ctx.beginPath(); ctx.arc(1150, 486, 11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1136, 494, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1164, 494, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5da24a';
  ctx.beginPath(); ctx.arc(1150, 496, 8, 0, Math.PI * 2); ctx.fill();
}

export function drawKitchen(ctx, kitchen, board, now) {
  const k = kitchen;
  ctx.save();
  // Screen shake: camera offset only, trauma squared.
  if (k.trauma > 0) {
    const s = k.trauma * k.trauma * 7;
    ctx.translate((Math.random() * 2 - 1) * s, (Math.random() * 2 - 1) * s);
  }
  // Floor: warm checker tiles with deterministic per-tile tint variation,
  // so it reads as worn kitchen tile, not a flat checkerboard.
  const tile = 64;
  const tileHash = (tx, ty) => {
    let h = (tx * 73856093) ^ (ty * 19349663);
    h = (h ^ (h >> 13)) >>> 0;
    return h % 100;
  };
  for (let ty = 0; ty < 12; ty += 1) {
    for (let tx = 0; tx < 20; tx += 1) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? P.floorA : P.floorB;
      ctx.fillRect(tx * tile, 156 + ty * tile, tile, tile);
      const v = tileHash(tx, ty);
      if (v < 14) {
        ctx.fillStyle = 'rgba(255,246,220,0.10)';
        ctx.fillRect(tx * tile, 156 + ty * tile, tile, tile);
      } else if (v < 28) {
        ctx.fillStyle = 'rgba(122,74,26,0.07)';
        ctx.fillRect(tx * tile, 156 + ty * tile, tile, tile);
      } else if (v === 97) {
        // Rare accent tile: a faint copper diamond inlay.
        ctx.fillStyle = 'rgba(201,111,46,0.20)';
        ctx.beginPath();
        ctx.moveTo(tx * tile + 32, 156 + ty * tile + 14);
        ctx.lineTo(tx * tile + 50, 156 + ty * tile + 32);
        ctx.lineTo(tx * tile + 32, 156 + ty * tile + 50);
        ctx.lineTo(tx * tile + 14, 156 + ty * tile + 32);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  for (let ty = 0; ty < 12; ty += 1) ctx.fillRect(0, 156 + ty * tile, W, 2);
  for (let tx = 0; tx < 20; tx += 1) ctx.fillRect(tx * tile, 156, 2, H - 156);

  // Wall band + copper trim above the counters.
  ctx.fillStyle = P.wall;
  ctx.fillRect(0, 156, W, 34);
  ctx.fillStyle = P.copper;
  ctx.fillRect(0, 186, W, 5);
  text(ctx, 'T H E   C O P P E R   L A D L E', W / 2, 173, 15, '#f7e3c2', 800);
  // Copper pans hanging on the wall band, out of the walkway.
  for (const px of [52, 1228]) {
    ctx.fillStyle = P.copper;
    ctx.beginPath(); ctx.arc(px, 173, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5d341f';
    ctx.beginPath(); ctx.arc(px, 173, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.copper;
    ctx.fillRect(px - 2, 160, 4, 6);
  }
  // Hanging herb bundle, left of the title.
  ctx.strokeStyle = '#d9b96a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(252, 158); ctx.lineTo(252, 168); ctx.stroke();
  ctx.fillStyle = '#2f6b4f';
  ctx.beginPath(); ctx.ellipse(244, 176, 6, 9, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(260, 176, 6, 9, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4c9a6d';
  ctx.beginPath(); ctx.ellipse(252, 178, 6, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fbf3df';
  ctx.beginPath(); ctx.arc(252, 186, 4, 0, Math.PI * 2); ctx.fill();
  // Plate shelf, right of the title: three plates standing on a plank.
  ctx.fillStyle = '#5d341f';
  ctx.fillRect(1000, 184, 118, 5);
  for (const [i, px] of [1018, 1052, 1086].entries()) {
    ctx.fillStyle = '#fdfbf4';
    ctx.beginPath(); ctx.arc(px, 174, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9b98f';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = i === 1 ? P.copper : '#e8b23a';
    ctx.beginPath(); ctx.arc(px, 174, 4, 0, Math.PI * 2); ctx.fill();
  }

  // A woven rug in the middle of the floor — the chef walks over it, as one does.
  ctx.fillStyle = '#c96f2e';
  ctx.beginPath(); ctx.ellipse(640, 560, 180, 62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d98a4a';
  ctx.beginPath(); ctx.ellipse(640, 560, 160, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f7e3c2';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(640, 560, 132, 38, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#f7e3c2';
  ctx.beginPath(); ctx.ellipse(640, 560, 26, 10, 0, 0, Math.PI * 2); ctx.fill();

  // South counter run + floor props: decor only, filling the bottom band.
  drawSouthCounter(ctx);
  drawFloorProps(ctx);

  // Pantry crates.
  drawCounter(ctx, STATIONS.pantry, 'PANTRY — pick an ingredient');
  for (const crate of CRATES) {
    ctx.fillStyle = '#d9b96a';
    rr(ctx, crate.x - 26, crate.y - 20, 52, 40, 6);
    ctx.fill();
    ctx.strokeStyle = '#a9853f';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawFood(ctx, crate.id, crate.x, crate.y - 2, 30, 'raw');
  }

  // Chop board.
  drawCounter(ctx, STATIONS.chop, 'CHOP — hold E');
  ctx.fillStyle = '#e8d9b0';
  rr(ctx, 300, 204, 156, 62, 6);
  ctx.fill();
  ctx.strokeStyle = '#b89a68';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (k.chopping) {
    drawFood(ctx, k.chopping.id, 378, 232, 40, 'chopped');
    const p = k.chopping.progress;
    ctx.strokeStyle = '#d9b96a';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(378, 235, 30, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = P.green;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(378, 235, 30, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
  }

  // Stove with two burners.
  drawCounter(ctx, STATIONS.stove, 'STOVE — 4s, burns at 10s');
  for (const [i, burner] of k.burners.entries()) {
    const bx = 606 + i * 100;
    const by = 234;
    ctx.fillStyle = '#3a3f45';
    ctx.beginPath(); ctx.arc(bx, by, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22262b';
    ctx.beginPath(); ctx.arc(bx, by, 27, 0, Math.PI * 2); ctx.fill();
    if (burner.state === 'cooking') {
      ctx.fillStyle = 'rgba(230,120,40,0.85)';
      for (let f = 0; f < 5; f += 1) {
        const a = (f / 5) * Math.PI * 2 + now * 2;
        ctx.beginPath();
        ctx.ellipse(bx + Math.cos(a) * 20, by + Math.sin(a) * 12, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (burner.item) drawFood(ctx, burner.item, bx, by, 38, burner.state === 'cooked' ? 'cooked' : burner.state === 'burnt' ? 'burnt' : 'raw');
    if (burner.state === 'cooking' || burner.state === 'cooked') {
      const ratio = Math.min(1, burner.progress / 4);
      ctx.strokeStyle = '#d9b96a'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(bx, by, 36, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = burner.state === 'cooked' ? P.greenLight : P.gold; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(bx, by, 36, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2); ctx.stroke();
    }
  }

  // Plating counter + the plate.
  drawCounter(ctx, STATIONS.assembly, 'PLATING — build the dish');
  ctx.fillStyle = '#fdfbf4';
  ctx.beginPath(); ctx.ellipse(934, 240, 62, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9b98f'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#efe7cd';
  ctx.beginPath(); ctx.ellipse(934, 240, 46, 15, 0, 0, Math.PI * 2); ctx.fill();
  if (k.plate.length && !k.plateCarried) {
    k.plate.forEach((step, i) => {
      const [id, prep] = step.split(':');
      drawFood(ctx, id, 934 + (i - (k.plate.length - 1) / 2) * 26, 238 - i * 7, 30, prep);
    });
  } else {
    text(ctx, 'empty plate', 934, 240, 11, '#a98f5f', 700);
  }

  // Serve window.
  drawCounter(ctx, STATIONS.serve, 'SERVE — ring the bell!');
  ctx.fillStyle = '#5d341f';
  rr(ctx, 1108, 204, 132, 56, 6);
  ctx.fill();
  ctx.fillStyle = '#f7e3c2';
  ctx.beginPath(); ctx.arc(1174, 226, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.arc(1174, 226, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(1172, 238, 4, 8);
  if (k.servedFlash > 0) {
    ctx.fillStyle = `rgba(76,154,109,${Math.min(0.5, k.servedFlash)})`;
    rr(ctx, 1092, 196, 164, 96, 8);
    ctx.fill();
  }
  if (k.wrongFlash > 0) {
    ctx.fillStyle = `rgba(194,47,30,${Math.min(0.45, k.wrongFlash)})`;
    rr(ctx, 1092, 196, 164, 96, 8);
    ctx.fill();
  }

  // Trash bin.
  ctx.fillStyle = '#6b7280';
  rr(ctx, 24, 620, 76, 76, 8);
  ctx.fill();
  ctx.fillStyle = '#4b5563';
  rr(ctx, 30, 620, 64, 12, 6);
  ctx.fill();
  text(ctx, 'TRASH', 62, 668, 11, '#fff', 800);

  // Particles.
  for (const p of k.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawChef(ctx, k);

  // Floating score texts.
  for (const t of k.texts) {
    ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
    shadowText(ctx, t.text, t.x, t.y, t.big ? 26 : 18, t.color, 800);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawChef(ctx, k) {
  const c = k.chef;
  const bob = c.moving ? Math.sin(c.bob) * 3 : 0;
  const x = c.x;
  const y = c.y + bob * 0.3;
  ctx.save();
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(x, c.y + 24, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body: white coat + green apron.
  ctx.fillStyle = '#fdfbf4';
  ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.green;
  ctx.beginPath(); ctx.ellipse(x, y + 8, 16, 14, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#fdfbf4';
  ctx.fillRect(x - 16, y + 2, 6, 16);
  ctx.fillRect(x + 10, y + 2, 6, 16);
  // Head + toque.
  ctx.fillStyle = '#f2c49b';
  ctx.beginPath(); ctx.arc(x, y - 26, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x - 8, y - 36, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 40, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 8, y - 36, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - 13, y - 38, 26, 8);
  // Eyes look the way the chef faces.
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.arc(x - 5 + c.facing * 2, y - 26, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5 + c.facing * 2, y - 26, 1.8, 0, Math.PI * 2); ctx.fill();
  // Carried item or plate above the head.
  if (k.carried) {
    drawFood(ctx, k.carried.id, x, y - 56, 34, k.carried.prep);
  } else if (k.plateCarried && k.plate.length) {
    ctx.fillStyle = '#fdfbf4';
    ctx.beginPath(); ctx.ellipse(x, y - 52, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
    k.plate.forEach((step, i) => {
      const [id, prep] = step.split(':');
      drawFood(ctx, id, x + (i - (k.plate.length - 1) / 2) * 14, y - 56 - i * 3, 18, prep);
    });
  }
  ctx.restore();
}

/** Top HUD: score, shift timer, combo, served count. */
export function drawHud(ctx, kitchen, board) {
  const k = kitchen;
  ctx.fillStyle = P.ink;
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = P.copper;
  ctx.fillRect(0, 64, W, 4);
  // Score.
  text(ctx, 'SCORE', 28, 20, 12, '#c9a86a', 800, 'left');
  text(ctx, `${k.score}`, 28, 44, 26, '#fff', 800, 'left');
  // Shift timer, centre — big, and red under 30s.
  const t = Math.max(0, k.timeLeft);
  const mm = Math.floor(t / 60);
  const ss = Math.floor(t % 60).toString().padStart(2, '0');
  const low = t <= 30 && t > 0;
  const timerColor = low ? '#ff6b57' : '#fff';
  text(ctx, k.rush ? 'RUSH HOUR' : 'SHIFT', W / 2, 18, 11, low ? '#ff9a8a' : '#c9a86a', 800);
  text(ctx, `${mm}:${ss}`, W / 2, 42, 30, timerColor, 800);
  // Timer bar under the clock.
  ctx.fillStyle = '#3a2f24';
  rr(ctx, W / 2 - 110, 58, 220, 5, 2);
  ctx.fill();
  ctx.fillStyle = low ? '#ff6b57' : P.gold;
  rr(ctx, W / 2 - 110, 58, 220 * (t / SHIFT_SECONDS), 5, 2);
  ctx.fill();
  // Combo + served.
  text(ctx, 'COMBO', W - 220, 20, 12, '#c9a86a', 800, 'right');
  text(ctx, k.combo > 1 ? `x${Math.min(k.combo, 5)}` : '—', W - 220, 44, 26, k.combo > 1 ? P.gold : '#8a7a5f', 800, 'right');
  text(ctx, 'SERVED', W - 120, 20, 12, '#c9a86a', 800, 'right');
  text(ctx, `${board.served}`, W - 120, 44, 26, '#fff', 800, 'right');
  text(ctx, 'LOST', W - 28, 20, 12, '#c9a86a', 800, 'right');
  text(ctx, `${board.lost}`, W - 28, 44, 26, board.lost ? '#ff6b57' : '#fff', 800, 'right');
}

/** Order tickets row under the HUD. */
export function drawOrders(ctx, board, now) {
  const n = board.orders.length;
  if (!n) {
    text(ctx, 'No orders yet — the first ticket is coming…', W / 2, 118, 16, '#8a6a3a', 700);
    return;
  }
  const w = 300;
  const gap = 14;
  const total = n * w + (n - 1) * gap;
  let x = (W - total) / 2;
  for (const order of board.orders) {
    drawTicket(ctx, order, x, 76, w, 72, now);
    x += w + gap;
  }
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(20,14,8,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.cream;
  rr(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = P.copper;
  ctx.lineWidth = 3;
  ctx.stroke();
}

export function drawTitle(ctx, best) {
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, W, H);
  // Warm kitchen glow behind the title.
  const grad = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 260, 520);
  grad.addColorStop(0, '#7d4a2d');
  grad.addColorStop(1, '#2b2118');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // A little plate of food as the hero.
  ctx.fillStyle = '#fdfbf4';
  ctx.beginPath(); ctx.ellipse(W / 2, 470, 190, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9b98f'; ctx.lineWidth = 3; ctx.stroke();
  drawFood(ctx, 'bun', W / 2 - 70, 440, 90, 'raw');
  drawFood(ctx, 'patty', W / 2, 430, 96, 'cooked');
  drawFood(ctx, 'tomato', W / 2 + 80, 442, 84, 'chopped');
  drawFood(ctx, 'lettuce', W / 2 - 20, 408, 80, 'chopped');
  drawFood(ctx, 'cheese', W / 2 + 40, 400, 80, 'raw');
  shadowText(ctx, 'THE COPPER LADLE', W / 2, 150, 64, '#fbf3df', 800);
  text(ctx, 'a rush-hour kitchen game', W / 2, 205, 22, P.gold, 700);
  text(ctx, 'Pick ingredients · Chop · Cook · Plate · Serve before the ticket runs out', W / 2, 560, 19, '#fbf3df', 600);
  text(ctx, 'Move: WASD / arrows or click  ·  Interact: E (hold to chop)  ·  Pantry: click a crate or press 1-6  ·  Trash: Q  ·  Pause: P', W / 2, 592, 16, '#d9c9a8', 600);
  shadowText(ctx, 'PRESS ENTER OR CLICK TO START', W / 2, 650, 20, '#fff', 800);
  if (best > 0) text(ctx, `Best shift so far: ${best}`, W / 2, 690, 14, '#c9a86a', 700);
}

export function drawPaused(ctx) {
  panel(ctx, W / 2 - 260, H / 2 - 110, 520, 220);
  shadowText(ctx, 'PAUSED', W / 2, H / 2 - 50, 44, P.ink, 800);
  text(ctx, 'P — resume    ·    M — sound    ·    R — restart shift', W / 2, H / 2 + 20, 17, '#6e4a22', 600);
}

export function drawShiftOver(ctx, kitchen, board) {
  panel(ctx, W / 2 - 320, H / 2 - 150, 640, 300);
  shadowText(ctx, 'SHIFT OVER', W / 2, H / 2 - 100, 44, P.ink, 800);
  text(ctx, `Score  ${kitchen.score}`, W / 2, H / 2 - 30, 26, P.ink, 800);
  text(ctx, `Served ${board.served} dishes  ·  Lost ${board.lost} orders  ·  Best combo x${Math.min(kitchen.combo, 5)}`, W / 2, H / 2 + 12, 17, '#6e4a22', 600);
  const verdict = kitchen.score >= 1500 ? 'A legendary service!' : kitchen.score >= 900 ? 'The dining room loves you.' : kitchen.score >= 400 ? 'A solid shift, chef.' : 'The tickets won this round.';
  text(ctx, verdict, W / 2, H / 2 + 48, 18, P.green, 700);
  shadowText(ctx, 'PRESS R TO COOK AGAIN', W / 2, H / 2 + 100, 20, P.copper, 800);
}

export { RECIPES, stepsKey };
