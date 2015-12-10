var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
var corridors = require('corridors');
var uuid = require('node-uuid');
app.use(express.static("public"));
var port = process.env.PORT || 4004;

corridors.init(server);
corridors.configure({
	maxMembers: 2,
	onRegistrationSuccess: function (user, registrationData) {
	},
	messages: {
		tell: function (user, data) {
			user._socket.broadcast.to(user.room.id).emit(data.msg, data);
		},
		getEnemyIds: function (user, data) {
			if (user.room.ids.length == 0) {
				user.room.generateIds(data.n);
			}
			corridors.replyTo(user, "enemy ids", {enemyIds: user.room.ids});
		},
		wonLevel: function (user, data) {
			user.room.ids = [];
			user.room.level += 1;
		},
		lostLevel: function (user, data) {
			user.room.readyFlags += 1;
			console.log("# ready flags: " + user.room.readyFlags);
			if (user.room.readyFlags >= 2) {
				user.room.numLives -= 1;
				user.room.readyFlags = 0;
				console.log("NUM LIVES LEFT: " + user.room.numLives);
				if (user.room.numLives == 0) {
					user.room._tellRoom("dead");
				} else {
					user.room._tellRoom("restart level");
				}
			}
		},
		readyForNextLevel: function (user, data) {
			user.room.readyFlags += 1;
			if (user.room.readyFlags >= 2) {
				user.room._tellRoom('start next', {level: user.room.level});
				user.room.readyFlags = 0;
			}
		},
		readyToStartGame: function (user, data) {
			user.room.readyFlags += 1;
			if (user.room.readyFlags >= 2) {
				user.room._tellRoom('start game');
				user.room.readyFlags = 0;
			}
		}
	},
	configureRoom: {	
		level: 1,
		ids: [],
		readyFlags: 0,
		numLives: 3,
		begin: function () {
			var keys = Object.keys(this.members);
			var hostID = uuid();
			var userID = uuid();
			this.members[keys[0]]._socket.emit("init", {type: "HOST", ids: [hostID, userID]});
			this.members[keys[0]].type = "HOST";
			this.members[keys[1]]._socket.emit("init", {type: "USER", ids: [hostID, userID]});
			this.members[keys[1]].type = "USER";
			this._tellRoom('game begin');
		},
		generateIds: function (n) {
			this.ids = [];
			for (var i = 0; i < n; i++) this.ids.push(uuid());
		}
	},
	configureUser: {
		type: ""
	}
});
corridors.run();

 
server.listen(port);