function BrownTank (game, x, y) {
	this.body = game.add.sprite(x, y, 'browntankbody');
	this.head = game.add.sprite(0, 0, 'browntankhead');
	game.physics.arcade.enable(this.body);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.body.addChild(this.head);

	this.setHeadAngle = function (angle) { this.head.angle = angle; }

	this.act = function () {
		//console.log(this.head.angle);
		//this.setHeadAngle(this.head.angle + 1);
		//this.setHeadAngle(moveAngleTo(this.head.angle, -10));
	}
}

// Attempts to find fastest way to move to angle b
function moveAngleTo (a, b) {
	
	if (b - a > ROTATION_SPEED * 2) {
		//console.log(-(180 - a) + " " + b);
		var realA = (a < 0) ? a + 360 : a;
		var realB = (b < 0) ? b + 360 : b;
		console.log("Real a: " + realA + " and real b: " + realB);	

		var rotClockwise = Math.abs(realB - realA);
		var rotCounterClockwise = 360 - rotClockwise;
		if (rotClockwise <= rotCounterClockwise) { return a - ROTATION_SPEED; }
		else return a + ROTATION_SPEED;
	}
	else return a;
}