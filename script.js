// script.js
// بازی دوز با ربات (Minimax)
// بازیکن: 'X' (انسان) — ربات: 'O'

const cells = Array.from(document.querySelectorAll('.cell'));
const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const restartBtn = document.getElementById('restart');
const messageEl = document.getElementById('message');
const scorePlayerEl = document.getElementById('score-player');
const scoreBotEl = document.getElementById('score-bot');
const scoreDrawEl = document.getElementById('score-draw');
const botFirstChk = document.getElementById('bot-first');
const showHintsChk = document.getElementById('show-hints');

let board = Array(9).fill(null);
let currentPlayer = 'X'; // 'X' = human, 'O' = bot
let gameOver = false;
let scores = {player:0, bot:0, draw:0};

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function startGame() {
  board.fill(null);
  gameOver = false;
  // پاک کردن DOM
  cells.forEach(c=>{
    c.textContent = '';
    c.classList.remove('disabled','hint');
    c.removeAttribute('aria-pressed');
  });
  // تعیین نوبت اولیه
  currentPlayer = botFirstChk.checked ? 'O' : 'X';
  turnEl.textContent = currentPlayer === 'X' ? 'X (شما)' : 'O (ربات)';
  messageEl.textContent = currentPlayer === 'O' ? 'ربات اول می‌زند...' : 'نوبت شما';
  if (currentPlayer === 'O') {
    // اجازه بده JS در حلقه اجرا کند تا UI به‌روزرسانی شود
    setTimeout(() => botMove(), 250);
  }
  if (showHintsChk.checked) showHints();
}

function cellClickHandler(e){
  if (gameOver) return;
  const idx = Number(e.target.dataset.index);
  if (board[idx]) return;
  if (currentPlayer !== 'X') return; // فقط وقتی نوبت انسان است
  makeMove(idx, 'X');
  if (!gameOver) {
    setTimeout(()=>botMove(), 220);
  }
}

function makeMove(idx, player) {
  if (board[idx] || gameOver) return false;
  board[idx] = player;
  const cell = cells[idx];
  cell.textContent = player;
  cell.classList.add('disabled');
  cell.setAttribute('aria-pressed','true');
  // بررسی پایان
  const winner = checkWinner(board);
  if (winner) {
    endGame(winner);
  } else if (isBoardFull(board)) {
    endGame('draw');
  } else {
    currentPlayer = (player === 'X') ? 'O' : 'X';
    turnEl.textContent = currentPlayer === 'X' ? 'X (شما)' : 'O (ربات)';
    messageEl.textContent = currentPlayer === 'X' ? 'نوبت شما' : 'ربات در حال فکر کردن...';
    if (showHintsChk.checked) showHints();
  }
  return true;
}

function checkWinner(bd) {
  for (const combo of winningCombos) {
    const [a,b,c] = combo;
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a]; // 'X' یا 'O'
  }
  return null;
}

function isBoardFull(bd) {
  return bd.every(Boolean);
}

// پایان بازی
function endGame(result) {
  gameOver = true;
  if (result === 'draw') {
    messageEl.textContent = 'مساوی شد!';
    scores.draw++;
    scoreDrawEl.textContent = scores.draw;
  } else if (result === 'X') {
    messageEl.textContent = 'تبریک — شما بردید!';
    scores.player++;
    scorePlayerEl.textContent = scores.player;
    highlightWinningCells(result);
  } else {
    messageEl.textContent = 'ربات برد.';
    scores.bot++;
    scoreBotEl.textContent = scores.bot;
    highlightWinningCells(result);
  }
  turnEl.textContent = 'بازی تمام شد';
  // غیرفعال کردن سلول‌ها
  cells.forEach(c=>c.classList.add('disabled'));
}

// هایلایت خانه‌های برنده
function highlightWinningCells(winner) {
  for (const combo of winningCombos) {
    const [a,b,c] = combo;
    if (board[a] === winner && board[b] === winner && board[c] === winner) {
      cells[a].classList.add('hint');
      cells[b].classList.add('hint');
      cells[c].classList.add('hint');
    }
  }
}

// حرکت ربات — استفاده از Minimax
function botMove() {
  if (gameOver) return;
  // اگر اولین حرکت و مرکز خالی است، اول مرکز را بگیر (بهینه ولی سریع)
  const best = findBestMove(board, 'O');
  makeMove(best, 'O');
}

// تابع Minimax wrapper
function findBestMove(bd, player) {
  // بازگشت سریع در صورت اولین حرکت
  const empty = bd.map((v,i)=>v?null:i).filter(v=>v!==null);
  if (empty.length === 9) return 4; // انتخاب خانه وسط
  // Minimax
  const {index} = minimax(bd, player, 0);
  return index;
}

// Minimax implementation
function minimax(bd, player, depth) {
  const opponent = player === 'O' ? 'X' : 'O';
  const winner = checkWinner(bd);
  if (winner === 'O') return {score: 10 - depth};
  if (winner === 'X') return {score: depth - 10};
  if (isBoardFull(bd)) return {score: 0};

  const moves = [];

  for (let i=0;i<9;i++){
    if (!bd[i]) {
      // شبیه‌سازی حرکت
      bd[i] = player;
      const result = minimax(bd, opponent, depth + 1);
      moves.push({
        index: i,
        score: result.score
      });
      bd[i] = null; // بازگردانی
    }
  }

  // انتخاب بهترین حرکت بسته به بازیکن
  let bestMove;
  if (player === 'O') {
    // بیشینه‌سازی
    let bestScore = -Infinity;
    for (const m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  } else {
    // کمینه‌سازی برای انسان
    let bestScore = Infinity;
    for (const m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
  }
  return bestMove;
}

// نمایش پیشنهادها (خانه‌هایی که ربات بر اساس Minimax به عنوان بهترین انتخاب بعدی دارد)
function showHints() {
  // پاک کردن قبلی
  cells.forEach(c=>c.classList.remove('hint'));
  if (gameOver) return;
  // محاسبه بهترین حرکت ربات اگر ربات بعدی باشد
  const nextPlayer = currentPlayer;
  if (nextPlayer === 'O') {
    const best = findBestMove(board, 'O');
    if (best !== undefined) cells[best].classList.add('hint');
  } else {
    // اگر نوبت انسان است، نشان بده جاهایی که دفاع مهم است (اگر ربات در نوبت بعدی می‌تواند ببرد)
    // برای سادگی: نشون بده همه حرکاتی که باعث باخت انسان در نوبت بعد می‌شوند
    for (let i=0;i<9;i++){
      if (!board[i]) {
        const copy = board.slice();
        copy[i] = 'X';
        const botBest = findBestMove(copy, 'O');
        const copy2 = copy.slice();
        copy2[botBest] = 'O';
        if (checkWinner(copy2) === 'O') {
          cells[i].classList.add('hint');
        }
      }
    }
  }
}

// رویدادها
cells.forEach(cell => cell.addEventListener('click', cellClickHandler));
restartBtn.addEventListener('click', ()=> {
  startGame();
  messageEl.textContent = 'شروع شد';
});
botFirstChk.addEventListener('change', startGame);
showHintsChk.addEventListener('change', ()=>{
  cells.forEach(c=>c.classList.remove('hint'));
  if (showHintsChk.checked) showHints();
});

// شروع اولیه
startGame();