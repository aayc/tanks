function createWallGroup () {
	var group = game.add.physicsGroup(Phaser.Physics.ARCADE);
	borderTop = game.add.sprite(0, 0, 'horizontal_border');
	borderBottom = game.add.sprite(0, GAME_HEIGHT - WALL_HEIGHT, 'horizontal_border');
	borderLeft = game.add.sprite(0, 0, 'vertical_border');
	borderRight = game.add.sprite(GAME_WIDTH - WALL_WIDTH, 0, 'vertical_border');
	group.add(borderTop);
	group.add(borderBottom);
	group.add(borderLeft);
	group.add(borderRight);
	group.createMultiple(20, 'wall1');
	group.setAll('body.immovable', 'true');
	return group;
}

function placeWall (x, y) {
	var wall = walls.getFirstExists(false);
	wall.reset(x, y); 
}