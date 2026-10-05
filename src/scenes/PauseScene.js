import Phaser from 'phaser';
import { COLORS, FONT } from '../config.js';
import Button from '../objects/Button.js';
import MuteButton from '../objects/MuteButton.js';
import { createOverlayPanel } from '../objects/Panel.js';

/** Overlay shown on top of the paused GameScene. */
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { top, cx } = createOverlayPanel(this, 600);

    this.add
      .text(cx, top + 90, 'PAUSED', {
        fontFamily: FONT.family,
        fontSize: '72px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    new Button(this, cx, top + 250, 'RESUME', { onClick: () => this.resumeGame() });
    new Button(this, cx, top + 390, 'HOME', {
      color: COLORS.buttonAlt,
      colorDark: COLORS.buttonAltDark,
      onClick: () => this.goHome(),
    });
    new MuteButton(this, cx, top + 515, 80);

    const kb = this.input.keyboard;
    kb.on('keydown-P', this.resumeGame, this);
    kb.on('keydown-ESC', this.resumeGame, this);
    kb.on('keydown-SPACE', this.resumeGame, this);
    kb.on('keydown-H', this.goHome, this);
  }

  resumeGame() {
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  goHome() {
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
