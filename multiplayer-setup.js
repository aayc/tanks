var multiplayerLobby = function (game) {}
var clientConnected = false;

multiplayerLobby.prototype = {
	preload: function () {
		game.load.image('join-button', 'assets/join-button.png');
	},

	create: function () {
		clientSetup();
		game.stage.backgroundColor = 0xFFFFFF;
		game.add.text(GAME_WIDTH/3, 100, "Ghetto Lobby", {size: "48px", fille: "#FFF", align: "center"});
		var playButton = game.add.button(250, 200, 'join-button', this.enterCode, this);
		game.time.advancedTiming = true;
	},

	update: function () {
		game.debug.text(game.time.fps, 2, 14, "#00ff00");
	},

	enterCode: function () {
		document.getElementById("hidden").innerHTML = "<div class='reveal-modal' id='code-entry' data-reveal  data-options='close_on_background_click:false'>" +
																		"<p>Tip: Faster computer should host (input code first)</p>" +
																	   "<p>Enter lobby code:</p>" + 
																	   "<input type='text' id='join-code'></input>" +  
																	   "<button id='waitForServer'>Join</button>" +
																	   "<div id='popup'></div>" +
																	   "<button id='cancel' class='close-reveal-modal'>Cancel</a>" +
																	  "</div>";
															  
		$("#code-entry").foundation('reveal', 'open');
		$("#waitForServer").on('click', function () {
			var code = $("#join-code").val();
			$("#join-code").prop("readonly", true);
			$("#waitForServer").addClass("disabled");
			$("#popup").html("Waiting...");
			if (!clientConnected) alert("Error: Not connected to server yet.");
			else server.registerCampaignCode(code);
		});

		$("#cancel").on('click', function () {
			var code = $("#join-code").val();
			server.destroyGame(code);
			$("#code-entry").foundation('reveal', 'close');
		})
	},
}

function clientSetup () {
	client = new Eureca.Client();
    
	client.ready(function (proxy) {   
		server = proxy;
		clientConnected = true;
		game.stage.disableVisibilityChange = true;
	});

	client.exports.setId = function (id) {
		clientId = id;
	}

	client.exports.startCampaign = function (cType) {
		clientType = cType;
		isMultiplayer = true;
		$("#code-entry").foundation('reveal', 'close');
		game.state.start("play-state");
	}

	client.exports.updatePlayer = function (data) {
		var p = (clientType == "HOST") ? players[1] : players[0];
		if (game.paused) return;
		p.heart.x = data.x;
		p.heart.y = data.y;
		p.head.rotation = data.rot;
		p.body.rotation = data.bodyRot;
	}

	client.exports.updateBullet = function (data) {
		fire(data, player, false);
	}

	client.exports.updateTankRotation = function (data) {
		if (!enemies.hasOwnProperty(data.ix)) return;
		var tank = enemies[data.ix];
		rotateTo(tank.head, data.goalRot, tank.rotDelay);
	}

	client.exports.updateTankVelocity = function (data) {
		if (!enemies.hasOwnProperty(data.ix)) return;
		var tank = enemies[data.ix];
		tank.heart.body.velocity.x = data.vx;
		tank.heart.body.velocity.y = data.vy;
	}

	client.exports.destroyEnemy = function (data) {
		destroyEnemyAt(data);
	}

	client.exports.nextMission = function () {
		game.state.start("play-state");
	}

	client.exports.winCondition = function () {
		destroyAllEnemies();
		if (!game.paused) win();
	}

	client.exports.unmultiplayer = function () {
		isMultiplayer = false;
		clientType = "";
		console.log("MULTIPLAYER DISCONNECTED");
	}
}