const MIN_BOARDS = 1;
const MAX_BOARDS = 3;

const boardsContainer = document.getElementById("boardsContainer");
const boardTemplate = document.getElementById("boardTemplate");
const boardCountEl = document.getElementById("boardCount");

const addBoardBtn = document.getElementById("addBoardBtn");
const removeBoardBtn = document.getElementById("removeBoardBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

let boards = [
  { id: crypto.randomUUID(), name: "Team A", score: 0 },
  { id: crypto.randomUUID(), name: "Team B", score: 0 }
];

function saveBoards() {
  localStorage.setItem("kyle-flip-scorekeeper-boards", JSON.stringify(boards));
}

function loadBoards() {
  const saved = localStorage.getItem("kyle-flip-scorekeeper-boards");
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length >= MIN_BOARDS) {
      boards = parsed.map((board, index) => ({
        id: board.id || crypto.randomUUID(),
        name: board.name || `Team ${index + 1}`,
        score: Number.isFinite(board.score) ? Math.max(0, Math.min(999, board.score)) : 0
      }));
      boards = boards.slice(0, MAX_BOARDS);
    }
  } catch (error) {
    console.error("Failed to load saved boards:", error);
  }
}

function setHalfNumbers(boardEl, number) {
  const value = String(number);

  boardEl.querySelector(".score-current").textContent = value;
  boardEl.querySelector(".flip-top-static").setAttribute("data-number", value);
  boardEl.querySelector(".flip-bottom-static").setAttribute("data-number", value);
}

function createBoardElement(board, index) {
  const fragment = boardTemplate.content.cloneNode(true);
  const article = fragment.querySelector(".team-board");
  const nameInput = fragment.querySelector(".team-name-input");
  const minusBtn = fragment.querySelector(".minus-btn");
  const plusBtn = fragment.querySelector(".plus-btn");

  article.dataset.id = board.id;
  nameInput.value = board.name;

  if (!board.name || board.name === "Team") {
    nameInput.value = `Team ${index + 1}`;
  }

  nameInput.addEventListener("input", (e) => {
    const found = boards.find((b) => b.id === board.id);
    if (!found) return;
    found.name = e.target.value.trim() || `Team ${index + 1}`;
    saveBoards();
  });

  minusBtn.addEventListener("click", () => updateScore(board.id, -1));
  plusBtn.addEventListener("click", () => updateScore(board.id, 1));

  setHalfNumbers(article, board.score);
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

function animateBoardFlip(boardEl, oldValue, newValue) {
  const topStatic = boardEl.querySelector(".flip-top-static");
  const bottomStatic = boardEl.querySelector(".flip-bottom-static");
  const topAnimate = boardEl.querySelector(".flip-top-animate");
  const bottomAnimate = boardEl.querySelector(".flip-bottom-animate");
  const scoreCurrent = boardEl.querySelector(".score-current");

  const oldText = String(oldValue);
  const newText = String(newValue);

  scoreCurrent.textContent = newText;

  topStatic.setAttribute("data-number", oldText);
  bottomStatic.setAttribute("data-number", newText);

  topAnimate.setAttribute("data-number", oldText);
  bottomAnimate.setAttribute("data-number", newText);

  topAnimate.className = "flip-half flip-top-animate";
  bottomAnimate.className = "flip-half flip-bottom-animate";

  const directionClass = newValue >= oldValue ? "play-forward" : "play-backward";

  void topAnimate.offsetWidth;
  void bottomAnimate.offsetWidth;

  topAnimate.classList.add(directionClass);
  bottomAnimate.classList.add(directionClass);

  const finish = () => {
    topAnimate.className = "flip-half flip-top-animate";
    bottomAnimate.className = "flip-half flip-bottom-animate";
    setHalfNumbers(boardEl, newValue);
  };

  setTimeout(finish, 360);
}

function updateScore(boardId, delta) {
  const board = boards.find((b) => b.id === boardId);
  if (!board) return;

  const oldValue = board.score;
  const nextValue = Math.max(0, Math.min(999, board.score + delta));

  if (oldValue === nextValue) return;

  board.score = nextValue;

  const boardEl = document.querySelector(`.team-board[data-id="${boardId}"]`);
  if (boardEl) {
    animateBoardFlip(boardEl, oldValue, nextValue);
  }

  saveBoards();
}

function addBoard() {
  if (boards.length >= MAX_BOARDS) return;

  boards.push({
    id: crypto.randomUUID(),
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