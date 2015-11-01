var chai = require('chai'),
    mocha = require('mocha'),
    should = chai.should();
var vm = require('vm');
var fs = require('fs');
var code = fs.readFileSync("./corridors-client.js");
vm.runInThisContext(code);
 
var io = require('socket.io-client');
var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var corridors = require("../index.js");
corridors.init(server);

app.use(express.static('public'));
server.listen(4004);

 
describe("SINGLE USER BASIC TESTS", function () {
    var socket;
    
    before(function () {
        corridors.configure({
            maxMembers: 2,
        });
        corridors.run();
    })
    
    beforeEach(function (done) {
        socket = io.connect("http://localhost:4004", {multiplex: false});
        corridorify(socket, { onConnect: function () { done(); } });
    });

    afterEach(function(done) {
        if (socket.connected) {
            socket.once('disconnect', function () { done(); });
            socket.disconnect();
        }
        else done();
    });

    it("should create 0 rooms for 1 user on connect", function (done) {
        Object.keys(corridors._getRooms()).length.should.equal(0);
        done();
    });

    it("should create a user on connect", function (done) {
        Object.keys(corridors._getUsers()).length.should.equal(1);
        done();
    });

    it("should delete a user on disconnect", function (done) {
        socket.disconnect();
        setTimeout(function () {
            Object.keys(corridors._getUsers()).length.should.equal(0);
            done();
        }, 10);
    });
});

describe("MULTI USER BASIC TESTS", function () {
    var sockets = [null, null, null];

    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 3,
            messages: {
            },
            configureRoom: {
                begin: function () {
                    this._tellRoom("start room", {});
                }
            },
            configureUser: {}
        });
        corridors.run();
    })
    
    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            
            corridorify(sockets[i], {
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) {
                        done();
                    }
                }
            });
        }
    });

    afterEach(function(done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) {
                sockets[i].disconnect();
            }
        }
        done();
    });

    it("should create 1 room for 3 users", function(done) {
        Object.keys(corridors._getUsers()).length.should.equal(3);
        Object.keys(corridors._getRooms()).length.should.equal(1);
        done();
    });

    it("should start the room and alert all users", function (done) {
        sockets[0].on('start room', function () {
            done();
        });
    });
});

describe("MULTI ROOM BASIC TESTS", function () {

    var sockets = [null, null, null, null, null, null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            messages: {},
            configureRoom: {},
            configureUser: {}
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            
            corridorify(sockets[i], {
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) {
                        done();
                    }
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) sockets[i].disconnect();
        }
        done();
    });

    it("should create 3 rooms for 7 users", function (done) {
        Object.keys(corridors._getRooms()).length.should.equal(3);
        done();
    });

    it("should have 1 user left over in the open room", function (done) {
       corridors._getLobby()._getOpenPseudoRoom().length.should.equal(1);
       done();
    });
});

describe("INTENSE CONCURRENCY TESTS", function () {
    var sockets = [];
    var numUsers = 41;
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            messages: {},
            configureRoom: {},
            configureUser: {}
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < numUsers; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            
            corridorify(sockets[i], {
                onConnect: function () { 
                    flags += 1;
                    if (flags == numUsers) {
                        done();
                    }
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) sockets[i].disconnect();
        }
        sockets = [];
        done();
    });

    it("should have 1 user left over in the lobby", function (done) {
       corridors._getLobby()._getOpenPseudoRoom().length.should.equal(1);
       done();
    });

    it("should have 20 rooms running concurrently", function (done) {
        Object.keys(corridors._getRooms()).length.should.equal(20);
        done();
    });
})


describe("ROOM COMMUNICATION TESTS", function () {

    var sockets = [null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            messages: {
                "echo": function (user, data) {
                    corridors.replyTo(user, "echo", {secret: data.secret});
                },
                "tell everybody this": function (user, data) {
                    user.room._tellRoom("hey listen", {secret: data.secret});
                }
            },
            configureRoom: {},
            configureUser: {}
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            
            corridorify(sockets[i], {
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) done();
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) sockets[i].disconnect();
        }
        done();
    });

    it("should echo back hello", function (done) {
        sockets[0].on("echo", function (data) {
            data.secret.should.equal("hello");
            done();
        });
        sockets[0].emit("echo", {secret: "hello"});
    });

    it("should tell everybody in the room hey", function (done) {
        sockets[0].on("hey listen", function (data) {
            data.secret.should.equal("hey");
            done();
        });
        sockets[1].emit("tell everybody this", {secret: "hey"})
    });

    it("should echo back a message to tell everybody yo", function (done) {
        sockets[0].on("echo", function (data) {
            if (data.secret == "do it") {
                sockets[0].emit("tell everybody this", {secret: "yo"});
            }
        });
        sockets[1].on("hey listen", function (data) {
            data.secret.should.equal("yo");
            done();
        })
        sockets[0].emit("echo", {secret: "do it"});
    })
});

