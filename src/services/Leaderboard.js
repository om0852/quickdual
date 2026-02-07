// Leaderboard service using API backend
// Falls back to localStorage if API is unavailable

import { authService } from './AuthService.js';

const API_URL = '/api';

export class Leaderboard {
  constructor(game) {
    this.game = game;
    this.gameOverScreen = document.getElementById('gameOver');
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Submit score button
    document.getElementById('submitScoreBtn').addEventListener('click', async () => {
      await this.handleSubmitScore();
    });

    // Play again button
    document.getElementById('playAgainBtn').addEventListener('click', () => {
      if (!authService.isAuthenticated()) {
        alert('Please login to play again!');
        window.location.reload();
        return;
      }
      this.hide();

      // We need to trigger the pre-game flow again (name input -> countdown)
      // Accessing the menu instance would be ideal, but for now, let's just reload 
      // or we can implement a "restartFlow" method. 
      // Actually, standard behavior for "Play Again" usually skips name input if same session.
      // But adhering to "security" and "multiplayer" request:

      // Let's redirect to menu's name input flow by reloading or manipulating DOM
      // Simplest robust way: 
      document.getElementById('game').classList.remove('active');
      document.getElementById('menu').classList.add('active');
      // Trigger start button click logic programmatically? Or just let user click start.
      // Current implementation of game.start() bypasses name input if called directly.
      // We should probably go back to menu or trigger name input.

      // Let's go back to menu to ensure flow consistency
      // document.getElementById('menu').classList.add('active');

      // To support the "Multi-player per session" feature (clearing name input),
      // "Play Again" should actually trigger the name input modal again.
      // We need to access the Menu instance. Since Leaderboard doesn't have reference to Menu,
      // we can trigger the Start Button click or similar.

      // Better approach: Go back to menu and simulate start click
      document.getElementById('game').classList.remove('active');
      document.getElementById('menu').classList.add('active');

      // Trigger the start button logic which checks auth and shows name input
      document.getElementById('startBtn').click();
    });

    // Menu button
    document.getElementById('menuBtn').addEventListener('click', () => {
      this.hide();
      document.getElementById('game').classList.remove('active');
      document.getElementById('menu').classList.add('active');
    });
  }

  async handleSubmitScore(auto = false) {
    if (!authService.isAuthenticated()) {
      if (!auto) alert('You must be logged in to submit a score!');
      return;
    }

    // Get the name used for this game session
    const user = authService.getUser();
    const playerName = user.name;
    const leaderboardForm = document.getElementById('leaderboardForm');

    try {
      const response = await authService.fetchWithAuth(`${API_URL}/scores/submit`, {
        method: 'POST',
        body: JSON.stringify({
          score: this.game.score,
          playerName: playerName
        })
      });

      const data = await response.json();

      if (data.success) {
        if (auto) {
          leaderboardForm.innerHTML = `
            <p style="color: var(--primary); margin-bottom: 16px; font-size: 1.1rem;">Score Submitted Successfully!</p>
            <button id="viewLeaderboardBtn" class="btn-secondary">View Leaderboard</button>
          `;
          document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
            this.hide();
            this.showLeaderboard();
          });
        } else {
          this.hide();
          this.showLeaderboard();
        }
      } else {
        throw new Error(data.message || 'Failed to submit score');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Fallback to localStorage
      this.saveScoreLocal(playerName || 'Player', this.game.score);

      if (auto) {
        leaderboardForm.innerHTML = `
          <p style="color: #4CAF50; margin-bottom: 16px;">Score Saved Locally (Offline)</p>
          <button id="viewLeaderboardBtn" class="btn-secondary">View Leaderboard</button>
        `;
        document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
          this.hide();
          this.showLeaderboard();
        });
      } else {
        this.hide();
        this.showLeaderboard();
      }
    }
  }

  show() {
    document.getElementById('finalScore').textContent = this.game.score;

    // Hide the name input since we use the logged-in user's name (updated per session)
    const leaderboardForm = document.getElementById('leaderboardForm');

    if (authService.isAuthenticated()) {
      const user = authService.getUser();

      leaderboardForm.innerHTML = `
        <p style="margin-bottom: 16px; color: var(--text-muted);">Submitting score for <strong>${user.name}</strong>...</p>
        <div class="loading-spinner" style="margin: 0 auto;"></div>
      `;

      // Auto-submit
      this.handleSubmitScore(true);
    } else {
      leaderboardForm.innerHTML = '<p style="color: var(--text-muted);">Login to submit your score to the leaderboard!</p>';
    }

    this.gameOverScreen.classList.add('active');
  }

  hide() {
    this.gameOverScreen.classList.remove('active');
  }

  showLeaderboard() {
    document.getElementById('leaderboard').classList.add('active');
    this.load();
  }

  // Fallback localStorage methods
  saveScoreLocal(name, score) {
    const scores = this.getScoresLocal();
    scores.push({ name, score, time: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);
    localStorage.setItem('quickqual_scores', JSON.stringify(topScores));
  }

  getScoresLocal() {
    const stored = localStorage.getItem('quickqual_scores');
    return stored ? JSON.parse(stored) : [];
  }

  async load() {
    const listElement = document.getElementById('leaderboardList');
    listElement.innerHTML = '<p class="loading">Loading scores...</p>';

    try {
      const response = await fetch(`${API_URL}/scores/leaderboard`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        this.renderScores(data.data);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }

    // Fallback to local scores
    const localScores = this.getScoresLocal();
    if (localScores.length > 0) {
      this.renderScores(localScores.map(s => ({ playerName: s.name, score: s.score })));
    } else {
      listElement.innerHTML = '<p class="loading">No scores yet. Be the first!</p>';
    }
  }

  renderScores(scores) {
    const listElement = document.getElementById('leaderboardList');
    listElement.innerHTML = scores.map((score, index) => `
      <div class="leaderboard-entry">
        <span class="leaderboard-rank">#${index + 1}</span>
        <span class="leaderboard-name">${this.escapeHtml(score.playerName || score.name)}</span>
        <span class="leaderboard-score">${score.score}</span>
      </div>
    `).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Make leaderboard globally accessible
if (typeof window !== 'undefined') {
  window.leaderboard = null;
}