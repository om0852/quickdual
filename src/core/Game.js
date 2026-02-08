import { STATES } from "./State.js";
import { Timer } from "./Timer.js";
import { GameLoop } from "./GameLoop.js";
import { FlappyGame } from "../games/flappy/FlappyGame.js";
import { ReflexGame } from "../games/reflex/ReflexGame.js";
import { GAME_DURATION } from "../utils/Constants.js";

export class Game {
  constructor() {
    this.state = STATES.MENU;
    this.score = 0;
    this.difficultyMultiplier = 1.0;

    this.flappy = new FlappyGame(this);
    this.reflex = new ReflexGame(this);
    this.timer = new Timer(GAME_DURATION);

    this.loop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );
  }

  start(now) {
    this.loop.stop();
    this.score = 0;
    this.difficultyMultiplier = 1.0;
    this.state = STATES.PLAYING;
    this.timer.start(now);
    this.flappy.reset();
    this.reflex.reset();
    this.loop.start();
    this.updateHUD();
  }

  pause(now) {
    if (this.state === STATES.PLAYING) {
      this.state = STATES.PAUSED;
      this.timer.pause(now);
    }
  }

  resume(now) {
    if (this.state === STATES.PAUSED) {
      this.state = STATES.PLAYING;
      this.timer.resume(now);
    }
  }

  end() {
    this.state = STATES.GAME_OVER;
    this.loop.stop();
  }

  update(dt, now) {
    if (this.state !== STATES.PLAYING) return;

    this.timer.update(now);
    this.updateHUD();

    // Time-based difficulty: Increase speed by 30% every 15 seconds
    const elapsed = this.timer.duration - this.timer.remaining;
    const intervals = Math.floor(elapsed / 15000);
    this.difficultyMultiplier = Math.pow(1.3, intervals);

    if (this.timer.isOver()) {
      this.end();
      return;
    }

    this.flappy.update(dt);
    this.reflex.update(dt);
  }

  render() {
    this.flappy.render();
    this.reflex.render();
  }

  addScore(value) {
    this.score = Math.max(0, this.score + value);

    // Difficulty is now handled by time in update()

    this.updateHUD();
  }

  updateHUD() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const timerDisplay = document.getElementById('timerDisplay');

    if (scoreDisplay) {
      scoreDisplay.textContent = this.score;
    }

    if (timerDisplay) {
      timerDisplay.textContent = this.timer.getTimeString();
    }
  }
}