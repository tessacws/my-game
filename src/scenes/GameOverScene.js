import Phaser from 'phaser';
import { COLORS, FONT } from '../config.js';
import Button from '../objects/Button.js';
import MuteButton from '../objects/MuteButton.js';
import { createOverlayPanel } from '../objects/Panel.js';
import { Storage } from '../storage.js';
import { onGameOver, showBanner, hideBanner, showRewardedAd } from '../ads.js';
import { Sfx } from '../sound.js';

/** Overlay shown on top of the paused GameScene when the player falls. */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score ?? 0;
    this.runCoins = data.coins ?? 0;
    this.canContinue = Boolean(data.canContinue);
    this.alive = true;
    this.busy = false;
  }

  create() {
    // Persist results. Coins are saved as a delta so a continued run doesn't double count.
    const game = this.scene.get('GameScene');
    const unsaved = this.runCoins - (game.savedCoins ?? 0);
    if (unsaved > 0) Storage.addCoins(unsaved);
    game.savedCoins = this.runCoins;
    const isRecord = Storage.submitScore(this.finalScore);
    const best = Storage.getBestScore();

    const panelH = this.canContinue ? 900 : 760;
    const { top, cx } = createOverlayPanel(this, panelH);
    const text = (y, str, size, color = '#ffffff') =>
      this.add
        .text(cx, y, str, { fontFamily: FONT.family, fontSize: `${size}px`, fontStyle: 'bold', color })
        .setOrigin(0.5);

    text(top + 85, 'GAME OVER', 60).setX(cx - 30);
    text(top + 165, 'SCORE', 30, COLORS.textDim);
    const scoreText = text(top + 225, String(this.finalScore), 84);
    text(top + 300, `BEST  ${best}`, 36, COLORS.textDim);
    if (isRecord && this.finalScore > 0) {
      const badge = text(top + 225, 'NEW!', 30, '#ffd43b').setX(cx + 70 + scoreText.width / 2).setAngle(-12);
      this.tweens.add({ targets: badge, scale: 1.2, yoyo: true, repeat: -1, duration: 400 });
    }

    this.add.image(cx - 80, top + 360, 'coin').setScale(0.75);
    this.add
      .text(cx - 52, top + 360, `+${this.runCoins}  (${Storage.getCoins()})`, {
        fontFamily: FONT.family,
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#fff3bf',
      })
      .setOrigin(0, 0.5);

    let y = top + 480;
    if (this.canContinue) {
      this.continueButton = new Button(this, cx, y, '▶ Watch ad to continue', {
        width: 520,
        height: 104,
        fontSize: 34,
        color: COLORS.buttonAd,
        colorDark: COLORS.buttonAdDark,
        onClick: () => this.continueRun(),
      });
      y += 140;
    }
    this.restartButton = new Button(this, cx, y, 'RESTART', { onClick: () => this.restart() });
    this.homeButton = new Button(this, cx, y + 140, 'HOME', {
      color: COLORS.buttonAlt,
      colorDark: COLORS.buttonAltDark,
      onClick: () => this.goHome(),
    });
    new MuteButton(this, cx + 240, top + 85, 64);

    const kb = this.input.keyboard;
    kb.on('keydown-ENTER', () => this.restartButton.click());
    kb.on('keydown-SPACE', () => this.restartButton.click());
    kb.on('keydown-R', () => this.restartButton.click());
    kb.on('keydown-H', () => this.homeButton.click());
    kb.on('keydown-C', () => this.continueButton?.click());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.alive = false;
    });

    // Interstitial every Nth game over – shown here, never during gameplay.
    this.setBusy(true);
    onGameOver().finally(() => {
      if (!this.alive) return;
      this.setBusy(false);
      showBanner();
    });
  }

  setBusy(busy) {
    this.busy = busy;
    [this.continueButton, this.restartButton, this.homeButton].forEach((b) => b?.setEnabled(!busy));
  }

  async continueRun() {
    if (this.busy || !this.canContinue) return;
    this.setBusy(true);
    hideBanner();
    let rewarded = false;
    try {
      rewarded = await showRewardedAd();
    } catch {
      rewarded = false;
    }
    if (!this.alive) return;
    if (!rewarded) {
      this.setBusy(false);
      Sfx.click();
      return;
    }
    const game = this.scene.get('GameScene');
    this.scene.stop();
    game.revive();
    this.scene.resume('GameScene');
  }

  restart() {
    if (this.busy) return;
    hideBanner();
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  goHome() {
    if (this.busy) return;
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
