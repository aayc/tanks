function Player (body, head) {
  this.body = body;
  this.head = head;
  this.rotateHead = function (radians) { head.rotation += radians; }
  this.rotateBody = function (radians) { body.rotation += radians; }

  this.setHeadRotation = function (radians) { head.rotation = radians; }
  this.setVelocity = function (dir, val) {
    head.body.velocity[dir] = val;
    body.body.velocity[dir] = val;
  }
}
