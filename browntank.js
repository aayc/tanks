function BrownTank (game, x, y) {
	this.body = game.add.sprite(x, y, 'browntankbody');
	this.head = game.add.sprite(0, 0, 'browntankhead');
	game.physics.arcade.enable(this.body);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.body.addChild(this.head);

	this.setHeadAngle = function (angle) { this.head.angle = angle; }

	this.act = function () {
		if (playerInSight(this.body)) {
			TweenLite.to(this.head, 3, {
				angle: Math.atan2(player.body.y - this.body.y, player.body.x - this.body.x) * 180 / Math.PI, 
				ease: Linear.easeNone
			});
		}

		//console.log(this.head.angle);
		//this.setHeadAngle(this.head.angle + 1);
		//this.setHeadAngle(moveAngleTo(this.head.angle, -10));
	}
}

function playerInSight (enemy) {
	var ray = new Phaser.Line(player.body.x, player.body.y, enemy.x, enemy.y);
	var intersect = getWallIntersection(ray);
	return intersect;
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