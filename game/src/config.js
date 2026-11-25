// The Copper Ladle — shared constants: palette, layout, ingredients, recipes.
// One job: the numbers every other file agrees on. No logic lives here.
export const W = 1280;
export const H = 720;
export const SHIFT_SECONDS = 150;
export const RUSH_AT = 30; // last seconds of the shift are rush hour

export const PALETTE = {
  floorA: '#f0dfbd', floorB: '#e6d0a4', wall: '#7d4a2d', wallTrim: '#5d341f',
  counterTop: '#b07a45', counterSide: '#8a5a33', counterEdge: '#6e4525',
  copper: '#c96f2e', copperDark: '#9a4f1c', cream: '#fbf3df', ink: '#2b2118',
  green: '#2f6b4f', greenLight: '#4c9a6d', red: '#d94f3d', gold: '#e8b23a',
  ticket: '#fff8e6', ticketEdge: '#d9b96a', danger: '#c22f1e', steel: '#9aa5ad',
};

export const INGREDIENTS = {
  tomato: { name: 'Tomato', color: '#d94f3d', chop: true, cook: false, price: 10 },
  lettuce: { name: 'Lettuce', color: '#5da24a', chop: true, cook: false, price: 10 },
  onion: { name: 'Onion', color: '#b678c2', chop: true, cook: false, price: 10 },
  cheese: { name: 'Cheese', color: '#f2c14e', chop: false, cook: false, price: 15 },
  patty: { name: 'Patty', color: '#8a5a3b', chop: false, cook: true, price: 20 },
  bun: { name: 'Bun', color: '#e0a458', chop: false, cook: false, price: 15 },
};

// A recipe step is an ingredient id plus how it must be prepared:
// 'raw' (as picked), 'chopped' or 'cooked'.
export const RECIPES = [
  { id: 'salad', name: 'Garden Salad', steps: ['lettuce:chopped', 'tomato:chopped', 'onion:chopped'], base: 120 },
  { id: 'melt', name: 'Cheesy Melt', steps: ['bun:raw', 'cheese:raw', 'patty:cooked'], base: 150 },
  { id: 'stack', name: 'Veggie Stack', steps: ['bun:raw', 'lettuce:chopped', 'tomato:chopped', 'onion:chopped', 'cheese:raw'], base: 190 },
  { id: 'burger', name: 'Copper Burger', steps: ['bun:raw', 'patty:cooked', 'lettuce:chopped', 'tomato:chopped', 'cheese:raw'], base: 220 },
];

export const STATIONS = {
  pantry: { x: 24, y: 196, w: 196, h: 116, label: 'PANTRY' },
  chop: { x: 268, y: 196, w: 220, h: 96, label: 'CHOP BOARD' },
  stove: { x: 536, y: 196, w: 240, h: 96, label: 'STOVE' },
  assembly: { x: 824, y: 196, w: 220, h: 96, label: 'PLATING' },
  serve: { x: 1092, y: 196, w: 164, h: 96, label: 'SERVE' },
  trash: { x: 24, y: 620, w: 76, h: 76, label: 'TRASH' },
};

// Pantry crates: ingredient id, centre of each crate. Two rows on the counter;
// the chef stands below the counter and reaches every crate.
export const CRATES = [
  { id: 'tomato', x: 64, y: 224 }, { id: 'lettuce', x: 122, y: 224 }, { id: 'onion', x: 180, y: 224 },
  { id: 'cheese', x: 64, y: 268 }, { id: 'patty', x: 122, y: 268 }, { id: 'bun', x: 180, y: 268 },
];

export const CHEF = { radius: 26, speed: 265 };
export const CHOP_SECONDS = 1.1;
export const COOK_SECONDS = 4.0;
export const BURN_SECONDS = 6.0; // past cooked: burnt, must be trashed
export const COMBO_WINDOW = 12;
export const MAX_ORDERS = 4;
