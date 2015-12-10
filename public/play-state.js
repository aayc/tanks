var bullets;
var walls;
var tanks;
var players = [];
var player;
var layout;
var enemies = {};
var cursors = {};


var updatePlayerMovement = function () {
  player.handleMovement(this.cursors);
}

var updatePlayerDirection = function() {
  player.head.rotation = Math.atan2(game.input.activePointer.y - player.heart.y, game.input.activePointer.x - player.heart.x);
}

var playState = function (game) {
  ready = false;
}

playState.prototype = {
	preload: preload, 
	create: create, 
	update: update 
}

function preload() {
  layout = getLayout(level);
  game.stage.disableVisibilityChange = true;
  game.load.image('tankcenter', 'assets/tankcenter.png');
  game.load.image('redtankbody', 'assets/redtankbody.png');
  game.load.image('redtankhead', 'assets/redtankhead.png');
  
  var assetNames = [
  { "browntankhead" : "assets/browntankhead.png", "browntankbody" : "assets/browntankbody.png" },
  { "graytankhead" : "assets/graytankhead.png", "graytankbody" : "assets/graytankbody.png" },
  { "tealtankhead" : "assets/tealtankhead.png", "tealtankbody" : "assets/tealtankbody.png" },
  { "circletankhead" : "assets/circletankhead.png", "circletankbody" : "assets/circletankbody.png" },
  { "bluetankhead" : "assets/bluetankhead.png", "bluetankbody" : "assets/bluetankbody.png" },
  { "greentankhead" : "assets/greentankhead.png", "greentankbody" : "assets/greentankbody.png" }];

  for (var i = 0; i < layout.tanksPresent.length; i++) {
    if (layout.tanksPresent[i]) {
      for (var spriteKey in assetNames[i]) {
        game.load.image(spriteKey, assetNames[i][spriteKey]);
      }
    }
  }

  game.load.image('horizontal_border', 'assets/horizontal_border.png');
  game.load.image('vertical_border', 'assets/vertical_border.png');
  game.load.image('wood-big', 'assets/wood-big.jpg');
  game.load.image('wood-small', 'assets/wood-small.jpg');
  game.load.image('wall1', 'assets/wall1.png');
  game.load.image('bullet_slow', 'assets/bullet_slow.png');
  game.physics.startSystem(Phaser.Physics.ARCADE);

  cursors = {
    up: game.input.keyboard.addKey(Phaser.Keyboard.W),
    down: game.input.keyboard.addKey(Phaser.Keyboard.S),
    left: game.input.keyboard.addKey(Phaser.Keyboard.A),
    right: game.input.keyboard.addKey(Phaser.Keyboard.D)
  }

  ready = false;
}

function create() {
  if (layout.grid.length < 16) game.add.sprite(0, 0, 'wood-small');
  else game.add.sprite(0, 0, 'wood-big');
  
  enemies = {};
  bullets = createBulletGroup();
  walls = createWallGroup(layout.grid.length * WALL_HEIGHT, layout.grid[0].length * WALL_WIDTH);
  tanks = game.add.physicsGroup(Phaser.Physics.ARCADE);

  /* Use layout to create walls and enemies */
  for (var r = 0; r < layout.grid.length; r++) {
    for (var c = 0; c <layout.grid[r].length; c++) {
      if (layout.grid[r][c] == 1) {
        placeWall(c * WALL_WIDTH, r * WALL_HEIGHT);
      }
    }
  }
  
  for (var i = 0; i < layout.players.length; i++) {
    var p = new Player(game, layout.players[i].x, layout.players[i].y);
    if (isMultiplayer) { players[multiSettings.ids[i]] = p; }
    else players[playerId] = p;
    tanks.add(p.heart);
  }

  player = players[playerId];

  var createEnemies = function (enemyIds) {
    for (var i = 0; i < layout.enemyTanks.length; i++) {
      var _ = layout.enemyTanks[i];
      var _id = isMultiplayer ? enemyIds[i] : uuid();
      var enemy = new _.tank(_id, game, _.position.x, _.position.y);
      tanks.add(enemy.heart);
      enemies[_id] = enemy;
    }
    if (isMultiplayer) socket.emit('readyToStartGame');
    else startGame();
  }
  
  if (isMultiplayer) {
    socket.once('enemy ids', function (data) {
      createEnemies(data.enemyIds);
    });
    socket.emit('getEnemyIds', {n: layout.enemyTanks.length});
  } else {
    createEnemies([]);
  }
}

function startGame () {
  game.input.onDown.add(function () {
    if (player.numBullets <= PLAYER_BULLET_LIMIT && !game.paused && !player.dead) {
      var angleToMouse = Math.atan2(game.input.activePointer.y - player.heart.y, game.input.activePointer.x - player.heart.x);
      var params = {
        rot: angleToMouse,
        x: player.heart.x + 30 * Math.cos(angleToMouse),
        y: player.heart.y + 30 * Math.sin(angleToMouse),
        speed: PLAYER_BULLET_SPEED,
        numBounces: PLAYER_RICOCHET
      }
      
      fire(params, player);
    }
  });
  
  if (!isMultiplayer || (isMultiplayer && multiSettings.type == "HOST")) {
    for (var id in enemies) {
       enemies[id].patrol();
       enemies[id].explore();
    }

    game.time.events.loop(Phaser.Timer.SECOND / 10, function () {
      for (var id in enemies) {
        enemies[id].act();
      }
    }, this);

    game.time.events.loop(Phaser.Timer.SECOND, function () {
      for (var id in enemies) {
        enemies[id].move();
      }
    }, this);
  }

  watch(game.input.activePointer, ["x", "y"], updatePlayerDirection);

  for(var key in this.cursors) {
    watch(cursors[key], ["isDown"], updatePlayerMovement.bind(this));
  }
  ready = true;
}

function update() {
  if (ready) {
    game.physics.arcade.collide(tanks, walls);
    game.physics.arcade.collide(tanks, tanks);
    game.physics.arcade.collide(bullets, walls, bulletWallCollide, null, this);
    game.physics.arcade.collide(bullets, bullets, bulletBulletCollide, null, this);
    game.physics.arcade.collide(tanks, bullets, destroyTank, null, this);
  }
}

function cleanGame () {
  for (var key in this.cursors) {
    unwatch(this.cursors[key], ["isDown"], updatePlayerMovement)
  }
  unwatch(game.input.activePointer, ["x", "y"], updatePlayerDirection);
}