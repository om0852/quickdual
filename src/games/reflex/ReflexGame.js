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

    // Handle mouse movement INSIDE the canvas
    this.handleMouseMove = (e) => {
      // Get canvas position and size on the screen (CSS pixels)
      const rect = this.canvas.getBoundingClientRect();

      // Convert CSS pixels → canvas pixels
      const scaleX = this.canvas.width / rect.width;

      // Mouse X relative to canvas
      const x = (e.clientX - rect.left) * scaleX;

      // Ignore movement if mouse goes outside the canvas
      if (x < 0 || x > this.canvas.width) return;

      // Valid mouse position for paddle update
      this.mouseX = x;
    };

    // Stop paddle movement when mouse leaves canvas
    this.handleMouseLeave = () => {
      this.mouseX = undefined;
    };

    // Attach mouse listeners ONLY to the right canvas
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
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
    this.paddle.update(this.mouseX);

    // Update ball physics and collisions
    this.ball.update(this.paddle);
  }

  render() {
    // Clear canvas with vertical gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw game elements
    this.ball.draw();
    this.paddle.draw(this.ctx);
  }

  destroy() {
    // Clean up event listeners when game is destroyed
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
  }
}
