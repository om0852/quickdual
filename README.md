# QuickDual - Dual Reflex Game

A challenging multitasking game that tests your hand-eye coordination, focus, and reaction speed by having you play two games simultaneously!

## 🎮 Game Description

QuickDual combines two classic games:
- **Flappy Bird** (Left): Navigate a bird through pipes using the SPACE key
- **Reflex Ball** (Right): Keep a bouncing ball from falling using your mouse to control the paddle

Players must manage both games at the same time for 2 minutes while trying to maximize their score!

## 🎯 Scoring System

- **+100 points**: Successfully passing through a pipe in Flappy Bird
- **-50 points**: Hitting a pipe in Flappy Bird
- **-100 points**: Letting the ball fall in Reflex Game

## 🕹️ Controls

- **SPACE**: Make the bird jump (Flappy Bird)
- **MOUSE**: Control the paddle (Reflex Game)
- **ESC**: Pause/Resume game

## 📁 Project Structure

```
quickdual/
├── index.html              # Main HTML file
├── style.css               # Stylesheet
├── src/
│   ├── main.js            # Entry point
│   ├── core/
│   │   ├── Game.js        # Main game controller
│   │   ├── GameLoop.js    # Game loop logic
│   │   ├── State.js       # Game states
│   │   └── Timer.js       # Game timer
│   ├── games/
│   │   ├── flappy/
│   │   │   ├── FlappyGame.js
│   │   │   ├── Bird.js
│   │   │   └── Pipes.js
│   │   └── reflex/
│   │       ├── ReflexGame.js
│   │       ├── Ball.js
│   │       ├── Paddle.js
│   ├── ui/
│   │   ├── Menu.js
│   │   ├── PauseMenu.js
│   │   ├── HUD.js
│   │   └── Tutorial.js
│   ├── services/
│   │   └── leaderboard.js
│   └── utils/
│       ├── Constants.js
│       ├── FloatingText.js
│       └── Input.js
```

## 🚀 How to Run

### Option 1: Using a Simple HTTP Server (Recommended)

Since this is a module-based JavaScript project, you need to run it through a web server:

```bash
# If you have Python 3 installed:
python -m http.server 8000

# If you have Node.js installed:
npx serve

# If you have PHP installed:
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

### Option 2: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Deploy to GitHub Pages

1. Push this project to a GitHub repository
2. Go to Settings > Pages
3. Select the main branch as source
4. Your game will be available at `https://yourusername.github.io/quickdual`

## 🎨 Features

- **Dual-game multitasking** gameplay
- **Smooth animations** and visual effects
- **Score tracking** with floating text feedback
- **Leaderboard system** (localStorage-based)
- **Pause/Resume** functionality
- **Tutorial screen** explaining how to play
- **Responsive design** that works on different screen sizes
- **Visual polish** with gradients, shadows, and smooth transitions

## 🔧 Customization

You can adjust game difficulty by modifying values in `src/utils/Constants.js`:

```javascript
export const GAME_DURATION = 120000; // Game duration in milliseconds

export const FLAPPY = {
  GRAVITY: 0.6,      // Bird fall speed
  JUMP: -10,         // Bird jump strength
  PIPE_SPEED: 3,     // Pipe movement speed
  PIPE_GAP: 250,     // Gap between pipes
  // ...
};

export const REFLEX = {
  BALL_RADIUS: 15,   // Ball size
  BALL_SPEED: 5,     // Ball movement speed
  PADDLE_WIDTH: 120, // Paddle width
  // ...
};
```

## 🔮 Future Enhancements

- Firebase integration for global leaderboard
- Power-ups and special abilities
- Different difficulty levels
- Sound effects and background music
- Mobile touch controls
- More game modes and variations
- Achievement system
- Social sharing features

## 📝 Notes

- The leaderboard currently uses `localStorage`, so scores are only saved locally
- For a production version, integrate Firebase or another backend service
- The game is optimized for desktop browsers with mouse and keyboard

## 🎓 Learning Points

This project demonstrates:
- ES6 modules and modern JavaScript
- Canvas API for 2D graphics
- Game loop implementation
- State management
- Object-oriented programming
- Event handling
- DOM manipulation
- Collision detection
- Smooth animations and transitions

## 📄 License

This project is open source and available for educational purposes.

---

Enjoy playing QuickDual! Can you survive the full 2 minutes? 🎮