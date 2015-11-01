var io = require('socket.io')
var User = require('./user.js');
var Room = require('./room.js');
var Lobby = require('./lobby.js');
var uuid = require('node-uuid');

var clone = function (obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    var temp = obj.constructor();
    for (var key in obj) temp[key] = clone(obj[key]);
    return temp;
}

module.exports = (function () {
	
	var users = {};
	var socketIdToUserId = {};
	var rooms = {};
	var lobby;
	var openRoomId = uuid();
	var registrationHandler;
	var connectionHandler;
	var defaults = {
		maxMembers: 1,
		allowKeys: true,
		userToRoomImmediately: false,
		shouldAllowUser: function (socket, data) {
			return true;
		},
		onRegistrationSuccess: function (user, registrationData) {},
		messages: {},
		configureRoom: {
			begin: function () {},
			removeMember: function (user) {}
		},
		configureUser: {}
	};

	var settings = {};

	var corridors = {
		init: function (server) {
			io = io(server);
		},

		configure: function (options) {
			// Impose defaults
			settings = clone(defaults);

			// Override defaults
			for (var i in options) {
				if (typeof options[i] === 'object' && options[i] !== null && settings.hasOwnProperty(i)) {
					for (var j in options[i]) {
						settings[i][j] = options[i][j];
					}
				}
				else {
					settings[i] = options[i];
				}
			}
		},

		run: function () {
			lobby = new Lobby(settings.maxMembers);

			/* "this" is bound to the socket on which the function is invoked. */
			registrationHandler = function (data) {
				/* Validate user */
				var autoRoomPass = data.roomKey === null || !settings.allowKeys;
				var roomIsFull = data.roomKey !== null && rooms.hasOwnProperty(data.roomKey) && rooms[data.roomKey]._full();
				var auth = settings.shouldAllowUser(this, data);

				if ((!autoRoomPass && roomIsFull) || !auth) {
					/* Reject the user */
					this.emit('_corridors_err_unique_room');
					return;
				}

				/* Create user and apply settings */
				var user = new User(this, clone(settings.configureUser));
				user.roomKey = settings.allowKeys ? data.roomKey : null;
				users[user.id] = user;
				socketIdToUserId[this.id] = user.id;
				settings.onRegistrationSuccess(user, data);

				if (settings.userToRoomImmediately) {
					if (user.roomKey === null) {
						/* No special room key, so allocate to open room*/
						if (rooms.hasOwnProperty(openRoomId)) {
							rooms[openRoomId]._addMember(user);
						} else {
							openRoomId = uuid();
							var newOpenRoom = new Room(openRoomId, settings.maxMembers, io, clone(settings.configureRoom));
							newOpenRoom._addMember(user);
							rooms[openRoomId] = newOpenRoom
						}
					} else {
						if (rooms.hasOwnProperty(user.roomKey)) {
							rooms._addMember(user);
						} else {
							var createdRoom = new Room(uuid(), settings.maxMembers, io, clone(settings.configureRoom));
							createdRoom._addMember(user);
							rooms[createdRoom.id] = createdRoom;
						}
					}
				}
				else {
					/* Add user to the lobby */
					lobby.addMember(user, user.roomKey);

					/* Retrieve full rooms and flush */
					var fullRooms = lobby.flushFullRooms();
					for (var roomId in fullRooms) {
						var createdRoom = new Room(roomId, settings.maxMembers, io, clone(settings.configureRoom));
						//console.log("NEW ROOM: " + createdRoom.id);
						for (var member in fullRooms[roomId]) {
							createdRoom._addMember(fullRooms[roomId][member]);
						}
						rooms[createdRoom.id] = createdRoom;
					}
				}

				corridors._setupHandlers(this);
				this.emit('_corridors_registered', {});
			};

			connectionHandler = function (socket) {
				socket.emit('_corridors_connected', { id: socket.id });
				socket.on('_corridors_register', registrationHandler.bind(socket));
			};

			io.on('connection', connectionHandler);
		},

		reset: function () {
			/* Terminate all existing connections */
			for (var userId in users) {
				users[userId]._socket.disconnect();
				delete users[userId];
			}

			/* Collapse all rooms */
			for (var roomId in rooms) {
				delete rooms[roomId];
			}

			/* Reset settings */
			settings = {};

			/* Nullify lobby */
			lobby = null;

			/* Remove on connection listener */
			var nsp = io.of('/');
			nsp.removeListener('connection', connectionHandler);
		},

		_setupHandlers: function (socket) {
			/* Set all messages defined in settings (default none). */
			for (var key in settings.messages) {
				//console.log("SOCKET CONFIGURE: on " + key + " do " + settings.messages[key]);
				(function (key, f) {
					socket.on(key, function (data) {
						var user = users[socketIdToUserId[socket.id]];
						f(user, data);
					});
				})(key, settings.messages[key]);
			}

			/* Handle disconnect */
			socket.on('disconnect', function () {
				var user = users[socketIdToUserId[socket.id]];

				/* Erase user. */
				if (user !== null  && user !== undefined && user.inRoom()) {
					user.room._removeMember(user);
					if (user.room.numMembers == 0) {
						delete rooms[user.room.id];
					}
				}
				if (socketIdToUserId.hasOwnProperty(socket.id)) {
					delete socketIdToUserId[socket.id];
					delete users[user.id];
				}
			});
		},

		_getRooms: function () { return rooms; },

		_getUsers: function () { return users; },

		_getLobby: function () { return lobby; },

		getUser: function (id) { return users[id]; },

		replyTo: function (user, message, data) {
			user._socket.emit(message, data);
		}
	}

	return corridors;
	
})();