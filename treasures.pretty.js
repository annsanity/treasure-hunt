const gridSize = 10;
const grid = [];
let gameStage = 'setup';
let positionOfPlayer = null;
let treasures = {
  5: 0,
  6: 0,
  7: 0,
  8: 0
};
let score = 0;
let rounds = 0;

// Initialize the grid
for (let i = 0; i < gridSize; i++) {
  grid[i] = new Array(gridSize).fill(null);
}

// Get DOM elements
const gameBoard = document.getElementById('game-board');
const endSetupBtn = document.getElementById('end-setup-btn');
const endPlayBtn = document.getElementById('end-play-btn');

/*
* The code for the following function was written by taking help from the following source:
* https://www.w3schools.com/jsref/coll_table_rows.asp#gsc.tab=0 and https://www.w3schools.com/jsref/met_element_setattribute.asp
*/
function createGameBoard() {
  gameBoard.innerHTML = '';
  for (let i = 0; i < gridSize; i++) {
    const row = gameBoard.insertRow();
    for (let j = 0; j < gridSize; j++) {
      const cell = row.insertCell();
      cell.setAttribute('row', i);
      cell.setAttribute('col', j);
      if (gameStage === 'setup') {
        cell.addEventListener('click', placeObject);
      }
    }
  }
}

// Function to place an object on the grid
/*
* The code for the following function was written by taking help from the following source: https://www.w3schools.com/jsref/jsref_parseint.asp
*/
function placeObject() {
  if (gameStage !== 'setup') {
    return;
  }
  const cell = this;
  const row = parseInt(cell.getAttribute('row'));
  const col = parseInt(cell.getAttribute('col'));
  // to check if the input is a number or not pasrseInt is used which can give NaN if the input is not a number
  if (isNaN(row) || isNaN(col)) {valid 
    alert('Invalid cell!');
    return;
  }
  const value = prompt('Enter a value (5-8 for treasure, "o" for obstacle, "h" for hunter)');
  if (grid[row][col] !== null) {
    alert('Cell already occupied!');
    return;
  }
  if (value >= 5 && value <= 8) {
    grid[row][col] = parseInt(value);
    cell.textContent = value;
    cell.classList.add('treasure');
    treasures[value]++;
  } else if (value === 'o') {
    grid[row][col] = 'obstacle';
    cell.textContent = 'O';
    cell.classList.add('obstacle');
  } else if (value === 'h') {
    if (positionOfPlayer) {
      alert('Hunter already placed!');
    } else {
      grid[row][col] = 'hunter';
      cell.textContent = 'H';
      cell.classList.add('hunter');
      positionOfPlayer = { row, col };
    }
  } else {
    alert('Invalid input!');
  }
}

// Function to create the status display
function createStatusDisplay() {
  const statusContainer = document.createElement('div');
  statusContainer.id = 'status-container';
  statusContainer.innerHTML = `
    <p>Rounds: <span id="rounds">0</span></p>
    <p>Treasures left:</p>
    <ul>
      <li>Value 5: <span id="treasures-5">0</span></li>
      <li>Value 6: <span id="treasures-6">0</span></li>
      <li>Value 7: <span id="treasures-7">0</span></li>
      <li>Value 8: <span id="treasures-8">0</span></li>
    </ul>
    <p>Score: <span id="score">0</span></p>
  `;
  document.body.appendChild(statusContainer);
}

// Function to update the status display
function updateStatusDisplay() {
  const roundsDisplay = document.getElementById('rounds');
  const scoreDisplay = document.getElementById('score');
  const treasuresDisplay = {
    5: document.getElementById('treasures-5'),
    6: document.getElementById('treasures-6'),
    7: document.getElementById('treasures-7'),
    8: document.getElementById('treasures-8')
  };
  roundsDisplay.textContent = rounds;
  for (const value in treasures) {
    treasuresDisplay[value].textContent = treasures[value];
  }
  scoreDisplay.textContent = score;
}

// Function to enter the play stage
function enterPlayStage() {
 document.addEventListener('keydown', handleKeyPress);
}

