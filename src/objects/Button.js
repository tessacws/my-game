import Phaser from 'phaser';
import { COLORS, FONT } from '../config.js';
import { Sfx } from '../sound.js';

/** Rounded, tappable text button with press feedback. */
export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, options = {}) {
    super(scene, x, y);
    const {
      width = 440,
      height = 112,
      color = COLORS.button,
      colorDark = COLORS.buttonDark,
      fontSize = 46,
      onClick = null,
    } = options;

    this.onClick = onClick;
    this.enabled = true;
    this.pressed = false;

    const bg = scene.add.graphics();
    // Bottom "3D" edge.
    bg.fillStyle(colorDark, 1);
    bg.fillRoundedRect(-width / 2, -height / 2 + 8, width, height, 28);
    // Face.
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height - 4, 28);
    // Gloss.
    bg.fillStyle(0xffffff, 0.18);
    bg.fillRoundedRect(-width / 2 + 14, -height / 2 + 8, width - 28, height * 0.32, 16);

    this.label = scene.add
      .text(0, -2, label, {
        fontFamily: FONT.family,
        fontSize: `${fontSize}px`,
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)
      .setShadow(0, 3, 'rgba(0,0,0,0.25)', 2);

    this.add([bg, this.label]);
    this.setSize(width, height + 8);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => {
      if (!this.enabled) return;
      this.pressed = true;
      this.setScale(0.95);
    });
    this.on('pointerout', () => {
      this.pressed = false;
      this.setScale(1);
    });
    this.on('pointerup', () => {
      if (!this.enabled || !this.pressed) return;
      this.pressed = false;
      this.setScale(1);
      this.click();
    });

    scene.add.existing(this);
  }

  /** Trigger the button programmatically (e.g. from a keyboard shortcut). */
  click() {
    if (!this.enabled) return;
    Sfx.click();
    if (this.onClick) this.onClick();
  }

  setText(text) {
    this.label.setText(text);
    return this;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.5);
    return this;
  }
}
