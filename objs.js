
function createBulletGroup () {
  var group = game.add.physicsGroup(Phaser.Physics.ARCADE);
  group.createMultiple(50, 'bullet_slow');
  group.setAll('anchor.x', 0.5);
  group.setAll('anchor.y', 0.5);
  group.setAll('body.bounce.x', 1);
  group.setAll('body.bounce.y', 1);
  return group;
}

function fire (params, owner, transmit) {
  var bullet = bullets.getFirstDead();
  bullet.reset(params.x, params.y);
  bullet.body.velocity.x = params.speed * Math.cos(params.rot);
  bullet.body.velocity.y = params.speed * Math.sin(params.rot);
  bullet.rotation = params.rot;
  bullet.bouncesLeft = params.numBounces;
  bullet.owner = owner;
  owner.numBullets++;

  if (isMultiplayer && transmit) {
    params.objType = owner.gameObjType;
    if (params.objType != "PLAYER") params.ix = owner.multiplayerIx;
    server.updateBullet(clientId, params);
  }
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

function destroyTank (a, b) {
  bulletDie(b);
  if (a.parentFcn.gameObjType == "PLAYER") {}
  else {
    for (var id in enemies) {
      if (id == a.parentFcn.multiplayerIx) {
        if (isMultiplayer) server.destroyEnemy(clientId, id);
        else destroyEnemyAt(id);
        break;
      }
    }
  }
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
  group.createMultiple(40, 'wall1');
  group.setAll('body.immovable', 'true');
  return group;
}

function placeWall (x, y) {
  var wall = walls.getFirstDead();
  wall.reset(x, y); 
}