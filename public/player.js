function Player (game, x, y) {
	this.heart = game.add.sprite(x, y, 'tankcenter');
	this.body = this.heart.addChild(game.add.sprite(0, 0, 'redtankbody'));
	this.head = this.heart.addChild(game.add.sprite(0, 0, 'redtankhead'));
	game.physics.arcade.enable(this.heart);
	this.heart.anchor.setTo(0.5, 0.5);
	this.body.anchor.setTo(0.5, 0.5);
	this.head.anchor.setTo(0.45, 0.5);
	this.heart.parentFcn = this;
	this.gameObjType = "PLAYER";
	this.numBullets = 0;
	this.rotTween = dualRotateTo(this.body, 0, PLAYER_ROTATION_SPEED);
	this.vx = 0;
	this.vy = 0;
      this.direction = 0;
      this.dead = false;

	this.handleMovement = function (cursors) {
		var newVx = 0;
		var newVy = 0;
            if (cursors.left.isDown)  { newVx = -PLAYER_MOVEMENT_SPEED; }
            if (cursors.right.isDown) { newVx =  PLAYER_MOVEMENT_SPEED; }
            if (cursors.up.isDown)    { newVy = -PLAYER_MOVEMENT_SPEED; }
            if (cursors.down.isDown)  { newVy =  PLAYER_MOVEMENT_SPEED; }
            if (newVx == 0 && newVy == 0) {
                  if (isMultiplayer) {
                        socket.emit("tell", {
                              msg: "player update v", 
                              id: playerId, 
                              heartX: this.heart.x, heartY: this.heart.y,
                              heartVx: 0, heartVy : 0,
                              vx: 0, vy: 0
                        });
                  }
            	this.heart.body.velocity.x = 0;
            	this.heart.body.velocity.y = 0;
            	this.vx = 0;
            	this.vy = 0;
            	return;
            }
            if ((newVx != this.vx || newVy != this.vy)) {
            	this.heart.body.velocity.x = 0;
            	this.heart.body.velocity.y = 0;
            	this.rotTween.stop();
            	var goalRot = Math.atan2(newVy, newVx);
                  this.direction = goalRot;
            	this.vx = newVx;
            	this.vy = newVy;
                  if (isMultiplayer) {
                        socket.emit("tell", {
                              msg: "player update r", 
                              id: playerId, 
                              rot: goalRot
                        });

                        socket.emit("tell", {
                              msg: "player update v", 
                              id: playerId, 
                              heartX: this.heart.x, heartY: this.heart.y,
                              heartVx: 0, heartVy : 0,
                              vx: 0, vy: 0
                        });
                  }
            	this.rotTween = dualRotateTo(this.body, goalRot, PLAYER_ROTATION_SPEED);
            	this.rotTween.onComplete.add (function () {
                        if (isMultiplayer) {
                              socket.emit("tell", {
                                    msg: "player update v", 
                                    id: playerId, 
                                    heartX: this.heart.x, heartY: this.heart.y,
                                    heartVx: PLAYER_MOVEMENT_SPEED * Math.cos(this.direction), 
                                    heartVy: PLAYER_MOVEMENT_SPEED * Math.sin(this.direction)
                              });
                        }
            		this.heart.body.velocity.x = PLAYER_MOVEMENT_SPEED * Math.cos(this.direction);
            		this.heart.body.velocity.y = PLAYER_MOVEMENT_SPEED * Math.sin(this.direction);
            	}, this);

            }
      }

      this.die = function () {
            this.heart.kill();
            this.head.kill();
            this.body.kill();
            this.dead = true;
      }
}