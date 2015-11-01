var levelUp = function (game) {}

levelUp.prototype = {

	preload: function () {
		game.load.image('play-button', 'assets/play-button.png');
		game.load.image('redtankbody', 'assets/redtankbody.png');
    	game.load.image('redtankhead', 'assets/redtankhead.png');
    	game.load.image('stat-add', 'assets/stat-add.png');
	},


	create: function () {
		this.textOpts = {size: "48px", fille: "#FFF", align: "center"};
		game.stage.backgroundColor = 0xFFFFFF;
		game.add.sprite(100, 300, 'redtankbody');
		game.add.sprite(100, 300, 'redtankhead');
		game.add.text(GAME_WIDTH/3, 50, "Level up!", {size: "72px", fille: "#FFF", align: "center"});
		this.skillPtsTxt = game.add.text(GAME_WIDTH / 3, 100, "Skill Points: " + skillPts, this.textOpts);

		this.adds = [{
			btn: game.add.sprite(200, 200, 'stat-add'),
			txt: game.add.text(250, 200, "Increase Movement Speed (current: " + PLAYER_MOVEMENT_SPEED + ", next " + (PLAYER_MOVEMENT_SPEED + 15) + ", cost: " + 1 + ")", this.textOpts),
			txtTemplate: "Increase Movement Speed",
			stat: "PLAYER_MOVEMENT_SPEED",
			change: 15,
			cost: 1
		}, {
			btn: game.add.sprite(200, 260, 'stat-add'),
			txt: game.add.text(250, 260, "Decrease Rotation Delay (current: " + PLAYER_ROTATION_SPEED + ", next: " + (PLAYER_ROTATION_SPEED - 10) + ", cost: " + 1 + ")", this.textOpts),
			txtTemplate: "Decrease Rotation Delay",
			stat: "PLAYER_ROTATION_SPEED",
			change: -10,
			cost: 1
		}, {
			btn: game.add.sprite(200, 320, 'stat-add'),
			txt: game.add.text(250, 320, "Add 1 bullet (current: " + PLAYER_BULLET_LIMIT + ", next: " + (PLAYER_BULLET_LIMIT + 1) + ", cost: " + 2 + ")", this.textOpts),
			txtTemplate: "Add 1 bullet",
			stat: "PLAYER_BULLET_LIMIT",
			change: 1,
			cost: 2
		}, {
			btn: game.add.sprite(200, 380, 'stat-add'),
			txt: game.add.text(250, 380, "Increase Bullet Speed (current: " + PLAYER_BULLET_SPEED + ", next: " + (PLAYER_BULLET_SPEED + 20) + ", cost: " + 2 + ")", this.textOpts),
			txtTemplate: "Increase Bullet Speed",
			stat: "PLAYER_BULLET_SPEED",
			change: 20,
			cost: 2
		}, {
			btn: game.add.sprite(200, 440, 'stat-add'),
			txt: game.add.text(250, 440, "Add 1 life (current: " + PLAYER_LIVES + ", next: " + (PLAYER_LIVES + 1) + ", cost: " + 1 + ")", this.textOpts),
			txtTemplate: "Add 1 life",
			stat: "PLAYER_LIVES",
			change: 1,
			cost: 1
		}];

		for (var i = 0; i < this.adds.length; i++) {
			this.adds[i].btn.inputEnabled = true;
			this.adds[i].btn.events.onInputDown.add(this.upgrade, {up: this.adds[i], world: this});
		}

		this.validateOptions();

		
		var playButton = game.add.button(250, 550, 'play-button', this.startNextMission, this);
		game.time.advancedTiming = true;
	},

	update: function () {
		game.debug.text(game.time.fps, 2, 14, "#00ff00");
	},

	upgrade: function () {
		skillPts -= this.up.cost;
		this.world.skillPtsTxt.setText("Skill Points: " + skillPts);
		eval(this.up.stat + " += " + this.up.change);
		var info = "(current: " + eval(this.up.stat) + ", next: " + (eval(this.up.stat + " + " + this.up.change)) + ", cost: " + this.up.cost + ")";
		this.up.txt.setText(this.up.txtTemplate + " " + info, this.world.textOpts);
		this.world.validateOptions();
	},

	validateOptions: function () {
		for (var i = 0; i < this.adds.length; i++) {
			if (this.adds[i].cost > skillPts) {
				this.adds[i].btn.visible = false;
			}
		}
	},
	
	startNextMission: function () {
		if (isMultiplayer) {
			server.readyForNextMission(clientId);
			game.add.text(250, 480, "Waiting for other player...", {size: "48px", fille: "#FFF", align: "center"});
		}
		else game.state.start("play-state");
	}
}