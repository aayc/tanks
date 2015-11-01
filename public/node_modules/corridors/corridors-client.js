var defaults = {
	registrationData: {
        roomKey: null
    },
	onConnect: function () {},
    onReject: function () {}
};

var clone = function (obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    var temp = obj.constructor();
    for (var key in obj) temp[key] = clone(obj[key]);
    return temp;
}

function corridorify (socket, options) {
    var settings = {};
    // Impose defaults
    settings = clone(defaults);
    for (var i in options) {
        if (typeof options[i] === 'object' && options[i] !== null && settings.hasOwnProperty(i))
            for (var j in options[i]) settings[i][j] = options[i][j];
        else settings[i] = options[i];
    }

	socket.on('_corridors_connected', function (incoming) {
        socket.id = incoming.id;
        socket.emit('_corridors_register', settings.registrationData);
    });
    socket.on('_corridors_err_unique_room', function () {
        settings.onReject.call(socket);
    });

    socket.on('_corridors_registered', function () {
        settings.onConnect.call(socket);
    });
    socket.on('ready?', function () {
        socket.emit('ready', {});
    });
}