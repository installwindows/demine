const MINE = -1;
const EMPTY = 0;


class Cell {
  constructor(x, y, val, revealed=false, flagged=false) {
    this.x = x;
    this.y = y;
    this.val = val;
    this.revealed = revealed;
    this.flagged = flagged;
  }
}


class Game {
  constructor() {
    this.grid = [];
    this.timer = 0;
    this.timerInterval = 0;
    this.numRevealed = 0;
    this.numFlagged = 0;
    this.numMinesExploded = 0;
    this.SIZE_X = 10;
    this.SIZE_Y = 10;
    this.NUM_MINES = 10;
    this.$grid = $("#grid");
    this.firstClick = true;
    this.setup_events();
  }

  clean() {
    clearInterval(this.timerInterval);
    this.grid = [];
    this.timer = 0;
    this.timerInterval = 0;
    this.numRevealed = 0;
    this.numFlagged = 0;
    this.numMinesExploded = 0;
    this.$grid.html("");
    $("#message").text("");
    $("#timer").text("0:00");
    $("#flagged-count").text("0");
    this.firstClick = true;
  }

  init() {
    // create a SIZE_X*SIZE_Y div grid
    for(let i = 0; i < this.SIZE_Y; i++){
      for(let j = 0; j < this.SIZE_X; j++){
        let $div = $(`<div class="cell" data-row="${i}" data-col="${j}"></div>`);
        this.$grid.append($div);
      }
    }
    this.$grid.addClass("running");
  }

  reset() {
    this.clean();
    this.init();
  }

  start(x, y) {
    // get NUM_MINES random number between 0 and SIZE_X*SIZE_Y-1
    let mines = [];
    while(mines.length < this.NUM_MINES){
      let mine = Math.floor(Math.random() * this.SIZE_X*this.SIZE_Y);
      if (mine === y * this.SIZE_Y + x) {
        continue;
      }
      if(mines.indexOf(mine) === -1){
        mines.push(mine);
      }
    }
    // setup grid
    this.grid = new Array(this.SIZE_Y);
    for(let i = 0; i < this.SIZE_Y; i++){
      this.grid[i] = new Array(this.SIZE_X);
      for(let j = 0; j < this.SIZE_X; j++){
        if (mines.indexOf(i * this.SIZE_Y + j) !== -1){
          this.grid[i][j] = new Cell(j, i, MINE);
        } else {
          this.grid[i][j] = new Cell(j, i, EMPTY);
        }
      }
    }
    for(let i = 0; i < this.SIZE_Y; i++){
      for(let j = 0; j < this.SIZE_X; j++){
        if (this.grid[i][j].val === MINE) {
          continue;
        }
        this.fill_numbers(j, i);
      }
    }
    $("#mines-count").text(this.NUM_MINES);
    console.log("start", this.grid);
  }

  get_adjacent(x, y) {
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
      } else if (p[0] >= this.SIZE_X || p[1] >= this.SIZE_Y) {
        continue;
      }
      adj.push(p);
    }
    return adj;
  }

  fill_numbers(x, y) {
    const positions = this.get_adjacent(x, y);
    for (const p of positions) {
      if (this.grid[p[1]][p[0]].val === MINE) {
          this.grid[y][x].val++;
      }
    }
  }
  reveal(x, y) {
    // reveal the cell at (x, y)
    // if the cell is empty, reveal all the adjacent cells
    // if the cell is a number, reveal the cell
    const positions = this.get_adjacent(x, y);
    if (this.grid[y][x].val === MINE) {
      $(`.cell[data-row=${y}][data-col=${x}]`).attr("data-val", MINE).addClass("boom");
      this.numMinesExploded++;
      return;
    }
    if (this.grid[y][x].val > 0 && !this.grid[y][x].revealed && !this.grid[y][x].flagged) {
      this.grid[y][x].revealed = true;
      this.numRevealed++;
      $(`.cell[data-row=${y}][data-col=${x}]`).text(this.grid[y][x].val).attr("data-val", this.grid[y][x].val);
    } else {
      for (const p of positions) {
        let $cell = $(`.cell[data-row=${p[1]}][data-col=${p[0]}]`);
        let cell = this.grid[p[1]][p[0]];
        if (cell.revealed || cell.flagged) {
          continue;
        }
        if (cell.val >= 0) {
          $cell.text(cell.val).attr("data-val", cell.val);
          cell.revealed = true;
          this.numRevealed++;
          if (cell.val === EMPTY) {
            this.reveal(p[0], p[1]);
          }
        }
      }
    }
  }

  reveal2(x, y) {
    // clicked on a revealed cell
    // check if the number of flagged cells around is equal to the value of the cell
    // if yes, reveal all the non-flagged cells around
    // if no, do nothing
    let cell = this.grid[y][x];
    if (cell.val === EMPTY) {
      return;
    }
    let flags = 0;
    const positions = this.get_adjacent(x, y);
    for (const p of positions) {
      let cell = this.grid[p[1]][p[0]];
      if (cell.flagged) {
        flags++;
      }
    }
    if (flags === cell.val) {
      this.reveal(x, y);
    }
  }

  setup_events() {
    // capture right click in a cell
    $(document).off("contextmenu.game").on("contextmenu.game", "#grid.running .cell", function(event){
      event.preventDefault();
      let $cell = $(event.target);
      const x = $cell.data("col");
      const y = $cell.data("row");
      let cell = this.grid[y][x];
      if (!cell.revealed) {
        $(event.target).toggleClass("flagged");
        cell.flagged = !cell.flagged;
        if (cell.flagged) {
          this.numFlagged++;
        } else {
          this.numFlagged--;
        }
        $("#flagged-count").text(this.numFlagged);
      }
    }.bind(this));

    $(document).off("click.game").on("click.game", "#grid.running .cell", function(event){
      // right click
      if (event.which === 3){
        return;
      }
      let $cell = $(event.target);
      const x = $cell.data("col");
      const y = $cell.data("row");
      if (this.firstClick) {
        this.firstClick = false;
        this.timer = new Date().getTime();
        this.timerInterval = setInterval(function(){
          let now = new Date().getTime();
          let diff = now - this.timer;
          let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          let seconds = Math.floor((diff % (1000 * 60)) / 1000);
          $("#timer").text(`${minutes}:${seconds < 10 ? "0" + seconds : seconds}`);
        }.bind(this), 1000);
        this.start(x, y);
      }
      // else left click
      let cell = this.grid[y][x];
      if (cell.revealed){
        this.reveal2(x, y);
      } else {
        this.reveal(x, y);
      }
      // - check if all the non-mine cells are revealed
      // - check if a mine is revealed
      if (this.numRevealed === this.SIZE_X * this.SIZE_Y - this.NUM_MINES) {
        this.end(true);
      }
      if (this.numMinesExploded > 0) {
        this.end(false);
      }
    }.bind(this));
  }

  // reveal all the mines
  // stop the timer
  // show a message
  // show all the cells
  end(win) {
    let message = win ? "You win! 🎉" : "You lose! 😵";
    clearInterval(this.timerInterval);
    $("#message").text(message);
    this.$grid.removeClass("running");
    if (!win) {
      console.log("reveal all the mines");
      for(let i = 0; i < this.SIZE_Y; i++){
        for(let j = 0; j < this.SIZE_X; j++){
          let cell = this.grid[i][j];
          if (cell.val === MINE) {
            $(`.cell[data-row=${i}][data-col=${j}]`).attr("data-val", MINE);
          }
        }
      }
    }
  }
}


$(function(){
  game = new Game();
  game.init();
  $("#restart button").click(function(){
    game.reset();
  });
});
