import { Ball } from "./Ball.js";
import { Paddle } from "./Paddle.js";

export class ReflexGame {
  constructor(game) {
    // Grab the right-side canvas only
    this.canvas = document.getElementById("reflexCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.game = game;

    // Mouse X position in CANVAS coordinates
    // undefined means "mouse not controlling paddle"
    this.mouseX = undefined;

    // Game objects
    this.paddle = new Paddle(this.canvas);
    this.ball = new Ball(this.ctx, this.canvas, game);

    // Handle mouse movement ANYWHERE on the screen
    this.handleMouseMove = (e) => {
      // Get canvas position and size on the screen (CSS pixels)
      const rect = this.canvas.getBoundingClientRect();

      // Convert CSS pixels → canvas pixels
      const scaleX = this.canvas.width / rect.width;

      // Mouse X relative to canvas
      let x = (e.clientX - rect.left) * scaleX;

      // Clamp x to be within canvas bounds (so paddle doesn't get lost)
      x = Math.max(0, Math.min(this.canvas.width, x));

      // Valid mouse position for paddle update
      this.mouseX = x;
    };

    // Attach mouse listener to WINDOW so control persists outside canvas
    window.addEventListener("mousemove", this.handleMouseMove);

    // We don't need mouseleave anymore since we want control to persist
  }

  reset() {
    // Reset paddle and ball to starting positions
    this.paddle.reset();
    this.ball.reset();

    // Disable mouse control until it re-enters canvas
    this.mouseX = undefined;
  }

  update(dt) {
    // Update paddle using mouse X (if defined)
    this.paddle.update(dt, this.mouseX);

    // Update ball physics and collisions
    this.ball.update(dt, this.paddle, this.game.difficultyMultiplier);
  }

  render() {
    // Clear canvas with vertical gradient background
    // Clear canvas with deep space background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#0b0b15"); // Almost black
    gradient.addColorStop(1, "#1a1a2e"); // Deep Blue-Purple

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle grid overlay for depth
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= this.canvas.width; x += 40) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }

    // Horizontal lines
    for (let y = 0; y <= this.canvas.height; y += 40) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }
    this.ctx.stroke();

    // Draw game elements
    this.ball.draw();
    this.paddle.draw(this.ctx);
  }

  destroy() {
    // Clean up event listeners when game is destroyed
    window.removeEventListener("mousemove", this.handleMouseMove);
  }
}
