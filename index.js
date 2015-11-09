var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
var corridors = require('corridors');
var uuid = require('node-uuid');
app.use(express.static("public"));

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
			console.log("REPLYING TO USER WITH IDS: " + user.room.ids);
			corridors.replyTo(user, "enemy ids", {enemyIds: user.room.ids});
		},
		wonLevel: function (user, data) {
			user.room.ids = [];
			user.room.readyFlags = 0;
		},
		lostLevel: function (user, data) {
			console.log("LOSE");
		},
		readyForNextLevel: function (user, data) {
			user.room.readyFlags += 1;
			if (user.room.readyFlags >= 2) {
				user.room.level += 1;
				user.room._tellRoom('start next', {level: user.room.level});
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

 
server.listen(4004);