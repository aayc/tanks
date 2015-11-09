
function createBulletGroup () {
  var group = game.add.physicsGroup(Phaser.Physics.ARCADE);
  group.createMultiple(50, 'bullet_slow');
  group.setAll('anchor.x', 0.5);
  group.setAll('anchor.y', 0.5);
  group.setAll('body.bounce.x', 1);
  group.setAll('body.bounce.y', 1);
  return group;
}

function fire (params, owner) {
  var bullet = bullets.getFirstDead();
  bullet.reset(params.x, params.y);
  bullet.body.velocity.x = params.speed * Math.cos(params.rot);
  bullet.body.velocity.y = params.speed * Math.sin(params.rot);
  bullet.rotation = params.rot;
  bullet.bouncesLeft = params.numBounces;
  bullet.owner = owner;
  if (owner !== null) owner.numBullets++;

  /* If the owner is null then it's from the other computer */
  if (isMultiplayer && owner !== null) {
    socket.emit('tell', {
      msg: "bullet fired",
      args: params,
      owner: null
    });
  }
}

function bulletDie (obj) {
  obj.kill();
  if (obj.owner !== null) obj.owner.numBullets -= 1;
}

function bulletBulletCollide (a, b) {
  a.kill();
  b.kill();
  if (a.owner !== null) a.owner.numBullets -= 1;
  if (b.owner !== null) b.owner.numBullets -= 1;
}

function bulletWallCollide (b, w) {
  if (b.bouncesLeft == 0) {
    b.kill();
    if (b.owner !== null) b.owner.numBullets -= 1;
  }
  else b.bouncesLeft--;
}

function destroyTank (a, b) {
  bulletDie(b);
  // If I assume that everything else is in sync then do I need to keep track of being destroyed?
  if (a.parentFcn.gameObjType == "PLAYER") {
    if (isMultiplayer) {
      a.parentFcn.die();
      for (var p in players) {
        if (!players[p].dead) return;
      }
      gameOver();
    }
    else {
      players[playerId].die();
      gameOver();
    }
  }
  else {
    if (isMultiplayer) {
      socket.emit('tell', {
        msg: "enemy destroyed",
        id: a.parentFcn.id
      });
    }
    destroyEnemyAt(a.parentFcn.id);
  }
}

// ----------------- WALL ----------------------- //

function createWallGroup (levelHeight, levelWidth) {
  var group = game.add.physicsGroup(Phaser.Physics.ARCADE);
  borderTop = game.add.sprite(0, 0, 'horizontal_border');
  borderBottom = game.add.sprite(0, levelHeight, 'horizontal_border');
  borderLeft = game.add.sprite(0, 0, 'vertical_border');
  borderRight = game.add.sprite(levelWidth - WALL_WIDTH, 0, 'vertical_border');
  borderLeft.height = levelHeight;
  borderRight.height = levelHeight;
  borderTop.width = levelWidth;
  borderBottom.width = levelWidth;
  group.add(borderTop);
  group.add(borderBottom);
  group.add(borderLeft);
  group.add(borderRight);
  group.createMultiple(80, 'wall1');
  group.setAll('body.immovable', 'true');
  return group;
}

function placeWall (x, y) {
  var wall = walls.getFirstDead();
  wall.reset(x, y); 
}