describe("ROOM DATA STORAGE TESTS", function () {
    var sockets = [null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            messages: {
                "echo": function (user, data) {
                    corridors.replyTo(user, "echo", {secret: data.secret});
                },
                "broadcast": function (user, data) {
                    user.room._tellRoom("hey listen", {secret: data.secret});
                },
                "store this": function (user, data) {
                    user.room.storage.push(data.secret);
                    corridors.replyTo(user, "done storing", {numStored: user.room.storage.length});
                },
                "tell me your secrets": function (user, data) {
                    corridors.replyTo(user, "secrets", {secrets: user.room.storage});
                }
            },
            configureRoom: {
                storage: []
            },
            configureUser: {}
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            
            corridorify(sockets[i], {
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) done();
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) sockets[i].disconnect();
        }
        done();
    });

    it("should have 1 room", function (done) {
        Object.keys(corridors._getRooms()).length.should.equal(1);
        done();
    });

    it("should store something", function (done) {
        sockets[0].emit("store this", {secret: "secret 1"});
        sockets[0].on('done storing', function (data) {
            data.numStored.should.equal(1);
            done();
        });
    });

    it("should see no duplicates from last test", function (done) {
        sockets[0].emit("store this", {secret: "secret 2"});
        sockets[0].on('done storing', function (data) {
            data.numStored.should.equal(1);
            done();
        });
    });

    it("should have the roommate see storage", function (done) {
        sockets[0].emit("store this", {secret: "secret 1"});
        sockets[0].on('done storing', function (data) {
            sockets[1].emit("tell me your secrets", {});
            sockets[1].once('secrets', function (data) {
                data.secrets[0].should.equal("secret 1");
                sockets[0].emit("tell me your secrets", {});
                sockets[0].on("secrets", function (data) {
                    data.secrets[0].should.equal("secret 1");
                    done();
                });
            });
        });
    });
});

describe("USER DATA STORAGE TESTS", function () {
    var sockets = [null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            messages: {
                "echo": function (user, data) {
                    corridors.replyTo(user, "echo", {secret: data.secret});
                },
                "broadcast": function (user, data) {
                    user.room._tellRoom("hey listen", {secret: data.secret});
                },
                "pocket": function (user, data) {
                    user.storage.push(data.secret);
                    corridors.replyTo(user, "done storing", {numStored: user.storage.length});
                },
                "my pocket": function (user, data) {
                    corridors.replyTo(user, "secrets", {secrets: user.storage});
                }
            },
            configureRoom: {
            },
            configureUser: {
                storage: []
            }
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            
            corridorify(sockets[i], {
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) done();
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) sockets[i].disconnect();
        }
        done();
    });

    it("should have 1 room", function (done) {
        Object.keys(corridors._getRooms()).length.should.equal(1);
        done();
    });

    it("should store something", function (done) {
        sockets[0].emit("pocket", {secret: "secret 1"});
        sockets[0].on('done storing', function (data) {
            data.numStored.should.equal(1);
            done();
        });
    });

    it("should let user see his/her pocket", function (done) {
        sockets[0].emit("pocket", {secret: "secret 2"});
        sockets[0].on('done storing', function (data) {
            sockets[0].on('secrets', function (data) {
                data.secrets[0].should.equal("secret 2");
                done();
            });
            sockets[0].emit("my pocket", {});
        });
    });

    it("should not let other guy see pocket", function (done) {
        sockets[0].on('done storing', function (data) {
            sockets[1].once('secrets', function (data) {
                data.secrets.length.should.equal(0);
                done();
            });
            sockets[1].emit("my pocket", {});
        });
        sockets[0].emit("pocket", {secret: "secret 1"});
    });
});

