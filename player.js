function Player (body, head) {
  this.body = body;
  this.head = head;
  this.rotateHead = function (radians) { head.rotation += radians; }
  this.rotateBody = function (radians) { body.rotation += radians; }


  this.setHeadRotation = function (radians) { head.rotation = radians; }
  this.enactMotions = function (motions) {
    for (var i = 0; i < motions.length; i++) {
      var type = motions[i].dir;
      var val = MOVEMENT_SPEED;
      var sign = motions[i].sign;
      val = (sign == '+') ? val : -val;
      if (type == 'x') {
        body.body.velocity.x = val;
        head.body.velocity.x = val;
      } 
      else if (type == 'y') {
        body.body.velocity.y = val;
        head.body.velocity.y = val;
      }
    }
  }
}
