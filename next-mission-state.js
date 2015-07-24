var nextMission = function (game) { 
}

nextMission.prototype = {
	preload: function () {
		game.load.image('play-button', 'assets/play-button.png');
	},

	create: function () {
		game.stage.backgroundColor = 0xFFFFFF;
		game.add.text(GAME_WIDTH/3, 100, "Mission " + level, {size: "48px", fille: "#FFF", align: "center"});
		game.add.text(GAME_WIDTH/3, 150, "Lives left: " + PLAYER_LIVES, {size: "48px", fille: "#FFF", align: "center"});
		var playButton = game.add.button(250, 300, 'play-button', this.startNextMission, this);
		game.time.advancedTiming = true;
	},

	update: function () {
		game.debug.text(game.time.fps, 2, 14, "#00ff00");
	},

	startNextMission: function () {
		if (isMultiplayer) {
			server.readyForNextMission(clientId);
			game.add.text(250, 300, "Waiting for other player...", {size: "48px", fille: "#FFF", align: "center"});
		}
		else game.state.start("play-state");
	}
}