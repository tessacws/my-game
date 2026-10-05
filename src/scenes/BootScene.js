import Phaser from 'phaser';
import { createBaseTextures } from '../objects/textures.js';
import { initAds } from '../ads.js';

/** Generates all procedural textures once, then opens the menu. */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    createBaseTextures(this);
    initAds();
    this.scene.start('MenuScene');
  }
}
