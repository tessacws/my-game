import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config.js';
import { unlockAudio } from './sound.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Browsers only allow audio after a user gesture.
['pointerdown', 'touchend', 'keydown'].forEach((type) =>
  window.addEventListener(type, unlockAudio, { passive: true }),
);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#12142e',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  // Sound is generated with our own Web Audio code (see sound.js).
  audio: { noAudio: true },
  input: { activePointers: 3 },
  fps: { target: 60 },
  render: { antialias: true, powerPreference: 'high-performance' },
  scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene],
});

// Handy for debugging in the browser console.
if (import.meta.env.DEV) window.__game = game;
