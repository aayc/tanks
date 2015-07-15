var numRows = GAME_WIDTH / WALL_WIDTH;
var numCols = GAME_HEIGHT / WALL_HEIGHT;


function getLayout(level) {
	var layout = {
		playerConfig: {},
		brownTanks: []
	};

	// Set grid
	switch (level) {
		case 1:
			layout.grid  =[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					 	  		[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				 		  		[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						  		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
			layout.playerConfig.angle = 0;
			break;
	}

	// Set positions.
	for (var r = 0; r < layout.grid.length; r++) {
		for (var c = 0; c < layout.grid[r].length; c++) {
			if (layout.grid[r][c] == 2) {
				layout.playerConfig.x = c * WALL_HEIGHT;
				layout.playerConfig.y = r * WALL_WIDTH;
			}
			else if (layout.grid[r][c] == 3) {
				layout.brownTanks.push({
					x: c * WALL_HEIGHT, 
					y: r * WALL_WIDTH,
					angle: 0
				});
			}
		}
	}

	// Set specifics.

	return layout;
}

function enactLayout (layout) {
	
	for (var r = 0; r < layout.grid.length; r++) {
		for (var c = 0; c <layout.grid[r].length; c++) {
			if (layout.grid[r][c] == 1) {
				placeWall(c * WALL_WIDTH, r * WALL_HEIGHT);
			}
		}
	}
}