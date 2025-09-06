// Use a single game loop for both games
const flappyCanvas = document.getElementById('flappyCanvas');
const flappyCtx = flappyCanvas.getContext('2d');
const reflexCanvas = document.getElementById('reflexCanvas');
const reflexCtx = reflexCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const restartButton = document.getElementById('restartButton');
const modalTitle = document.getElementById('modalTitle');
const timerDisplay = document.getElementById('timer');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const exitButton = document.getElementById('exitButton');
const menuButtonsContainer = document.getElementById('menuButtons');
const playerNameInput = document.getElementById('playerNameInput');
const nameInputContainer = document.getElementById('nameInputContainer');
const highScoresList = document.getElementById('highScoresList');
const loadingIndicator = document.getElementById('loading');
const toggleViewButton = document.getElementById('toggleViewButton');
const scoreboardView = document.getElementById('scoreboardView');
const menuView = document.getElementById('menuView');

let score = 0;
let gameActive = false;
let isPaused = false;
let boxAppearTime = 0;
const GAME_DURATION = 120000; // 120 seconds in milliseconds
let gameStartTime = 0;
let timeRemaining = GAME_DURATION;
let pauseStartTime = 0;

// Flappy Bird Game Constants
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const BIRD_GRAVITY = 0.3;
const BIRD_JUMP = -6.0;
const PIPE_WIDTH = 100;
const PIPE_GAP = 250;
const PIPE_SPEED = 3;
const PARALLAX_SPEED = 2;

// Flappy Bird Game Variables
let flappyBird = {
    x: 0,
    y: 0,
    velocity: 0
};
let pipes = [];

// Ball Game Constants
const BALL_RADIUS = 25;
const PADDLE_WIDTH = 150;
const PADDLE_HEIGHT = 15;
const BALL_SPEED = 5;
const BALL_SPEED_INCREMENT = 0.1;

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
let mouseX = 0;

// Scoring and Combo Constants
const COMBO_DURATION = 5000;
const MAX_COMBO_MULTIPLIER = 3;
const BASE_SCORE = 100;
const PENALTY_SCORE = 300;
const BALL_MISS_MULTIPLIER_INCREMENT = 0.5;

// Scoring and Combo Variables
let lastFlappyScore = 0;
let lastReflexScore = 0;
let comboMultiplier = 1;
let consecutivePipes = 0;
let ballSpeedMultiplier = 1;
let consecutiveMisses = 0;
let ballScoreMultiplier = 1;

let db; // Firestore instance
let auth; // Firebase Auth instance
let userId; // User ID

document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase variables are available
    if (typeof initializeApp !== 'undefined') {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                loadingIndicator.classList.add('hidden');
                loadAndDisplayHighScores();
            } else {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Firebase auth failed:", error);
                    loadingIndicator.classList.add('hidden');
                }
            }
        });
    } else {
        console.warn("Firebase is not loaded. High scores will not be saved.");
        loadingIndicator.classList.add('hidden');
    }
});

async function saveHighScore(score) {
    if (!db || !userId) {
        console.warn("Firestore not available. Score not saved.");
        return;
    }
    const playerName = playerNameInput.value || "Anonymous";
    const newScore = { name: playerName, score: score, timestamp: Date.now() };

    try {
        const highScoresCollection = collection(db, `artifacts/${appId}/public/data/highScores`);
        await addDoc(highScoresCollection, newScore);
        loadAndDisplayHighScores();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

async function loadAndDisplayHighScores() {
    if (!db) {
        console.warn("Firestore not available. High scores cannot be loaded.");
        return;
    }
    try {
        const highScoresCollection = collection(db, `artifacts/${appId}/public/data/highScores`);
        const q = query(highScoresCollection);
        const querySnapshot = await getDocs(q);

        let highScores = [];
        querySnapshot.forEach((doc) => {
            highScores.push(doc.data());
        });
        
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10);

        displayHighScores(highScores);
    } catch (e) {
        console.error("Error getting documents: ", e);
    }
}

function displayHighScores(scores) {
    highScoresList.innerHTML = scores.map(score =>
        `<li class="py-1">${score.name} - ${score.score}</li>`
    ).join('');
}

// Function to draw the bird
function drawFlappyBird() {
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
        "Y": "#FFEB3B", // main yellow
        "L": "#FFFFCC", // light yellow
        "O": "#FFC107", // orange
        "R": "#F44336", // red
        "W": "#FFFFFF", // white (eye)
        "B": "#000000", // black (outline)
        ".": null       // transparent
    };

    const rows = birdPixels.length;
    const cols = birdPixels[0].length;
    const totalW = cols * pixelSize;
    const totalH = rows * pixelSize;

    const startX = Math.round(flappyBird.x - totalW / 2);
    const startY = Math.round(flappyBird.y - totalH / 2);

    flappyCtx.imageSmoothingEnabled = false;

    // ---- First pass: Draw outline (black border) ----
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const ch = birdPixels[r][c];
            if (ch === ".") continue;

            // Check 4-neighbors for transparency
            const neighbors = [
                [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
            ];
            let isEdge = false;
            for (const [nr, nc] of neighbors) {
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || birdPixels[nr][nc] === ".") {
                    isEdge = true;
                    break;
                }
            }
            if (isEdge) {
                flappyCtx.fillStyle = "#000000";
                flappyCtx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    // ---- Second pass: Draw bird colors ----
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const ch = birdPixels[r][c];
            const color = colors[ch];
            if (!color) continue;
            flappyCtx.fillStyle = color;
            flappyCtx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
        }
    }
}


