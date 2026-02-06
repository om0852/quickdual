export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;

    this.last = 0;
    this.animationId = null;
    this.running = false;

    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.running) return;

    this.running = true;
    this.last = performance.now();
    this.animationId = requestAnimationFrame(this.loop);
  }

  stop() {
    if (!this.running) return;

    cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.running = false;
  }

  loop(ts) {
    if (!this.running) return;

    const dt = ts - this.last;
    this.last = ts;

    this.update(dt, ts);
    this.render();

    this.animationId = requestAnimationFrame(this.loop);
  }
}
