// ============ 游戏状态 ============
let board = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('brutal2048ultra_best') || '0');
let gameWon = false;
let gameLost = false;
let canContinue = false;
let moveCount = 0;
let comboCount = 0;
let maxCombo = 0;
let gameMode = 'classic';
let undoCount = 3;
let bombCount = 2;
let history = [];
let achievements = new Set();
let maxTile = 0;
let frozenCells = [];
let timerInterval = null;
let timeLeft = 60;
let currentLevel = null;
let levelMovesLeft = 0;

// ============ DOM 元素 ============
let gameBoard, gridBackground, tilesContainer, scoreEl, bestScoreEl;
let comboCountEl, moveCountEl, progressFill, progressText;
let gameOverlay, overlayIcon, overlayTitle, overlayMessage, overlayStats;
let continueBtn, restartBtn, newGameBtn, undoBtn, bombBtn;
let undoCountEl, bombCountEl, statusText, mainContainer;
let achievementsGrid, achievementCount;
let timerPanelEl, timerDisplayEl, timerBarEl;
let levelPanelEl, levelGridEl, levelInfoEl;
let leaderboardListEl, noRecordsEl, clearRecordsBtn;
let currentTheme = 'neo-brutal';
let themeGridEl;

// ============ 初始化DOM ============
function initDOM() {
  gameBoard = document.getElementById('game-board');
  gridBackground = document.getElementById('grid-background');
  tilesContainer = document.getElementById('tiles-container');
  scoreEl = document.getElementById('score');
  bestScoreEl = document.getElementById('best-score');
  comboCountEl = document.getElementById('combo-count');
  moveCountEl = document.getElementById('move-count');
  progressFill = document.getElementById('progress-fill');
  progressText = document.getElementById('progress-text');
  gameOverlay = document.getElementById('game-overlay');
  overlayIcon = document.getElementById('overlay-icon');
  overlayTitle = document.getElementById('overlay-title');
  overlayMessage = document.getElementById('overlay-message');
  overlayStats = document.getElementById('overlay-stats');
  continueBtn = document.getElementById('continue-btn');
  restartBtn = document.getElementById('restart-btn');
  newGameBtn = document.getElementById('new-game-btn');
  undoBtn = document.getElementById('undo-btn');
  bombBtn = document.getElementById('bomb-btn');
  undoCountEl = document.getElementById('undo-count');
  bombCountEl = document.getElementById('bomb-count');
  statusText = document.getElementById('status-text');
  mainContainer = document.getElementById('main-container');
  achievementsGrid = document.getElementById('achievements-grid');
  achievementCount = document.getElementById('achievement-count');
  timerPanelEl = document.getElementById('timer-panel');
  timerDisplayEl = document.getElementById('timer-display');
  timerBarEl = document.getElementById('timer-bar');
  levelPanelEl = document.getElementById('level-panel');
  levelGridEl = document.getElementById('level-grid');
  levelInfoEl = document.getElementById('level-info');
  leaderboardListEl = document.getElementById('leaderboard-list');
  noRecordsEl = document.getElementById('no-records');
  clearRecordsBtn = document.getElementById('clear-records-btn');
  themeGridEl = document.getElementById('theme-grid');
}

// ============ 初始化 ============
function init() {
  initDOM();
  
  // 创建网格背景
  gridBackground.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    gridBackground.appendChild(cell);
  }

  // 创建成就网格
  createAchievementGrid();
  
  // 加载已解锁成就
  const savedAchievements = JSON.parse(localStorage.getItem('brutal2048ultra_achievements') || '[]');
  savedAchievements.forEach(id => achievements.add(id));
  updateAchievementDisplay();

  bestScoreEl.textContent = bestScore;
  newGame();
}

function createAchievementGrid() {
  achievementsGrid.innerHTML = '';
  achievementList.forEach(ach => {
    const div = document.createElement('div');
    div.className = 'aspect-square flex flex-col items-center justify-center p-1 border-2 cursor-help relative';
    div.style.borderColor = achievements.has(ach.id) ? ach.color : '#444';
    div.style.background = achievements.has(ach.id) ? ach.color + '20' : '#222';
    div.title = `${ach.name}: ${ach.desc}`;
    div.innerHTML = `
      <i class="fas ${ach.icon} text-lg mb-1" style="color: ${achievements.has(ach.id) ? ach.color : '#666'};"></i>
      <span class="text-[8px] font-mono font-bold text-center leading-tight" style="color: ${achievements.has(ach.id) ? ach.color : '#666'};">${ach.name}</span>
    `;
    achievementsGrid.appendChild(div);
  });
}

function updateAchievementDisplay() {
  achievementCount.textContent = `${achievements.size}/${achievementList.length}`;
  createAchievementGrid();
}

function unlockAchievement(id) {
  if (!achievements.has(id)) {
    achievements.add(id);
    localStorage.setItem('brutal2048ultra_achievements', JSON.stringify([...achievements]));
    
    const ach = achievementList.find(a => a.id === id);
    if (ach) {
      showAchievementToast(ach);
      updateAchievementDisplay();
    }
  }
}

