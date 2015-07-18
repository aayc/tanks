var nextMission = function (game) { 
}

nextMission.prototype = {
	preload: function () {
		game.load.image('play-button', 'assets/play-button.png');
	},


	create: function () {
		game.stage.backgroundColor = 0xFFFFFF;
		game.add.text(GAME_WIDTH/3, 100, "Mission " + level, {size: "48px", fille: "#FFF", align: "center"});
		var playButton = game.add.button(250, 200, 'play-button', this.startNextMission, this);
		game.time.advancedTiming = true;
	},

	update: function () {
		game.debug.text(game.time.fps, 2, 14, "#00ff00");
	},

	startNextMission: function () {
		game.state.start("play-state");
	}
}