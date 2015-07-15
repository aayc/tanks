
function createBulletGroup () {
  var group = game.add.physicsGroup(Phaser.Physics.ARCADE);
  group.createMultiple(50, 'bullet_slow');
  group.setAll('anchor.x', 0.5);
  group.setAll('anchor.y', 0.5);
  group.setAll('body.bounce.x', 1);
  group.setAll('body.bounce.y', 1);
  group.setAll('body.collideWorldBounds', 'true');
  return group;a
}

function fire (x, y, rot) {
  var bullet = bullets.getFirstExists(false);
  bullet.reset(x, y);
  game.physics.arcade.velocityFromRotation(rot, BULLET_SPEED, bullet.body.velocity);
  bullet.rotation = rot;
  bullet.bouncesLeft = 1;
}

function bulletDie (obj) {
  obj.kill();
  numPlayerBullets--;
}

function bulletBulletCollide (a, b) {
  a.kill();
  b.kill();
  numPlayerBullets -= 2;
}

function bulletWallCollide (b, w) {
  // TODO: ROTATE BULLET
  if (b.bouncesLeft == 0) {
    b.kill();
    numPlayerBullets -= 1;
  }
  else b.bouncesLeft--;
}