// Function to draw the pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // ---- Pipe gradient ----
        const gradient = flappyCtx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        gradient.addColorStop(0, "#3CB371");   // MediumSeaGreen
        gradient.addColorStop(0.3, "#32CD32"); // LimeGreen
        gradient.addColorStop(0.7, "#7CFC00"); // LawnGreen
        gradient.addColorStop(1, "#2E8B57");   // SeaGreen

        // Pipe fill
        flappyCtx.fillStyle = gradient;
        flappyCtx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        flappyCtx.fillRect(pipe.x, pipe.bottom, PIPE_WIDTH, flappyCanvas.height);

        // ---- Strong border ----
        flappyCtx.strokeStyle = "#006400"; // DarkGreen border
        flappyCtx.lineWidth = 5;           // thicker border

        // Border around top pipe
        flappyCtx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.top);

        // Border around bottom pipe
        flappyCtx.strokeRect(pipe.x, pipe.bottom, PIPE_WIDTH, flappyCanvas.height);

        // ---- Pipe caps ----
        flappyCtx.fillStyle = gradient;
        flappyCtx.fillRect(pipe.x - 5, pipe.top - 20, PIPE_WIDTH + 10, 20);
        flappyCtx.fillRect(pipe.x - 5, pipe.bottom, PIPE_WIDTH + 10, 20);

        flappyCtx.strokeStyle = "#004d00"; // darker outline for caps
        flappyCtx.lineWidth = 5;
        flappyCtx.strokeRect(pipe.x - 5, pipe.top - 20, PIPE_WIDTH + 10, 20);
        flappyCtx.strokeRect(pipe.x - 5, pipe.bottom, PIPE_WIDTH + 10, 20);

        // ---- Subtle glare ----
        let glare = flappyCtx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        glare.addColorStop(0, "rgba(255,255,255,0.2)");
        glare.addColorStop(0.3, "rgba(255,255,255,0.1)");
        glare.addColorStop(1, "transparent");

        flappyCtx.fillStyle = glare;
        flappyCtx.fillRect(pipe.x + 2, 0, PIPE_WIDTH / 4, pipe.top);   // glare top pipe
        flappyCtx.fillRect(pipe.x + 2, pipe.bottom, PIPE_WIDTH / 4, flappyCanvas.height); // glare bottom pipe
    });
}



