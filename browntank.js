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
	this.rotTween = null;

	this.patrol = function () {
		var raw = getRadTo(player.body.x, player.body.y, this.body.x, this.body.y);
		this.head.rotation = lerp_dir(this.head.rotation, raw, 0.2);
		/*this.rotTween = getTweenToRotation (raw + this.dir * 0.4, this.head, Math.abs(raw + this.dir * 0.4 - this.head.rotation) * 500);
		this.rotTween.onComplete.add(function () { 
			this.target.dir = -this.target.dir; 
			this.target.patrol(); 
		}, {target: this, player: player});*/
	}

	// Operating off of timer
	this.act = function () {
		if (shouldFire(this.body.x, this.body.y, this.head.rotation, 1)) {
			fire(this.body.x, this.body.y, this.head.rotation);
		}
	}
}


function getTweenToRotation (goalRot, obj, time) {
	if (4.56789 < -1.57079 && 4.56789 >= -3.1415 && goalRot < 3.1415 && goalRot > 0.78539) { console.log("here"); goalRot = '-' + (6.28318 - goalRot + 4.56789); }
	else if (goalRot < -1.57079 && goalRot >= -3.1415 && 4.56789 < 3.1415 && 4.56789 > 0.78539) goalRot = '+' + (6.28318 - 4.56789 + goalRot);
	console.log(4.56789);
	return game.add.tween(obj).to( {rotation: goalRot}, time, "Linear", true);
}

function getRadTo (x1, y1, x2, y2) {
	return Math.atan2(y1 - y2, x1 - x2);
}

function shouldFire (x, y, rotation, numBouncesLeft) {
	var ray = new Phaser.Line(x, y, Math.cos(rotation) * 5000 + x, Math.sin(rotation) * 5000 + y);
	var playerIntersect = getPlayerIntersect(ray);

	if (playerIntersect) {
		//var rayToPlayer = new Phaser.Line(x, y, playerIntersect.x, playerIntersect.y);
		//var intersect = getWallIntersection(rayToPlayer);
		return true;//!intersect;
	}
	else {
		/*if (numBouncesLeft > 0) {
			var intersect = getWallIntersection(ray);
			return shouldFire(intersect.x, intersect.y, )
		}
		else return false;*/
		return false;
	}
}

function lerp_dir (cur_dir, tar_dir, inc)
{	
	if ( Math.abs( tar_dir - cur_dir) <= inc || Math.abs( tar_dir - cur_dir) >= (2 * Math.PI - inc)) cur_dir = tar_dir;
	else if ( Math.abs( tar_dir - cur_dir) > Math.PI)
	{
		tar_dir += (tar_dir < cur_dir) ? 2 * Math.PI : -2 * Math.PI;
	}

	console.log("here");

	if ( tar_dir > cur_dir) cur_dir += inc;
	else if ( tar_dir < cur_dir) cur_dir -= inc;
	
	return cur_dir;
}

function getPlayerIntersect (ray) {
	var left = player.body.x - player.body.width * 0.5;
	var right = player.body.x + player.body.width * 0.5;
	var top = player.body.y - player.body.height * 0.5;
	var bottom = player.body.y + player.body.height * 0.5;

	var lines = [
		new Phaser.Line (left, top, left, bottom),
		new Phaser.Line (left, top, right, top),
		new Phaser.Line (right, bottom, left, bottom),
		new Phaser.Line (right, bottom, right, top)
	]

	for (var i = 0; i < lines.length; i++) {
		var intersect = Phaser.Line.intersects(ray, lines[i]);
		if (intersect) { return intersect; }
	}

	return null;
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