import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { Sfx } from '../sound.js';

/** Small circular icon button. Icons are drawn with Graphics: 'pause' | 'sound' | 'muted'. */
export default class IconButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, icon, onClick, size = 88) {
    super(scene, x, y);
    this.size = size;
    this.onClick = onClick;
    this.pressed = false;

    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.22);
    bg.fillCircle(0, 4, size / 2);
    bg.fillStyle(COLORS.panel, 0.75);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(4, 0xffffff, 0.85);
    bg.strokeCircle(0, 0, size / 2 - 2);

    this.iconGfx = scene.add.graphics();
    this.add([bg, this.iconGfx]);
    this.setIcon(icon);

    this.setSize(size, size);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', () => {
      this.pressed = true;
      this.setScale(0.92);
    });
    this.on('pointerout', () => {
      this.pressed = false;
      this.setScale(1);
    });
    this.on('pointerup', () => {
      if (!this.pressed) return;
      this.pressed = false;
      this.setScale(1);
      Sfx.click();
      if (this.onClick) this.onClick(this);
    });

    scene.add.existing(this);
  }

  setIcon(icon) {
    const g = this.iconGfx;
    const s = this.size / 88; // icons are designed for an 88px button
    g.clear();
    g.fillStyle(0xffffff, 1);
    if (icon === 'pause') {
      g.fillRoundedRect(-16 * s, -18 * s, 11 * s, 36 * s, 3 * s);
      g.fillRoundedRect(5 * s, -18 * s, 11 * s, 36 * s, 3 * s);
    } else {
      // Speaker.
      g.fillRect(-22 * s, -9 * s, 12 * s, 18 * s);
      g.fillTriangle(-12 * s, -9 * s, 4 * s, -22 * s, 4 * s, 22 * s);
      g.fillTriangle(-12 * s, -9 * s, -12 * s, 9 * s, 4 * s, 22 * s);
      if (icon === 'muted') {
        g.lineStyle(5 * s, 0xff6b6b, 1);
        g.lineBetween(10 * s, -10 * s, 26 * s, 10 * s);
        g.lineBetween(26 * s, -10 * s, 10 * s, 10 * s);
      } else {
        g.lineStyle(4 * s, 0xffffff, 1);
        g.beginPath();
        g.arc(6 * s, 0, 12 * s, -0.8, 0.8);
        g.strokePath();
        g.beginPath();
        g.arc(6 * s, 0, 21 * s, -0.8, 0.8);
        g.strokePath();
      }
    }
    return this;
  }
}
