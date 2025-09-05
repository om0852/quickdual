// Use a single game loop for both games
const flappyCanvas = document.getElementById('flappyCanvas');
const flappyCtx = flappyCanvas.getContext('2d');
const reflexCanvas = document.getElementById('reflexCanvas');
const reflexCtx = reflexCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreDisplay = document.getElementById('finalScoreDisplay'); // Fix reference
const restartButton = document.getElementById('restartButton');
const modalTitle = document.getElementById('modalTitle');
const timerDisplay = document.getElementById('timer');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const menuRestartButton = document.getElementById('menuRestartButton');
const exitButton = document.getElementById('exitButton');
const menuButtonsContainer = document.getElementById('menuButtons');

let score = 0;
let gameActive = false;
let isPaused = false; // New variable for the pause state
let boxAppearTime = 0;
const GAME_DURATION = 120000; // 2 minutes in milliseconds
let gameStartTime = 0;
let timeRemaining = GAME_DURATION;
let pauseStartTime = 0; // New variable to track when the game was paused

// Flappy Bird Game Constants
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const BIRD_GRAVITY = 0.2;    // Increased from 0.15
const BIRD_JUMP = -4.2;      // Increased from -3.5
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const PIPE_SPEED = 2.2;      // Increased from 1.8

// Flappy Bird Game Variables
let flappyBird = {
    x: 0,
    y: 0,
    velocity: 0
};
let pipes = [];

// Ball Game Constants
const BALL_RADIUS = 10;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_SPEED = 5;
const BALL_SPEED_INCREMENT = 0.1; // Added to fix ReferenceError
const PADDLE_SPEED = 8;

// Ball Game Variables
let ball = {
    x: 0,
    y: 0,
    dx: BALL_SPEED,
    dy: -BALL_SPEED
};
let paddle = {
    x: 0,
    y: 0,
    dx: 0
};
let ballScore = 0;
let mouseX = 0;

// Add these constants at the top with other constants
const COMBO_DURATION = 5000; // 5 seconds to maintain combo
const MAX_COMBO_MULTIPLIER = 3;
const BASE_SCORE = 100; // Increased base score
const PENALTY_SCORE = 100; // Increased penalty
// const COMBO_BREAK_PENALTY = 50; // Remove this line
const MAX_PIPE_MULTIPLIER = 3;
const MAX_REFLEX_MULTIPLIER = 3;
const MIN_REFLEX_MULTIPLIER = 0.5;
const FAST_REACTION_TIME = 300;
const SLOW_REACTION_TIME = 1000;

// Add new constants
// Increment-related constants (grouped together for clarity)
const SCORE_MULTIPLIER_INCREMENT = 1.2;
const BALL_MISS_MULTIPLIER_INCREMENT = 0.5;
const PIPE_MULTIPLIER_INCREMENT = 0.2;

// Add these variables with other game variables
let lastFlappyScore = 0;
let lastReflexScore = 0;
let comboMultiplier = 1;
let comboTimer = 0;
let consecutivePipes = 0;
let ballSpeedMultiplier = 1;
let consecutiveMisses = 0;
let ballScoreMultiplier = 1;

// Function to draw the bird
function drawFlappyBird() {
    flappyCtx.fillStyle = '#fde047'; // Yellow
    flappyCtx.fillRect(flappyBird.x - BIRD_WIDTH / 2, flappyBird.y - BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT);
    flappyCtx.strokeStyle = '#92400e';
    flappyCtx.lineWidth = 2;
    flappyCtx.strokeRect(flappyBird.x - BIRD_WIDTH / 2, flappyBird.y - BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT);
}

// Function to draw the pipes
function drawPipes() {
    flappyCtx.fillStyle = '#16a34a'; // Green
    pipes.forEach(pipe => {
        // Top pipe
        flappyCtx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        // Bottom pipe
        flappyCtx.fillRect(pipe.x, pipe.bottom, PIPE_WIDTH, flappyCanvas.height);
    });
}

