import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config.js';

const CLOUD_PARALLAX = 0.35;

/**
 * Sky gradient that darkens into a starry night as you climb,
 * plus a few parallax clouds that are recycled as they scroll off screen.
 */
export default class Background {
  constructor(scene, { clouds = 6, stars = 40 } = {}) {
    this.scene = scene;

    this.sky = scene.add
      .image(0, 0, 'sky')
      .setOrigin(0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setScrollFactor(0)
      .setDepth(-100);

    this.night = scene.add
      .image(0, 0, 'pixel')
      .setOrigin(0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setTint(COLORS.night)
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(-99);

    this.stars = [];
    for (let i = 0; i < stars; i++) {
      const s = scene.add
        .image(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT), 'star')
        .setScale(Phaser.Math.FloatBetween(0.6, 1.6))
        .setScrollFactor(0)
        .setAlpha(0)
        .setDepth(-98);
      s.twinkle = Math.random() * Math.PI * 2;
      this.stars.push(s);
    }

    this.clouds = [];
    for (let i = 0; i < clouds; i++) {
      const c = scene.add
        .image(0, 0, 'cloud')
        .setScrollFactor(1, CLOUD_PARALLAX)
        .setDepth(-97);
      this.placeCloud(c, (GAME_HEIGHT / clouds) * i);
      this.clouds.push(c);
    }
  }

  placeCloud(cloud, screenY) {
    cloud.x = Phaser.Math.Between(-40, GAME_WIDTH + 40);
    const scrollY = this.scene.cameras.main.scrollY;
    cloud.y = screenY + scrollY * CLOUD_PARALLAX;
    cloud.setScale(Phaser.Math.FloatBetween(0.6, 1.3));
    cloud.setAlpha(Phaser.Math.FloatBetween(0.35, 0.75));
  }

  /** nightAmount: 0 (day) .. 1 (full night). */
  update(time, nightAmount = 0) {
    const scrollY = this.scene.cameras.main.scrollY;
    this.night.setAlpha(nightAmount * 0.85);

    const starAlpha = Phaser.Math.Clamp((nightAmount - 0.3) / 0.7, 0, 1);
    for (const s of this.stars) {
      s.setAlpha(starAlpha * (0.6 + 0.4 * Math.sin(time * 0.003 + s.twinkle)));
    }

    for (const c of this.clouds) {
      const screenY = c.y - scrollY * CLOUD_PARALLAX;
      if (screenY > GAME_HEIGHT + 80) this.placeCloud(c, -80 - Math.random() * 200);
      c.alpha = Math.min(c.alpha, 0.75 * (1 - nightAmount * 0.8) + 0.1);
    }
  }
}
