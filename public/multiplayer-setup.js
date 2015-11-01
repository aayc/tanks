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
		});

		$("#cancel").on('click', function () {
			var code = $("#join-code").val();
			$("#code-entry").foundation('reveal', 'close');
		})
	},
}