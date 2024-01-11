$(function(){
	let $app = $("#app");
	// get 10 random number between 0 and 99
	let mines = [];
	while(mines.length < 10){
		let mine = Math.floor(Math.random() * 100);
		if(mines.indexOf(mine) === -1){
			mines.push(mine);
		}
	}
	// create a 10x10 div grid
	for(let i = 0; i < 10; i++){
		for(let j = 0; j < 10; j++){
			let $div = $(`<div class="cell" data-row="${i}" data-col="${j}"></div>`);
			if (mines.indexOf(i * 10 + j) !== -1){
				$div.addClass("mine");
			}
			$app.append($div);
		}
	}
});

$(document).on("click", ".cell", function(){
	if ($(this).hasClass("mine")){
		$(this).addClass("explosed");
	} else {

	}
});
