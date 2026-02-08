import { authService } from '../services/AuthService.js';

export class Menu {
  constructor(game) {
    this.game = game;
    this.menuScreen = document.getElementById('menu');
    this.tutorialScreen = document.getElementById('tutorial');
    this.leaderboardScreen = document.getElementById('leaderboard');
    this.loginModal = document.getElementById('loginModal');

    this.setupEventListeners();
    this.updateAuthUI();
  }

  setupEventListeners() {
    // Start button - check auth first
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
      console.log('Start button clicked');
      if (!authService.isAuthenticated()) {
        console.log('User not authenticated, showing login');
        alert('Please login to play the game!');
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

    // Leaderboard button
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', () => {
        this.showLeaderboard();
      });
    }

    // Leaderboard close button
    const leaderboardCloseBtn = document.getElementById('leaderboardCloseBtn');
    if (leaderboardCloseBtn) {
      leaderboardCloseBtn.addEventListener('click', () => {
        this.hideLeaderboard();
      });
    }

    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        console.log('Login button clicked');
        this.showLogin();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        console.log('Logout button clicked');
        authService.logout();
        console.log('User logged out, updating UI...');
        this.updateAuthUI();
      });
    }

    // Login form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted');
        await this.handleLogin();
      });
    }
    // Cancel buttons
    const loginCancelBtn = document.getElementById('loginCancelBtn');
    if (loginCancelBtn) {
      loginCancelBtn.addEventListener('click', () => {
        this.hideLogin();
      });
    }
  }

  showNameInput() {
    console.log('Showing name input');
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
      console.log('Attempting login...');
      errorEl.textContent = 'Logging in...';
      const user = await authService.login(email, password);
      console.log('Login successful, user:', user);

      this.hideLogin();
      console.log('Login modal hidden, updating UI...');
      this.updateAuthUI();
    } catch (error) {
      console.error('Login error:', error);
      errorEl.textContent = error.message || 'Login failed';
    }
  }

  updateAuthUI() {
    console.log('updateAuthUI called');
    const user = authService.getUser();
    console.log('Current user state:', user);

    const welcomeText = document.getElementById('welcomeText');
    const authButtons = document.getElementById('authButtons');
    const logoutContainer = document.getElementById('logoutContainer');

    if (!welcomeText || !authButtons || !logoutContainer) {
      console.error('Critical UI elements missing in updateAuthUI');
      return;
    }

    if (user) {
      console.log('Switching to Logged In view');
      welcomeText.textContent = `Welcome, ${user.name}!`;
      authButtons.style.display = 'none';
      logoutContainer.style.display = 'flex';

      // Update start button text/state if needed
      const startBtn = document.getElementById('startBtn');
      if (startBtn) {
        startBtn.textContent = "Start Game";
        startBtn.classList.remove('btn-disabled');
        startBtn.classList.add('btn-primary');
      }
    } else {
      console.log('Switching to Guest view');
      welcomeText.textContent = 'Welcome, Guest! Please Login to Play';
      authButtons.style.display = 'flex';
      logoutContainer.style.display = 'none';

      // Update start button to indicate login needed
      const startBtn = document.getElementById('startBtn');
      if (startBtn) {
        startBtn.textContent = "Login to Start";
        startBtn.classList.add('btn-disabled');
      }
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
    console.log('Showing login modal');
    if (this.loginModal) {
      this.loginModal.classList.add('active');
      const errorEl = document.getElementById('loginError');
      if (errorEl) errorEl.textContent = '';
      const form = document.getElementById('loginForm');
      if (form) form.reset();
    } else {
      console.error('Login modal element not found');
    }
  }

  hideLogin() {
    if (this.loginModal) {
      this.loginModal.classList.remove('active');
    }
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
