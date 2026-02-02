const boardWidth = 10;
const boardHeight = 20;
const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");

let board = [];
let currentPiece = null;
let intervalId;
let score = 0;

let isPaused = false;
const pauseMessage = document.getElementById("pause-message");


// テトリミノの形と回転定義（4x4のマトリクス）
const TETROMINOS = {
  I: [
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]]
  ],
  O: [
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[2,1]]
  ],
  T: [
    [[1,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,1]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[0,1],[1,0],[1,1],[1,2]]
  ],
  S: [
    [[1,0],[2,0],[0,1],[1,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]]
  ],
  Z: [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]]
  ],
  J: [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]]
  ],
  L: [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]]
  ]
};

const COLORS = {
  I: '#88c0d0', // ソフトブルー
  O: '#ebcb8b', // やさしい黄
  T: '#b48ead', // 薄い紫
  S: '#a3be8c', // ミントグリーン
  Z: '#bf616a', // 柔らか赤
  J: '#5e81ac', // 青グレー
  L: '#d08770'  // オレンジベージュ
};

function createBoard() {
  board = [];
  gameBoard.innerHTML = '';
  for (let y = 0; y < boardHeight; y++) {
    const row = [];
    for (let x = 0; x < boardWidth; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      gameBoard.appendChild(cell);
      row.push(cell);
    }
    board.push(row);
  }
}

function drawPiece(piece, add = true) {
  piece.shape.forEach(([x, y]) => {
    const px = piece.x + x;
    const py = piece.y + y;
    if (py >= 0 && board[py] && board[py][px]) {
      board[py][px].classList.toggle('active', add);
      if (add) board[py][px].style.backgroundColor = COLORS[piece.type];
      else board[py][px].style.backgroundColor = '';
    }
  });
}

function generatePiece() {
  const types = Object.keys(TETROMINOS);
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type,
    shape: TETROMINOS[type][0],
    rotation: 0,
    x: 3,
    y: -1
  };
}

function rotatePiece() {
  const nextRotation = (currentPiece.rotation + 1) % 4;
  const newShape = TETROMINOS[currentPiece.type][nextRotation];
  if (!collides(currentPiece.x, currentPiece.y, newShape)) {
    drawPiece(currentPiece, false);
    currentPiece.shape = newShape;
    currentPiece.rotation = nextRotation;
    drawPiece(currentPiece, true);
  }
}

function movePiece(dx, dy) {
  if (!collides(currentPiece.x + dx, currentPiece.y + dy, currentPiece.shape)) {
    drawPiece(currentPiece, false);
    currentPiece.x += dx;
    currentPiece.y += dy;
    drawPiece(currentPiece, true);
    return true;
  }
  return false;
}

function collides(x, y, shape) {
  return shape.some(([sx, sy]) => {
    const nx = x + sx;
    const ny = y + sy;
    return (
      nx < 0 || nx >= boardWidth || ny >= boardHeight ||
      (ny >= 0 && board[ny][nx].classList.contains('set'))
    );
  });
}

function fixPiece() {
  currentPiece.shape.forEach(([x, y]) => {
    const px = currentPiece.x + x;
    const py = currentPiece.y + y;
    if (py >= 0 && board[py] && board[py][px]) {
      board[py][px].classList.remove('active');
      board[py][px].classList.add('set');
      board[py][px].style.backgroundColor = COLORS[currentPiece.type];
    }
  });
}

function clearLines() {
  let linesCleared = 0;
  for (let y = boardHeight - 1; y >= 0; y--) {
    if (board[y].every(cell => cell.classList.contains('set'))) {
      for (let ty = y; ty > 0; ty--) {
        for (let x = 0; x < boardWidth; x++) {
          board[ty][x].className = board[ty - 1][x].className;
          board[ty][x].style.backgroundColor = board[ty - 1][x].style.backgroundColor;
        }
      }
      y++;
      linesCleared++;
    }
  }
  if (linesCleared > 0) {
    score += linesCleared * 100;
    scoreDisplay.textContent = score;
  }
}

function gameLoop() {
  if (!movePiece(0, 1)) {
    fixPiece();
    clearLines();
    currentPiece = generatePiece();
    if (collides(currentPiece.x, currentPiece.y, currentPiece.shape)) {
      clearInterval(intervalId);
      alert('ゲームオーバー！');
    } else {
      drawPiece(currentPiece);
    }
  }
}

function startGame() {
  createBoard();
  score = 0;
  scoreDisplay.textContent = score;
  currentPiece = generatePiece();
  drawPiece(currentPiece);
  intervalId = setInterval(gameLoop, 500);
}

function resetGame() {
  clearInterval(intervalId);
  startGame();
}

function move(direction) {
  switch (direction) {
    case 'left': movePiece(-1, 0); break;
    case 'right': movePiece(1, 0); break;
    case 'down': movePiece(0, 1); break;
  }
}

function rotate() {
  rotatePiece();
}

document.addEventListener("keydown", (e) => {
  if (e.key === 'ArrowLeft') movePiece(-1, 0);
  else if (e.key === 'ArrowRight') movePiece(1, 0);
  else if (e.key === 'ArrowDown') movePiece(0, 1);
  else if (e.key === 'ArrowUp') rotatePiece();
  else if (e.key === 'p' || e.key === 'P') togglePause();
});


startGame();

const startScreen = document.getElementById("start-screen");
const container = document.querySelector(".container");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  container.style.display = "block";
  startGame();
});

function togglePause() {
  if (isPaused) {
    intervalId = setInterval(gameLoop, 500);
    pauseMessage.style.display = "none";
  } else {
    clearInterval(intervalId);
    pauseMessage.style.display = "block";
  }
  isPaused = !isPaused;
}
