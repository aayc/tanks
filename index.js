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
		}
	},
	configureRoom: {	
		begin: function () {
			var keys = Object.keys(this.members);
			var hostID = uuid();
			var userID = uuid();
			this.members[keys[0]]._socket.emit("init", {type: "HOST", ids: [hostID, userID]});
			this.members[keys[1]]._socket.emit("init", {type: "USER", ids: [hostID, userID]});
			this._tellRoom('game begin');
		}
	},
	configureUser: {
		type: ""
	}
});
corridors.run();

 
server.listen(4004);