// Function to update the Flappy Bird game state
function updateFlappyBird() {

    // Apply gravity
    flappyBird.velocity += BIRD_GRAVITY;
    flappyBird.y += flappyBird.velocity;

    // Move pipes
    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
    });

    // Add new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < flappyCanvas.width - 250) {  // Increased spacing
        // Limit the random height to be more centered and predictable
        const minHeight = flappyCanvas.height * 0.2;  // 20% from top
        const maxHeight = flappyCanvas.height * 0.6;  // 60% from top
        let randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        pipes.push({
            x: flappyCanvas.width,
            top: randomHeight,
            bottom: randomHeight + PIPE_GAP,
            passed: false
        });
    }

    // Remove pipes that are off-screen
    pipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

    // Check for collision
    let collision = false;
    pipes.forEach(pipe => {
        if (
            flappyBird.x + BIRD_WIDTH / 2 > pipe.x &&
            flappyBird.x - BIRD_WIDTH / 2 < pipe.x + PIPE_WIDTH &&
            (flappyBird.y - BIRD_HEIGHT / 2 < pipe.top || flappyBird.y + BIRD_HEIGHT / 2 > pipe.bottom)
        ) {
            collision = true;
        }
        if (flappyBird.x > pipe.x + PIPE_WIDTH && !pipe.passed) {
            consecutivePipes++;
            const pipeMultiplier = Math.min(1 + (consecutivePipes * PIPE_MULTIPLIER_INCREMENT), MAX_PIPE_MULTIPLIER);
            const comboScore = Math.floor(BASE_SCORE * pipeMultiplier * comboMultiplier);
            score += comboScore;
            pipe.passed = true;
            lastFlappyScore = performance.now();
            updateComboMultiplier();
            
            const rect = flappyCanvas.getBoundingClientRect();
            createFloatingText(
                rect.left + flappyBird.x,
                rect.top + flappyBird.y,
                `+${comboScore} (x${pipeMultiplier.toFixed(1)})`,
                pipeMultiplier >= MAX_PIPE_MULTIPLIER ? '#fbbf24' : '#4ade80'
            );
        }
    });

    // Check for canvas boundaries
    if (flappyBird.y + BIRD_HEIGHT / 2 > flappyCanvas.height || flappyBird.y - BIRD_HEIGHT / 2 < 0) {
        collision = true;
    }

    if (collision) {
        consecutivePipes = 0; // Reset multiplier on collision
        applyScorePenalty();
        resetFlappyBird();
    }
}

// Replace reflex game functions with ball game functions
function initBallGame() {
    // Random starting position along the top
    ball.x = Math.random() * (reflexCanvas.width - BALL_RADIUS * 2) + BALL_RADIUS;
    ball.y = BALL_RADIUS * 2; // Start near the top
    paddle.x = reflexCanvas.width / 2 - PADDLE_WIDTH / 2;
    paddle.y = reflexCanvas.height - 30;

    // Random initial direction between -45 and 45 degrees
    const angle = (Math.random() * 90 - 45) * Math.PI / 180;
    ball.dx = BALL_SPEED * Math.sin(angle) * ballSpeedMultiplier;
    ball.dy = BALL_SPEED * Math.cos(angle) * ballSpeedMultiplier;
}

function drawBall() {
    reflexCtx.beginPath();
    reflexCtx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    reflexCtx.fillStyle = '#ef4444';
    reflexCtx.fill();
    reflexCtx.closePath();
}

