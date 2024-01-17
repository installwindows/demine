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
    this.NUM_MINES = 20;
    this.$grid = $("#grid");
    this.firstClick = true;
    this.setup_events();
  }

  set_params(size_x, size_y, num_mines) {
    this.SIZE_X = size_x;
    this.SIZE_Y = size_y;
    this.NUM_MINES = num_mines;
    let error_msg = "";
    if (this.SIZE_X * this.SIZE_Y < this.NUM_MINES) {
      error_msg = "WIDTH * HEIGHT < NUM_MINES !<br>";
    }
    if (this.SIZE_X < 5 || this.SIZE_Y < 5) {
      error_msg = "WIDTH < 5 or HEIGHT < 5 !<br>";
    }
    if (this.NUM_MINES < 1) {
      error_msg = "NUM_MINES < 1 !<br>";
    }
    if (error_msg !== "") {
      $("#custom-difficulty-form .error").html(error_msg);
      return false;
    }
    $("#custom-difficulty-form .error").html("");

    this.$grid.css("--grid-rows", this.SIZE_Y);
    this.$grid.css("--grid-cols", this.SIZE_X);
    console.log("set_params", this.SIZE_X, this.SIZE_Y, this.NUM_MINES);
    return true;
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
    $("#custom-difficulty-form").hide();
    $(".difficulty-choice").show();
    $("#difficulty-settings-container").hide();
    $("#game").show();
  }

  reset() {
    this.clean();
    this.init();
  }

  start(x, y) {
    // get NUM_MINES random number between 0 and SIZE_X*SIZE_Y-1
    let mines = [];
    let toAvoids = this.get_adjacent(x, y);
    toAvoids.push([x, y]);
    toAvoids = toAvoids.map(function(p){
      return p[1] * this.SIZE_Y + p[0];
    }.bind(this));
    // TODO: this doesn't work for non-square grids
    while(mines.length < this.NUM_MINES){
      let mine = Math.floor(Math.random() * this.SIZE_X*this.SIZE_Y);
      if (toAvoids.indexOf(mine) !== -1) {
        continue;
      }
      if(mines.indexOf(mine) === -1){
        mines.push(mine);
      }
    }
    console.log("mines", mines);
    // setup grid
    this.grid = new Array(this.SIZE_Y);
    for(let i = 0; i < this.SIZE_Y; i++){
      this.grid[i] = new Array(this.SIZE_X);
      for(let j = 0; j < this.SIZE_X; j++){
        console.log(i * this.SIZE_Y + j);
        if (mines.indexOf(i * this.SIZE_Y + j) !== -1){
          this.grid[i][j] = new Cell(j, i, MINE);
          console.log("mine set at", j, i);
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

  reveal_cell(x, y) {
    let toReveal = [];
    toReveal.push([x, y]);
    let max = 0;
    let clickedCell = this.grid[y][x];
    if (clickedCell.revealed && clickedCell.val > 0) {
      let flags = 0;
      let positions = this.get_adjacent(x, y);
      for (const p of positions) {
        let cell = this.grid[p[1]][p[0]];
        if (cell.flagged) {
          flags++;
        }
      }
      if (flags === clickedCell.val) {
        toReveal.push(...positions);
      }
    }
    while(toReveal.length > 0){
      let p = toReveal.pop();
      let cell = this.grid[p[1]][p[0]];
      if (cell.flagged || cell.revealed) {
        continue;
      }
      if (cell.val === MINE) {
        $(`.cell[data-row=${p[1]}][data-col=${p[0]}]`).attr("data-val", MINE).addClass("boom");
        this.numMinesExploded++;
        return;
      }
      if (cell.val === EMPTY) {
        let positions = this.get_adjacent(p[0], p[1]);
        toReveal.push(...positions);
      }
      cell.revealed = true;
      this.numRevealed++;
      $(`.cell[data-row=${p[1]}][data-col=${p[0]}]`).text(cell.val).attr("data-val", cell.val);
      max++;
      if (max > 100) {
        console.log("max reached");
        break;
      }
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
      // else left click
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
      this.reveal_cell(x, y);
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
  $(".difficulty-choice-custom").click(function(){
    $(".difficulty-choice").hide();
    $("#custom-difficulty-form").show();
  });
  $("#custom-difficulty-ok").click(function(){
    let size_x = parseInt($("#custom-width").val());
    let size_y = parseInt($("#custom-height").val());
    let num_mines = parseInt($("#custom-mines").val());
    if (game.set_params(size_x, size_y, num_mines)) {
      game.reset();
    }
  });
  $("#custom-difficulty-cancel").click(function(){
    $("#custom-difficulty-form").hide();
    $(".difficulty-choice").show();
  });
  $(".difficulty-choice[data-type=preset]").click(function(){
    let size_x = parseInt($(this).data("width"));
    let size_y = parseInt($(this).data("height"));
    let num_mines = parseInt($(this).data("mines"));
    if (game.set_params(size_x, size_y, num_mines)) {
      game.reset();
    }
  });
  $("#restart button").click(function(){
    game.reset();
  });
  $("#change-difficulty").click(function(){
    $("#difficulty-settings-container").show();
    $("#game").hide();
  });
});
