function EnemyTank (game, settings) {
	this.dead = false;
	this.id = settings.id;
	this.numBullets = 0;
	this.maxBullets = settings.maxBullets;
	this.bulletDelay = 0;
	this.bulletDelayRequired = settings.bulletDelayRequired;
	this.rotDelay = settings.rotDelay;
	this.gameObjType = settings.gameObjType;
	this.heart = game.add.sprite(settings.x, settings.y, 'tankcenter');
	this.body = this.heart.addChild(game.add.sprite(0, 0, settings.spriteBodyName));
	this.head = this.heart.addChild(game.add.sprite(0, 0, settings.spriteHeadName));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.heart.parentFcn = this;
}

EnemyTank.prototype.explore = function () {
}

EnemyTank.prototype.die = function () {
	this.head.kill();
	this.body.kill();
	this.heart.kill();
	this.dead = true; 
}

function inherit(childObject, parentObject) {
	var copyOfParent = Object.create(parentObject.prototype);
	copyOfParent.constructor = childObject;
	childObject.prototype = copyOfParent;
}


/* BROWN TANK */
function BrownTank(id, game, x, y) {
	var settings = {
		x: x, y: y, id: id,
		maxBullets: 1,
		rotDelay: 800,
		bulletDelayReqired: 0,
		gameObjType: "BROWN TANK",
		spriteBodyName: "browntankbody",
		spriteHeadName: "browntankhead"
	}
	this.patrols = true;
	this.dir = 0.5;
	this.goalRot = 0;
	EnemyTank.call(this, game, settings);
}
inherit(BrownTank, EnemyTank);
BrownTank.prototype.patrol = function () {
	if (this.dead) return;

	if (isMultiplayer) {
		socket.emit('tell', {
			msg: "enemy update head r", 
			id: this.id, goalRot: this.goalRot, 
			curRot: this.head.rotation,
			rotDel: this.rotDelay
		});
	}

	rotateTo(this.head, this.goalRot, this.rotDelay).onComplete.add(function () {
		this.dir *= -1;
		this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
		var p = getClosestPlayerTo(this.heart.x, this.heart.y, players);
		this.goalRot = getRadTo(p.heart.x, p.heart.y, this.heart.x, this.heart.y) + this.dir;
		this.patrol();
	}, this);
}
BrownTank.prototype.move = function () {}
BrownTank.prototype.act = function () {
	if (shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1) && this.numBullets < this.maxBullets) {
		var params = {
			x: this.heart.x,
			y: this.heart.y,
			rot: this.head.rotation,
			numBounces: 1,
			speed: SLOW_BULLET_SPEED
		}
		fire(params, this);
	}
}