function drawPaddle() {
    reflexCtx.fillStyle = '#3b82f6';
    reflexCtx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function updateBallGame() {
    // Move paddle
    paddle.x = Math.max(0, Math.min(reflexCanvas.width - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2));

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with paddle
    if (ball.y + BALL_RADIUS >= paddle.y && 
        ball.y <= paddle.y + PADDLE_HEIGHT && 
        ball.x > paddle.x && 
        ball.x < paddle.x + PADDLE_WIDTH &&
        ball.dy > 0) {
    
        // Push the ball just above the paddle to avoid re-collision
        ball.y = paddle.y - BALL_RADIUS;

        // Calculate relative hit position
        const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
        const angle = (hitPos - 0.5) * Math.PI / 2;

        // Increment speed only on paddle hit
        ballSpeedMultiplier = BALL_SPEED_INCREMENT;
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        const newSpeed = currentSpeed * (1 + ballSpeedMultiplier);

        ball.dx = newSpeed * Math.sin(angle);
        ball.dy = -newSpeed * Math.cos(angle);

        // Scoring logic
        ballScoreMultiplier += 0.2;
        const finalScore = Math.floor(BASE_SCORE * ballScoreMultiplier);
        score += finalScore;

        consecutiveMisses = 0; // Reset miss counter on successful hit
        createFloatingText(
            reflexCanvas.offsetLeft + 50 * window.innerWidth / 100 + ball.x,
            reflexCanvas.offsetTop + paddle.y - 20, // Show text just above paddle
            `+${finalScore} (x${ballScoreMultiplier.toFixed(1)})`,
            ballScoreMultiplier >= 2 ? '#fbbf24' : '#4ade80'
        );
    }

    // Ball collision with walls
    if (ball.x + BALL_RADIUS > reflexCanvas.width || ball.x - BALL_RADIUS < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - BALL_RADIUS < 0) {
        ball.dy = -ball.dy;
    }

    // Ball out of bounds
    if (ball.y + BALL_RADIUS > reflexCanvas.height) {
        consecutiveMisses++;
        const missMultiplier = 1 + (consecutiveMisses - 1) * BALL_MISS_MULTIPLIER_INCREMENT;
        const penalty = Math.floor(PENALTY_SCORE * missMultiplier);
        score = Math.max(0, score - penalty);
        
        createFloatingText(
            reflexCanvas.offsetLeft + ball.x,
            reflexCanvas.offsetTop + ball.y,
            `-${penalty} (x${missMultiplier.toFixed(1)})`,
            '#ef4444'
        );
        // Reset ball speed multiplier to 1 on miss
        ballSpeedMultiplier = 1;
        newSpeed = BALL_SPEED;
        ballScoreMultiplier = 1;
        initBallGame();
    }
}

// Update the game loop to handle timing better
let lastTime = 0;
let accumulatedTime = 0;
const FRAME_TIME = 1000 / 60; // Target 60 FPS

function gameLoop(timestamp) {
    if (!gameActive || isPaused) {
        lastTime = 0; // Reset timing when paused
        requestAnimationFrame(gameLoop);
        return;
    }

    if (lastTime === 0) {
        lastTime = timestamp;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Limit accumulated time to prevent speed spikes
    accumulatedTime = Math.min(accumulatedTime + deltaTime, FRAME_TIME * 3);

    while (accumulatedTime >= FRAME_TIME) {
        timeRemaining = GAME_DURATION - (timestamp - gameStartTime);
        
        if (timeRemaining <= 0) {
            endGame();
            return;
        }

        // Update game state with fixed time step
        updateFlappyBird();
        updateBallGame();
        
        // Add this before accumulatedTime -= FRAME_TIME
        if (performance.now() - Math.max(lastFlappyScore, lastReflexScore) > COMBO_DURATION) {
            comboMultiplier = 1;
        }

        accumulatedTime -= FRAME_TIME;
    }

    // Update display
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    timerDisplay.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Clear and redraw both canvases
    flappyCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);
    reflexCtx.clearRect(0, 0, reflexCanvas.width, reflexCanvas.height);
    drawFlappyBird();
    drawPipes();
    drawBall();
    drawPaddle();

    scoreDisplay.textContent = `Score: ${score}`;
    requestAnimationFrame(gameLoop);
}

function startGame() {
    endGame(); // Ensure any existing game is ended
    resetGame();
    gameActive = true;
    isPaused = false;
    lastTime = 0;
    accumulatedTime = 0;
    gameStartTime = performance.now();
    gameOverModal.classList.add('hidden');
    restartButton.classList.add('hidden');
    pauseButton.classList.remove('hidden');
    menuButtonsContainer.classList.add('hidden');
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    score = 0;
    
    // Reset Flappy Bird
    flappyBird.x = flappyCanvas.width / 4;
    flappyBird.y = flappyCanvas.height / 2;
    flappyBird.velocity = 0;
    pipes = [];

    // Reset Ball Game
    initBallGame();
    ballScore = 0;
    ballSpeedMultiplier = 1;
    consecutiveMisses = 0;
    ballScoreMultiplier = 1;
    // Reset additional variables
    boxAppearTime = 0;
    timeRemaining = GAME_DURATION;
    pauseStartTime = 0;
    mouseX = reflexCanvas.width / 2;
    lastPenaltyTime = 0;

    // Reset combo system
    comboMultiplier = 1;
    lastFlappyScore = 0;
    lastReflexScore = 0;
    consecutivePipes = 0;
}

// New function to reset Flappy Bird on failure
function resetFlappyBird() {
    flappyBird.y = flappyCanvas.height / 2;
    flappyBird.velocity = 0;
    pipes = [];
}

// New function to reset Ball Game on failure
function initBallGame() {
    // Random starting position along the top
    ball.x = Math.random() * (reflexCanvas.width - BALL_RADIUS * 2) + BALL_RADIUS;
    ball.y = BALL_RADIUS * 2; // Start near the top
    paddle.x = reflexCanvas.width / 2 - PADDLE_WIDTH / 2;
    paddle.y = reflexCanvas.height - 30;

    // Random initial direction between -45 and 45 degrees
    const angle = (Math.random() * 90 - 45) * Math.PI / 180;
    ball.dx = BALL_SPEED * Math.sin(angle) * ballSpeedMultiplier;
    ball.dy = BALL_SPEED * Math.cos(angle) * ballSpeedMultiplier;
}

function endGame() {
    gameActive = false;
    isPaused = true;
    modalTitle.textContent = "Time's Up!";
    finalScoreDisplay.textContent = `Your final score is ${score}`;
    gameOverModal.classList.remove('hidden');
    restartButton.classList.remove('hidden'); // Show restart button
    menuButtonsContainer.classList.add('hidden');
    pauseButton.classList.add('hidden'); // Hide pause button
}

function pauseGame() {
    isPaused = true;
    pauseStartTime = performance.now();
    modalTitle.textContent = "Game Paused";
    finalScoreDisplay.innerHTML = "Click a button to continue.";
    gameOverModal.classList.remove('hidden');
    restartButton.classList.add('hidden');
    menuButtonsContainer.classList.remove('hidden');
}

function resumeGame() {
    isPaused = false;
    const pauseDuration = performance.now() - pauseStartTime;
    gameStartTime += pauseDuration;
    lastTime = 0; // Reset lastTime to ensure proper timing
    accumulatedTime = 0; // Reset accumulated time
    gameOverModal.classList.add('hidden');
    requestAnimationFrame(gameLoop);
}

function exitGame() {
    isPaused = false;
    gameActive = false;
    resetGame();
    modalTitle.textContent = "How to Play";
    finalScoreDisplay.innerHTML = "Press the START button to begin. You'll have 2 minutes to score as high as you can. Good luck!";
    gameOverModal.classList.remove('hidden');
    restartButton.classList.remove('hidden');
    menuButtonsContainer.classList.add('hidden');
    pauseButton.classList.add('hidden');
}

// Add window resize handler
window.addEventListener('resize', () => {
    flappyCanvas.width = flappyCanvas.offsetWidth;
    flappyCanvas.height = flappyCanvas.offsetHeight;
    reflexCanvas.width = reflexCanvas.offsetWidth;
    reflexCanvas.height = reflexCanvas.offsetHeight;
});

// Debounce score penalties
let lastPenaltyTime = 0;
const PENALTY_COOLDOWN = 500; // ms

// Update penalty function
function applyScorePenalty() {
    const now = performance.now();
    if (now - lastPenaltyTime >= PENALTY_COOLDOWN) {
        score = Math.max(0, score - PENALTY_SCORE);
        createFloatingText(
            flappyCanvas.offsetLeft + flappyBird.x,
            flappyCanvas.offsetTop + flappyBird.y,
            `-${PENALTY_SCORE}`,
            '#ef4444'
        );
        lastPenaltyTime = now;
        // Just reset combo without additional penalty
        comboMultiplier = 1;
    }
}

// Add after the constants section
function createFloatingText(x, y, text, color = '#fff') {
    const element = document.createElement('div');
    element.className = 'floating-score';
    element.textContent = text;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.color = color;
    document.body.appendChild(element);

    setTimeout(() => element.remove(), 1000);
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameActive && !isPaused) {
        flappyBird.velocity = BIRD_JUMP;
    }
});

