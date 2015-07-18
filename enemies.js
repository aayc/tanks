function BrownTank (game, x, y) {

	this.body = game.add.sprite(x, y, 'browntankbody');
	this.head = game.add.sprite(0, 0, 'browntankhead');
	game.physics.arcade.enable(this.body);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.body.addChild(this.head);
	this.body.parentFcn = this;
	this.gameObjType = "BROWN TANK";

	this.patrols = true;
	this.dir = 1;
	this.goalRot = 0;
	this.numBullets = 0;
	this.maxBullets = 1;
	this.dead = false;

	this.patrol = function () {
		if (this.dead) return;

		rotateTo(this.head, this.goalRot, 800).onComplete.add(function () {
			this.dir *= -1;
			this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
			this.goalRot = getRadTo(player.heart.x, player.heart.y, this.body.x, this.body.y) + this.dir;
			this.patrol();
		}, this);
	}

	this.act = function () {
		if (shouldFire(this.body.x, this.body.y, this.head.rotation, 1) && this.numBullets < this.maxBullets) {
			fire(this.body.x, this.body.y, this.head.rotation, this);
		}
	}

	this.move = function () {}

	this.die = function () { 
		this.head.kill();
      this.body.kill();
		this.dead = true; 
	}
}

function GrayTank (game, x, y) {
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
	this.maxBullets = 1;
	this.seePlayer = false;
	this.direction = getRandomRotation();

	this.patrol = function () {
		if (this.dead) return;

		if (this.seePlayer) {
			this.goalRot = getRadTo(player.heart.x, player.heart.y, this.heart.x, this.heart.y);
			rotateTo(this.head, this.goalRot, 400).onComplete.add(function () {
				this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
				this.patrol();
			}, this);
		}
		else {
			rotateTo(this.head, getRandomRotation(), 800).onComplete.add(function () {
				this.head.rotation = Phaser.Math.wrapAngle(this.head.rotation, true);
				this.patrol();
			}, this);
		}
	}

	this.act = function () {
		if (shouldFire(this.heart.x, this.heart.y, this.head.rotation, 1) && this.numBullets < this.maxBullets) {
			fire(this.heart.x, this.heart.y, this.head.rotation, this);
		}
	}

	this.move = function () {
		var rayToPlayer = new Phaser.Line(this.heart.x, this.heart.y, player.heart.x, player.heart.y);
		var intersect = getWallIntersection(rayToPlayer);
		this.seePlayer = (intersect == null);
		if (this.seePlayer) {
			this.heart.body.velocity.x = 0;
			this.heart.body.velocity.y = 0;
			return;
		}
		else {
			this.heart.body.velocity.x = 0.4 * MOVEMENT_SPEED * Math.cos(this.direction);
			this.heart.body.velocity.y = 0.4 * MOVEMENT_SPEED * Math.sin(this.direction);
			var rayForward = new Phaser.Line(this.heart.x, this.heart.y, Math.cos(this.direction) * 500 + x, Math.sin(this.direction) * 500 + y);
			var wallIntersect = getWallIntersection(rayForward);

			var distance = 0;
			if (wallIntersect != null) distance = game.math.distance(this.heart.x, this.heart.y, wallIntersect.x, wallIntersect.y);

			if (distance < 200 || Math.random() < 0.2) {
				// Explore
				this.direction = getRandomRotation();
				dualRotateTo(this.body, this.direction, 100).onComplete.add(function () {
					this.heart.body.velocity.x = 0.4 * MOVEMENT_SPEED * Math.cos(this.direction);
					this.heart.body.velocity.y = 0.4 * MOVEMENT_SPEED * Math.sin(this.direction);
				}, this);
			}
			
		}
	}
	

	this.die = function () { 
		this.head.kill();
      this.body.kill();
      this.heart.kill();
		this.dead = true; 
	}
}