// Function to update the Flappy Bird game state
function updateFlappyBird() {
    flappyBird.velocity += BIRD_GRAVITY;
    flappyBird.y += flappyBird.velocity;

    // Parallax scrolling for background
    const bgElement = document.querySelector('.canvas-container:first-child canvas');
    if (bgElement) {
        const bgPosition = parseFloat(bgElement.style.backgroundPositionX || '0');
        bgElement.style.backgroundPositionX = `${bgPosition - PARALLAX_SPEED}px`;
    }

    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
    });

    if (
        pipes.length === 0 ||
        (
            pipes[pipes.length - 1].x < flappyCanvas.width - (pipes[pipes.length - 1].nextSpacing || 500) && Math.random() < 0.5
        )
    ) {
        const gap = PIPE_GAP;
        const spacing = 500;
        const minHeight = 40;
        const maxHeight = flappyCanvas.height - gap - 40;
        let randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        pipes.push({
            x: flappyCanvas.width,
            top: randomHeight,
            bottom: randomHeight + gap,
            passed: false,
            nextSpacing: spacing
        });
    }

    pipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

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
            const pipeScore = Math.min(100 + (consecutivePipes - 1) * 50, 300);
            score += pipeScore;
            const pipeMultiplier = pipeScore / 100;
            const comboScore = pipeScore;
            pipe.passed = true;
            lastFlappyScore = performance.now();
            updateComboMultiplier();
            
            const rect = flappyCanvas.getBoundingClientRect();
            createFloatingText(
                rect.left + flappyBird.x,
                rect.top + flappyBird.y,
                `+${comboScore} (x${pipeMultiplier.toFixed(1)})`,
                pipeMultiplier >= 3 ? '#fbbf24' : '#4ade80'
            );
        }
    });

    if (flappyBird.y + BIRD_HEIGHT / 2 > flappyCanvas.height || flappyBird.y - BIRD_HEIGHT / 2 < 0) {
        collision = true;
    }

    if (collision) {
        consecutivePipes = 0;
        applyScorePenalty();
        resetFlappyBird();
    }
}

function initBallGame() {
    ball.x = Math.random() * (reflexCanvas.width - BALL_RADIUS * 2) + BALL_RADIUS;
    ball.y = BALL_RADIUS * 2;
    paddle.x = reflexCanvas.width / 2 - PADDLE_WIDTH / 2;
    paddle.y = reflexCanvas.height - 30;

    const angle = (Math.random() * 90 - 45) * Math.PI / 180;
    ball.dx = BALL_SPEED * Math.sin(angle) * ballSpeedMultiplier;
    ball.dy = BALL_SPEED * Math.cos(angle) * ballSpeedMultiplier;
}

function drawBall() {
    reflexCtx.beginPath();

    // Create a radial gradient for a 3D effect
    const gradient = reflexCtx.createRadialGradient(
        ball.x - BALL_RADIUS / 3, // gradient center X
        ball.y - BALL_RADIUS / 3, // gradient center Y
        BALL_RADIUS / 5,           // inner radius
        ball.x, 
        ball.y, 
        BALL_RADIUS               // outer radius
    );
    gradient.addColorStop(0, '#ffffff'); // highlight
    gradient.addColorStop(0.5, '#ebeb1eff'); // main color
    gradient.addColorStop(1, '#d4d400'); // shadow color

    reflexCtx.fillStyle = gradient;
    reflexCtx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    reflexCtx.fill();

    // Optional subtle outline
    reflexCtx.lineWidth = 2;
    reflexCtx.strokeStyle = 'rgba(0,0,0,0.2)';
    reflexCtx.stroke();

    reflexCtx.closePath();
}


function drawPaddle() {
    const radius = 10; 
    reflexCtx.beginPath();
    reflexCtx.moveTo(paddle.x + radius, paddle.y);
    reflexCtx.lineTo(paddle.x + PADDLE_WIDTH - radius, paddle.y);
    reflexCtx.quadraticCurveTo(paddle.x + PADDLE_WIDTH, paddle.y, paddle.x + PADDLE_WIDTH, paddle.y + radius);
    reflexCtx.lineTo(paddle.x + PADDLE_WIDTH, paddle.y + PADDLE_HEIGHT - radius);
    reflexCtx.quadraticCurveTo(paddle.x + PADDLE_WIDTH, paddle.y + PADDLE_HEIGHT, paddle.x + PADDLE_WIDTH - radius, paddle.y + PADDLE_HEIGHT);
    reflexCtx.lineTo(paddle.x + radius, paddle.y + PADDLE_HEIGHT);
    reflexCtx.quadraticCurveTo(paddle.x, paddle.y + PADDLE_HEIGHT, paddle.x, paddle.y + PADDLE_HEIGHT - radius);
    reflexCtx.lineTo(paddle.x, paddle.y + radius);
    reflexCtx.quadraticCurveTo(paddle.x, paddle.y, paddle.x + radius, paddle.y);
    reflexCtx.closePath();

    // Gradient fill for premium ash-grey look
    const gradient = reflexCtx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + PADDLE_HEIGHT);
    gradient.addColorStop(0, "#e0e0e0");  // light ash
    gradient.addColorStop(0.5, "#b0b0b0"); // mid-tone
    gradient.addColorStop(1, "#7a7a7a");  // darker ash
    reflexCtx.fillStyle = gradient;
    reflexCtx.fill();

    // Subtle outline for depth
    reflexCtx.lineWidth = 2;
    reflexCtx.strokeStyle = "rgba(0,0,0,0.3)";
    reflexCtx.stroke();

    // Soft shadow for premium feel
    reflexCtx.shadowColor = "rgba(0,0,0,0.25)";
    reflexCtx.shadowBlur = 10;
    reflexCtx.shadowOffsetY = 4;

    // Fill & stroke again to apply shadow properly
    reflexCtx.fill();
    reflexCtx.stroke();

    // Reset shadow so it doesn’t affect other drawings
    reflexCtx.shadowColor = "transparent";
    reflexCtx.shadowBlur = 0;
    reflexCtx.shadowOffsetY = 0;
}



