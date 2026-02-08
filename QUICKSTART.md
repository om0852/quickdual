# QuickDual - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Extract the Files
Extract the `quickdual` folder to your computer.

### Step 2: Start a Local Server
Open your terminal/command prompt in the `quickdual` folder and run one of these commands:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx serve
```

**Using PHP:**
```bash
php -S localhost:8000
```

### Step 3: Open in Browser
Open your web browser and go to:
```
http://localhost:8000
```

## 🎮 How to Play

1. Click **"Start Game"** on the main menu
2. Use **SPACE** to make the bird jump in the left game
3. Move your **MOUSE** to control the paddle in the right game
4. Survive for 2 minutes while managing both games!
5. Try to get the highest score possible

## 💡 Tips for Success

- **Stay calm**: Don't panic when both games get chaotic
- **Peripheral vision**: Keep an eye on both games at once
- **Rhythm**: Find a rhythm for jumping in Flappy Bird
- **Anticipate**: Watch where the ball is going in Reflex Game
- **Practice**: It gets easier with practice!

## ⚠️ Troubleshooting

**Problem: Blank screen or errors**
- Make sure you're running the game through a web server (not just opening index.html directly)
- Check the browser console for errors (F12)

**Problem: Games not responding**
- Make sure you clicked on the canvas area first
- Check that JavaScript is enabled in your browser

**Problem: Can't see both canvases**
- Your screen might be too small - try zooming out (Ctrl + -)
- The game works best on screens 1400px wide or larger

## 🎯 Default Controls

| Action | Control |
|--------|---------|
| Bird Jump | SPACE |
| Paddle Move | MOUSE |
| Pause/Resume | ESC |

## 📊 Scoring

| Event | Points |
|-------|--------|
| Pass a pipe | +100 |
| Hit a pipe | -50 |
| Drop the ball | -100 |

Good luck and have fun! 🎮