class Cell {
  constructor(x, y, val, revealed=false, flagged=false) {
    this.x = x;
    this.y = y;
    this.val = val;
    this.revealed = revealed;
    this.flagged = flagged;
  }
}


var grid = [];
var timer = 0;
var timerInterval = 0;
var numRevealed = 0;
var numFlagged = 0;
var numMinesExploded = 0;
const SIZE_X = 10;
const SIZE_Y = 10;
const NUM_MINES = 10;

const MINE = -1;
const EMPTY = 0;
const REVEALED = 10;

$(function(){
	let $grid = $("#grid");
	// get NUM_MINES random number between 0 and SIZE_X*SIZE_Y-1
	let mines = [];
	while(mines.length < NUM_MINES){
		let mine = Math.floor(Math.random() * SIZE_X*SIZE_Y);
		if(mines.indexOf(mine) === -1){
			mines.push(mine);
		}
	}
	// create a SIZE_X*SIZE_Y div grid
  grid = new Array(SIZE_Y);
	for(let i = 0; i < SIZE_Y; i++){
    grid[i] = new Array(SIZE_X);
		for(let j = 0; j < SIZE_X; j++){
			let $div = $(`<div class="cell" data-row="${i}" data-col="${j}"></div>`);
			if (mines.indexOf(i * SIZE_Y + j) !== -1){
				$div.addClass("mine");
        grid[i][j] = new Cell(j, i, MINE);
			} else {
        grid[i][j] = new Cell(j, i, EMPTY);
      }
			$grid.append($div);
		}
	}
    // setup grid numbers
	for(let i = 0; i < SIZE_Y; i++){
		for(let j = 0; j < SIZE_X; j++){
      if (grid[i][j].val === MINE) {
        continue;
      }
      check_around(j, i);
    }
  }
  $("#mines-count").text(NUM_MINES);
  console.log(grid);
});

function get_adjacent(x, y) {
  // up-left, up, up-right
  // left, right
  // down-left, down, down-right
  const positions = [
    [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
    [x - 1, y], [x + 1, y],
    [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
  ];
  let adj = [];
  for (const p of positions) {
    if (p[0] < 0 || p[1] < 0) {
      continue;
    } else if (p[0] >= SIZE_X || p[1] >= SIZE_Y) {
      continue;
    }
    adj.push(p);
  }
  return adj;
}

function check_around(x, y) {
  const positions = get_adjacent(x, y);
  for (const p of positions) {
    if (grid[p[1]][p[0]].val === MINE) {
        grid[y][x].val++;
    }
  }
}

function reveal(x, y) {
  // reveal the cell at (x, y)
  // if the cell is empty, reveal all the adjacent cells
  // if the cell is a number, reveal the cell
  const positions = get_adjacent(x, y);
  if (grid[y][x].val === MINE) {
    $(`.cell[data-row=${y}][data-col=${x}]`).addClass("explosed");
    numMinesExploded++;
    return;
  }
  if (grid[y][x].val > 0 && !grid[y][x].revealed) {
    grid[y][x].revealed = true;
    numRevealed++;
    $(`.cell[data-row=${y}][data-col=${x}]`).addClass("revealed").text(grid[y][x].val).attr("data-val", grid[y][x].val);
  } else {
    for (const p of positions) {
      let $cell = $(`.cell[data-row=${p[1]}][data-col=${p[0]}]`);
      let cell = grid[p[1]][p[0]];
      if (cell.revealed || cell.flagged) {
        continue;
      }
      if (cell.val >= 0) {
        $cell.addClass("revealed").text(cell.val).attr("data-val", cell.val);
        cell.revealed = true;
        numRevealed++;
        if (cell.val === EMPTY) {
          reveal(p[0], p[1]);
        }
      }
    }
  }
}

function reveal2(x, y) {
  // clicked on a revealed cell
  // check if the number of flagged cells around is equal to the value of the cell
  // if yes, reveal all the non-flagged cells around
  // if no, do nothing
  let val = grid[y][x].val;
  let flagged = 0;
  const positions = get_adjacent(x, y);
  for (const p of positions) {
    let cell = grid[p[1]][p[0]];
    if (cell.flagged) {
      flagged++;
    }
  }
  if (flagged === val) {
    for (const p of positions) {
      let cell = grid[p[1]][p[0]];
      if (cell.flagged) {
        continue;
      }
      reveal(p[0], p[1]);
    }
  }
}

// capture right click in a cell
$(document).on("contextmenu", ".cell", function(event){
	event.preventDefault();
  const x = $(this).data("col");
  const y = $(this).data("row");
  let cell = grid[y][x];
  if (!cell.revealed) {
    $(this).toggleClass("flagged");
    cell.flagged = !cell.flagged;
    if (cell.flagged) {
      $(this).text("F");
      numFlagged++;
    } else {
      $(this).text("");
      numFlagged--;
    }
    $("#flagged-count").text(numFlagged);
  }
});

$(document).on("click", ".cell", function(event){
	// right click
	if (event.which === 3){
		return;
	}
	// else left click
  const x = $(this).data("col");
  const y = $(this).data("row");
  let cell = grid[y][x];
	if (cell.revealed){
    reveal2(x, y);
	} else {
    reveal(x, y);
	}
  // - check if all the non-mine cells are revealed
  // - check if a mine is revealed
  if (numRevealed === SIZE_X * SIZE_Y - NUM_MINES) {
    clearInterval(timerInterval);
    alert("You win!");
  }
  if (numMinesExploded > 0) {
    clearInterval(timerInterval);
    alert("You lose!");
  }
});

// on first click, save current time
$(document).one("click", ".cell", function(event){
  if (timer === 0) {
    timer = new Date().getTime();
    timerInterval = setInterval(function(){
      let now = new Date().getTime();
      let diff = now - timer;
      let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((diff % (1000 * 60)) / 1000);
      $("#timer").text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds}`);
    }, 1000);
  }
});
