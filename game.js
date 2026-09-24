/* game.js - Snake Game JS */

/* Copyright (c) 2026 - present Rajesh Sahoo's personal project */

/*
modification history
--------------------
01f,24sep26,rks  created.
*/

class Snake {
  constructor() {
    this.segments = [{ x: 10, y: 10 }];
    this.direction = 'right';
    this.directionQueue = [];
  }

  setDirection(newDirection) {
    const lastDirection = this.directionQueue.length > 0
      ? this.directionQueue[this.directionQueue.length - 1]
      : this.direction;

    const opposites = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    };

    if (opposites[lastDirection] !== newDirection && lastDirection !== newDirection) {
      if (this.directionQueue.length < 3) {
        this.directionQueue.push(newDirection);
      }
    }
  }

  updateDirection() {
    if (this.directionQueue.length > 0) {
      this.direction = this.directionQueue.shift();
    }
  }

  checkCollision(gridSize) {
    const head = this.segments[0];

    if (head.x < 0 || head.x >= gridSize ||
      head.y < 0 || head.y >= gridSize) {
      return true;
    }

    for (let i = 1; i < this.segments.length; i++) {
      if (head.x === this.segments[i].x &&
        head.y === this.segments[i].y) {
        return true;
      }
    }

    return false;
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.tileSize = this.canvas.width / this.gridSize;

    this.snake = new Snake();

    this.bonus = null;
    this.bomb = null;
    this.food = this.generateItem();

    this.score = 0;
    this.gameLoop = null;

    // Timer elements
    this.timePlayed = 0;
    this.timerInterval = null;

    // Visual queues
    this.floatingTexts = [];

    // Speed parameters
    this.baseSpeed = 400; // 1x Speed
    this.maxSpeed = 60;   // Fastest limit
    this.gameSpeed = this.baseSpeed;

    this.leaderboard = [];
    this.currentPlayerName = 'Player 1';

    this.setupEventListeners();
    this.draw();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': this.snake.setDirection('up'); break;
        case 'ArrowDown': this.snake.setDirection('down'); break;
        case 'ArrowLeft': this.snake.setDirection('left'); break;
        case 'ArrowRight': this.snake.setDirection('right'); break;
      }
    });

    document.getElementById('overlayButton').addEventListener('click', () => {
      if (!this.gameLoop) {
        this.restartGame();
      }
    });

    const handleMobileInput = (id, dir) => {
      const btn = document.getElementById(id);
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault(); // prevents 300ms delay and emulated mouse events
        this.snake.setDirection(dir);
      });
    };

    handleMobileInput('btnUp', 'up');
    handleMobileInput('btnDown', 'down');
    handleMobileInput('btnLeft', 'left');
    handleMobileInput('btnRight', 'right');
  }

  generateItem() {
    const item = {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize)
    };

    const isOnSnake = this.snake.segments.some(s => s.x === item.x && s.y === item.y);
    const isOnFood = this.food && this.food.x === item.x && this.food.y === item.y;
    const isOnBonus = this.bonus && this.bonus.x === item.x && this.bonus.y === item.y;
    const isOnBomb = this.bomb && this.bomb.x === item.x && this.bomb.y === item.y;

    if (isOnSnake || isOnFood || isOnBonus || isOnBomb) return this.generateItem();
    return item;
  }

  scheduleBonus() {
    if (!this.gameLoop) return;
    const delay = Math.random() * 15000 + 15000; // 15-30 seconds
    this.bonusTimeout = setTimeout(() => this.spawnBonus(), delay);
  }

  spawnBonus() {
    if (!this.gameLoop) return;
    this.bonus = this.generateItem();
    // Disappear after 10 seconds
    this.bonusClearTimeout = setTimeout(() => {
      this.bonus = null;
      this.scheduleBonus();
    }, 10000);
  }

  scheduleBomb() {
    if (!this.gameLoop) return;
    const delay = Math.random() * 20000 + 20000; // 20-40 seconds
    this.bombTimeout = setTimeout(() => this.spawnBomb(), delay);
  }

  spawnBomb() {
    if (!this.gameLoop) return;
    this.bomb = this.generateItem();
    // Disappear after 10 seconds
    this.bombClearTimeout = setTimeout(() => {
      this.bomb = null;
      this.scheduleBomb();
    }, 10000);
  }

  clearTimeouts() {
    if (this.bonusTimeout) clearTimeout(this.bonusTimeout);
    if (this.bonusClearTimeout) clearTimeout(this.bonusClearTimeout);
    if (this.bombTimeout) clearTimeout(this.bombTimeout);
    if (this.bombClearTimeout) clearTimeout(this.bombClearTimeout);
    this.bonus = null;
    this.bomb = null;
  }

  adjustSpeed(delta) {
    this.gameSpeed -= delta;

    if (this.gameSpeed < this.maxSpeed) this.gameSpeed = this.maxSpeed;
    if (this.gameSpeed > this.baseSpeed) this.gameSpeed = this.baseSpeed;

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
    }
  }

  addFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x: x * this.tileSize + this.tileSize / 2,
      y: y * this.tileSize, // spawn slightly above
      text: text,
      color: color,
      life: 1.0
    });
  }

  draw() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i <= this.canvas.width; i += this.tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }

    // Draw bonus (gold pulsating)
    if (this.bonus) {
      const centerX = this.bonus.x * this.tileSize + this.tileSize / 2;
      const centerY = this.bonus.y * this.tileSize + this.tileSize / 2;

      this.ctx.fillStyle = '#fbbf24';
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, this.tileSize / 2 - 1, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, this.tileSize / 4, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    // Draw bomb (highly visible red outline on black)
    if (this.bomb) {
      const centerX = this.bomb.x * this.tileSize + this.tileSize / 2;
      const centerY = this.bomb.y * this.tileSize + this.tileSize / 2;

      this.ctx.fillStyle = '#222'; // Dark center
      this.ctx.strokeStyle = '#ef4444'; // Bright red outline
      this.ctx.lineWidth = 2;

      // Outer glow
      this.ctx.shadowColor = '#ef4444';
      this.ctx.shadowBlur = 10;

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, this.tileSize / 2 - 2, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.shadowBlur = 0; // reset shadow

      // Spark/fuse
      this.ctx.fillStyle = '#fbbf24'; // Yellow spark
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY - this.tileSize / 4, 3, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    // Draw normal food
    this.ctx.fillStyle = '#f87171';
    this.ctx.shadowColor = '#f87171';
    this.ctx.shadowBlur = 5;
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.tileSize + this.tileSize / 2,
      this.food.y * this.tileSize + this.tileSize / 2,
      this.tileSize / 2 - 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Draw snake
    this.snake.segments.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
      this.ctx.fillRect(
        segment.x * this.tileSize + 1,
        segment.y * this.tileSize + 1,
        this.tileSize - 2,
        this.tileSize - 2
      );
    });

    // Draw floating text
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 16px Poppins, sans-serif';
    this.floatingTexts.forEach(ft => {
      this.ctx.fillStyle = ft.color;
      this.ctx.globalAlpha = ft.life;
      this.ctx.fillText(ft.text, ft.x, ft.y);
    });
    this.ctx.globalAlpha = 1.0; // reset
  }

  update() {
    this.snake.updateDirection();

    const head = { ...this.snake.segments[0] };
    switch (this.snake.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    this.snake.segments.unshift(head);
    let ateFood = false;

    // Normal Food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      document.getElementById('score').textContent = this.score;
      this.food = this.generateItem();
      this.adjustSpeed(5); // Increased from 2 to 5 because base speed is much slower
      ateFood = true;
    }

    // Bonus Item
    if (this.bonus && head.x === this.bonus.x && head.y === this.bonus.y) {
      this.score += 50;
      document.getElementById('score').textContent = this.score;
      this.addFloatingText(head.x, head.y, '+50!', '#fbbf24');
      clearTimeout(this.bonusClearTimeout);
      this.bonus = null;
      this.scheduleBonus();
      this.adjustSpeed(25); // Increased from 15 to 25 to make the boost more impactful
      ateFood = true;
    }

    if (!ateFood) {
      this.snake.segments.pop();
    }

    // Bomb Item
    if (this.bomb && head.x === this.bomb.x && head.y === this.bomb.y) {
      clearTimeout(this.bombClearTimeout);
      this.bomb = null;
      this.scheduleBomb();

      // Halve the score
      this.score = Math.floor(this.score / 2);
      document.getElementById('score').textContent = this.score;
      this.addFloatingText(head.x, head.y, '½ SCORE', '#ef4444');

      this.adjustSpeed(-50); // Increased slow down from -40 to -50

      // Halve the snake
      const newLength = Math.max(1, Math.ceil(this.snake.segments.length / 2));
      this.snake.segments = this.snake.segments.slice(0, newLength);
    }

    if (this.snake.checkCollision(this.gridSize)) {
      this.endGame();
    }

    // Update floating texts
    this.floatingTexts.forEach(ft => {
      ft.life -= 0.05; // fade out speed
      ft.y -= 1; // drift upwards
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);
  }

  gameStep() {
    this.update();
    this.draw();
  }

  updateLeaderboard() {
    if (this.score > 0) {
      this.leaderboard.push({ name: this.currentPlayerName, score: this.score, time: this.timePlayed });
      this.leaderboard.sort((a, b) => b.score - a.score || a.time - b.time); // higher score, then lower time
      this.leaderboard = this.leaderboard.slice(0, 5); // keep top 5
    }

    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';

    if (this.leaderboard.length === 0) {
      list.innerHTML = '<li class="empty-msg">No scores yet!</li>';
      return;
    }

    this.leaderboard.forEach((entry, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="name-val">${entry.name}</span>
                <span class="score-val">${entry.score}</span>
                <span class="time-val">⏱ ${entry.time}s</span>
            `;
      list.appendChild(li);
    });
  }

  startGame() {
    if (this.gameLoop) return;

    const nameInput = document.getElementById('playerNameInput');
    this.currentPlayerName = nameInput.value.trim() || 'Anonymous';

    document.getElementById('overlay').style.display = 'none';

    // Timer Logic
    this.timePlayed = 0;
    document.getElementById('timer').textContent = '0s';
    this.timerInterval = setInterval(() => {
      this.timePlayed++;
      document.getElementById('timer').textContent = `${this.timePlayed}s`;
    }, 1000);

    this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);

    this.scheduleBonus();
    this.scheduleBomb();
  }

  endGame() {
    clearInterval(this.gameLoop);
    clearInterval(this.timerInterval);
    this.gameLoop = null;
    this.timerInterval = null;
    this.clearTimeouts();

    this.updateLeaderboard();

    const overlay = document.getElementById('overlay');
    document.getElementById('overlayTitle').textContent = 'Game Over!';
    document.getElementById('overlayTitle').style.color = '#f87171';
    document.getElementById('overlayText').textContent = `Final Score: ${this.score}`;
    document.getElementById('overlayButton').textContent = 'Play Again';
    overlay.style.display = 'flex';
  }

  restartGame() {
    this.snake = new Snake();
    this.clearTimeouts();
    this.bonus = null;
    this.bomb = null;
    this.food = this.generateItem();
    this.floatingTexts = [];

    this.score = 0;
    this.gameSpeed = this.baseSpeed;
    document.getElementById('score').textContent = '0';

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    this.startGame();
  }
}

window.onload = () => {
  new Game();
};
