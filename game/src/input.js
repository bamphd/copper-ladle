// Keyboard + mouse input. Keys are read as a held set; the mouse gives a
// click-to-move target and a click position the world turns into an action.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.moveTarget = null; // {x, y} in canvas coordinates, or null
    this.clicked = null; // {x, y} consumed once per click
    this.interactHeld = false;
    this.onKey = null; // callback(code) for one-shot keys (pause, mute, restart)
    window.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      if (!event.repeat) {
        if (this.onKey) this.onKey(event.code);
        if (event.code === 'KeyE' || event.code === 'Space') this.interactHeld = true;
      }
      this.keys.add(event.code);
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
      if (event.code === 'KeyE' || event.code === 'Space') this.interactHeld = false;
    });
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      this.moveTarget = { x, y };
      this.clicked = { x, y };
    });
    window.addEventListener('blur', () => { this.keys.clear(); this.interactHeld = false; });
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;
    return { x, y };
  }

  consumeClick() {
    const click = this.clicked;
    this.clicked = null;
    return click;
  }

  clearMoveTarget() { this.moveTarget = null; }
}
