import { FLAPPY } from "../../utils/Constants.js";

export class Bird {
  constructor(ctx, canvas, game) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.game = game;
    this.reset();
  }

  reset() {
    this.x = this.canvas.width / 4;
    this.y = this.canvas.height / 2;
    this.vy = 0;
    this.isDead = false;
  }

  flap() {
    if (!this.isDead) {
      this.vy = FLAPPY.JUMP;
    }
  }

  update(dt) {
    if (this.isDead) return;

    const timeScale = dt / 16.666;
    this.vy += FLAPPY.GRAVITY * timeScale;
    this.y += this.vy * timeScale;

    // Check boundaries
    if (this.y < FLAPPY.BIRD_SIZE / 2) {
      this.y = FLAPPY.BIRD_SIZE / 2;
      this.vy = 0;
    }

    if (this.y > this.canvas.height - FLAPPY.BIRD_SIZE / 2) {
      this.y = this.canvas.height - FLAPPY.BIRD_SIZE / 2;
      this.vy = 0;

      if (!this.isDead) {
        this.isDead = true;
        this.game.addScore(-80);

        // Add floating text
        // We'll need to import FloatingText or just rely on the score update
        // Since Bird doesn't handle FloatingText list easily without more refactoring,
        // we'll just deduct score. 
        // Ideally we should pass floatingTexts array or handle text spawning via game/pipes
        // For now, score deduction is the priority.
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const pixelSize = 3;

    const birdPixels = [
      "............BBBBBBBBBBBB..........",
      "............BBBBBBBBBBBB..........",
      "........BBBBYYYYYYBBWWWWBB........",
      "........BBBBYYYYYYBBWWWWBB........",
      "......BBYYYYYYYYBBWWWWWWWWBB......",
      "......BBYYYYYYYYBBWWWWWWWWBB......",
      "..BBBBBBBBYYYYYYBBWWWWWWBBWWBB....",
      "..BBBBBBBBYYYYYYBBWWWWWWBBWWBB....",
      "BBLLLLLLLLBBYYYYBBWWWWWWBBWWBB....",
      "BBLLLLLLLLBBYYYYBBWWWWWWBBWWBB....",
      "BBLLLLLLLLLLBBYYYYBBWWWWWWWWBB....",
      "BBLLLLLLLLLLBBYYYYBBWWWWWWWWBB....",
      "BBYYLLLLLLYYBBYYYYYYBBBBBBBBBBBB..",
      "BBYYLLLLLLYYBBYYYYYYBBBBBBBBBBBB..",
      "..BBYYYYYYBBYYYYYYBBRRRRRRRRRRRRBB",
      "..BBYYYYYYBBYYYYYYBBRRRRRRRRRRRRBB",
      "....BBBBBBOOOOOOBBRRBBBBBBBBBBBB..",
      "....BBBBBBOOOOOOBBRRBBBBBBBBBBBB..",
      "....BBOOOOOOOOOOOOBBRRRRRRRRRRBB..",
      "....BBOOOOOOOOOOOOBBRRRRRRRRRRBB..",
      "......BBBBOOOOOOOOOOBBBBBBBBBB....",
      "......BBBBOOOOOOOOOOBBBBBBBBBB....",
      "..........BBBBBBBBBB..............",
      "..........BBBBBBBBBB.............."
    ];

    const colors = {
      Y: "#FFEB3B",
      L: "#FFFFCC",
      O: "#FFC107",
      R: "#F44336",
      W: "#FFFFFF",
      B: "#000000",
      ".": null
    };

    const rows = birdPixels.length;
    const cols = birdPixels[0].length;

    const totalW = cols * pixelSize;
    const totalH = rows * pixelSize;

    const startX = Math.round(this.x - totalW / 2);
    const startY = Math.round(this.y - totalH / 2);

    ctx.imageSmoothingEnabled = false;

    // ---- Pass 1: outline ----
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (birdPixels[r][c] === ".") continue;

        const neighbors = [
          [r - 1, c],
          [r + 1, c],
          [r, c - 1],
          [r, c + 1]
        ];

        let isEdge = false;
        for (const [nr, nc] of neighbors) {
          if (
            nr < 0 ||
            nc < 0 ||
            nr >= rows ||
            nc >= cols ||
            birdPixels[nr][nc] === "."
          ) {
            isEdge = true;
            break;
          }
        }

        if (isEdge) {
          ctx.fillStyle = "#000";
          ctx.fillRect(
            startX + c * pixelSize,
            startY + r * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }
    }

    // ---- Pass 2: colors ----
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = colors[birdPixels[r][c]];
        if (!color) continue;

        ctx.fillStyle = color;
        ctx.fillRect(
          startX + c * pixelSize,
          startY + r * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  getBounds() {
    return {
      x: this.x - FLAPPY.BIRD_SIZE / 2,
      y: this.y - FLAPPY.BIRD_SIZE / 2,
      width: FLAPPY.BIRD_SIZE,
      height: FLAPPY.BIRD_SIZE
    };
  }
}