/* GRAY TANK */
function GrayTank (id, game, x, y) {
	var settings = {
		x: x, y: y, id: id,
		maxBullets: 2,
		rotDelay: 800,
		gameObjType: "GRAY TANK",
		spriteBodyName: "graytankbody",
		spriteHeadName: "graytankhead",
		bulletDelayRequired: 6
	};
	this.patrols = true;
	this.direction = getRandomRotation();
	this.seePlayer = null;
	this.movSpeed = 50;
	EnemyTank.call(this, game, settings);
	this.body.rotation = this.direction;
	
}
inherit(GrayTank, EnemyTank);
GrayTank.prototype.patrol = function () {
	if (this.dead) return;

	if (this.seePlayer !== null) this.goalRot = getRadTo(this.seePlayer.heart.x, this.seePlayer.heart.y, this.heart.x, this.heart.y);
	else this.goalRot = getRandomRotation();

	if (isMultiplayer) {
		socket.emit('tell', {
			msg: "enemy update head r", 
			id: this.id, goalRot: this.goalRot, 
			curRot: this.head.rotation,
			rotDel: this.rotDelay - (this.seePlayer ? 400 : 0)
		});
	}

	rotateTo(this.head, this.goalRot, this.rotDelay - (this.seePlayer ? 400 : 0)).onComplete.add(function () {
		this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
		this.patrol();
	}, this);
}
GrayTank.prototype.act = function () {
	if (this.numBullets < this.maxBullets) this.bulletDelay += 1;
	if (this.numBullets < this.maxBullets && this.bulletDelay > this.bulletDelayRequired && 
		shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
		var params = {
			x: this.heart.x,
			y: this.heart.y,
			rot: this.head.rotation,
			numBounces: 1,
			speed: SLOW_BULLET_SPEED
		}
		fire(params, this);
		this.bulletDelay = 0;
	}
}
GrayTank.prototype.move = function () {
	this.seePlayer = getPlayerInSight(this.heart.x, this.heart.y, players);
	var distance = Math.min(getDistanceToForwardWall(this.heart.x, this.heart.y, this.direction),
					    	getDistanceToForwardWall(this.heart.x, this.heart.y, this.direction + Math.PI/4),
					   		getDistanceToForwardWall(this.heart.x, this.heart.y, this.direction - Math.PI/4));
	if (distance < 100 || Math.random() < 0.1) {
		this.explore();
	}
}
GrayTank.prototype.explore = function () {
	this.direction = getRandomRotation();
	this.heart.body.velocity.x = 0;
	this.heart.body.velocity.y = 0;

	if (isMultiplayer) {
		socket.emit('tell', {
			msg: "enemy update v",
			id: this.id,
			vx: 0, vy: 0,
			x: this.heart.x, y: this.heart.y
		});

		socket.emit('tell', {
			msg: "enemy update body r",
			id: this.id, goalRot: this.direction,
			rotDel: this.rotDelay,
			curRot: this.body.rotation
		});
	}

	dualRotateTo(this.body, this.direction, this.rotDelay).onComplete.add(function () {
		this.heart.body.velocity.x = this.movSpeed * Math.cos(this.direction);
		this.heart.body.velocity.y = this.movSpeed * Math.sin(this.direction);
		if (isMultiplayer) {
			socket.emit('tell', {
				msg: "enemy update v",
				id: this.id, x: this.heart.x, y: this.heart.y,
				vx: this.heart.body.velocity.x,
				vy: this.heart.body.velocity.y
			});
		}
	}, this);
}

/* TEAL TANK */
function TealTank(id, game, x, y) {
	var settings = {
		x: x, y: y, id: id,
		maxBullets: 1,
		rotDelay: 800,
		bulletDelayRequired: 8,
		gameObjType: "TEAL TANK",
		spriteBodyName: "tealtankbody",
		spriteHeadName: "tealtankhead"
	}
	this.patrols = true;
	this.goalRot = 0;
	this.movSpeed = 50;
	this.seePlayer = false;
	this.direction = getRandomRotation();

	this.wayPoints = [];
	this.onTheWay = false;
	this.prevDistance = 10000;
	this.state = "PATH";

	EnemyTank.call(this, game, settings);
	this.body.rotation = this.direction;
}
inherit(TealTank, EnemyTank);
TealTank.prototype.patrol = function () {
	if (this.dead) return;

	if (this.seePlayer) this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
	else this.goalRot = getRandomRotation();

	rotateTo(this.head, this.goalRot, this.rotDelay - (this.seePlayer ? 300 : 0)).onComplete.add(function () {
		this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
		this.patrol();
	}, this);
}

