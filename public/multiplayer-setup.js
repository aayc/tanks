var multiplayerLobby = function (game) {}

multiplayerLobby.prototype = {
	preload: function () {
		game.load.image('join-button', 'assets/join-button.png');
	},

	create: function () {
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
																		"<p>Tip: Faster computer should host (a.k.a. input code first)</p>" +
																	   "<p>Enter lobby code:</p>" + 
																	   "<input type='text' id='join-code'></input>" +  
																	   "<button id='join'>Join</button>" +
																	   "<div id='popup'></div>" +
																	   "<button id='cancel' class='close-reveal-modal'>Cancel</a>" +
																	  "</div>";
															  
		$("#code-entry").foundation('reveal', 'open');
		$("#join").on('click', function () {
			var code = $("#join-code").val();
			$("#join-code").prop("readonly", true);
			$("#join").addClass("disabled");
			$("#popup").html("Waiting...");
			socket = io.connect();
			corridorify(socket, {
				onConnect: function () {
					console.log("CORRIDORS CONNECTED");

					isMultiplayer = true;
					socket.on('init', function (data) {
						multiSettings.type = data.type;
						multiSettings.ids = data.ids;
						playerId = multiSettings.type == "HOST" ? data.ids[0] : data.ids[1];
						console.log("my id is: " + playerId);
						console.log("rest of the ids: " + data.ids);
					});

					socket.on('player update v', function (data) {
						players[data.id].heart.body.velocity.x = data.heartVx;
		            	players[data.id].heart.body.velocity.y = data.heartVy;
		            	players[data.id].vx = data.vx;
		            	players[data.id].vy = data.vy;
		            	players[data.id].heart.x = data.heartX;
		            	players[data.id].heart.y = data.heartY;
					});

					socket.on('player update r', function (data) {
						console.log("ROT");
						players[data.id].rotTween.stop();
						players[data.id].rotTween = dualRotateTo(players[data.id].body, data.rot, PLAYER_ROTATION_SPEED);
					})

					socket.on('game begin', function () {
						$("#code-entry").foundation('reveal', 'close');
						game.state.start('play-state');
					});
				},
				registrationData: {
					roomKey: code
				},
				onReject: function () {
					$("#popup").html("Sorry, it looks like that room is full.  Please try another room ID.");
					$("#join").removeClass("disabled");
					$("#join-code").prop("readonly", false);
				}
			});
		});

		$("#cancel").on('click', function () {
			var code = $("#join-code").val();
			$("#code-entry").foundation('reveal', 'close');
		})
	},
}