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

	this.patrol = function () {
		this.head.rotation = lerp_dir(this.head.rotation, this.goalRot, 0.1);
		
		if (this.head.rotation == this.goalRot) {
			this.dir *= -1;
			this.goalRot = Phaser.Math.wrapAngle(getRadTo(player.body.x, player.body.y, this.body.x, this.body.y) + this.dir, true);
		}
	}

	this.act = function () {
		if (shouldFire(this.body.x, this.body.y, this.head.rotation, 1) && this.numBullets < this.maxBullets) {
			fire(this.body.x, this.body.y, this.head.rotation, this);
		}
	}
}

function GrayTank (game, x, y) {
	this.body = game.add.sprite(x, y, 'graytankbody');
	this.head = game.add.sprite(0, 0, 'graytankhead');
	game.physics.arcade.enable(this.body);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.body.addChild(this.head);
	this.body.parentFcn = this;
	this.gameObjType = "GRAY TANK";

	this.patrols = true;
	this.goalRot = 0;
	this.numBullets = 0;
	this.maxBullets = 1;
	this.states = ["BOLD", "GUERILLA", "RETREAT", "CAUTIOUS"];
	this.currentState = "CAUTIOUS";
	this.seePlayer = false;

	this.patrol = function () {
		// MAKE DEPENDENT ON seePlayer
		this.head.rotation = lerp_dir(this.head.rotation, this.goalRot, 0.1);
		if (this.head.rotation == this.goalRot) {
			this.goalRot = getRadTo(player.body.x, player.body.y, this.body.x, this.body.y);
		}

		this.move();
	}

	this.act = function () {
		if (shouldFire(this.body.x, this.body.y, this.head.rotation, 1) && this.numBullets < this.maxBullets) {
			fire(this.body.x, this.body.y, this.head.rotation, this);
		}
	}

	this.move = function () {
		var rayToPlayer = new Phaser.Line(this.body.x, this.body.y, player.body.x, player.body.y);
		var intersect = getWallIntersection(rayToPlayer);
		seePlayer = (intersect == null);
		if (this.currentState == "CAUTIOUS") {
			if (seePlayer) {
				this.body.body.velocity.x = 0;
				this.body.body.velocity.y = 0;
				return;
			}
			else {
				var rayForward = new Phaser.Line(this.body.x, this.body.y, Math.cos(this.body.rotation) * 500 + x, Math.sin(this.body.rotation) * 500 + y);
				var wallIntersect = getWallIntersection(rayForward);
				var distance = Number.POSITIVE_INFINITY;
				if (wallIntersect != null) {
					distance = game.math.distance(this.body.x, this.body.y, wallIntersect.x, wallIntersect.y);
				}
				if (distance < 100) {
					// Explore
					console.log("whatup");
					this.body.body.velocity.x = 0;
					this.body.body.velocity.y = 0;
				}
				else {
					// Continue going forward.
					this.body.body.velocity.x = 0.2 * MOVEMENT_SPEED * Math.cos(this.body.rotation);
					this.body.body.velocity.y = 0.2 * MOVEMENT_SPEED * Math.sin(this.body.rotation);
				}
			}
		}
	}
}

