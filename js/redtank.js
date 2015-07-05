function Player {
	this.createMe = function (game) {
		game.add.sprite(32, game.world.height - 150, 'redtankhead');
		game.add.sprite(48, game.world.height - 150, 'redtankbody');
	}
}