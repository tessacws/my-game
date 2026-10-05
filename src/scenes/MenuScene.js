import Phaser from 'phaser';
import { FONT, GAME_WIDTH } from '../config.js';
import Background from '../objects/Background.js';
import Button from '../objects/Button.js';
import MuteButton from '../objects/MuteButton.js';
import { Storage } from '../storage.js';
import { hideBanner, showBanner } from '../ads.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  init() {
    this.starting = false;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    this.background = new Background(this, { clouds: 5, stars: 0 });

    this.add
      .text(cx, 300, 'SKY\nHOPPER', {
        fontFamily: FONT.family,
        fontSize: '128px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        lineSpacing: -10,
      })
      .setOrigin(0.5)
      .setStroke('#2b2f77', 14)
      .setShadow(0, 10, 'rgba(0,0,0,0.25)', 6, true, true);

    // Decorative bouncing ball on a platform.
    this.add.image(cx, 700, 'platform-normal-180');
    const ball = this.add.image(cx, 660, 'player');
    this.tweens.add({
      targets: ball,
      y: 520,
      duration: 420,
      ease: 'Quad.easeOut',
      yoyo: true,
      repeat: -1,
    });

    this.playButton = new Button(this, cx, 880, 'PLAY', {
      width: 460,
      height: 130,
      fontSize: 60,
      onClick: () => this.startGame(),
    });

    this.add
      .text(cx, 1010, `BEST  ${Storage.getBestScore()}`, {
        fontFamily: FONT.family,
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setShadow(0, 3, 'rgba(0,0,0,0.3)', 3);

    this.add.image(cx - 50, 1075, 'coin').setScale(0.8);
    this.add
      .text(cx - 20, 1075, `${Storage.getCoins()}`, {
        fontFamily: FONT.family,
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#fff3bf',
      })
      .setOrigin(0, 0.5)
      .setShadow(0, 3, 'rgba(0,0,0,0.3)', 3);

    this.add
      .text(cx, 1190, 'Tap left / right side to move  •  Keyboard: ← → / A D', {
        fontFamily: FONT.family,
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#2b2f77',
      })
      .setOrigin(0.5);

    new MuteButton(this, GAME_WIDTH - 70, 70);

    this.input.keyboard.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard.on('keydown-SPACE', this.startGame, this);

    showBanner();
  }

  update(time) {
    this.background.update(time, 0);
  }

  startGame() {
    if (this.starting) return;
    this.starting = true;
    hideBanner();
    this.scene.start('GameScene');
  }
}
