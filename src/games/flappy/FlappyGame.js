import { Bird } from "./Bird.js";
import { Pipes } from "./Pipes.js";

export class FlappyGame {
  constructor(game) {
    const canvas = document.getElementById("flappyCanvas");
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.game = game;

    this.bird = new Bird(this.ctx, this.canvas, game);
    this.pipes = new Pipes(this.ctx, canvas, game);

    // Event listener for flapping
    this.handleKeyDown = (e) => {
      if (e.code === "Space" && this.game.state === "playing") {
        e.preventDefault();
        this.bird.flap();
      }
    };

    document.addEventListener("keydown", this.handleKeyDown);
  }

  reset() {
    this.bird.reset();
    this.pipes.reset();
  }


  update(dt) {
    this.bird.update();
    this.pipes.update(this.bird, this.game.difficultyMultiplier);

    // Game-over handling
    if (this.bird.isDead) {
      this.reset();
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = "#87CEEB";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = "#8B4513";
    this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

    // Draw game elements
    this.pipes.draw();
    this.bird.draw();
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
}