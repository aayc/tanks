var uuid = require('node-uuid');

module.exports = (function () {
	function User (socket, config) {
		this.id = uuid();
		this.socketId = socket.id;
		this._socket = socket;
		this.room = null;
		for (var key in config) {
			this[key] = config[key];
		}
	}

	User.prototype = {
		inRoom: function () { return this.room !== undefined && this.room !== null; }
	}

	return User;
})();