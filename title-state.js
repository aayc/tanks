var titleState = function (game) { 
}

titleState.prototype = {
	preload: function () {
		game.load.image('play-button', 'assets/play-button.png');
		game.load.image('multiplayer-button', 'assets/multiplayer-button.png');
	},


	create: function () {
		game.stage.backgroundColor = 0xFFFFFF;
		game.add.text(GAME_WIDTH/3, 100, "TANKS!!!", {size: "48px", fille: "#FFF", align: "center"});
		var playButton = game.add.button(250, 200, 'play-button', this.startNextMission, this);

		var multiplayerButton = game.add.button(250, 400, 'multiplayer-button', this.startMultiplayer, this);
		game.time.advancedTiming = true;
	},

	update: function () {
		game.debug.text(game.time.fps, 2, 14, "#00ff00");
	},

	startNextMission: function () {
		game.state.start("play-state");
	},

	startMultiplayer : function () {
		game.state.start('multiplayer-lobby');
	}
}

