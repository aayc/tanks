function BrownTank (id, game, x, y) {
	this.id = id;
	this.heart = game.add.sprite(x, y, 'tankcenter');
	this.body = this.heart.addChild(game.add.sprite(0, 0, 'browntankbody'));
	this.head = this.heart.addChild(game.add.sprite(0, 0, 'browntankhead'));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.heart.parentFcn = this;
	this.gameObjType = "BROWN TANK";

	this.patrols = true;
	this.dir = 0.5;
	this.goalRot = 0;
	this.numBullets = 0;
	this.maxBullets = 1;
	this.rotDelay = 800;
	this.dead = false;


	this.patrol = function () {
		if (this.dead) return;

		rotateTo(this.head, this.goalRot, this.rotDelay).onComplete.add(function () {
			this.dir *= -1;
			this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
			this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y) + this.dir;
			this.patrol();
		}, this);
	}

	this.act = function () {
		if (shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1) && this.numBullets < this.maxBullets) {
			var params = {
				x: this.heart.x,
				y: this.heart.y,
				rot: this.head.rotation,
				numBounces: 1,
				speed: SLOW_BULLET_SPEED
			}
			fire(params, this, true);
		}
	}

	this.move = function () {}
	this.explore = function () {}

	this.die = function () { 
		this.head.kill();
      this.body.kill();
      this.heart.kill();
		this.dead = true; 
	}
}

function GrayTank (id, game, x, y) {
	this.id = id;
	this.heart = game.add.sprite(x, y, 'tankcenter')
	this.body = this.heart.addChild(game.add.sprite(0, 0, 'graytankbody'));
	this.head = this.heart.addChild(game.add.sprite(0, 0, 'graytankhead'));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	
	this.heart.parentFcn = this;
	this.gameObjType = "GRAY TANK";

	this.patrols = true;
	this.goalRot = 0;
	this.numBullets = 0;
	this.maxBullets = 2;
	this.seePlayer = false;
	this.direction = getRandomRotation();
	this.movSpeed = 50;
	this.rotDelay = 800;
	this.bulletDelay = 0;
	this.bulletDelayRequirement = 6;
	this.body.rotation = this.direction;

	this.multiplayerIx = -1;

	this.patrol = function () {
		if (this.dead) return;

		if (this.seePlayer) this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
		else this.goalRot = getRandomRotation();

		rotateTo(this.head, this.goalRot, this.rotDelay - (this.seePlayer ? 400 : 0)).onComplete.add(function () {
			this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
			this.patrol();
		}, this);
		
	}

	this.act = function () {
		this.bulletDelay += 1;
		if (this.numBullets < this.maxBullets && this.bulletDelay > this.bulletDelayRequirement && 
			shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
			var params = {
				x: this.heart.x,
				y: this.heart.y,
				rot: this.head.rotation,
				numBounces: 1,
				speed: SLOW_BULLET_SPEED
			}
			fire(params, this, true);
			this.bulletDelay = 0;
		}
	}

	this.move = function () {
		var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
		var intersect = getWallIntersection(rayToPlayer);
		this.seePlayer = (intersect == null);

		if (this.distanceToForwardWall(this.direction) < 100 || Math.random() < 0.1) {
			this.explore();
		}
	}

	this.distanceToForwardWall = function (direction) {
		var rayForward = new Phaser.Line(this.heart.x, this.heart.y, Math.cos(direction) * 1000 + x, Math.sin(direction) * 1000 + y);
		var wallIntersect = getWallIntersection(rayForward);

		var distance = 500;
		if (wallIntersect != null) distance = game.math.distance(this.heart.x, this.heart.y, wallIntersect.x, wallIntersect.y);
		return distance;
	}

	this.explore = function () {
		var dir1 = getRandomRotation();
		var dir2 = getRandomRotation();
		this.direction = this.distanceToForwardWall(dir1) > this.distanceToForwardWall(dir2) ? dir1 : dir2;
		this.heart.body.velocity.x = 0;
		this.heart.body.velocity.y = 0;

		dualRotateTo(this.body, this.direction, this.rotDelay).onComplete.add(function () {
			this.heart.body.velocity.x = this.movSpeed * Math.cos(this.direction);
			this.heart.body.velocity.y = this.movSpeed * Math.sin(this.direction);
		}, this);
	}
	

	this.die = function () { 
		this.head.kill();
      this.body.kill();
      this.heart.kill();
		this.dead = true; 
	}

	this.explore();
}

