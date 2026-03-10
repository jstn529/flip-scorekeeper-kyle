const MIN_BOARDS = 1;
const MAX_BOARDS = 3;
const STORAGE_KEY = "kyle-flip-scorekeeper-boards";

const boardsContainer = document.getElementById("boardsContainer");
const boardTemplate = document.getElementById("boardTemplate");
const boardCountEl = document.getElementById("boardCount");

const addBoardBtn = document.getElementById("addBoardBtn");
const removeBoardBtn = document.getElementById("removeBoardBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

let boards = [
  { id: createId(), name: "Team A", score: 0 },
  { id: createId(), name: "Team B", score: 0 }
];

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "board-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function saveBoards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

function loadBoards() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed) && parsed.length >= MIN_BOARDS) {
      boards = parsed.slice(0, MAX_BOARDS).map((board, index) => ({
        id: board.id || createId(),
        name: typeof board.name === "string" && board.name.trim()
          ? board.name.trim()
          : `Team ${index + 1}`,
        score: Number.isFinite(board.score)
          ? Math.max(0, Math.min(999, board.score))
          : 0
      }));
    }
  } catch (error) {
    console.error("Failed to load saved boards:", error);
  }
}

function createBoardElement(board, index) {
  const fragment = boardTemplate.content.cloneNode(true);
  const article = fragment.querySelector(".team-board");
  const nameInput = fragment.querySelector(".team-name-input");
  const scoreDisplay = fragment.querySelector(".score-display");
  const minusBtn = fragment.querySelector(".minus-btn");
  const plusBtn = fragment.querySelector(".plus-btn");

  article.dataset.id = board.id;
  nameInput.value = board.name || `Team ${index + 1}`;
  scoreDisplay.textContent = board.score;

  nameInput.addEventListener("input", (event) => {
    const currentBoard = boards.find((item) => item.id === board.id);
    if (!currentBoard) return;

    currentBoard.name = event.target.value.trim() || `Team ${index + 1}`;
    saveBoards();
  });

  minusBtn.addEventListener("click", () => updateScore(board.id, -1));
  plusBtn.addEventListener("click", () => updateScore(board.id, 1));

  return article;
}

function renderBoards() {
  boardsContainer.innerHTML = "";

  boards.forEach((board, index) => {
    const boardEl = createBoardElement(board, index);
    boardsContainer.appendChild(boardEl);
  });

  boardCountEl.textContent = String(boards.length);
  addBoardBtn.disabled = boards.length >= MAX_BOARDS;
  removeBoardBtn.disabled = boards.length <= MIN_BOARDS;

  saveBoards();
}

function animateBoardFlip(boardEl, newValue) {
  const display = boardEl.querySelector(".score-display");
  const top = boardEl.querySelector(".flip-top");
  const bottom = boardEl.querySelector(".flip-bottom");

  top.classList.remove("play");
  bottom.classList.remove("play");

  void top.offsetWidth;
  void bottom.offsetWidth;

  display.textContent = newValue;
  top.classList.add("play");

  setTimeout(() => {
    bottom.classList.add("play");
  }, 120);

  setTimeout(() => {
    top.classList.remove("play");
    bottom.classList.remove("play");
  }, 320);
}

function updateScore(boardId, delta) {
  const board = boards.find((item) => item.id === boardId);
  if (!board) return;

  const nextValue = Math.max(0, Math.min(999, board.score + delta));
  if (nextValue === board.score) return;

  board.score = nextValue;

  const boardEl = document.querySelector(`.team-board[data-id="${boardId}"]`);
  if (boardEl) {
    animateBoardFlip(boardEl, nextValue);
  }

  saveBoards();
}

function addBoard() {
  if (boards.length >= MAX_BOARDS) return;

  boards.push({
    id: createId(),
    name: `Team ${boards.length + 1}`,
    score: 0
  });

  renderBoards();
}

function removeBoard() {
  if (boards.length <= MIN_BOARDS) return;
  boards.pop();
  renderBoards();
}

function resetAllBoards() {
  boards = boards.map((board) => ({
    ...board,
    score: 0
  }));
  renderBoards();
}

addBoardBtn.addEventListener("click", addBoard);
removeBoardBtn.addEventListener("click", removeBoard);
resetAllBtn.addEventListener("click", resetAllBoards);

loadBoards();
renderBoards();