function showAchievementToast(ach) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <i class="fas ${ach.icon} text-2xl" style="color: #1A1A1A;"></i>
      <div>
        <div class="text-[10px] uppercase">▸ ACHIEVEMENT UNLOCKED</div>
        <div class="font-display text-sm">${ach.name}</div>
        <div class="text-[10px]">${ach.desc}</div>
      </div>
    </div>
  `;
  document.getElementById('achievement-container').appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ============ 新游戏 ============
function newGame() {
  board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  score = 0;
  gameWon = false;
  gameLost = false;
  canContinue = false;
  moveCount = 0;
  comboCount = 0;
  maxCombo = 0;
  maxTile = 0;
  frozenCells = [];
  
  // 根据模式设置道具
  if (gameMode === 'classic') {
    undoCount = 3;
    bombCount = 2;
  } else if (gameMode === 'chaos') {
    undoCount = 1;
    bombCount = 3;
  } else if (gameMode === 'zen') {
    undoCount = 999;
    bombCount = 5;
  } else if (gameMode === 'gravity') {
    undoCount = 2;
    bombCount = 2;
  } else if (gameMode === 'levels') {
    undoCount = 3;
    bombCount = 2;
    // 如果没有选择关卡，显示关卡选择面板
    if (!currentLevel) {
      showLevelPanel();
      return;
    }
  }
  
  history = [];
  
  stopTimer();
  
  // 关卡模式：加载关卡数据
  if (gameMode === 'levels' && currentLevel) {
    board = currentLevel.board.map(row => [...row]);
    levelMovesLeft = currentLevel.moves;
    updateLevelInfo();
  }
  
  updateScore();
  updateCombo();
  updateMoveCount();
  updatePowers();
  updateProgress();
  hideOverlay();
  
  if (gameMode !== 'levels' || !currentLevel) {
    addRandomTile();
    addRandomTile();
  }
  
  renderTiles();
  statusText.textContent = 'SYSTEM_READY';
  
  // 限时模式启动计时器
  if (gameMode === 'time') {
    startTimer();
  }
}

// ============ 添加随机方块 ============
function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0 && !frozenCells.some(f => f.r === r && f.c === c)) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length > 0) {
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // Chaos模式有概率生成特殊方块
    if (gameMode === 'chaos' && Math.random() < 0.12) {
      const specialType = Math.random();
      if (specialType < 0.25) {
        board[r][c] = 'bomb';
      } else if (specialType < 0.45) {
        board[r][c] = 'multiplier';
      } else if (specialType < 0.60) {
        board[r][c] = 'rainbow';
      } else if (specialType < 0.75) {
        board[r][c] = 'freeze';
      } else if (specialType < 0.88) {
        board[r][c] = 'rowclear';
      } else if (specialType < 0.95) {
        board[r][c] = 'colclear';
      } else {
        board[r][c] = 'mergeall';
      }
    } else if (gameMode === 'time' && Math.random() < 0.06) {
      // 限时模式低概率生成帮助道具
      const specialType = Math.random();
      if (specialType < 0.3) {
        board[r][c] = 'freeze';
      } else if (specialType < 0.6) {
        board[r][c] = 'rowclear';
      } else if (specialType < 0.85) {
        board[r][c] = 'colclear';
      } else {
        board[r][c] = 'mergeall';
      }
    } else {
      board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    
    return { r, c, value: board[r][c] };
  }
  return null;
}

// ============ 渲染方块 ============
function renderTiles(newTilePos = null, mergedPositions = []) {
  tilesContainer.innerHTML = '';
  
  const boardRect = gameBoard.getBoundingClientRect();
  const padding = 12;
  const gap = 8;
  const cellSize = (boardRect.width - padding * 2 - gap * 3) / 4;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const value = board[r][c];
      if (value !== 0) {
        const tile = document.createElement('div');
        
        let tileClass = 'tile ';
        let displayText = value;
        
        if (typeof value === 'string') {
          // 特殊方块
          if (value === 'bomb') {
            tileClass += 'tile-bomb';
            displayText = '<i class="fas fa-bomb"></i>';
          } else if (value === 'multiplier') {
            tileClass += 'tile-multiplier';
            displayText = 'x2';
          } else if (value === 'rainbow') {
            tileClass += 'tile-rainbow';
            displayText = '★';
          } else if (value === 'freeze') {
            tileClass += 'tile-freeze';
            displayText = '<i class="fas fa-snowflake"></i>';
          } else if (value === 'rowclear') {
            tileClass += 'tile-rowclear';
            displayText = '<i class="fas fa-minus"></i>';
          } else if (value === 'colclear') {
            tileClass += 'tile-colclear';
            displayText = '<i class="fas fa-grip-lines-vertical"></i>';
          } else if (value === 'mergeall') {
            tileClass += 'tile-mergeall';
            displayText = '<i class="fas fa-compress-arrows-alt"></i>';
          }
        } else if (value <= 2048) {
          tileClass += `tile-${value}`;
        } else {
          tileClass += 'tile-super';
        }

        if (newTilePos && newTilePos.r === r && newTilePos.c === c) {
          tileClass += ' tile-new';
        }

        if (mergedPositions.some(pos => pos.r === r && pos.c === c)) {
          tileClass += ' tile-merged';
        }

        tile.className = tileClass;
        tile.innerHTML = displayText;

        const x = c * (cellSize + gap);
        const y = r * (cellSize + gap);
        
        tile.style.width = `${cellSize}px`;
        tile.style.height = `${cellSize}px`;
        tile.style.transform = `translate(${x}px, ${y}px)`;
        
        // 字体大小自适应
        if (typeof value === 'number') {
          const fontSize = value < 100 ? cellSize * 0.42 : 
                           value < 1000 ? cellSize * 0.36 : 
                           value < 10000 ? cellSize * 0.28 : 
                           cellSize * 0.22;
          tile.style.fontSize = `${fontSize}px`;
        } else {
          tile.style.fontSize = `${cellSize * 0.4}px`;
        }

        tilesContainer.appendChild(tile);
      }
    }
  }
}

// ============ 保存历史 ============
function saveHistory() {
  history.push({
    board: board.map(row => [...row]),
    score: score,
    comboCount: comboCount,
    moveCount: moveCount
  });
  
  // 限制历史记录数量
  if (history.length > 10) {
    history.shift();
  }
}

// ============ 撤销 ============
function undo() {
  if (history.length > 0 && undoCount > 0) {
    const lastState = history.pop();
    board = lastState.board;
    score = lastState.score;
    comboCount = lastState.comboCount;
    moveCount = lastState.moveCount;
    undoCount--;
    
    updateScore();
    updateCombo();
    updateMoveCount();
    updatePowers();
    renderTiles();
    
    statusText.textContent = 'UNDO_DONE';
    setTimeout(() => statusText.textContent = 'SYSTEM_READY', 1000);
  }
}

// ============ 炸弹 ============
function useBomb() {
  if (bombCount <= 0) return;
  
  statusText.textContent = 'BOMB_MODE';
  gameBoard.style.cursor = 'crosshair';
  
  // 添加点击监听
  const bombClickHandler = (e) => {
    const rect = gameBoard.getBoundingClientRect();
    const x = e.clientX - rect.left - 12;
    const y = e.clientY - rect.top - 12;
    const gap = 8;
    const cellSize = (rect.width - 24 - gap * 3) / 4;
    
    const c = Math.floor(x / (cellSize + gap));
    const r = Math.floor(y / (cellSize + gap));
    
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && board[r][c] !== 0) {
      // 创建爆炸效果
      createExplosion(r, c);
      
      // 炸毁方块
      board[r][c] = 0;
      bombCount--;
      
      updatePowers();
      renderTiles();
      
      statusText.textContent = 'BOMB_USED';
      setTimeout(() => statusText.textContent = 'SYSTEM_READY', 1000);
      
      gameBoard.style.cursor = '';
      gameBoard.removeEventListener('click', bombClickHandler);
    }
  };
  
  gameBoard.addEventListener('click', bombClickHandler);
  
  // 5秒后自动取消
  setTimeout(() => {
    gameBoard.style.cursor = '';
    gameBoard.removeEventListener('click', bombClickHandler);
    if (statusText.textContent === 'BOMB_MODE') {
      statusText.textContent = 'SYSTEM_READY';
    }
  }, 5000);
}

function createExplosion(r, c) {
  const boardRect = gameBoard.getBoundingClientRect();
  const padding = 12;
  const gap = 8;
  const cellSize = (boardRect.width - padding * 2 - gap * 3) / 4;
  
  const centerX = padding + c * (cellSize + gap) + cellSize / 2;
  const centerY = padding + r * (cellSize + gap) + cellSize / 2;
  
  const explosion = document.createElement('div');
  explosion.className = 'explosion';
  explosion.style.left = `${centerX}px`;
  explosion.style.top = `${centerY}px`;
  
  // 创建粒子
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'explosion-particle';
    const angle = (i / 12) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    particle.style.background = ['#FF4757', '#FFE600', '#FF8C42'][i % 3];
    explosion.appendChild(particle);
  }
  
  gameBoard.appendChild(explosion);
  
  // 屏幕震动
  mainContainer.classList.add('screen-shake');
  setTimeout(() => mainContainer.classList.remove('screen-shake'), 400);
  
  setTimeout(() => explosion.remove(), 600);
}

// ============ 移动逻辑 ============
function move(direction) {
  if (gameLost || (gameWon && !canContinue)) return;
  if (statusText.textContent === 'BOMB_MODE') return;

  let moved = false;
  let mergedPositions = [];
  let scoreGained = 0;
  let mergeCount = 0;

  // 保存历史
  saveHistory();

  const oldBoard = board.map(row => [...row]);
  let rotatedBoard = rotateBoard(board, direction);
  
  for (let r = 0; r < GRID_SIZE; r++) {
    let row = rotatedBoard[r].filter(val => val !== 0);
    
    for (let i = 0; i < row.length - 1; i++) {
      // 处理特殊方块
      if (row[i] === 'bomb') {
        // 炸弹炸毁相邻方块
        createExplosion(r, i);
        row[i] = 0;
        if (row[i + 1]) row[i + 1] = 0;
        mergeCount++;
        continue;
      }
      
      if (row[i] === 'multiplier' && typeof row[i + 1] === 'number') {
        // 倍数方块翻倍下一个方块
        row[i + 1] *= 2;
        scoreGained += row[i + 1];
        row[i] = 0;
        mergedPositions.push({ r, c: i + 1 });
        mergeCount++;
        continue;
      }
      
      if (row[i] === 'rainbow' && typeof row[i + 1] === 'number') {
        // 彩虹方块变成与下一个相同但翻倍
        row[i] = row[i + 1] * 2;
        scoreGained += row[i];
        row.splice(i + 1, 1);
        mergedPositions.push({ r, c: i });
        mergeCount++;
        if (row[i] === 2048 && !gameWon) gameWon = true;
        continue;
      }
      
      if (row[i] === 'freeze') {
        // 冻结一个随机空格3步
        const emptyFreezeCells = [];
        for (let fr = 0; fr < GRID_SIZE; fr++) {
          for (let fc = 0; fc < GRID_SIZE; fc++) {
            if (board[fr][fc] === 0 && !frozenCells.some(f => f.r === fr && f.c === fc)) {
              emptyFreezeCells.push({ r: fr, c: fc });
            }
          }
        }
        if (emptyFreezeCells.length > 0) {
          const target = emptyFreezeCells[Math.floor(Math.random() * emptyFreezeCells.length)];
          frozenCells.push({ ...target, turns: 3 });
          updateFrozenDisplay();
        }
        row.splice(i, 1);
        i--;
        mergeCount++;
        continue;
      }
      
      if (row[i] === 'rowclear') {
        // 消除当前行所有数字方块
        const originalRow = convertPosition({ r, c: 0 }, direction).r;
        let cleared = 0;
        for (let cr = 0; cr < GRID_SIZE; cr++) {
          if (typeof board[originalRow][cr] === 'number' && board[originalRow][cr] > 0) {
            scoreGained += board[originalRow][cr];
            board[originalRow][cr] = 0;
            cleared++;
          }
        }
        if (cleared > 0) {
          createExplosion(originalRow, 2);
          mainContainer.classList.add('screen-shake');
          setTimeout(() => mainContainer.classList.remove('screen-shake'), 400);
        }
        row.splice(i, 1);
        i--;
        mergeCount++;
        continue;
      }
      
      if (row[i] === 'colclear') {
        // 消除当前列所有数字方块
        const originalCol = convertPosition({ r, c: 0 }, direction).c;
        let cleared = 0;
        for (let cc = 0; cc < GRID_SIZE; cc++) {
          if (typeof board[cc][originalCol] === 'number' && board[cc][originalCol] > 0) {
            scoreGained += board[cc][originalCol];
            board[cc][originalCol] = 0;
            cleared++;
          }
        }
        if (cleared > 0) {
          createExplosion(2, originalCol);
          mainContainer.classList.add('screen-shake');
          setTimeout(() => mainContainer.classList.remove('screen-shake'), 400);
        }
        row.splice(i, 1);
        i--;
        mergeCount++;
        continue;
      }
      
      if (row[i] === 'mergeall') {
        // 合并棋盘上所有相邻相同数字
        let mergedAny = false;
        for (let mr = 0; mr < GRID_SIZE; mr++) {
          for (let mc = 0; mc < GRID_SIZE - 1; mc++) {
            if (typeof board[mr][mc] === 'number' && board[mr][mc] === board[mr][mc + 1] && board[mr][mc] > 0) {
              board[mr][mc] *= 2;
              scoreGained += board[mr][mc];
              board[mr][mc + 1] = 0;
              mergedAny = true;
              if (board[mr][mc] === 2048 && !gameWon) gameWon = true;
            }
          }
        }
        for (let mc = 0; mc < GRID_SIZE; mc++) {
          for (let mr = 0; mr < GRID_SIZE - 1; mr++) {
            if (typeof board[mr][mc] === 'number' && board[mr][mc] === board[mr + 1][mc] && board[mr][mc] > 0) {
              board[mr][mc] *= 2;
              scoreGained += board[mr][mc];
              board[mr + 1][mc] = 0;
              mergedAny = true;
              if (board[mr][mc] === 2048 && !gameWon) gameWon = true;
            }
          }
        }
        if (mergedAny) {
          mainContainer.classList.add('screen-shake');
          setTimeout(() => mainContainer.classList.remove('screen-shake'), 400);
        }
        row.splice(i, 1);
        i--;
        mergeCount++;
        continue;
      }
      
      // 普通合并
      if (row[i] === row[i + 1] && typeof row[i] === 'number') {
        row[i] *= 2;
        scoreGained += row[i];
        mergedPositions.push({ r, c: i });
        mergeCount++;
        
        if (row[i] === 2048 && !gameWon) gameWon = true;
        
        // 更新最大方块
        if (row[i] > maxTile) {
          maxTile = row[i];
          checkTileAchievements(row[i]);
        }
        
        row.splice(i + 1, 1);
      }
    }
    
    while (row.length < GRID_SIZE) {
      row.push(0);
    }
    
    rotatedBoard[r] = row;
  }

  board = rotateBoardBack(rotatedBoard, direction);

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] !== oldBoard[r][c]) {
        moved = true;
        break;
      }
    }
    if (moved) break;
  }

  if (moved) {
    const actualMergedPositions = mergedPositions.map(pos => convertPosition(pos, direction));

    // 连击系统
    if (mergeCount > 0) {
      comboCount++;
      if (comboCount > maxCombo) maxCombo = comboCount;
      
      // 连击加成
      const comboMultiplier = 1 + (comboCount - 1) * 0.5;
      scoreGained = Math.floor(scoreGained * comboMultiplier);
      
      // 显示连击
      if (comboCount >= 2) {
        showCombo(comboCount);
      }
      
      // 检查连击成就
      if (comboCount >= 5) {
        unlockAchievement('combo_5');
      }
      
      // 首次合并成就
      if (moveCount === 0 || (moveCount === 1 && !achievements.has('first_merge'))) {
        unlockAchievement('first_merge');
      }
    } else {
      comboCount = 0;
    }

    score += scoreGained;
    moveCount++;
    
    updateScore();
    updateCombo();
    updateMoveCount();
    updateProgress();
    
    if (scoreGained > 0) {
      showScorePopup(scoreGained);
    }

    // 检查分数成就
    if (score >= 10000) {
      unlockAchievement('score_10000');
    }

    const newTile = addRandomTile();
    renderTiles(newTile, actualMergedPositions);
    
    // 减少冰冻格子剩余回合
    decrementFrozenCells();
    
    // 重力模式：应用重力
    if (gameMode === 'gravity') {
      setTimeout(() => {
        applyGravity();
        renderTiles();
      }, 150);
    }
    
    // 关卡模式：更新剩余步数并检查目标
    if (gameMode === 'levels' && currentLevel) {
      levelMovesLeft--;
      updateLevelInfo();
      
      if (checkLevelGoal()) {
        return;
      }
    }

    if (gameWon && !canContinue) {
      saveGameRecord();
      setTimeout(() => showWinOverlay(), 300);
    } else if (isGameOver()) {
      gameLost = true;
      saveGameRecord();
      setTimeout(() => showLoseOverlay(), 300);
    }
  } else {
    // 没有移动，撤销历史保存
    history.pop();
  }
}

function checkTileAchievements(value) {
  if (value >= 128) unlockAchievement('reach_128');
  if (value >= 256) unlockAchievement('reach_256');
  if (value >= 512) unlockAchievement('reach_512');
  if (value >= 1024) unlockAchievement('reach_1024');
  if (value >= 2048) unlockAchievement('reach_2048');
  
  // 限时模式加时奖励
  if (gameMode === 'time') {
    if (value >= 128) addTime(3);
    if (value >= 256) addTime(5);
    if (value >= 512) addTime(8);
    if (value >= 1024) addTime(15);
    if (value >= 2048) addTime(30);
  }
}

// ============ 重力模式 ============
function applyGravity() {
  if (gameMode !== 'gravity') return;
  
  // 对每一列应用重力（从下往上）
  for (let c = 0; c < GRID_SIZE; c++) {
    // 收集该列所有非零值
    let column = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      if (board[r][c] !== 0) {
        column.push(board[r][c]);
      }
    }
    
    // 从底部填充
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (column.length > 0) {
        board[r][c] = column.pop();
      } else {
        board[r][c] = 0;
      }
    }
  }
  
  // 重力后合并相邻相同数字（从下往上）
  let merged = false;
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = GRID_SIZE - 1; r > 0; r--) {
      if (typeof board[r][c] === 'number' && 
          typeof board[r-1][c] === 'number' && 
          board[r][c] === board[r-1][c] && 
          board[r][c] > 0) {
        board[r][c] *= 2;
        score += board[r][c];
        board[r-1][c] = 0;
        merged = true;
        
        if (board[r][c] === 2048 && !gameWon) gameWon = true;
        if (board[r][c] > maxTile) {
          maxTile = board[r][c];
          checkTileAchievements(board[r][c]);
        }
      }
    }
  }
  
  // 再次应用重力填补合并后的空隙
  if (merged) {
    applyGravityFall();
  }
  
  updateScore();
  updateProgress();
}

function applyGravityFall() {
  for (let c = 0; c < GRID_SIZE; c++) {
    let column = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      if (board[r][c] !== 0) {
        column.push(board[r][c]);
      }
    }
    
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      if (column.length > 0) {
        board[r][c] = column.pop();
      } else {
        board[r][c] = 0;
      }
    }
  }
}

// ============ 棋盘旋转 ============
function rotateBoard(b, direction) {
  const n = GRID_SIZE;
  let result = Array(n).fill(null).map(() => Array(n).fill(0));

  if (direction === 'left') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[r][c] = b[r][c];
  } else if (direction === 'right') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[r][c] = b[r][n - 1 - c];
  } else if (direction === 'up') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[r][c] = b[c][r];
  } else if (direction === 'down') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[r][c] = b[n - 1 - c][r];
  }
  return result;
}

function rotateBoardBack(b, direction) {
  const n = GRID_SIZE;
  let result = Array(n).fill(null).map(() => Array(n).fill(0));

  if (direction === 'left') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[r][c] = b[r][c];
  } else if (direction === 'right') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[r][n - 1 - c] = b[r][c];
  } else if (direction === 'up') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[c][r] = b[r][c];
  } else if (direction === 'down') {
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) result[r][c] = b[c][n - 1 - r];
  }
  return result;
}

function convertPosition(pos, direction) {
  const n = GRID_SIZE;
  if (direction === 'left') return pos;
  if (direction === 'right') return { r: pos.r, c: n - 1 - pos.c };
  if (direction === 'up') return { r: pos.c, c: pos.r };
  if (direction === 'down') return { r: pos.c, c: n - 1 - pos.r };
  return pos;
}

// ============ 检查游戏结束 ============
function isGameOver() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = board[r][c];
      if (c < GRID_SIZE - 1 && val === board[r][c + 1]) return false;
      if (r < GRID_SIZE - 1 && val === board[r + 1][c]) return false;
    }
  }
  return true;
}

// ============ 更新显示 ============
function updateScore() {
  scoreEl.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = bestScore;
    localStorage.setItem('brutal2048ultra_best', bestScore);
  }
}

function updateCombo() {
  comboCountEl.textContent = `x${comboCount > 0 ? comboCount : 1}`;
  if (comboCount >= 3) {
    comboCountEl.style.color = '#FFE600';
  } else if (comboCount >= 2) {
    comboCountEl.style.color = '#FFFFFF';
  } else {
    comboCountEl.style.color = '#FFFFFF';
  }
}

function updateMoveCount() {
  moveCountEl.textContent = `MOVES: ${moveCount}`;
}

function updatePowers() {
  undoCountEl.textContent = `(${undoCount})`;
  bombCountEl.textContent = `(${bombCount})`;
  undoBtn.disabled = undoCount <= 0 || history.length <= 0;
  bombBtn.disabled = bombCount <= 0;
}

function updateProgress() {
  // 找到最大方块
  let max = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (typeof board[r][c] === 'number' && board[r][c] > max) {
        max = board[r][c];
      }
    }
  }
  
  const progress = Math.min(100, (Math.log2(max) / Math.log2(2048)) * 100);
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `${Math.floor(progress)}%`;
}

// ============ 冰冻格子管理 ============
function updateFrozenDisplay() {
  // 清除所有冰冻效果
  document.querySelectorAll('.grid-cell.frozen').forEach(cell => {
    cell.classList.remove('frozen');
  });
  
  // 添加当前冰冻格子效果
  frozenCells.forEach(frozen => {
    const cellIndex = frozen.r * GRID_SIZE + frozen.c;
    const cells = gridBackground.querySelectorAll('.grid-cell');
    if (cells[cellIndex]) {
      cells[cellIndex].classList.add('frozen');
    }
  });
}

function decrementFrozenCells() {
  frozenCells = frozenCells.filter(f => {
    f.turns--;
    return f.turns > 0;
  });
  updateFrozenDisplay();
}

// ============ 计时器管理 ============
function startTimer() {
  if (gameMode !== 'time') return;
  
  timerPanelEl.classList.remove('hidden');
  timeLeft = 60;
  timerDisplayEl.textContent = timeLeft;
  timerBarEl.style.width = '100%';
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplayEl.textContent = timeLeft;
    timerBarEl.style.width = `${(timeLeft / 60) * 100}%`;
    
    if (timeLeft <= 10) {
      timerBarEl.style.background = '#FF4757';
      timerDisplayEl.style.color = '#FF4757';
    }
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameLost = true;
      showLoseOverlay();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerPanelEl.classList.add('hidden');
  timerBarEl.style.background = 'linear-gradient(90deg, #FF4757, #FFE600, #7FD858)';
  timerDisplayEl.style.color = '#FFE600';
}

function addTime(seconds) {
  if (gameMode !== 'time') return;
  timeLeft = Math.min(99, timeLeft + seconds);
  timerDisplayEl.textContent = timeLeft;
  timerBarEl.style.width = `${(timeLeft / 60) * 100}%`;
  
  // 显示加时提示
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = `+${seconds}s`;
  popup.style.left = '50%';
  popup.style.top = '50px';
  popup.style.color = '#7FD858';
  gameBoard.appendChild(popup);
  setTimeout(() => popup.remove(), 800);
}

// ============ 关卡模式 ============
function showLevelPanel() {
  levelPanelEl.classList.remove('hidden');
  levelGridEl.innerHTML = '';
  
  levelList.forEach(level => {
    const btn = document.createElement('button');
    btn.className = 'brutal-btn p-2 text-xs font-mono';
    btn.style.background = currentLevel && currentLevel.id === level.id ? '#FFE600' : '#FFFFFF';
    btn.style.color = '#1A1A1A';
    btn.innerHTML = `
      <div class="font-bold">${level.id}</div>
      <div class="text-[8px]">${level.name}</div>
    `;
    btn.addEventListener('click', () => selectLevel(level));
    levelGridEl.appendChild(btn);
  });
  
  if (currentLevel) {
    levelInfoEl.textContent = `Level ${currentLevel.id}: ${currentLevel.name}`;
  }
}

function selectLevel(level) {
  currentLevel = level;
  levelPanelEl.classList.add('hidden');
  newGame();
}

function updateLevelInfo() {
  if (!currentLevel) return;
  
  const goalText = currentLevel.goal ? `合成${currentLevel.goal}` : `得分${currentLevel.goalScore}`;
  statusText.textContent = `LEVEL ${currentLevel.id}: ${goalText} | ${levelMovesLeft}步`;
}

function checkLevelGoal() {
  if (gameMode !== 'levels' || !currentLevel) return false;
  
  let goalReached = false;
  
  if (currentLevel.goal) {
    // 检查是否达到目标方块
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] >= currentLevel.goal) {
          goalReached = true;
          break;
        }
      }
      if (goalReached) break;
    }
  } else if (currentLevel.goalScore) {
    // 检查是否达到目标分数
    goalReached = score >= currentLevel.goalScore;
  }
  
  if (goalReached) {
    saveGameRecord();
    showLevelComplete();
    return true;
  }
  
  if (levelMovesLeft <= 0) {
    saveGameRecord();
    showLevelFailed();
    return true;
  }
  
  return false;
}

function showLevelComplete() {
  overlayIcon.innerHTML = '<i class="fas fa-star" style="color: #FFE600;"></i>';
  overlayTitle.textContent = 'LEVEL COMPLETE!';
  overlayTitle.style.color = '#FFE600';
  overlayMessage.textContent = `▸ 恭喜通过关卡 ${currentLevel.id}！ ◂`;
  overlayStats.innerHTML = `SCORE: ${score} | MOVES: ${currentLevel.moves - levelMovesLeft}/${currentLevel.moves}`;
  continueBtn.classList.add('hidden');
  gameOverlay.classList.add('active');
}

function showLevelFailed() {
  overlayIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #FF4757;"></i>';
  overlayTitle.textContent = 'LEVEL FAILED';
  overlayTitle.style.color = '#FF4757';
  overlayMessage.textContent = `▸ 步数用完了！ ◂`;
  overlayStats.innerHTML = `SCORE: ${score} | 目标未达成`;
  continueBtn.classList.add('hidden');
  gameOverlay.classList.add('active');
}

// ============ 排行榜 ============
// ============ 排行榜 (API版本) ============
let playerNickname = localStorage.getItem('brutal2048ultra_nickname') || '';

async function saveGameRecord() {
  // 如果没有昵称，弹出输入框
  if (!playerNickname) {
    playerNickname = prompt('请输入你的昵称（最多20个字符）：') || '匿名玩家';
    playerNickname = playerNickname.slice(0, 20);
    localStorage.setItem('brutal2048ultra_nickname', playerNickname);
  }
  
  const record = {
    nickname: playerNickname,
    score: score,
    moves: moveCount,
    maxTile: maxTile,
    maxCombo: maxCombo,
    gameMode: gameMode,
    levelId: currentLevel ? currentLevel.id : null,
    duration: null
  };
  
  try {
    const response = await fetch('/api/game/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.duplicate) {
        showScorePopup('记录已保存！');
      }
      updateLeaderboard();
    }
  } catch (error) {
    console.error('Failed to save record:', error);
  }
}

async function updateLeaderboard() {
  try {
    const response = await fetch('/api/game/leaderboard?limit=20');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const { records } = await response.json();
    
    if (!records || records.length === 0) {
      leaderboardListEl.innerHTML = '';
      noRecordsEl.classList.remove('hidden');
      return;
    }
    
    noRecordsEl.classList.add('hidden');
    leaderboardListEl.innerHTML = '';
    
    records.forEach((record, index) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-2 border-2';
      div.style.borderColor = index < 3 ? ['#FFE600', '#C0C0C0', '#CD7F32'][index] : '#444';
      div.style.background = index < 3 ? ['#FFE60020', '#C0C0C020', '#CD7F3220'][index] : '#222';
      
      const date = new Date(record.createdAt);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      div.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="font-display text-lg" style="color: ${index < 3 ? ['#FFE600', '#C0C0C0', '#CD7F32'][index] : '#666'};">#${index + 1}</span>
          <div>
            <div class="font-mono text-xs font-bold">${record.score}分</div>
            <div class="font-mono text-[10px] opacity-60">${record.moves}步 | ${record.nickname}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-mono text-[10px] opacity-60">${dateStr}</div>
          <div class="font-mono text-[10px]">最高: ${record.maxTile}</div>
        </div>
      `;
      
      leaderboardListEl.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    // 降级到localStorage
    updateLeaderboardFallback();
  }
}

