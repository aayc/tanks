function BrownTank (game, x, y) {
	this.PATROL_INCREMENT = 10;

	this.body = game.add.sprite(x, y, 'browntankbody');
	this.head = game.add.sprite(0, 0, 'browntankhead');
	game.physics.arcade.enable(this.body);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.body.addChild(this.head);

	this.patrols = true;
	this.dir = 1;
	this.angleTween = null;

	this.setHeadAngle = function (angle) { this.head.angle = angle; }

	this.act = function () {
		var raw = getAngleTo(player.body.x, player.body.y, this.body.x, this.body.y);

		this.angleTween = getTweenToAngle (raw + this.dir * 50, this.head, Math.abs(raw + this.dir * 20 - this.head.angle) * 20);
		this.angleTween.onComplete.add(function () { 
			this.target.dir = -this.target.dir; 
			if (rayCastSuccess(player.body.x, player.body.y, this.target.body.x, this.target.body.y, 1)) {
				console.log(this.target.head.angle);
				fire(this.target.body.x, this.target.body.y, this.target.head.rotation);//this.target.head.angle);
			}
			else console.log("Miss");
			this.target.act(); 
		}, {target: this, player: player});
	}
}


function getTweenToAngle (goalAngle, obj, time) {
	if (obj.angle < -90 && obj.angle >= -180 && goalAngle < 180 && goalAngle > 45) goalAngle = '-' + (180 - goalAngle + -(-180 - obj.angle));
	else if (goalAngle < -90 && goalAngle >= -180 && obj.angle < 180 && obj.angle > 45) goalAngle = '+' + (180 - obj.angle + -(-180 - goalAngle));
	return game.add.tween(obj).to( {angle: goalAngle}, time, "Linear", true);
}

function getAngleTo (x1, y1, x2, y2) {
	return Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI;
}

function rayCastSuccess (x1, y1, x2, y2, numBouncesLeft) {
	var ray = new Phaser.Line(x1, y1, x2, y2);
	var intersect = getWallIntersection(ray);
	if (intersect && numBouncesLeft > 0) return rayCastSuccess(x1, y1, intersect.x, intersect.y, numBouncesLeft - 1);
	return !intersect;
}
w
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