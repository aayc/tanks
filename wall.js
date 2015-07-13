function createWallGroup () {
	var group = game.add.physicsGroup(Phaser.Physics.ARCADE);
	group.createMultiple(100, 'wall1');
	group.setAll('body.immovable', true);
	return group;
}

function placeWall (x, y) {
	var wall = walls.getFirstExists(false);
	wall.reset(x, y); 
}

function clearWalls () {
	walls.forEachAlive(function (wall) {
		wall.destroy();
	});
}