function updateLeaderboardFallback() {
  const records = JSON.parse(localStorage.getItem('brutal2048ultra_records') || '[]');
  
  if (records.length === 0) {
    leaderboardListEl.innerHTML = '';
    noRecordsEl.classList.remove('hidden');
    return;
  }
  
  noRecordsEl.classList.add('hidden');
  leaderboardListEl.innerHTML = '';
  
  records.forEach((record, index) => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-2 border-2';
    div.style.borderColor = index < 3 ? ['#FFE600', '#C0C0C0', '#CD7F32'][index] : '#444';
    div.style.background = index < 3 ? ['#FFE60020', '#C0C0C020', '#CD7F3220'][index] : '#222';
    
    const date = new Date(record.date);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="font-display text-lg" style="color: ${index < 3 ? ['#FFE600', '#C0C0C0', '#CD7F32'][index] : '#666'};">#${index + 1}</span>
        <div>
          <div class="font-mono text-xs font-bold">${record.score}分</div>
          <div class="font-mono text-[10px] opacity-60">${record.moves}步 | ${record.mode}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-mono text-[10px] opacity-60">${dateStr}</div>
        <div class="font-mono text-[10px]">最高: ${record.maxTile}</div>
      </div>
    `;
    
    leaderboardListEl.appendChild(div);
  });
}

function clearRecords() {
  if (confirm('确定要清除本地缓存吗？')) {
    localStorage.removeItem('brutal2048ultra_records');
    updateLeaderboard();
  }
}

// ============ 主题切换 ============
function initThemes() {
  currentTheme = localStorage.getItem('brutal2048ultra_theme') || 'neo-brutal';
  themeGridEl.innerHTML = '';
  
  themeList.forEach(theme => {
    const btn = document.createElement('button');
    btn.className = 'brutal-btn p-2 text-xs font-mono flex flex-col items-center gap-1';
    btn.style.background = currentTheme === theme.id ? theme.colors.yellow : theme.colors.bg;
    btn.style.color = theme.colors.dark;
    btn.style.borderColor = theme.colors.dark;
    btn.innerHTML = `
      <div class="w-6 h-6 rounded" style="background: linear-gradient(135deg, ${theme.colors.bg} 50%, ${theme.colors.dark} 50%);"></div>
      <span>${theme.name}</span>
    `;
    btn.addEventListener('click', () => applyTheme(theme.id));
    themeGridEl.appendChild(btn);
  });
  
  applyTheme(currentTheme);
}

function applyTheme(themeId) {
  currentTheme = themeId;
  localStorage.setItem('brutal2048ultra_theme', themeId);
  
  const theme = themeList.find(t => t.id === themeId);
  if (!theme) return;
  
  const root = document.documentElement;
  root.style.setProperty('--bg-color', theme.colors.bg);
  root.style.setProperty('--dark-color', theme.colors.dark);
  root.style.setProperty('--yellow-color', theme.colors.yellow);
  root.style.setProperty('--red-color', theme.colors.red);
  root.style.setProperty('--green-color', theme.colors.green);
  root.style.setProperty('--blue-color', theme.colors.blue);
  root.style.setProperty('--purple-color', theme.colors.purple);
  root.style.setProperty('--orange-color', theme.colors.orange);
  root.style.setProperty('--pink-color', theme.colors.pink);
  root.style.setProperty('--cyan-color', theme.colors.cyan);
  
  // 更新body背景
  document.body.style.background = theme.colors.bg;
  document.body.style.color = theme.colors.dark;
  
  // 更新网格背景
  const gridCells = document.querySelectorAll('.grid-cell');
  gridCells.forEach(cell => {
    cell.style.background = themeId === 'dark' ? '#333' : (themeId === 'retro' ? '#001100' : '#E0E0D8');
    cell.style.borderColor = theme.colors.dark;
  });
  
  // 更新游戏网格
  const gameGrid = document.querySelector('.game-grid');
  if (gameGrid) {
    gameGrid.style.background = theme.colors.dark;
    gameGrid.style.borderColor = theme.colors.dark;
  }
  
  // 刷新主题按钮样式
  initThemes();
}

// ============ 特效 ============
function showScorePopup(points) {
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = `+${points}`;
  popup.style.left = '50%';
  popup.style.top = '10px';
  popup.style.transform = 'translateX(-50%)';
  gameBoard.appendChild(popup);
  setTimeout(() => popup.remove(), 800);
}

function showCombo(count) {
  const combo = document.createElement('div');
  combo.className = 'combo-display';
  combo.textContent = `${count}x COMBO!`;
  gameBoard.appendChild(combo);
  setTimeout(() => combo.remove(), 1000);
  
  // 高连击屏幕震动
  if (count >= 3) {
    mainContainer.classList.add('screen-shake');
    setTimeout(() => mainContainer.classList.remove('screen-shake'), 400);
  }
}

// ============ 遮罩 ============
function showWinOverlay() {
  overlayIcon.innerHTML = '<i class="fas fa-trophy" style="color: #FFE600;"></i>';
  overlayTitle.textContent = 'YOU WIN!';
  overlayTitle.style.color = '#FFE600';
  overlayMessage.textContent = `▸ 你成功合成了 2048！ ◂`;
  overlayStats.innerHTML = `SCORE: ${score} | MOVES: ${moveCount} | MAX COMBO: ${maxCombo}x`;
  continueBtn.classList.remove('hidden');
  gameOverlay.classList.add('active');
}

function showLoseOverlay() {
  overlayIcon.innerHTML = '<i class="fas fa-skull" style="color: #FF4757;"></i>';
  overlayTitle.textContent = 'GAME OVER';
  overlayTitle.style.color = '#FF4757';
  overlayMessage.textContent = `▸ 无法继续移动了 ◂`;
  overlayStats.innerHTML = `SCORE: ${score} | MOVES: ${moveCount} | MAX COMBO: ${maxCombo}x | MAX TILE: ${maxTile}`;
  continueBtn.classList.add('hidden');
  gameOverlay.classList.add('active');
}

function hideOverlay() {
  gameOverlay.classList.remove('active');
}

// ============ 事件监听 ============
function initEvents() {
  document.addEventListener('keydown', (e) => {
    const keyMap = {
      'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
      'w': 'up', 's': 'down', 'a': 'left', 'd': 'right',
      'W': 'up', 'S': 'down', 'A': 'left', 'D': 'right'
    };

    if (keyMap[e.key]) {
      e.preventDefault();
      move(keyMap[e.key]);
    } else if (e.key === 'z' || e.key === 'Z') {
      undo();
    } else if (e.key === 'x' || e.key === 'X') {
      useBomb();
    }
  });

  document.querySelectorAll('.dpad-btn').forEach(btn => {
    btn.addEventListener('click', () => move(btn.dataset.dir));
  });

  // 触摸滑动 - 优化移动端体验
  let touchStartX = 0, touchStartY = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  gameBoard.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isSwiping = false;
    }
  }, { passive: true });

  gameBoard.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      const absDx = Math.abs(dx), absDy = Math.abs(dy);
      
      // 如果移动距离超过阈值，标记为正在滑动
      if (Math.max(absDx, absDy) > 10) {
        isSwiping = true;
      }
    }
  }, { passive: true });

  gameBoard.addEventListener('touchend', (e) => {
    if (!isSwiping) {
      // 点击事件处理
      return;
    }
    
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    const touchDuration = Date.now() - touchStartTime;
    
    // 快速滑动（<300ms）需要较小的距离阈值
    // 慢速滑动需要较大的距离阈值防止误触
    const minDistance = touchDuration < 300 ? 20 : 30;
    
    if (Math.max(absDx, absDy) > minDistance) {
      // 防止页面滚动
      e.preventDefault();
      
      if (absDx > absDy) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
    
    isSwiping = false;
  }, { passive: false });

  // 按钮事件
  newGameBtn.addEventListener('click', newGame);
  restartBtn.addEventListener('click', newGame);
  continueBtn.addEventListener('click', () => { canContinue = true; hideOverlay(); });
  undoBtn.addEventListener('click', undo);
  bombBtn.addEventListener('click', useBomb);

  // 模式切换
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameMode = btn.dataset.mode;
      newGame();
    });
  });

  // 窗口大小变化
  window.addEventListener('resize', () => renderTiles());
  
  // 清除记录按钮
  clearRecordsBtn.addEventListener('click', clearRecords);
  
  // 昵称输入
  const nicknameInput = document.getElementById('nickname-input');
  const saveNicknameBtn = document.getElementById('save-nickname-btn');
  
  if (nicknameInput && saveNicknameBtn) {
    // 加载已保存的昵称
    nicknameInput.value = playerNickname;
    
    saveNicknameBtn.addEventListener('click', () => {
      const newNickname = nicknameInput.value.trim();
      if (newNickname) {
        playerNickname = newNickname.slice(0, 20);
        localStorage.setItem('brutal2048ultra_nickname', playerNickname);
        saveNicknameBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          saveNicknameBtn.innerHTML = '<i class="fas fa-save"></i>';
        }, 1000);
      }
    });
    
    nicknameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveNicknameBtn.click();
      }
    });
  }
  
  // 初始化排行榜
  updateLeaderboard();
  
  // 初始化主题
  initThemes();
}

// ============ 启动游戏 ============
document.addEventListener('DOMContentLoaded', () => {
  init();
  initEvents();
});
