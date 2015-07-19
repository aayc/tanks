var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
 
var EurecaServer = require('eureca.io').EurecaServer;
var eurecaServer = new EurecaServer({allow:['setId', 'startCampaign', 'unmultiplayer', 'updatePlayer', 'updateBullet', 
												'updateTankRotation', 'updateTankVelocity', 'winCondition', 'nextMission']});
 
app.use(express.static(__dirname));
 
 // Controls multiplayer games.
var games = [];
var waiting = {};

eurecaServer.attach(server);

eurecaServer.onConnect(function (conn) {    
    var remote = eurecaServer.getClient(conn.id);
    console.log("newe client");
    waiting[conn.id] = {id: conn.id, remote: remote};
    remote.setId(conn.id);
});

eurecaServer.exports.registerCampaignCode = function (code) {
	var conn = this.connection;
	var codeFound = false;

	for (var i = 0; i < games.length; i++) {
		if (games[i].code == code && !games[i].inGame) {
			games[i].coplayer = waiting[conn.id];
			games[i].inGame = true;
			games[i].playing = true;
			games[i].host.remote.startCampaign("HOST");
			games[i].coplayer.remote.startCampaign("DUMB");

			codeFound = true;
			break;
		}
	}

	if (!codeFound) {
		games.push({
			code: code,
			coplayer: null,
			host: waiting[conn.id],
			inGame: false
		});
	}

	delete waiting[conn.id];
}

eurecaServer.exports.destroyGame = function (code) {
	for (var i = 0; i < games.length; i++) {
		if (games[i].code == code) {
			waiting[games[i].host.id] = {id: games[i].host.id, remote: games[i].host.remote};
			games.splice(i, 1);
			break;
		}
	}
}

eurecaServer.exports.updatePlayer = function (id, data) {
	findPlayer(id, function (player) {
		player.remote.updatePlayer(data);
	})
}

eurecaServer.exports.updateBullet = function (id, data) {
	findPlayer(id, function (player) {
		player.remote.updateBullet(data);
	});
}

eurecaServer.exports.updateTankRotation = function (id, data) {
	findPlayer(id, function (player) {
		player.remote.updateTankRotation(data);
	});
}

eurecaServer.exports.updateTankVelocity = function (id, data) {
	findPlayer(id, function (player) {
		player.remote.updateTankVelocity(data);
	});
}

eurecaServer.exports.sendWinCondition = function (id) {
	for (var i = 0; i < games.length; i++) {
		if (games[i].coplayer.id == id) {
			games[i].playing = false;
			games[i].host.remote.winCondition();
			break;
		}
		else if (games[i].host.id == id) {
			games[i].playing = false;
			games[i].coplayer.remote.winCondition();
			break;
		}
	}
}

eurecaServer.exports.readyForNextMission = function (id) {
	for (var i = 0; i < games.length; i++) {
		if (games[i].coplayer.id == id || games[i].host.id == id) {
			if (games[i].playing) {
				games[i].coplayer.remote.nextMission();
				games[i].host.remote.nextMission();
			}
			else games[i].playing = true;
			break;
		}
	}
}

function findPlayer(id, fcn) {
	for (var i = 0; i < games.length; i++) {
		if (games[i].coplayer.id == id) {
			fcn(games[i].host);
			break;
		}
		else if (games[i].host.id == id) {
			fcn(games[i].coplayer);
			break;
		}
	}
}
 
//detect client disconnection
eurecaServer.onDisconnect(function (conn) {
	console.log("client out");
	for (var i = 0; i < games.length; i++) {
		if (games[i].coplayer.id == conn.id) {
			games[i].host.remote.unmultiplayer();
			games.splice(i, 1);
		}
		else if (games[i].host.id == conn.id) {
			games[i].coplayer.remote.unmultiplayer();
			games.splice(i, 1);
		}
	}

	delete waiting[conn.id];
});

 
server.listen(8000);