TealTank.prototype.move = function () {
	if (this.state == "PATH") {
		this.wayPoints = [];
		this.wayIx = 0;
		this.onTheWay = false;
		this.prevDistance = 10000;
		var myCoords = getLayoutPositionFromXY(this.heart.x, this.heart.y);
		var closestPlayer = getClosestPlayerTo(this.heart.x, this.heart.y, players);
		var playerCoords = getLayoutPositionFromXY(closestPlayer.heart.x, closestPlayer.heart.y);
		pathfind.findPath(myCoords[0], myCoords[1], playerCoords[0], playerCoords[1], (function (path) {
			var modW = WALL_WIDTH / 2;
			var modH = WALL_HEIGHT / 2;
			var lastDir = -10;
			for (var i = 0; i < path.length; i ++) {
				if (i > 0) {
					var thisDir = Math.atan((path[i].y - path[i - 1].y) / parseFloat(path[i].x - path[i - 1].x));
					if (Math.abs(thisDir - lastDir) < 0.2) {
						lastDir = thisDir;
						continue;
					}
					lastDir = thisDir;
				}
				this.wayPoints.push([path[i].x * WALL_WIDTH + modW, path[i].y * WALL_HEIGHT + modH]);
			}
			this.wayIx = 0;
			this.onTheWay = false;
			this.state = "SEEK";
		}).bind(this));
		pathfind.calculate();
		
	}
	else if (this.state == "SEEK") {
		if (!this.onTheWay) {
			this.direction = getRadTo(this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1], this.heart.x, this.heart.y);
			this.heart.body.velocity.x = 0;
			this.heart.body.velocity.y = 0;
			dualRotateTo(this.body, this.direction, this.rotDelay).onComplete.add(function () {
				this.heart.body.velocity.x = this.movSpeed * Math.cos(this.direction);
				this.heart.body.velocity.y = this.movSpeed * Math.sin(this.direction);
			}, this);
			this.onTheWay = true;
		}
		else {
			var rand = Math.random();
			if (Math.random () < 0.2) {
				this.state = "PATH";
			}
			var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
			var intersect = getWallIntersection(rayToPlayer);
			this.seePlayer = (intersect == null);

			var distance = game.math.distance(this.heart.x, this.heart.y, this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1]);
			if (distance <= 100) {
				this.wayIx++;
				this.prevDistance = 10000;
				this.onTheWay = false;
				if (this.wayIx == this.wayPoints.length) this.state = "PATH";
			}
			else this.prevDistance = distance;
		}
	}
}

TealTank.prototype.act = function () {
	if (this.numBullets < this.maxBullets && this.bulletDelay < this.bulletDelayRequired) {
		this.bulletDelay += 1;
	}
	if (this.bulletDelay >= this.bulletDelayRequired && shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
		var params = {
			x: this.heart.x,
			y: this.heart.y,
			rot: this.head.rotation,
			numBounces: 0,
			speed: FAST_BULLET_SPEED
		}
		fire(params, this);
		this.bulletDelay = 0;
	}
}

/* BLUE TANK */
function BlueTank(id, game, x, y) {
	var settings = {
		x: x, y: y, id: id,
		maxBullets: 1,
		rotDelay: 600,
		bulletDelayRequired: 5,
		gameObjType: "BLUE TANK",
		spriteBodyName: "bluetankbody",
		spriteHeadName: "bluetankhead"
	}
	this.patrols = true;
	this.goalRot = 0;
	this.movSpeed = 70;
	this.seePlayer = false;
	this.direction = getRandomRotation();

	this.wayPoints = [];
	this.onTheWay = false;
	this.prevDistance = 10000;
	this.state = "PATH";

	EnemyTank.call(this, game, settings);
	this.body.rotation = this.direction;
}
inherit(BlueTank, EnemyTank);
BlueTank.prototype.patrol = function () {
	if (this.dead) return;

	if (this.seePlayer) this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
	else this.goalRot = getRandomRotation();

	rotateTo(this.head, this.goalRot, this.rotDelay - (this.seePlayer ? 300 : 0)).onComplete.add(function () {
		this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
		this.patrol();
	}, this);
}

