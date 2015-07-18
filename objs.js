
function createBulletGroup () {
  var group = game.add.physicsGroup(Phaser.Physics.ARCADE);
  group.createMultiple(50, 'bullet_slow');
  group.setAll('anchor.x', 0.5);
  group.setAll('anchor.y', 0.5);
  group.setAll('body.bounce.x', 1);
  group.setAll('body.bounce.y', 1);
  return group;
}

function fire (x, y, rot, owner) {
  var bullet = bullets.getFirstDead();
  bullet.reset(x, y);
  bullet.body.velocity.x = BULLET_SPEED * Math.cos(rot);
  bullet.body.velocity.y = BULLET_SPEED * Math.sin(rot);
  bullet.rotation = rot;
  bullet.bouncesLeft = 1;
  bullet.owner = owner;
  owner.numBullets++;
}

function bulletDie (obj) {
  obj.kill();
  obj.owner.numBullets -= 1;
}

function bulletBulletCollide (a, b) {
  a.kill();
  b.kill();
  a.owner.numBullets -= 1;
  b.owner.numBullets -= 1;
}

function bulletWallCollide (b, w) {
  if (b.bouncesLeft == 0) {
    b.kill();
    b.owner.numBullets -= 1;
  }
  else b.bouncesLeft--;
}

// ----------------- WALL ----------------------- //

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