function updateBallGame() {
    paddle.x = Math.max(0, Math.min(reflexCanvas.width - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2));

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + BALL_RADIUS >= paddle.y && 
        ball.y <= paddle.y + PADDLE_HEIGHT && 
        ball.x > paddle.x && 
        ball.x < paddle.x + PADDLE_WIDTH &&
        ball.dy > 0) {
    
        ball.y = paddle.y - BALL_RADIUS;

        const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH;
        const angle = (hitPos - 0.5) * Math.PI / 2;

        ballSpeedMultiplier = Math.min(ballSpeedMultiplier + BALL_SPEED_INCREMENT, 5);
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        const newSpeed = Math.min(currentSpeed * (ballSpeedMultiplier), 2 * BALL_SPEED);

        ball.dx = newSpeed * Math.sin(angle);
        ball.dy = -newSpeed * Math.cos(angle);

        ballScoreMultiplier += 0.2;
        const finalScore = Math.floor(BASE_SCORE * ballScoreMultiplier);
        score += finalScore;

        consecutiveMisses = 0;
        createFloatingText(
            reflexCanvas.offsetLeft + 50 * window.innerWidth / 100 + ball.x,
            reflexCanvas.offsetTop + paddle.y - 20,
            `+${finalScore} (x${ballScoreMultiplier.toFixed(1)})`,
            ballScoreMultiplier >= 2 ? '#fbbf24' : '#4ade80'
        );
    }

    if (ball.x + BALL_RADIUS > reflexCanvas.width || ball.x - BALL_RADIUS < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - BALL_RADIUS < 0) {
        ball.dy = -ball.dy;
    }

    if (ball.y + BALL_RADIUS > reflexCanvas.height) {
        consecutiveMisses++;
        const missMultiplier = 1 + (consecutiveMisses - 1) * BALL_MISS_MULTIPLIER_INCREMENT;
        const penalty = Math.floor(PENALTY_SCORE * missMultiplier);
        score = Math.max(0, score - penalty);
        
        createFloatingText(
            reflexCanvas.offsetLeft + 50 * window.innerWidth / 100 + ball.x,
            reflexCanvas.offsetTop + ball.y,
            `-${penalty} (x${missMultiplier.toFixed(1)})`,
            '#ef4444'
        );
        ballSpeedMultiplier = 1;
        ballScoreMultiplier = 1;
        initBallGame();
    }
}

let lastTime = 0;
let accumulatedTime = 0;
const FRAME_TIME = 1000 / 60;

