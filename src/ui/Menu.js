import { authService } from '../services/AuthService.js';

export class Menu {
  constructor(game) {
    this.game = game;
    this.menuScreen = document.getElementById('menu');
    this.tutorialScreen = document.getElementById('tutorial');
    this.leaderboardScreen = document.getElementById('leaderboard');
    this.loginModal = document.getElementById('loginModal');
    this.registerModal = document.getElementById('registerModal');

    this.setupEventListeners();
    this.updateAuthUI();
  }

  setupEventListeners() {
    // Start button - check auth first
    document.getElementById('startBtn').addEventListener('click', () => {
      if (!authService.isAuthenticated()) {
        alert('Please login or register to play the game!');
        this.showLogin();
        return;
      }

      // Prompt for name before starting
      this.showNameInput();
    });

    // Name input form submit
    document.getElementById('nameInputForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('gamePlayerName').value.trim();
      if (name) {
        // Update user name in auth service/local storage if needed, or just use for this session
        // For now, let's update the HUD and start countdown
        const user = authService.getUser();
        user.name = name; // Update session name momentarily

        this.hideNameInput();
        this.startCountdown();
      }
    });

    // Name input cancel
    document.getElementById('nameInputCancelBtn').addEventListener('click', () => {
      this.hideNameInput();
    });

    // Tutorial button
    document.getElementById('tutorialBtn').addEventListener('click', () => {
      this.hide();
      this.showTutorial();
    });

    // Tutorial back button
    document.getElementById('tutorialBackBtn').addEventListener('click', () => {
      this.hideTutorial();
      this.show();
    });

    // Leaderboard button (Global Rankings) is now a direct link in HTML

    // Leaderboard close button

    // Leaderboard close button
    document.getElementById('leaderboardCloseBtn').addEventListener('click', () => {
      this.hideLeaderboard();
    });

    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
      this.showLogin();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      authService.logout();
      this.updateAuthUI();
    });

    // Login form submit
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    // Cancel buttons
    document.getElementById('loginCancelBtn').addEventListener('click', () => {
      this.hideLogin();
    });
  }

  showNameInput() {
    const nameInput = document.getElementById('gamePlayerName');
    nameInput.value = ''; // Always clear input for new player
    document.getElementById('nameInputModal').classList.add('active');
  }

  hideNameInput() {
    document.getElementById('nameInputModal').classList.remove('active');
  }

  startCountdown() {
    this.hide();
    this.showGameScreen();

    const countdownOverlay = document.getElementById('countdownOverlay');
    const countdownNumber = document.getElementById('countdownNumber');
    let count = 5;

    countdownOverlay.classList.add('active');
    countdownNumber.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
      } else {
        clearInterval(interval);
        countdownOverlay.classList.remove('active');
        this.game.start(performance.now());
        this.updateHUDPlayerName();
      }
    }, 1000);
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    try {
      errorEl.textContent = '';
      await authService.login(email, password);
      this.hideLogin();
      this.updateAuthUI();
    } catch (error) {
      errorEl.textContent = error.message || 'Login failed';
    }
  }

  async handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');

    try {
      errorEl.textContent = '';
      await authService.register(name, email, password);
      this.hideRegister();
      this.updateAuthUI();
    } catch (error) {
      errorEl.textContent = error.message || 'Registration failed';
    }
  }

  updateAuthUI() {
    const user = authService.getUser();
    const welcomeText = document.getElementById('welcomeText');
    const authButtons = document.getElementById('authButtons');
    const logoutContainer = document.getElementById('logoutContainer');

    if (user) {
      welcomeText.textContent = `Welcome, ${user.name}!`;
      authButtons.style.display = 'none';
      logoutContainer.style.display = 'flex';
    } else {
      welcomeText.textContent = 'Welcome, Guest!';
      authButtons.style.display = 'flex';
      logoutContainer.style.display = 'none';
    }
  }

  updateHUDPlayerName() {
    const user = authService.getUser();
    const hudPlayerName = document.getElementById('hudPlayerName');
    if (hudPlayerName && user) {
      hudPlayerName.textContent = user.name;
    }
  }

  showLogin() {
    this.loginModal.classList.add('active');
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginForm').reset();
  }

  hideLogin() {
    this.loginModal.classList.remove('active');
  }

  showRegister() {
    this.registerModal.classList.add('active');
    document.getElementById('registerError').textContent = '';
    document.getElementById('registerForm').reset();
  }

  hideRegister() {
    this.registerModal.classList.remove('active');
  }

  show() {
    this.menuScreen.classList.add('active');
    this.hideGameScreen();
    this.updateAuthUI();
  }

  hide() {
    this.menuScreen.classList.remove('active');
  }

  showTutorial() {
    this.tutorialScreen.classList.add('active');
  }

  hideTutorial() {
    this.tutorialScreen.classList.remove('active');
  }

  showLeaderboard() {
    this.leaderboardScreen.classList.add('active');
    // Trigger leaderboard load
    if (window.leaderboard) {
      window.leaderboard.load();
    }
  }

  hideLeaderboard() {
    this.leaderboardScreen.classList.remove('active');
  }

  showGameScreen() {
    document.getElementById('game').classList.add('active');
  }

  hideGameScreen() {
    document.getElementById('game').classList.remove('active');
  }
}