// Function to handle player movement
function playerMovement(direction) {
  const currentRow = positionOfPlayer.row;
  const currentCol = positionOfPlayer.col;
  let newRow = currentRow;
  let newCol = currentCol;
  switch (direction) {
    case 'a':
      newCol = currentCol - 1;
      break;
    case 'd':
      newCol = currentCol + 1;
      break;
    case 'w':
      newRow = currentRow - 1;
      break;
    case 's':
      newRow = currentRow + 1;
      break;
    default:
      alert('Invalid direction! Please use "a", "d", "w", or "s".');
      return;
  }
  if (
    newRow < 0 ||
    newRow >= gridSize ||
    newCol < 0 ||
    newCol >= gridSize ||
    grid[newRow][newCol] === 'obstacle'
  ) {
    alert('Cannot move to that position!');
    return;
  }

  const currentCell = gameBoard.rows[currentRow].cells[currentCol];
  const newCell = gameBoard.rows[newRow].cells[newCol];

  currentCell.classList.remove('hunter');
  currentCell.textContent = '';
  newCell.classList.add('hunter');
  newCell.textContent = 'H';

  grid[currentRow][currentCol] = null;

  if (typeof grid[newRow][newCol] === 'number') {
    console.log('Treasure found at', newRow, newCol);
    const treasureValue = grid[newRow][newCol];
    score += treasureValue;
    treasures[treasureValue]--;
    newCell.classList.remove('treasure');
    grid[newRow][newCol] = 'hunter';

    placeRandomObstacle();
  }
  console.log('line 188');
  grid[newRow][newCol] = 'hunter';

  positionOfPlayer = { row: newRow, col: newCol };
  console.log('Hunter moved to', newRow, newCol);

  rounds++;
  updateStatusDisplay();

  checkPlayStageEnd();
}

// Function to place a random obstacle on the grid
function placeRandomObstacle() {
  const emptyCells = [];

  // Find all empty cells
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === null) {
        emptyCells.push({ row: i, col: j });
      }
    }
  }

  if (emptyCells.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const { row, col } = emptyCells[randomIndex];

  const cell = gameBoard.rows[row].cells[col];
  cell.textContent = 'O';
  cell.classList.add('obstacle');
  grid[row][col] = 'obstacle';
  console.log('Obstacle placed at', row, col);
}

// Function to check if the play stage has ended
function checkPlayStageEnd() {
  let totalTreasures = 0;
  for (const value in treasures) {
  totalTreasures += treasures[value];
  }
  if (totalTreasures === 0) {
    endPlayStage();
    return;
  }

  // Check if the hunter is not able to move or not
  let canMoveUp, canMoveDown, canMoveLeft, canMoveRight;
  
  if (positionOfPlayer.row > 0 && grid[positionOfPlayer.row - 1][positionOfPlayer.col] !== 'obstacle') {
    canMoveUp = true;
  } else {
    canMoveUp = false;
  }

  if (positionOfPlayer.row < gridSize - 1 && grid[positionOfPlayer.row + 1][positionOfPlayer.col] !== 'obstacle') {
   canMoveDown = true;
  } else {
    canMoveDown = false;
  }

  if (positionOfPlayer.col > 0 && grid[positionOfPlayer.row][positionOfPlayer.col - 1] !== 'obstacle') {
   canMoveLeft = true;
  } else {
    canMoveLeft = false;
  }

  if (positionOfPlayer.col < gridSize - 1 && grid[positionOfPlayer.row][positionOfPlayer.col + 1] !== 'obstacle') {
   canMoveRight = true;
  } else {
    canMoveRight = false;
  }

  if (!canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight) {
    endPlayStage();
    return;
  }
}

// End the play stage
function endPlayStage() {
  gameStage = 'end';
  endPlayBtn.disabled = true;
  calculatePerformanceIndex();
}

// Calculate the performance index
function calculatePerformanceIndex() {
  const performanceIndex = rounds > 0 ? (score / rounds).toFixed(2) : 0;
  console.log('Performance Index: ${performanceIndex}');
  alert(`Game is Over! Performance Index: ${performanceIndex}`);
}

// Setup event listeners
endSetupBtn.addEventListener('click', () => {
  if (positionOfPlayer === null) {
    alert('Please place the hunter first!');
    return;
  }
  createStatusDisplay();
  updateStatusDisplay();
  gameStage = 'play';
  endSetupBtn.disabled = true;
  endPlayBtn.disabled = false;
  checkPlayStageEnd();
  enterPlayStage();
});

endPlayBtn.addEventListener('click', () => {
  if (!positionOfPlayer) {
    alert('Please place the hunter first!');
    return;
  }
  endPlayStage()
});

// Handle key press for player movement
/*
* The code for the following function was written by taking help from the following source:
https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_onkeypress_addeventlistener
*/
function handleKeyPress(event) {
  if (gameStage !== 'play') {
    return;
  }
  const key = event.key.toLowerCase();
  playerMovement(key);
}

// Make the initial game board
createGameBoard();
