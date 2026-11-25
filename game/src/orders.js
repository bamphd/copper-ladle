// The order board: recipes arrive on a timer, each with a patience bar that
// drains; serve the matching plate before it runs out. Pressure ramps as the
// shift goes on, and rush hour doubles the pace.
import { RECIPES, MAX_ORDERS, RUSH_AT, SHIFT_SECONDS } from './config.js';
import { pickFrom } from './random.js';

let nextOrderId = 1;

export class Order {
  constructor(recipe, patienceSeconds, bornAt) {
    this.id = nextOrderId;
    nextOrderId += 1;
    this.recipe = recipe;
    this.patienceMax = patienceSeconds;
    this.patience = patienceSeconds;
    this.bornAt = bornAt;
    this.urgent = false;
  }

  get patienceRatio() { return Math.max(0, this.patience / this.patienceMax); }
  get expired() { return this.patience <= 0; }
}

export function stepsKey(steps) {
  return [...steps].sort().join('|');
}

export function plateMatchesOrder(plateSteps, order) {
  return stepsKey(plateSteps) === stepsKey(order.recipe.steps);
}

export class OrderBoard {
  constructor(rng) {
    this.rng = rng;
    this.orders = [];
    this.spawnIn = 2.0; // first order arrives quickly
    this.served = 0;
    this.lost = 0;
  }

  get rush() {
    return this.elapsed >= SHIFT_SECONDS - RUSH_AT;
  }

  get elapsed() {
    return this._elapsed || 0;
  }

  spawnInterval() {
    // 16s early, 9s late, 7s in rush hour.
    const t = Math.min(1, this.elapsed / SHIFT_SECONDS);
    const base = 16 - 7 * t;
    return this.rush ? 7 : base;
  }

  patienceFor() {
    const t = Math.min(1, this.elapsed / SHIFT_SECONDS);
    return this.rush ? 30 : 50 - 15 * t;
  }

  spawnOrder() {
    if (this.orders.length >= MAX_ORDERS) return null;
    const recipe = pickFrom(this.rng, RECIPES);
    const order = new Order(recipe, this.patienceFor(), this.elapsed);
    this.orders.push(order);
    return order;
  }

  /** Advance timers; returns orders that just expired. */
  tick(dt, nowSeconds) {
    this._elapsed = nowSeconds;
    const expired = [];
    for (const order of this.orders) {
      const before = order.patience;
      order.patience -= dt;
      if (before > 8 && order.patience <= 8) order.urgent = true;
      if (order.expired) expired.push(order);
    }
    if (expired.length) this.orders = this.orders.filter((o) => !o.expired);
    this.lost += expired.length;
    if (this.orders.length < MAX_ORDERS) {
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        this.spawnOrder();
        this.spawnIn = this.spawnInterval() * (0.85 + this.rng() * 0.3);
      }
    }
    return expired;
  }

  /** Serve a plate: returns the matched order or null. */
  servePlate(plateSteps) {
    for (let i = 0; i < this.orders.length; i += 1) {
      if (plateMatchesOrder(plateSteps, this.orders[i])) {
        const order = this.orders[i];
        this.orders.splice(i, 1);
        this.served += 1;
        return order;
      }
    }
    return null;
  }
}
