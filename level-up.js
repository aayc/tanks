var levelUp = function (game) { 
}

levelUp.prototype = {

	preload: function () {
		game.load.image('play-button', 'assets/play-button.png');
		game.load.image('redtankbody', 'assets/redtankbody.png');
    	game.load.image('redtankhead', 'assets/redtankhead.png');
    	game.load.image('stat-add', 'assets/stat-add.png');
	},


	create: function () {
		var textOpts = {size: "48px", fille: "#FFF", align: "center"};
		game.stage.backgroundColor = 0xFFFFFF;
		game.add.sprite(100, 300, 'redtankbody');
		game.add.sprite(100, 300, 'redtankhead');

		game.add.button(200, 300, 'stat-add', this.addMoveSpeed, this);
		this.movTxt = game.add.text(250, 300, "Movement Speed: " + MOVEMENT_SPEED, textOpts);

		game.add.button(200, 350, 'stat-add', this.addRotSpeed, this);
		this.rotTxt = game.add.text(250, 350, "Rotation Speed: " + ROTATION_SPEED, textOpts);

		game.add.text(GAME_WIDTH/3, 50, "Level up!", {size: "48px", fille: "#FFF", align: "center"});
		var playButton = game.add.button(250, 400, 'play-button', this.startNextMission, this);
		game.time.advancedTiming = true;
	},

	update: function () {
		game.debug.text(game.time.fps, 2, 14, "#00ff00");
	},

	addMoveSpeed : function () {
		MOVEMENT_SPEED += 30;
		this.movTxt.setText("Movement Speed: " + MOVEMENT_SPEED);
	},

	addRotSpeed: function  () {
		ROTATION_SPEED -= 10;
		this.rotTxt.setText("Rotation Speed: " + MOVEMENT_SPEED);
	},
	
	startNextMission: function () {
		game.state.start("play-state");
	}
}