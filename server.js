var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
 
var EurecaServer = require('eureca.io').EurecaServer;
var eurecaServer = new EurecaServer({allow:['setId', 'startCampaign', 'unmultiplayer', 'updatePlayer', 'updateBullet', 'updateTankRotation']});
 
app.use(express.static(__dirname));
 
 // Controls multiplayer games.
var games = [];
var waiting = {};

eurecaServer.attach(server);

eurecaServer.onConnect(function (conn) {    
    var remote = eurecaServer.getClient(conn.id);
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