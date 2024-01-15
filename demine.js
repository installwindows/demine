var grid = [];
const SIZE_X = 10;
const SIZE_Y = 10;
const NUM_MINES = 10;

const MINE = -1;
const EMPTY = 0;
const REVEALED = 10;

$(function(){
	let $app = $("#app");
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
                grid[i][j] = -1;
			} else {
                grid[i][j] = 0;
            }
			$app.append($div);
		}
	}
    // setup grid numbers
	for(let i = 0; i < SIZE_Y; i++){
		for(let j = 0; j < SIZE_X; j++){
            if (grid[i][j] == -1) {
                continue;
            }
            check_around(j, i);
        }
    }
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
        if (grid[p[1]][p[0]] < 0) {
            grid[y][x]++;
        }
    }
}

function reveal(x, y) {
  // reveal the cell at (x, y)
  // if the cell is empty, reveal all the adjacent cells
  // if the cell is a number, reveal the cell
  const positions = get_adjacent(x, y);
  if (grid[y][x] === -1) {
    $(`.cell[data-row=${y}][data-col=${x}]`).addClass("explosed");
    return;
  }
  if (grid[y][x] > 0) {
    $(`.cell[data-row=${y}][data-col=${x}]`).addClass("revealed").text(grid[y][x]).attr("data-val", grid[y][x]);
  } else {
    for (const p of positions) {
      let $cell = $(`.cell[data-row=${p[1]}][data-col=${p[0]}]`);
      if ($cell.hasClass("revealed") || $cell.hasClass("flagged")) {
        continue;
      }
      let val = grid[p[1]][p[0]];
      if (val >= 0) {
        $cell.addClass("revealed").text(val).attr("data-val", val);
        if (val === 0) {
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
  let $cell = $(`.cell[data-row=${y}][data-col=${x}]`);
  let val = grid[y][x];
  let flagged = 0;
  const positions = get_adjacent(x, y);
  for (const p of positions) {
    let $cell = $(`.cell[data-row=${p[1]}][data-col=${p[0]}]`);
    if ($cell.hasClass("flagged")) {
      flagged++;
    }
  }
  if (flagged === val) {
    for (const p of positions) {
      let $cell = $(`.cell[data-row=${p[1]}][data-col=${p[0]}]`);
      if ($cell.hasClass("flagged")) {
        continue;
      }
      reveal(p[0], p[1]);
    }
  }
}

// capture right click in a cell
$(document).on("contextmenu", ".cell", function(event){
	event.preventDefault();
	if (!$(this).hasClass("revealed")){
		$(this).toggleClass("flagged");
	}
});

$(document).on("click", ".cell", function(event){
	// right click
	if (event.which === 3){
		return;
	}
	// else left click
	if ($(this).hasClass("mine")){
		$(this).addClass("explosed");
	} else if ($(this).hasClass("revealed")){
    reveal2($(this).data("col"), $(this).data("row"));
	} else {
    const x = $(this).data("col");
    const y = $(this).data("row");
    reveal(x, y);
	}
});
