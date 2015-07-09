Bullet = function (game, x, y, angle) {
  Phaser.Sprite.call(this, game, x, y, 'bullet_slow');

  this.angle = angle;
  this.left = x;
  this.right = x + 10;
  this.top = y;
  this.bottom = y + 10;
  this.setMovementPath = function () {
    this.body.velocity.x = BULLET_SPEED * Math.cos(angle);
    this.body.velocity.y = BULLET_SPEED * Math.sin(angle);
  }
}

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;
Bullet.prototype.update = function () {
  if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) {
    numPlayerBullets -= 1;
    this.destroy();
  }
};