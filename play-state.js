var bullets;
var walls;
var tanks;
var players = [];
var player;
var enemies = [];
var playState = function (game) {
}

playState.prototype = {
	preload: preload, 
	create: create, 
	update: update 
}

function preload() {
    game.load.image('tankcenter', 'assets/tankcenter.png');
    game.load.image('redtankbody', 'assets/redtankbody.png');
    game.load.image('redtankhead', 'assets/redtankhead.png');
    game.load.image('browntankhead', 'assets/browntankhead.png');
    game.load.image('browntankbody', 'assets/browntankbody.png');
    game.load.image('graytankbody', 'assets/graytankbody.png');
    game.load.image('graytankhead', 'assets/graytankhead.png');
    game.load.image('tealtankhead', 'assets/tealtankhead.png');
    game.load.image('tealtankbody', 'assets/tealtankbody.png');
    game.load.image('horizontal_border', 'assets/horizontal_border.png');
    game.load.image('vertical_border', 'assets/vertical_border.png');
    game.load.image('wood', 'assets/wood.jpg');
    game.load.image('wall1', 'assets/wall1.png');
    game.load.image('bullet_slow', 'assets/bullet_slow.png');
    this.layout = getLayout(level);
  }

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0, 0, 'wood');

  bullets = createBulletGroup();
  walls = createWallGroup();
  tanks = game.add.physicsGroup(Phaser.Physics.ARCADE);

  enactLayout(this.layout);
  
  for (var i = 0; i < this.layout.players.length; i++) {
    var p = new Player(game, this.layout.players[i].x, this.layout.players[i].y);
    players.push(p);
    tanks.add(p.heart);
  }

  player = (!isMultiplayer || clientType == "HOST") ? players[0] : players[1];
  console.log(player);

  game.input.onDown.add(function () {
    if (player.numBullets <= PLAYER_BULLET_LIMIT && !game.paused) {
      var angleToMouse = Math.atan2(game.input.activePointer.y - player.heart.y, game.input.activePointer.x - player.heart.x);
      var params = {
        rot: angleToMouse,
        x: player.heart.x + 30 * Math.cos(angleToMouse),
        y: player.heart.y + 30 * Math.sin(angleToMouse),
        speed: PLAYER_BULLET_SPEED,
        numBounces: 1
      }
      
      fire(params, player, true);
    }
  });

  this.cursors = {
    up: game.input.keyboard.addKey(Phaser.Keyboard.W),
    down: game.input.keyboard.addKey(Phaser.Keyboard.S),
    left: game.input.keyboard.addKey(Phaser.Keyboard.A),
    right: game.input.keyboard.addKey(Phaser.Keyboard.D)
  }

  if (!isMultiplayer || clientType == "HOST") {
    enemies.forEach(function (enemy) { enemy.patrol(); });

    game.time.events.loop(Phaser.Timer.SECOND / 2, function () {
      enemies.forEach(function (enemy) { enemy.act(); enemy.move(); });
    }, this);
  }
  game.time.advancedTiming = true;
}

function update() {
  game.debug.text(game.time.fps, 2, 14, "#00ff00");
  game.physics.arcade.collide(tanks, walls);
  game.physics.arcade.collide(tanks, tanks);
  game.physics.arcade.collide(bullets, walls, bulletWallCollide, null, this);
  game.physics.arcade.collide(bullets, bullets, bulletBulletCollide, null, this);
  game.physics.arcade.collide(tanks, bullets, destroyTank, null, this);
  player.head.rotation = Math.atan2(game.input.activePointer.y - player.heart.y, game.input.activePointer.x - player.heart.x);
  player.handleMovement(this.cursors);

  if (isMultiplayer) {
    server.updatePlayer(clientId, {x: player.heart.x, y: player.heart.y, rot: player.head.rotation, bodyRot: player.body.rotation});
  }
}