describe("ROOM DATA MUTATION TESTS", function () {
    var sockets = [null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            messages: {
                "echo": function (user, data) {
                    corridors.replyTo(user, "echo", {secret: data.secret});
                },
                "broadcast": function (user, data) {
                    user.room._tellRoom("hey listen", {secret: data.secret});
                },
                "store this": function (user, data) {
                    user.room.storage = data.secret;
                    corridors.replyTo(user, "done storing", {});
                },
                "what is it": function (user, data) {
                    corridors.replyTo(user, "secret", {secret: user.room.storage});
                }
            },
            configureRoom: {
            },
            configureUser: {
                storage: 0
            }
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            
            corridorify(sockets[i], {
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) done();
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) sockets[i].disconnect();
        }
        done();
    });

    it("should store something", function (done) {
        sockets[0].emit("store this", {secret: 3});
        sockets[0].on('done storing', function (data) {
            sockets[0].on('secret', function (data) {
                data.secret.should.equal(3);
                done();
            })
            sockets[0].emit('what is it', {});
        });
    });

    it("should have one change storage and other see changed", function (done) {
        sockets[0].emit("store this", {secret: 3});
        sockets[0].once('done storing', function (data) {
            sockets[1].emit("store this", {secret: 4});
            sockets[1].once('done storing', function (data) {
                sockets[0].emit('what is it');
                sockets[0].on('secret', function (data) {
                    data.secret.should.equal(4);
                    done();
                });
            });
        });
    });
});
describe("ROOM KEY TESTS", function () {
    var sockets = [null, null, null, null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            allowKeys: true,
            messages: {
                "echo": function (user, data) {
                    corridors.replyTo(user, "echo", {secret: data.secret});
                },
                "broadcast": function (user, data) {
                    user.room._tellRoom("hey listen", {secret: data.secret});
                },
                "my room": function (user, data) {
                    corridors.replyTo(user, "your room id", {roomId: user.room.id});
                },
                "store this": function (user, data) {
                    user.room.storage.push(data.secret);
                    corridors.replyTo(user, "done storing", {numStored: user.room.storage.length});
                },
                "tell me your secrets": function (user, data) {
                    corridors.replyTo(user, "secrets", {secrets: user.room.storage});
                }
            },
            configureRoom: {
                storage: []
            },
            configureUser: {
            }
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});
            var roomAssignment = i == 0 || i == 2 ? "A" : "B";
            if (i == 4) roomAssignment = null;
            corridorify(sockets[i], {
                registrationData: {
                    roomKey: roomAssignment
                },
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) done();
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) sockets[i].disconnect();
        }
        setTimeout(done, 100);
    });

    it("should keep sockets[0, 2] in room A", function (done) {
        sockets[0].on('your room id', function (data) {
            data.roomId.should.equal("A");
            sockets[2].on('your room id', function (data) {
                data.roomId.should.equal("A");
                done();
            })
            sockets[2].emit('my room');
        });
        sockets[0].emit('my room');
    });

    it("should keep sockets[1, 3] in room B", function (done) {
        sockets[1].on('your room id', function (data) {
            data.roomId.should.equal("B");
            sockets[3].on('your room id', function (data) {
                data.roomId.should.equal("B");
                done();
            })
            sockets[3].emit('my room');
        });
        sockets[1].emit('my room');
    });

    it("should keep sockets[4] in uuid generated room", function (done) {
        sockets[4].on('your room id', function (data) {
            data.roomId.should.not.equal("A");
            data.roomId.should.not.equal("B");
            done();
        });
        sockets[4].emit('my room');
    })

    it("combo test", function (done) {
        sockets[0].on('your room id', function (data) {
            data.roomId.should.equal("A");
            sockets[1].on('your room id', function (data) {
                data.roomId.should.equal("B");
                sockets[2].on('your room id', function (data) {
                    data.roomId.should.equal("A");
                    sockets[3].on('your room id', function (data) {
                        data.roomId.should.equal("B");
                        sockets[4].on('your room id', function (data) {
                            data.roomId.should.not.equal("A");
                            data.roomId.should.not.equal("B");
                            done();
                        })
                        sockets[4].emit('my room');
                    })
                    sockets[3].emit('my room');
                })
                sockets[2].emit('my room');
            })
            sockets[1].emit('my room');
        });
        sockets[0].emit("my room");
    });
});

