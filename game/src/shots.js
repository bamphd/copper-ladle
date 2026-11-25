// Staged screenshot scenes (?shot=cover|play|rush|serve). Each one builds a fixed,
// deterministic kitchen state — a real frame of the game mid-shift, never a mock
// drawing — so the screenshots are honest renders of the game's own code.
import { RECIPES } from './config.js';
import { Order } from './orders.js';

function makeOrder(recipeId, patience, patienceMax) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const order = new Order(recipe, patienceMax, 0);
  order.patience = patience;
  order.urgent = patience < 8;
  return order;
}

function resetBoard(board, specs) {
  board.orders = specs.map(([id, patience, max]) => makeOrder(id, patience, max));
  board.served = 0;
  board.lost = 0;
}

/**
 * Put `kitchen` + `board` into the named scene and return the screen to draw.
 * The game loop is paused on these frames; only particles/steam advance.
 */
export function stageShot(name, kitchen, board) {
  kitchen.particles = [];
  kitchen.texts = [];
  kitchen.trauma = 0;
  kitchen.servedFlash = 0;
  kitchen.wrongFlash = 0;
  kitchen.chopping = null;
  kitchen.carried = null;
  kitchen.plateCarried = false;
  kitchen.plate = [];
  kitchen.burners = [
    { item: null, progress: 0, state: 'empty' },
    { item: null, progress: 0, state: 'empty' },
  ];

  if (name === 'play') {
    // Mid-chop: tomato on the board at 60%, one ticket waiting, early shift.
    kitchen.elapsed = 32; kitchen.timeLeft = 118;
    kitchen.score = 240; kitchen.combo = 0;
    resetBoard(board, [['burger', 34, 45]]);
    board.served = 1;
    kitchen.chef = { x: 378, y: 360, facing: 1, moving: false, bob: 0 };
    kitchen.chopping = { id: 'tomato', progress: 0.6 };
    kitchen.burst(378, 244, 9, '#d94f3d', 110, 4);
    kitchen.steam(606, 232);
    return 'play';
  }
  if (name === 'rush') {
    // Rush hour: four tickets, one about to expire, clock at 0:24, combo alive.
    kitchen.elapsed = 126; kitchen.timeLeft = 24;
    kitchen.score = 1480; kitchen.combo = 3; kitchen.comboTimer = 8;
    resetBoard(board, [
      ['salad', 6, 30], ['burger', 18, 40], ['melt', 26, 35], ['stack', 31, 40],
    ]);
    board.served = 9; board.lost = 2;
    kitchen.chef = { x: 700, y: 420, facing: -1, moving: true, bob: 2.4 };
    kitchen.carried = { id: 'patty', prep: 'cooked' };
    kitchen.burners[0] = { item: 'patty', progress: 2.2, state: 'cooking' };
    kitchen.steam(606, 232);
    return 'play';
  }
  if (name === 'serve') {
    // Plate ready to serve: a full Copper Burger carried to the window.
    kitchen.elapsed = 96; kitchen.timeLeft = 54;
    kitchen.score = 1240; kitchen.combo = 3; kitchen.comboTimer = 9;
    resetBoard(board, [['burger', 28, 45], ['salad', 22, 40]]);
    board.served = 7;
    kitchen.chef = { x: 1060, y: 360, facing: 1, moving: false, bob: 0 };
    kitchen.plateCarried = true;
    kitchen.plate = ['bun:raw', 'patty:cooked', 'lettuce:chopped', 'tomato:chopped', 'cheese:raw'];
    kitchen.servedFlash = 0.9;
    kitchen.burst(1174, 280, 26, '#e8b23a', 170, 5);
    kitchen.burst(1174, 280, 14, '#4c9a6d', 130, 4);
    kitchen.texts.push({ x: 1150, y: 440, text: 'SERVED! +420', color: '#4c9a6d', life: 1.4, maxLife: 1.4, big: true, step() {} });
    return 'play';
  }
  // Cover (default): the whole kitchen at a glance — three tickets, a dish
  // mid-assembly on the plate, a patty on the stove, ingredients on the counter.
  kitchen.elapsed = 78; kitchen.timeLeft = 72;
  kitchen.score = 860; kitchen.combo = 2; kitchen.comboTimer = 6;
  resetBoard(board, [['burger', 30, 45], ['salad', 24, 40], ['melt', 38, 45]]);
  board.served = 5;
  kitchen.chef = { x: 900, y: 400, facing: -1, moving: false, bob: 0 };
  kitchen.carried = { id: 'tomato', prep: 'chopped' };
  kitchen.plate = ['bun:raw', 'patty:cooked', 'lettuce:chopped'];
  kitchen.burners[0] = { item: 'patty', progress: 2.6, state: 'cooking' };
  kitchen.steam(606, 232);
  kitchen.steam(606, 232);
  return 'play';
}
