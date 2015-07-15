function BrownTank (game, x, y) {
	this.PATROL_INCREMENT = 10;

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