// Mouse move listener for the Ball game
reflexCanvas.addEventListener('mousemove', (e) => {
    if (!gameActive || isPaused) return;
    const rect = reflexCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

// Add this new function to handle combo multiplier
function updateComboMultiplier() {
    const now = performance.now();
    const timeSinceLastScore = Math.min(
        now - lastFlappyScore,
        now - lastReflexScore
    );

    if (timeSinceLastScore < COMBO_DURATION) {
        comboMultiplier = Math.min(comboMultiplier + 0.5, MAX_COMBO_MULTIPLIER);
    } else {
        comboMultiplier = 1;
    }
}

// Main button event listeners
restartButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
resumeButton.addEventListener('click', resumeGame);
menuRestartButton.addEventListener('click', startGame);
exitButton.addEventListener('click', exitGame);


window.onload = function() {
    // Set canvas size to fill container
    flappyCanvas.width = flappyCanvas.offsetWidth;
    flappyCanvas.height = flappyCanvas.offsetHeight;
    reflexCanvas.width = reflexCanvas.offsetWidth;
    reflexCanvas.height = reflexCanvas.offsetHeight;

    // Display initial instructions
    gameOverModal.classList.remove('hidden');
    modalTitle.textContent = "How to Play";
    finalScoreDisplay.innerHTML = "Press the START button to begin. You'll have 2 minutes to score as high as you can. Good luck!";
    restartButton.textContent = "Start Game";

    flappyCanvas.height = flappyCanvas.offsetHeight;
    reflexCanvas.width = reflexCanvas.offsetWidth;
    reflexCanvas.height = reflexCanvas.offsetHeight;

    // Display initial instructions
    gameOverModal.classList.remove('hidden');
    modalTitle.textContent = "How to Play";
    finalScoreDisplay.innerHTML = "Press the START button to begin. You'll have 2 minutes to score as high as you can. Good luck!";
    restartButton.textContent = "Start Game";
}
