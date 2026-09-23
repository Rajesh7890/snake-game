# Snake Game - Design and Implementation Guidelines

## 1. Overview
The Snake Game is a modern, web-based implementation of the classic arcade game. It features responsive design, dynamic gameplay mechanics, and mobile touch controls.

## 2. Technical Stack
- **HTML5**: Defines the structure, including the game canvas, overlay UI, and leaderboard.
- **CSS3 (Vanilla)**: Handles styling, responsive flexbox layouts, media queries for mobile, and modern aesthetic choices (like glowing effects and semi-transparent overlays).
- **JavaScript (ES6+)**: Manages the game loop, object-oriented state management (`Snake` and `Game` classes), HTML5 Canvas rendering, and event handling.

## 3. Game Mechanics
### 3.1 Entities
- **Snake**: 
  - Represented as an array of segment objects (`{x, y}`).
  - Movement is handled by calculating the new head position based on the current direction, unshifting it to the array, and popping the tail (unless an item is eaten).
- **Food (Red)**:
  - Standard collectible. Grants +10 points.
  - Slightly increases game speed.
- **Bonus (Gold Coin)**:
  - Spawns randomly (every 15-30 seconds) and despawns after 10 seconds.
  - Grants +50 points.
  - Significantly increases game speed.
- **Bomb (Black/Red)**:
  - Spawns randomly (every 20-40 seconds) and despawns after 10 seconds.
  - Halves the player's score and snake length.
  - Significantly decreases game speed (provides a breather to recover).

### 3.2 Speed & Difficulty
- The game operates on a tick-based `setInterval` loop.
- **Base Speed**: 200ms per tick (1x).
- **Max Speed**: 60ms per tick (capped to prevent unplayable states).
- Speed is dynamically adjusted using the `adjustSpeed(delta)` method based on items consumed.

## 4. User Interface & Aesthetics
- **Theme**: Dark, modern aesthetic (`#1a1a2e` background) using the 'Poppins' Google Font.
- **Canvas Effects**: 
  - The canvas features a faint grid to help players judge distance.
  - Items use `shadowBlur` and `shadowColor` on the 2D context to create a glowing neon effect.
  - Floating text animations provide immediate visual feedback (`+50!`, `½ SCORE`).
- **Overlay System**: A single unified `div` overlay handles both the "Start" screen and the "Game Over" screen, keeping DOM complexity minimal.

## 5. Responsiveness & Controls
- **Layout**: The wrapper uses `flex-wrap` and `flex: 1 1 100%` with constraints to automatically reflow the leaderboard to the bottom on smaller devices.
- **Typography**: Uses CSS `clamp()` functions to ensure font sizes scale beautifully across large monitors and small smartphones alike.
- **Controls**:
  - Desktop: Arrow keys (default browser scrolling is intentionally prevented).
  - Mobile: An on-screen D-pad is conditionally rendered using media queries (`max-width: 768px`).

## 6. Code Optimization & Best Practices
- **State Compartmentalization**: The game state is compartmentalized into classes. The `Snake` class handles its own positional math and collision detection, while the `Game` class handles rendering, rules, and input.
- **Memory Management**: Timers (`setTimeout`) for the Bonus and Bomb items are strictly tracked and cleared using `clearTimeouts()` upon Game Over or Game Restart to prevent memory leaks or phantom item spawns.
- **Efficient DOM Updates**: Score and Timer DOM elements are only queried and updated when necessary, rather than wiping and rebuilding the DOM every tick.
