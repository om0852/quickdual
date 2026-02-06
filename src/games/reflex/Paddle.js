import { REFLEX } from "../../utils/Constants.js";

export class Paddle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = canvas.width / 2 - REFLEX.PADDLE_WIDTH / 2;
    this.targetX = this.x;
  }

  reset() {
    this.x = this.canvas.width / 2 - REFLEX.PADDLE_WIDTH / 2;
    this.targetX = this.x;
  }

  update(mouseX) {
    // Ignore invalid mouse values
    if (typeof mouseX !== "number") return;

    this.targetX = Math.max(
      0,
      Math.min(
        this.canvas.width - REFLEX.PADDLE_WIDTH,
        mouseX - REFLEX.PADDLE_WIDTH / 2
      )
    );

    // Smooth movement
    this.x += (this.targetX - this.x) * 0.2;
  }


  draw(ctx) {
    // Draw paddle shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(
      this.x + 3,
      this.canvas.height - 27,
      REFLEX.PADDLE_WIDTH,
      REFLEX.PADDLE_HEIGHT
    );

    // Draw paddle
    const gradient = ctx.createLinearGradient(
      this.x,
      0,
      this.x + REFLEX.PADDLE_WIDTH,
      0
    );
    gradient.addColorStop(0, "#2196F3");
    gradient.addColorStop(0.5, "#42A5F5");
    gradient.addColorStop(1, "#2196F3");

    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.x,
      this.canvas.height - 30,
      REFLEX.PADDLE_WIDTH,
      REFLEX.PADDLE_HEIGHT
    );

    // Draw highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(
      this.x,
      this.canvas.height - 30,
      REFLEX.PADDLE_WIDTH,
      5
    );
  }
}