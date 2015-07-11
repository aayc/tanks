function BrownTank (game, x, y) {
	this.body = game.add.sprite(x, y, 'browntankbody');
	this.head = game.add.sprite(0, 0, 'browntankhead');
	game.physics.arcade.enable(this.body);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.body.addChild(this.head);

	this.setHeadAngle = function (angle) { this.head.angle = angle; }
	this.setVelocity = function (dir, val) {
		this.body.body.velocity[dir] = val;
	}
}
