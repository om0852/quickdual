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

  update(dt, mouseX) {
    const timeScale = dt / 16.666;
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
    this.x += (this.targetX - this.x) * 0.2 * timeScale;
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
    // Enable glow for paddle
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00F3FF"; // Cyan glow

    const gradient = ctx.createLinearGradient(
      this.x,
      0,
      this.x + REFLEX.PADDLE_WIDTH,
      0
    );
    gradient.addColorStop(0, "#00E5FF"); // Bright Cyan
    gradient.addColorStop(0.5, "#E0F7FA"); // Almost White center
    gradient.addColorStop(1, "#00E5FF");

    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.x,
      this.canvas.height - 30,
      REFLEX.PADDLE_WIDTH,
      REFLEX.PADDLE_HEIGHT
    );

    // Reset shadow for other elements
    ctx.shadowBlur = 0;

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