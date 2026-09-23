class Snake {
    constructor() {
        this.segments = [{x: 10, y: 10}];
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    move(food) {
        const head = {...this.segments[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        this.segments.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            return true;
        }

        this.segments.pop();
        return false;
    }

    setDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[this.direction] !== newDirection) {
            this.nextDirection = newDirection;
        }
    }

    updateDirection() {
        this.direction = this.nextDirection;
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
        this.food = this.generateFood();
        this.score = 0;
        this.gameLoop = null;
        this.gameSpeed = 150;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.snake.setDirection('up'); break;
                case 'ArrowDown': this.snake.setDirection('down'); break;
                case 'ArrowLeft': this.snake.setDirection('left'); break;
                case 'ArrowRight': this.snake.setDirection('right'); break;
            }
        });

        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
    }

    generateFood() {
        const food = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };

        // Ensure food doesn't spawn on snake
        const isOnSnake = this.snake.segments.some(
            segment => segment.x === food.x && segment.y === food.y
        );

        if (isOnSnake) return this.generateFood();
        return food;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.segments.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
            this.ctx.fillRect(
                segment.x * this.tileSize,
                segment.y * this.tileSize,
                this.tileSize - 1,
                this.tileSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.tileSize,
            this.food.y * this.tileSize,
            this.tileSize - 1,
            this.tileSize - 1
        );
    }

    update() {
        this.snake.updateDirection();
        const hasEatenFood = this.snake.move(this.food);

        if (hasEatenFood) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
            this.gameSpeed = Math.max(50, this.gameSpeed - 2);
        }

        if (this.snake.checkCollision(this.gridSize)) {
            this.endGame();
        }
    }

    gameStep() {
        this.update();
        this.draw();
    }

    startGame() {
        if (this.gameLoop) return;

        document.getElementById('startButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'inline-block';

        this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
    }

    endGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'Game Over!',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    restartGame() {
        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        this.gameSpeed = 150;
        document.getElementById('score').textContent = '0';

        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        this.startGame();
    }
}

// Initialize game when window loads
window.onload = () => {
    new Game();
};
