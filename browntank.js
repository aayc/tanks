function BrownTank (game, x, y) {
	this.body = game.add.sprite(x, y, 'browntankbody');
	this.head = game.add.sprite(0, 0, 'browntankhead');
	game.physics.arcade.enable(this.body);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.body.addChild(this.head);
	this.angleTween = null;

	this.setHeadAngle = function (angle) { this.head.angle = angle; }

	this.act = function () {
		if (playerInSight(this.body) && (this.angleTween == null || !this.angleTween.isRunning)) {

			var goalAngle = Math.atan2(player.body.y - this.body.y, player.body.x - this.body.x) * 180 / Math.PI;
			if (this.head.angle < -90 && this.head.angle >= -180 && goalAngle < 180 && goalAngle > 90) goalAngle = '-' + (180 - goalAngle + -(-180 - this.head.angle));
			else if (goalAngle < -90 && goalAngle >= -180 && this.head.angle < 180 && this.head.angle > 90) goalAngle = '+' + (180 - this.head.angle + -(-180 - goalAngle));

			this.angleTween = game.add.tween(this.head).to( {angle: goalAngle}, 1000, "Linear", true);
		}
	}
}

function playerInSight (enemy) {
	var ray = new Phaser.Line(player.body.x, player.body.y, enemy.x, enemy.y);
	var intersect = getWallIntersection(ray);
	return !intersect;
}

function getWallIntersection (ray) {
	var distanceToWall = Number.POSITIVE_INFINITY;
   var closestIntersection = null;

   this.walls.forEach(function(wall) {
       // Create an array of lines that represent the four edges of each wall
		var lines = [
			new Phaser.Line(wall.x, wall.y, wall.x + wall.width, wall.y),
			new Phaser.Line(wall.x, wall.y, wall.x, wall.y + wall.height),
			new Phaser.Line(wall.x + wall.width, wall.y,
			wall.x + wall.width, wall.y + wall.height),
			new Phaser.Line(wall.x, wall.y + wall.height,
			wall.x + wall.width, wall.y + wall.height)
		];
		//console.log(lines[0].start + " and " + lines[0].end);
		// Test each of the edges in this wall against the ray.
		// If the ray intersects any of the edges then the wall must be in the way.
		for(var i = 0; i < lines.length; i++) {
			var intersect = Phaser.Line.intersects(ray, lines[i]);
			if (intersect) {
				// Find the closest intersection
				distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
				if (distance < distanceToWall) {
					distanceToWall = distance;
					closestIntersection = intersect;
				}
			}
			}
		}, this);

		return closestIntersection;
}