describe("ROOM UNIQUENESS TESTS", function () {
    var sockets = [null, null, null, null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 2,
            allowKeys: true,
            messages: {
                "echo": function (user, data) {
                    corridors.replyTo(user, "echo", {secret: data.secret});
                },
                "broadcast": function (user, data) {
                    user.room._tellRoom("hey listen", {secret: data.secret});
                },
                "my room": function (user, data) {
                    corridors.replyTo(user, "your room id", {roomId: user.room.id});
                },
                "store this": function (user, data) {
                    user.room.storage.push(data.secret);
                    corridors.replyTo(user, "done storing", {numStored: user.room.storage.length});
                },
                "tell me your secrets": function (user, data) {
                    corridors.replyTo(user, "secrets", {secrets: user.room.storage});
                }
            },
            configureRoom: {
                storage: []
            },
            configureUser: {
            }
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});

            corridorify(sockets[i], {
                registrationData: {
                    roomKey: "coveted room"
                },
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) {
                        done();
                    }
                },
                onReject: function () {
                    this.denied = true;
                    flags += 1;
                    if (flags == sockets.length) done();
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) {
                sockets[i].denied = false;
                sockets[i].disconnect();
            }
        }

        setTimeout(done, 100);
    });

    it("should have 2 users because 3 were rejected", function (done) {
        Object.keys(corridors._getUsers()).length.should.equal(2);
        done();
    });

    it("should have 3 sockets getting denied registration", function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            flags += (sockets[i].denied) ? 1 : 0;
        }
        flags.should.equal(3);
        done();
    })
});

describe("USER CHAT SERVER TESTS", function () {
    var sockets = [null, null, null, null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 3,
            allowKeys: true,
            messages: {
                "say":function (user, data) {
                    user.room._tellRoom("new message", {message: data.message, name: user.name});
                }
            },
            configureRoom: {
                storage: []
            },
            configureUser: {
                name: ""
            },
            onRegistrationSuccess: function (user, data) {
                user.name = data.name
            }
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});

            corridorify(sockets[i], {
                registrationData: {
                    name: "user" + i
                },
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) {
                        done();
                    }
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) {
                sockets[i].denied = false;
                sockets[i].disconnect();
            }
        }

        setTimeout(done, 100);
    });

    it("should have 1 room open", function (done) {
        Object.keys(corridors._getRooms()).length.should.equal(1);
        done();
    });

    it("should send a message 'hello' from user1", function (done) {
        sockets[0].once('new message', function (data) {
            data.message.should.equal('hello');
            data.name.should.equal("user1");
            done();
        });

        sockets[1].emit("say", {message: "hello"});
    })
});


describe("IMMEDIATE ROOM ENTRY TESTS", function () {
    var sockets = [null, null, null, null, null];
    before(function () {
        corridors.reset();
        corridors.configure({
            maxMembers: 30,
            allowKeys: true,
            userToRoomImmediately: true,
            messages: {
                "say":function (user, data) {
                    user.room._tellRoom("new message", {message: data.message, name: user.name});
                }
            },
            configureRoom: {
                storage: []
            },
            configureUser: {
                name: ""
            },
            onRegistrationSuccess: function (user, data) {
                user.name = data.name
            }
        });
        corridors.run();
    });

    beforeEach(function (done) {
        var flags = 0;
        for (var i = 0; i < sockets.length; i++) {
            sockets[i] = io.connect("http://localhost:4004", { multiplex: false});

            corridorify(sockets[i], {
                registrationData: {
                    name: "user" + i
                },
                onConnect: function () { 
                    flags += 1;
                    if (flags == sockets.length) {
                        done();
                    }
                }
            });
        }
    });

    afterEach(function (done) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].connected) {
                sockets[i].denied = false;
                sockets[i].disconnect();
            }
        }

        setTimeout(done, 100);
    });

    it("should have 1 room open", function (done) {
        Object.keys(corridors._getRooms()).length.should.equal(1);
        done();
    });

    it("should send a message even though maxMembers not met", function (done) {
        sockets[0].once('new message', function (data) {
            data.message.should.equal('hello');
            data.name.should.equal("user1");
            done();
        });

        sockets[1].emit("say", {message: "hello"});
    })
});