module.exports = (function () {
	function Room (id, maxMembers, io, config) {
		/* Apply settings */	
		for (var key in config) {
			this[key] = config[key];
		}
		
		this.id = id;
		this.maxMembers = maxMembers;
		this.numMembers = 0;
		this.members = {};
		this.io = io;
	}

	Room.prototype = {
		_removeMember: function (user) {
			if (this.members[user.id]) {
				//console.log("ROOM REMOVED USER FROM MEMBERS");
				this.removeMember(user);
				this.members[user.id]._socket.leave(this.id);
				delete this.members[user.id];
				this.numMembers -= 1;
			}
		},

		_addMember: function (user) {
			this.members[user.id] = user;
			this.numMembers += 1;
			user.room = this;
			user._socket.join(this.id);
			if (this._full()) this._start();
		},

		_full: function () {
			return this.numMembers == this.maxMembers;
		},

		_start: function () {
			this._waitForAll(onFinish = this.begin.bind(this));
		},

		_waitForAll: function (onFinish) {
			var flags = 0;
			var collect = (function (dummy) {
				flags += 1;
				if (flags == this.numMembers) {
					for (var i in this.members) {
						this.members[i]._socket.removeListener('ready', collect);
					}
					onFinish();
				}
			}).bind(this);
			for (var i in this.members) {
				this.members[i]._socket.on('ready', collect);
			}
			this._tellRoom('ready?', {});
		},

		_tellRoom: function (message, data) {
			this.io.to(this.id).emit(message, data);
		}
	}
	return Room;
})();