BlueTank.prototype.move = function () {
	if (this.state == "PATH") {
		this.wayPoints = [];
		this.wayIx = 0;
		this.onTheWay = false;
		this.prevDistance = 10000;
		var myCoords = getLayoutPositionFromXY(this.heart.x, this.heart.y);
		var closestPlayer = getClosestPlayerTo(this.heart.x, this.heart.y, players);
		var playerCoords = getLayoutPositionFromXY(closestPlayer.heart.x, closestPlayer.heart.y);
		pathfind.findPath(myCoords[0], myCoords[1], playerCoords[0], playerCoords[1], (function (path) {
			var modW = WALL_WIDTH / 2;
			var modH = WALL_HEIGHT / 2;
			var lastDir = -10;
			for (var i = 0; i < path.length; i ++) {
				if (i > 0) {
					var thisDir = Math.atan((path[i].y - path[i - 1].y) / parseFloat(path[i].x - path[i - 1].x));
					if (Math.abs(thisDir - lastDir) < 0.2) {
						lastDir = thisDir;
						continue;
					}
					lastDir = thisDir;
				}
				this.wayPoints.push([path[i].x * WALL_WIDTH + modW, path[i].y * WALL_HEIGHT + modH]);
			}
			this.wayIx = 0;
			this.onTheWay = false;
			this.state = "SEEK";
		}).bind(this));
		pathfind.calculate();
		
	}
	else if (this.state == "SEEK") {
		if (!this.onTheWay) {
			this.direction = getRadTo(this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1], this.heart.x, this.heart.y);
			this.heart.body.velocity.x = 0;
			this.heart.body.velocity.y = 0;
			dualRotateTo(this.body, this.direction, this.rotDelay).onComplete.add(function () {
				this.heart.body.velocity.x = this.movSpeed * Math.cos(this.direction);
				this.heart.body.velocity.y = this.movSpeed * Math.sin(this.direction);
			}, this);
			this.onTheWay = true;
		}
		else {
			var rand = Math.random();
			if (Math.random () < 0.2) {
				this.state = "PATH";
			}
			var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
			var intersect = getWallIntersection(rayToPlayer);
			this.seePlayer = (intersect == null);

			var distance = game.math.distance(this.heart.x, this.heart.y, this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1]);
			if (distance <= 100) {
				this.wayIx++;
				this.prevDistance = 10000;
				this.onTheWay = false;
				if (this.wayIx == this.wayPoints.length) this.state = "PATH";
			}
			else this.prevDistance = distance;
		}
	}
}

BlueTank.prototype.act = function () {
	if (this.numBullets < this.maxBullets && this.bulletDelay < this.bulletDelayRequired) {
		this.bulletDelay += 1;
	}
	if (this.bulletDelay >= this.bulletDelayRequired && shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
		var params = {
			x: this.heart.x,
			y: this.heart.y,
			rot: this.head.rotation,
			numBounces: 1,
			speed: SLOW_BULLET_SPEED
		}
		fire(params, this);
		this.bulletDelay = 0;
	}
}

/* GREEN TANK */
function GreenTank(id, game, x, y) {
	var settings = {
		x: x, y: y, id: id,
		maxBullets: 2,
		rotDelay: 700,
		bulletDelayReqired: 5,
		gameObjType: "GREEN TANK",
		spriteBodyName: "greentankbody",
		spriteHeadName: "greentankhead"
	}
	this.patrols = true;
	this.dir = 0.5;
	this.goalRot = 0;
	EnemyTank.call(this, game, settings);
}
inherit(GreenTank, EnemyTank);
GreenTank.prototype.patrol = function () {
	if (this.dead) return;

	rotateTo(this.head, this.goalRot, this.rotDelay).onComplete.add(function () {
		this.dir *= -1;
		this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
		this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y) + this.dir;
		this.patrol();
	}, this);
}
GreenTank.prototype.move = function () {}
GreenTank.prototype.act = function () {
	if (shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1) && this.numBullets < this.maxBullets) {
		var params = {
			x: this.heart.x,
			y: this.heart.y,
			rot: this.head.rotation,
			numBounces: 3,
			speed: FAST_BULLET_SPEED + 30
		}
		fire(params, this);
	}
}