function gameLoop(timestamp) {
    if (!gameActive || isPaused) {
        lastTime = 0;
        requestAnimationFrame(gameLoop);
        return;
    }

    if (lastTime === 0) {
        lastTime = timestamp;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    accumulatedTime = Math.min(accumulatedTime + deltaTime, FRAME_TIME * 3);

    while (accumulatedTime >= FRAME_TIME) {
        timeRemaining = GAME_DURATION - (timestamp - gameStartTime);
        
        if (timeRemaining <= 0) {
            endGame();
            return;
        }

        updateFlappyBird();
        updateBallGame();
        
        if (performance.now() - Math.max(lastFlappyScore, lastReflexScore) > COMBO_DURATION) {
            comboMultiplier = 1;
        }

        accumulatedTime -= FRAME_TIME;
    }

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    timerDisplay.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

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
    /* if (playerNameInput.value.trim() === '') {
        promptForNameAndStartGame();
        return;
    } */
    
    resetGame();
    gameActive = true;
    isPaused = false;
    lastTime = 0;
    accumulatedTime = 0;
    gameStartTime = performance.now();
    gameOverModal.classList.add('hidden');
    pauseButton.classList.remove('hidden');
    menuButtonsContainer.classList.add('hidden');
    nameInputContainer.classList.add('hidden');
    restartButton.textContent = "Start Game";
    restartButton.onclick = startGame;
    requestAnimationFrame(gameLoop);
}

/* function promptForNameAndStartGame() {
    modalTitle.textContent = "Enter Your Name";
    finalScoreDisplay.textContent = "Please enter your name to save your high score.";
    highScoresList.innerHTML = '';
    nameInputContainer.classList.remove('hidden');
    restartButton.textContent = "Continue";
    restartButton.onclick = startGame;
    }
 */


function resetGame() {
    score = 0;
    
    flappyBird.x = flappyCanvas.width / 4;
    flappyBird.y = flappyCanvas.height / 2;
    flappyBird.velocity = 0;
    pipes = [];

    initBallGame();
    ballSpeedMultiplier = 1;
    consecutiveMisses = 0;
    ballScoreMultiplier = 1;
    boxAppearTime = 0;
    timeRemaining = GAME_DURATION;
    pauseStartTime = 0;
    mouseX = reflexCanvas.width / 2;
    lastPenaltyTime = 0;

    comboMultiplier = 1;
    lastFlappyScore = 0;
    lastReflexScore = 0;
    consecutivePipes = 0;
}

function resetFlappyBird() {
    flappyBird.y = flappyCanvas.height / 2;
    flappyBird.velocity = 0;
    pipes = [];
}

function endGame() {
    gameActive = false;
    isPaused = true;
    modalTitle.textContent = "Time's Up!";
    finalScoreDisplay.textContent = `Your final score is ${score}`;
    gameOverModal.classList.remove('hidden');
    restartButton.classList.remove('hidden');
    menuButtonsContainer.classList.add('hidden');
    pauseButton.classList.add('hidden');
    
    // Show name input and save score
    nameInputContainer.classList.remove('hidden');
    restartButton.textContent = "Save Score";
    restartButton.onclick = () => {
        saveHighScore(score);
    };
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
    lastTime = 0;
    accumulatedTime = 0;
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
    nameInputContainer.classList.add('hidden');
    restartButton.onclick = startGame;
}

let lastPenaltyTime = 0;
const PENALTY_COOLDOWN = 500;

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
        comboMultiplier = 1;
    }
}

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

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameActive && !isPaused) {
        flappyBird.velocity = BIRD_JUMP;
    }
});

reflexCanvas.addEventListener('mousemove', (e) => {
    if (!gameActive || isPaused) return;
    const rect = reflexCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

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


restartButton.addEventListener('click', () => {
    console.log("✅ Start button clicked");
    startGame();
});

pauseButton.addEventListener('click', pauseGame);
resumeButton.addEventListener('click', resumeGame);
exitButton.addEventListener('click', exitGame);
/* 
toggleViewButton.addEventListener('click', () => {
    if (scoreboardView.classList.contains('hidden')) {
        menuView.classList.add('hidden');
        scoreboardView.classList.remove('hidden');
        toggleViewButton.textContent = "Back to Menu";
    } else {
        scoreboardView.classList.add('hidden');
        menuView.classList.remove('hidden');
        toggleViewButton.textContent = "View Scoreboard";
    }
});
 */

window.addEventListener('resize', () => {
    flappyCanvas.width = flappyCanvas.offsetWidth;
    flappyCanvas.height = flappyCanvas.offsetHeight;
    reflexCanvas.width = reflexCanvas.offsetWidth;
    reflexCanvas.height = reflexCanvas.offsetHeight;
});

// Onload
window.onload = () => {
    flappyCanvas.width = flappyCanvas.offsetWidth;
    flappyCanvas.height = flappyCanvas.offsetHeight;
    reflexCanvas.width = reflexCanvas.offsetWidth;
    reflexCanvas.height = reflexCanvas.offsetHeight;
    initBallGame();
};
