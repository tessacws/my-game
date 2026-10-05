import Phaser from 'phaser';
import { GAME_WIDTH, PLATFORM } from '../config.js';
import { platformTexture } from './textures.js';

/**
 * A pooled platform. Types:
 *  - normal:   static
 *  - moving:   slides horizontally, bouncing off the screen edges
 *  - breaking: bounces the player once, then crumbles
 */
export default class Platform extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, platformTexture(scene, 'normal', 180));
    this.type = 'normal';
    this.speed = 0;
    this.coin = null;
    this.breakTween = null;
  }

  spawn(x, y, type, width, speed = 0) {
    this.stopBreakTween();
    this.type = type;
    this.speed = speed;
    this.coin = null;

    this.setTexture(platformTexture(this.scene, type, width));
    this.setActive(true).setVisible(true).setAlpha(1).setAngle(0).setDepth(5);

    const body = this.body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setImmovable(true);
    // Collision box is the platform face (excludes the drop shadow strip).
    body.setSize(this.width, PLATFORM.height, false);
    body.setOffset(0, 0);
    body.reset(x, y);
    body.setVelocity(type === 'moving' ? speed * (Math.random() < 0.5 ? -1 : 1) : 0, 0);
    return this;
  }

  /** Top edge of the walkable surface, in world coords. */
  get top() {
    return this.body.y;
  }

  update() {
    if (this.type !== 'moving' || !this.body.enable) return;
    const halfW = this.width / 2;
    const margin = 8;
    if (this.x - halfW < margin && this.body.velocity.x < 0) {
      this.body.setVelocityX(this.speed);
    } else if (this.x + halfW > GAME_WIDTH - margin && this.body.velocity.x > 0) {
      this.body.setVelocityX(-this.speed);
    }
  }

  crumble() {
    if (!this.body.enable) return;
    this.body.enable = false;
    this.body.setVelocity(0, 0);
    this.breakTween = this.scene.tweens.add({
      targets: this,
      y: this.y + 160,
      angle: Phaser.Math.Between(-25, 25),
      alpha: 0,
      duration: 450,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.breakTween = null;
        this.recycle();
      },
    });
  }

  stopBreakTween() {
    if (this.breakTween) {
      this.breakTween.stop();
      this.breakTween = null;
    }
  }

  /** Return to the pool. */
  recycle() {
    this.stopBreakTween();
    if (this.coin) {
      this.coin.recycle();
      this.coin = null;
    }
    this.body.enable = false;
    this.body.setVelocity(0, 0);
    this.setActive(false).setVisible(false);
  }
}