function TealTank (id, game, x, y) {
	this.id = id;
	this.heart = game.add.sprite(x, y, 'tankcenter')
	this.body = this.heart.addChild(game.add.sprite(0, 0, 'tealtankbody'));
	this.head = this.heart.addChild(game.add.sprite(0, 0, 'tealtankhead'));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	
	this.heart.parentFcn = this;
	this.gameObjType = "TEAL TANK";
	this.state = "PATHFIND";

	this.patrols = true;
	this.goalRot = 0;
	this.numBullets = 0;
	this.maxBullets = 1;
	this.seePlayer = false;
	this.direction = getRandomRotation();
	this.movSpeed = 60;
	this.rotDelay = 600;
	this.bulletDelay = 3;
	this.bulletDelayRequirement = 10;
	this.body.rotation = this.direction;
	this.wayPoints = [];

	this.wayIx = 0;
	this.onTheWay = false;
	this.prevDistance = 10000;

	this.patrol = function () {
		if (this.dead) return;

		if (this.seePlayer) this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
		else this.goalRot = getRandomRotation();

		rotateTo(this.head, this.goalRot, this.rotDelay - (this.seePlayer ? 300 : 0)).onComplete.add(function () {
			this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
			this.patrol();
		}, this);
	}

	this.act = function () {
		if (this.bulletDelay < this.bulletDelayRequirement) this.bulletDelay += 1;
		if (this.numBullets < this.maxBullets && this.bulletDelay >= this.bulletDelayRequirement && shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
			var params = {
				x: this.heart.x,
				y: this.heart.y,
				rot: this.head.rotation,
				numBounces: 0,
				speed: FAST_BULLET_SPEED
			}
			fire(params, this, true);
			this.bulletDelay = 0;
		}
	}

	this.move = function () {
		if (this.state == "PATHFIND") {
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
					this.state = "PATHFIND";
				}
				var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
				var intersect = getWallIntersection(rayToPlayer);
				this.seePlayer = (intersect == null);

				var distance = game.math.distance(this.heart.x, this.heart.y, this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1]);
				if (distance <= 100) {
					this.wayIx++;
					this.prevDistance = 10000;
					this.onTheWay = false;
					if (this.wayIx == this.wayPoints.length) this.state = "PATHFIND";
				}
				else this.prevDistance = distance;
			}
		}
	}
	
	this.explore = function () { this.move(); }
	this.die = function () { 
		this.head.kill();
      this.body.kill();
      this.heart.kill();
		this.dead = true; 
	}
}

function CircleTank (id, game, x, y) {
	this.heart = game.add.sprite(x, y, 'tankcenter')
	this.body = this.heart.addChild(game.add.sprite(0, 0, 'circletankbody'));
	this.head = this.heart.addChild(game.add.sprite(0, 0, 'circletankhead'));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	
	this.heart.parentFcn = this;
	this.gameObjType = "CIRCLE TANK";
	this.state = "PATHFIND";

	this.patrols = true;
	this.numBullets = 0;
	this.maxBullets = 1;
	this.seePlayer = false;
	this.direction = getRandomRotation();
	this.movSpeed = 100;
	this.rotDelay = 100;
	this.bulletDelay = 10;
	this.bulletDelayRequirement = 12;
	this.wayPoints = [];

	this.wayIx = 0;
	this.onTheWay = false;
	this.prevDistance = 10000;

	this.patrol = function () {
		if (this.dead) return;

		if (this.seePlayer) this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
		else this.goalRot = getRandomRotation();

		rotateTo(this.head, this.goalRot, this.rotDelay).onComplete.add(function () {
			this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
			this.patrol();
		}, this);
	}

	this.act = function () {
		this.bulletDelay += 1;
		if (this.numBullets < this.maxBullets && this.bulletDelay > this.bulletDelayRequirement && shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
			var params = {
				x: this.heart.x,
				y: this.heart.y,
				rot: this.head.rotation,
				numBounces: 0,
				speed: FAST_BULLET_SPEED
			}
			fire(params, this, true);
			this.bulletDelay = 0;
		}
	}

	this.move = function () {
		if (this.state == "PATHFIND") {
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
					this.state = "PATHFIND";
				}
				var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
				var intersect = getWallIntersection(rayToPlayer);
				this.seePlayer = (intersect == null);

				var distance = game.math.distance(this.heart.x, this.heart.y, this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1]);
				if (distance <= 100) {
					this.wayIx++;
					this.prevDistance = 10000;
					this.onTheWay = false;
					if (this.wayIx == this.wayPoints.length) this.state = "PATHFIND";
				}
				else this.prevDistance = distance;
			}
		}
	}
	
	this.explore = function () { this.move(); }
	this.die = function () { 
		this.heart.kill();
		this.head.kill();
      	this.body.kill();
		this.dead = true; 
	}
}

