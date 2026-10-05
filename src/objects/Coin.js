import Phaser from 'phaser';

/** A pooled collectible coin that rides on top of a platform. */
export default class Coin extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    this.platform = null;
    this.phase = 0;
  }

  attachTo(platform) {
    this.platform = platform;
    platform.coin = this;
    this.phase = Math.random() * Math.PI * 2;
    this.setActive(true).setVisible(true).setAlpha(1).setScale(1).setDepth(6);
    this.follow(0);
    return this;
  }

  /** Keep the coin hovering above its platform with a spin animation. */
  follow(time) {
    const p = this.platform;
    if (!p) return;
    this.x = p.x;
    this.y = p.top - 38 + Math.sin(time * 0.004 + this.phase) * 5;
    this.scaleX = Math.max(0.15, Math.abs(Math.cos(time * 0.003 + this.phase)));
  }

  recycle() {
    if (this.platform && this.platform.coin === this) this.platform.coin = null;
    this.platform = null;
    this.setActive(false).setVisible(false);
  }
}
