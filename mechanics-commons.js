function getRadTo (x1, y1, x2, y2) {
	return Math.atan2(y1 - y2, x1 - x2);
}

function getRandomRotation () {
	return Math.random () * (2 * Math.PI) - Math.PI;
}

function serverUpdateTankRotation (ix) {
	var tank = enemies[ix];
	var data = {
		ix: ix,
		goalRot: tank.goalRot
	};
	server.updateTankRotation(clientId, data);
}

function shouldFire (x, y, rotation, numBouncesLeft) {
	var ray = new Phaser.Line(x, y, Math.cos(rotation) * 500 + x, Math.sin(rotation) * 500 + y);
	var playerIntersect = getPlayerIntersect(ray);

	if (playerIntersect) {
		var rayToPlayer = new Phaser.Line(x, y, playerIntersect.x, playerIntersect.y);
		var intersect = getWallIntersection(rayToPlayer);
		if (intersect == null) return true;
		if (intersect.x == ray.start.x && intersect.y == ray.start.y) return true;
		return false;
	}
	else {
		if (numBouncesLeft > 0) {
			var intersect = getWallIntersection(ray);
			if (!intersect) { return false; }

			var bounceAngle;
			if (intersect.bounceType == 'H') bounceAngle = -rotation;
			else if (rotation < 0) bounceAngle = -Math.PI - rotation;
			else bounceAngle = Math.PI - rotation;
			return shouldFire(intersect.x, intersect.y, bounceAngle, numBouncesLeft - 1);
		}
		else return false;
	}
}

function dualRotateTo (sprite, tar_dir, delay) {
	var cur_dir = sprite.rotation;
	var clockWise = Math.abs(tar_dir - cur_dir);
	var counterClock = 2 * Math.PI - clockWise;

	var opp_dir = Math.PI - Math.abs(tar_dir);
	if (tar_dir > 0) opp_dir *= -1;
	var oppClock = Math.abs(opp_dir - cur_dir);
	var oppCounter = 2 * Math.PI - oppClock;

	var min = Math.min(Math.min(Math.min(clockWise, counterClock), oppClock), oppCounter);
	if (min == clockWise || min == counterClock) return createTweenToRotation(sprite, cur_dir, tar_dir, clockWise, counterClock, delay);
	else return createTweenToRotation(sprite, cur_dir, opp_dir, oppClock, oppCounter, delay);
}

function rotateTo(sprite, tar_dir, delay) {
	var cur_dir = sprite.rotation;
	var clockWise = Math.abs(tar_dir - cur_dir);
	var counterClock = 2 * Math.PI - clockWise;
	return createTweenToRotation(sprite, cur_dir, tar_dir, clockWise, counterClock, delay);
}

function createTweenToRotation (sprite, cur_dir, tar_dir, clock, counterClock, timeFactor) {
	var rot = Math.min(clock, counterClock);
	if (clock > Math.PI) {
		tar_dir += (tar_dir < cur_dir) ? 2 * Math.PI : -2 * Math.PI;
	}
	var sign = (tar_dir > cur_dir) ? "+" : "-";
	time = rot * timeFactor;
	if (time < 10) time = 10;

	var tween = game.add.tween(sprite).to({rotation: sign + rot}, time).start();
	return tween;
}

function getPlayerIntersect (ray) {
	var maxDistance = Number.POSITIVE_INFINITY;
	var closestIntersection = null;

	var left = player.heart.x - player.body.width * 0.5;
	var right = player.heart.x + player.body.width * 0.5;
	var top = player.heart.y - player.body.height * 0.5;
	var bottom = player.heart.y + player.body.height * 0.5;

	var lines = [
		new Phaser.Line (left, top, left, bottom),
		new Phaser.Line (left, top, right, top),
		new Phaser.Line (right, bottom, left, bottom),
		new Phaser.Line (right, bottom, right, top)
	]

	for (var i = 0; i < lines.length; i++) {
		var intersect = Phaser.Line.intersects(ray, lines[i]);
		if (intersect) { 
			distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
			if (distance < maxDistance)  {
				maxDistance = distance;
				closestIntersection = intersect;
			}
		}
	}

	return closestIntersection;
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
					if (i == 0 || i == 3) closestIntersection.bounceType = 'H';
					else closestIntersection.bounceType = 'V';
				}
			}
		}
	}, this);
		
	return closestIntersection;
}

function destroyTank (a, b) {
    bulletDie(b);
    if (a.parentFcn.gameObjType == "PLAYER") {}
    else destroyEnemy(a.parentFcn);
  }

function destroyEnemy (enemy) {
 for (var i = 0; i < enemies.length; i++) {
   if (enemies[i] === enemy) {
     enemy.die();
     enemies.splice(i, 1);
     break;
   }
 }

 if (enemies.length == 0) win();
}