function BlueTank (id, game, x, y) {
	this.id = id;
	this.heart = game.add.sprite(x, y, 'tankcenter');
	this.body = this.heart.addChild(game.add.sprite(0, 0, 'bluetankbody'));
	this.head = this.heart.addChild(game.add.sprite(0, 0, 'bluetankhead'));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	
	this.heart.parentFcn = this;
	this.gameObjType = "BLUE TANK";
	this.state = "PATHFIND";

	this.patrols = true;
	this.goalRot = 0;
	this.numBullets = 0;
	this.maxBullets = 5;
	this.seePlayer = false;
	this.direction = getRandomRotation();
	this.movSpeed = 120;
	this.rotDelay = 500;
	this.bulletDelay = 0;
	this.bulletDelayRequirement = 4;
	this.body.rotation = this.direction;
	this.wayPoints = [];

	this.wayIx = 0;
	this.onTheWay = false;
	this.prevDistance = 10000;\

	this.patrol = function () {
		if (this.dead) return;

		if (this.seePlayer) this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
		else this.goalRot = getRandomRotation();

		rotateTo(this.head, this.goalRot, this.rotDelay).onComplete.add(function () {
			this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
			this.patrol();
		}, this);
	}

	this.act = function () {
		this.bulletDelay += 1;
		if (this.numBullets < this.maxBullets && this.bulletDelay > this.bulletDelayRequirement && shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1)) {
			var params = {
				x: this.heart.x,
				y: this.heart.y,
				rot: this.head.rotation,
				numBounces: 1,
				speed: SLOW_BULLET_SPEED
			}
			fire(params, this, true);
			this.bulletDelay = 0;
		}
	}

		this.move = function () {
		if (this.state == "PATHFIND") {
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
					this.state = "PATHFIND";
				}
				var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
				var intersect = getWallIntersection(rayToPlayer);
				this.seePlayer = (intersect == null);

				var distance = game.math.distance(this.heart.x, this.heart.y, this.wayPoints[this.wayIx][0], this.wayPoints[this.wayIx][1]);
				if (distance <= 100) {
					this.wayIx++;
					this.prevDistance = 10000;
					this.onTheWay = false;
					if (this.wayIx == this.wayPoints.length) this.state = "PATHFIND";
				}
				else this.prevDistance = distance;
			}
		}
	}
	
	this.explore = function () { this.move(); }
	this.die = function () { 
		this.head.kill();
      	this.body.kill();
      	this.heart.kill();
		this.dead = true; 
	}
}

function GreenTank (id, game, x, y) {
	this.id = id;
	this.heart = game.add.sprite(x, y, 'tankcenter');
	this.body = this.heart.addChild(game.add.sprite(0, 0, 'greentankbody'));
	this.head = this.heart.addChild(game.add.sprite(0, 0, 'greentankhead'));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	
	this.heart.parentFcn = this;

	this.patrols = true;
	this.dir = 0.5;
	this.goalRot = 0;
	this.numBullets = 0;
	this.maxBullets = 2;
	this.rotDelay = 800;
	this.dead = false;

	this.patrol = function () {
		if (this.dead) return;

		rotateTo(this.head, this.goalRot, this.rotDelay).onComplete.add(function () {
			this.dir *= -1;
			this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
			this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y) + this.dir;
			this.patrol();
		}, this);
	}

	this.act = function () {
		if (shouldFire(this.heart.x, this.heart.y, this.head.rotation, 4) && this.numBullets < this.maxBullets) {
			var params = {
				x: this.heart.x,
				y: this.heart.y,
				rot: this.head.rotation,
				numBounces: 3,
				speed: FAST_BULLET_SPEED + 30
			}
			fire(params, this, true);
		}
	}

	this.move = function () {}
	this.explore = function () {}
	this.die = function () { 
		this.heart.kill();
		this.head.kill();
      	this.body.kill();
		this.dead = true; 
	}
}