/* CIRCLE TANK */
function CircleTank(id, game, x, y) {
	var settings = {
		x: x, y: y, id: id,
		maxBullets: 3,
		rotDelay: 600,
		bulletDelayRequired: 1,
		gameObjType: "CIRCLE TANK",
		spriteBodyName: "circletankbody",
		spriteHeadName: "circletankhead"
	}
	this.patrols = true;
	this.goalRot = 0;
	this.movSpeed = 80;
	this.seePlayer = false;
	this.direction = getRandomRotation();

	this.wayPoints = [];
	this.onTheWay = false;
	this.prevDistance = 10000;
	this.state = "PATH";

	EnemyTank.call(this, game, settings);
	this.body.rotation = this.direction;
}
inherit(CircleTank, EnemyTank);
CircleTank.prototype.patrol = function () {
	if (this.dead) return;

	if (this.seePlayer) this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
	else this.goalRot = getRandomRotation();

	rotateTo(this.head, this.goalRot, this.rotDelay - (this.seePlayer ? 300 : 0)).onComplete.add(function () {
		this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
		this.patrol();
	}, this);
}

CircleTank.prototype.move = function () {
	if (this.state == "PATH") {
		this.wayPoints = [];
		this.wayIx = 0;
		this.onTheWay = false;
		this.prevDistance = 10000;
		var myCoords = getLayoutPositionFromXY(this.heart.x, this.heart.y);
		var closestPlayer = getClosestPlayerTo(this.heart.x, this.heart.y, players);
		var playerCoords = getLayoutPositionFromXY(closestPlayer.heart.x, closestPlayer.heart.y);
		pathfind.findPath(myCoords[0], myCoords[1], playerCoords[0], playerCoords[1], (function (path) {
			var modW = WALL_WIDTH / 2;
			var modH = WALL_HEIGHT / 2;
			var lastDir = -10;
			for (var i = 0; i < path.length; i ++) {
				if (i > 0) {
					var thisDir = Math.atan((path[i].y - path[i - 1].y) / parseFloat(path[i].x - path[i - 1].x));
					if (Math.abs(thisDir - lastDir) < 0.2) {
						lastDir = thisDir;
						continue;
					}
					lastDir = thisDir;
				}
				this.wayPoints.push([path[i].x * WALL_WIDTH + modW, path[i].y * WALL_HEIGHT + modH]);
			}
			this.wayIx = 0;
			this.onTheWay = false;
			this.state = "SEEK";
		}).bind(this));
		pathfind.calculate();
		
	}
	else if (this.state == "SEEK") {
		if (!this.onTheWay) {
			this.direction = getRadTo(this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1], this.heart.x, this.heart.y);
			this.heart.body.velocity.x = this.movSpeed * Math.cos(this.direction);
			this.heart.body.velocity.y = this.movSpeed * Math.sin(this.direction);
			this.onTheWay = true;
		}
		else {
			var rand = Math.random();
			if (Math.random () < 0.2) {
				this.state = "PATH";
			}
			var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
			var intersect = getWallIntersection(rayToPlayer);
			this.seePlayer = (intersect == null);

			var distance = game.math.distance(this.heart.x, this.heart.y, this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1]);
			if (distance <= 100) {
				this.wayIx++;
				this.prevDistance = 10000;
				this.onTheWay = false;
				if (this.wayIx == this.wayPoints.length) this.state = "PATH";
			}
			else this.prevDistance = distance;
		}
	}
}

CircleTank.prototype.act = function () {
	if (this.numBullets < this.maxBullets && this.bulletDelay < this.bulletDelayRequired) {
		this.bulletDelay += 1;
	}
	if (this.bulletDelay >= this.bulletDelayRequired && shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
		var params = {
			x: this.heart.x,
			y: this.heart.y,
			rot: this.head.rotation,
			numBounces: 1,
			speed: SLOW_BULLET_SPEED
		}
		fire(params, this);
		this.bulletDelay = 0;
	}
}