import Phaser from 'phaser';
import { PLAYER } from '../config.js';

/** The bouncing ball. Horizontal input is applied via acceleration; it auto-jumps off platforms. */
export default class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const r = PLAYER.radius;
    this.body.setCircle(r, (this.width - r * 2) / 2, (this.height - r * 2) / 2);
    this.body.setGravityY(PLAYER.gravity);
    this.body.setMaxVelocity(PLAYER.maxSpeedX, PLAYER.maxFallSpeed);
    this.body.setDragX(PLAYER.dragX);
    this.setDepth(10);
  }

  /** dir: -1 (left), 0 (none), 1 (right). */
  move(dir, deltaSec) {
    const body = this.body;
    if (dir === 0) {
      body.setAccelerationX(0);
    } else {
      // Turn around faster than speeding up for snappy controls.
      const reversing = Math.sign(body.velocity.x) === -dir;
      body.setAccelerationX(dir * PLAYER.accelX * (reversing ? 1.8 : 1));
    }
    this.rotation += (body.velocity.x * deltaSec) / PLAYER.radius;
  }

  jump(multiplier = 1) {
    this.body.setVelocityY(-PLAYER.jumpVelocity * multiplier);
  }

  /** Bottom of the body during the previous physics step. */
  get prevBottom() {
    return this.body.prev.y + this.body.height;
  }

  get isFalling() {
    return this.body.velocity.y > 0;
  }

  resetAt(x, y) {
    this.body.reset(x, y);
    this.body.setAcceleration(0, 0);
    this.rotation = 0;
  }
}
