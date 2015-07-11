function Player (body, head) {
  this.head = head;
  this.body = body;

  this.rotateHead = function (radians) { this.head.rotation += radians; }
  this.rotateBody = function (radians) { this.body.rotation += radians; }

  this.setHeadRotation = function (radians) { this.head.rotation = radians; }
  this.setVelocity = function (dir, val) {
    this.body.body.velocity[dir] = val;
  }
}
