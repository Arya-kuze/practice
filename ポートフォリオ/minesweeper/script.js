const board = document.getElementById("board");
const timerEl = document.getElementById("timer");
const flagsEl = document.getElementById("flags");
const resetBtn = document.getElementById("reset");
const difficultySelect = document.getElementById("difficulty");

let width, height, mineCount;
let grid = [];
let minePositions = [];
let flags = 0;
let timer = 0;
let timerInterval;
let gameOver = false;
let openedCells = 0;

const difficultySettings = {
  easy: { width: 9, height: 9, mines: 10 },
  medium: { width: 16, height: 16, mines: 40 },
  hard: { width: 30, height: 16, mines: 99 },
};

function startGame() {
  const difficulty = difficultySelect.value;
  const settings = difficultySettings[difficulty];
  width = settings.width;
  height = settings.height;
  mineCount = settings.mines;

  board.style.gridTemplateColumns = `repeat(${width}, 30px)`;

  // 初期化
  board.innerHTML = "";
  grid = [];
  minePositions = [];
  flags = mineCount;
  timer = 0;
  gameOver = false;
  openedCells = 0;
  flagsEl.textContent = flags;
  timerEl.textContent = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = timer;
  }, 1000);

  // 地雷配置
  while (minePositions.length < mineCount) {
    const i = Math.floor(Math.random() * width * height);
    if (!minePositions.includes(i)) minePositions.push(i);
  }

  // セル生成
  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    cell.addEventListener("click", () => openCell(i));
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      toggleFlag(i);
    });

    board.appendChild(cell);
    grid.push({
      el: cell,
      isMine: minePositions.includes(i),
      isOpen: false,
      isFlagged: false,
      adjacentMines: 0,
    });
  }

  // 隣接地雷数の計算
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].isMine) continue;
    const neighbors = getNeighbors(i);
    let count = neighbors.filter((idx) => grid[idx].isMine).length;
    grid[i].adjacentMines = count;
  }
}

function getNeighbors(index) {
  const x = index % width;
  const y = Math.floor(index / width);
  const neighbors = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        neighbors.push(ny * width + nx);
      }
    }
  }

  return neighbors;
}

function openCell(index) {
  const cell = grid[index];
  if (cell.isOpen || cell.isFlagged || gameOver) return;

  cell.isOpen = true;
  cell.el.classList.add("open");
  openedCells++;

  if (cell.isMine) {
    cell.el.classList.add("mine");
    cell.el.textContent = "💣";
    endGame(false);
    return;
  }

  if (cell.adjacentMines > 0) {
    cell.el.textContent = cell.adjacentMines;
  } else {
    const neighbors = getNeighbors(index);
    for (const n of neighbors) openCell(n);
  }

  if (openedCells === width * height - mineCount) {
    endGame(true);
  }
}

function toggleFlag(index) {
  const cell = grid[index];
  if (cell.isOpen || gameOver) return;

  if (cell.isFlagged) {
    cell.isFlagged = false;
    cell.el.classList.remove("flag");
    cell.el.textContent = "";
    flags++;
  } else {
    if (flags === 0) return;
    cell.isFlagged = true;
    cell.el.classList.add("flag");
    cell.el.textContent = "🚩";
    flags--;
  }

  flagsEl.textContent = flags;
}

function endGame(win) {
  gameOver = true;
  clearInterval(timerInterval);

  for (const cell of grid) {
    if (cell.isMine && !cell.isOpen) {
      cell.el.classList.add("mine");
      cell.el.textContent = "💣";
    }
  }

  setTimeout(() => {
    alert(win ? "🎉 勝利！" : "💥 ゲームオーバー！");
  }, 100);
}

resetBtn.addEventListener("click", startGame);
difficultySelect.addEventListener("change", startGame);
startGame();
