import { Game } from "./core/Game.js";
import { Menu } from "./ui/Menu.js";
import { PauseMenu } from "./ui/PauseMenu.js";
import { Leaderboard } from "./services/Leaderboard.js";
import { STATES } from "./core/State.js";

// Initialize game when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game();

    // Create UI components
    const menu = new Menu(game);
    const pauseMenu = new PauseMenu(game);
    const leaderboard = new Leaderboard(game);

    // Make leaderboard globally accessible
    window.leaderboard = leaderboard;

    // Watch for game over state
    let lastState = game.state;
    setInterval(() => {
      if (game.state === STATES.GAME_OVER && lastState !== STATES.GAME_OVER) {
        leaderboard.show();
      }
      lastState = game.state;
    }, 100);

    // Show menu initially
    menu.show();

    console.log('QuickDual initialized successfully!');
  });
}