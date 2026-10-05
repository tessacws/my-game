import Phaser from 'phaser';
import {
  COLORS,
  DIFFICULTY,
  FONT,
  GAME_HEIGHT,
  GAME_WIDTH,
  PIXELS_PER_POINT,
  PLATFORM,
  PLAYER,
} from '../config.js';
import Background from '../objects/Background.js';
import Coin from '../objects/Coin.js';
import IconButton from '../objects/IconButton.js';
import Platform from '../objects/Platform.js';
import Player from '../objects/Player.js';
import { Sfx } from '../sound.js';

const lerp = (range, t) => range.easy + (range.hard - range.easy) * t;
const START_PLATFORM_Y = GAME_HEIGHT - 160;
// Largest vertical gap we ever generate: comfortably below the max jump height.
const MAX_GAP = (PLAYER.jumpVelocity ** 2 / (2 * PLAYER.gravity)) * 0.85;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    this.state = 'playing'; // 'playing' | 'dead'
    this.score = 0;
    this.runCoins = 0;
    this.hasContinued = false;
    this.savedCoins = 0; // coins already written to storage (see GameOverScene)
    this.highestPlatformY = START_PLATFORM_Y;
    this.uiPointers = new Set();
  }

  create() {
    this.physics.world.setBounds(0, -1e7, GAME_WIDTH, 2e7);
    this.cameras.main.setScroll(0, 0);

    this.background = new Background(this);

    this.platforms = this.physics.add.group({
      classType: Platform,
      maxSize: -1,
      allowGravity: false,
      immovable: true,
    });
    this.coins = this.add.group({ classType: Coin, maxSize: -1 });

    this.player = new Player(this, GAME_WIDTH / 2, START_PLATFORM_Y - 120);
    this.physics.add.overlap(this.player, this.platforms, this.onLand, this.canLand, this);

    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 80, max: 260 },
      lifespan: 450,
      scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });
    this.particles.setDepth(8);

    this.spawnInitialPlatforms();
    this.player.jump();

    this.createHud();
    this.createInput();

    // Auto-pause when the tab/app goes to the background. Listeners on the
    // game-level emitter outlive the scene, so remove them on shutdown.
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.onHidden, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
  }

  // ---------------------------------------------------------------------------
  // Setup

  createHud() {
    const style = {
      fontFamily: FONT.family,
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#ffffff',
    };
    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 70, '0', style)
      .setOrigin(0.5)
      .setStroke('#2b2f77', 10)
      .setScrollFactor(0)
      .setDepth(100);

    this.add.image(50, 70, 'coin').setScrollFactor(0).setDepth(100);
    this.coinText = this.add
      .text(82, 70, '0', { ...style, fontSize: '40px', color: '#fff3bf' })
      .setOrigin(0, 0.5)
      .setStroke('#2b2f77', 8)
      .setScrollFactor(0)
      .setDepth(100);

    this.pauseButton = new IconButton(this, GAME_WIDTH - 66, 70, 'pause', () => this.pauseGame(), 84);
    this.pauseButton.setScrollFactor(0).setDepth(100);

    const hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.35, '◀  TAP LEFT / RIGHT  ▶', {
        fontFamily: FONT.family,
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setStroke('#2b2f77', 8)
      .setScrollFactor(0)
      .setDepth(100);
    this.tweens.add({ targets: hint, alpha: 0, delay: 1800, duration: 600, onComplete: () => hint.destroy() });
  }

  createInput() {

    const kb = this.input.keyboard;
    this.keys = kb.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });
    kb.on('keydown-P', this.pauseGame, this);
    kb.on('keydown-ESC', this.pauseGame, this);

    // Pointers that start on a UI element (e.g. pause button) don't steer.
    this.input.on('pointerdown', (pointer, over) => {
      if (over.length > 0) this.uiPointers.add(pointer.id);
    });
    const release = (pointer) => this.uiPointers.delete(pointer.id);
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
  }

  spawnInitialPlatforms() {
    // Wide, safe starting platform under the player.
    this.getPlatform().spawn(GAME_WIDTH / 2, START_PLATFORM_Y, 'normal', 260);
    this.highestPlatformY = START_PLATFORM_Y;
    this.fillPlatforms();
  }

  // ---------------------------------------------------------------------------
  // Platform generation

  getPlatform() {
    return this.platforms.get(0, 0);
  }

  difficultyAt(y) {
    // Score the player will have when bouncing on a platform at this height.
    const score = Math.max(0, (GAME_HEIGHT * 0.45 - y) / PIXELS_PER_POINT);
    return { score, t: Phaser.Math.Clamp(score / DIFFICULTY.maxScore, 0, 1) };
  }

  /** Generate platforms until the area just above the camera is filled. */
  fillPlatforms() {
    const limit = this.cameras.main.scrollY - 200;
    while (this.highestPlatformY > limit) this.spawnNextPlatform();
  }

  spawnNextPlatform() {
    const { score, t } = this.difficultyAt(this.highestPlatformY);
    const baseGap = lerp(DIFFICULTY.gap, t);
    const jitter = 1 + (Math.random() * 2 - 1) * DIFFICULTY.gapJitter;
    const gap = Phaser.Math.Clamp(baseGap * jitter, 110, MAX_GAP);
    const y = this.highestPlatformY - gap;

    let type = 'normal';
    if (score >= DIFFICULTY.breakingStartScore && Math.random() < lerp(DIFFICULTY.breakingChance, t)) {
      type = 'breaking';
    } else if (Math.random() < lerp(DIFFICULTY.movingChance, t)) {
      type = 'moving';
    }

    const width = lerp(DIFFICULTY.width, t) * Phaser.Math.FloatBetween(0.9, 1.1);
    const x = Phaser.Math.Between(Math.ceil(width / 2) + 12, Math.floor(GAME_WIDTH - width / 2) - 12);
    const speed = lerp(DIFFICULTY.movingSpeed, t) * Phaser.Math.FloatBetween(0.85, 1.15);

    const platform = this.getPlatform().spawn(x, y, type, width, speed);
    if (type !== 'breaking' && Math.random() < DIFFICULTY.coinChance) {
      this.coins.get(0, 0).attachTo(platform);
    }
    this.highestPlatformY = y;
  }

  recycleOffscreen() {
    const bottom = this.cameras.main.scrollY + GAME_HEIGHT + 60;
    this.platforms.children.each((p) => {
      if (p.active && p.y - PLATFORM.height > bottom) p.recycle();
    });
  }

  // ---------------------------------------------------------------------------
  // Collision

  canLand(player, platform) {
    // One-way platforms: only land while falling and coming from above.
    return (
      this.state === 'playing' &&
      platform.body.enable &&
      player.isFalling &&
      player.prevBottom <= platform.top + 6
    );
  }

  onLand(player, platform) {
    player.body.y = platform.top - player.body.height;
    player.jump();
    Sfx.jump();
    this.burst(player.x, platform.top, 6, 0xffffff);

    if (platform.type === 'breaking') {
      Sfx.break();
      this.burst(platform.x, platform.y, 14, COLORS.platformBreaking[0]);
      platform.crumble();
    }
  }

  burst(x, y, count, tint) {
    this.particles.particleTint = tint;
    this.particles.explode(count, x, y);
  }

  collectCoins(time) {
    const px = this.player.x;
    const py = this.player.y;
    const reach = PLAYER.radius + 22;
    this.coins.children.each((coin) => {
      if (!coin.active) return;
      coin.follow(time);
      if (Phaser.Math.Distance.Squared(px, py, coin.x, coin.y) < reach * reach) {
        this.runCoins += 1;
        this.coinText.setText(String(this.runCoins));
        Sfx.coin();
        this.burst(coin.x, coin.y, 10, COLORS.coin);
        coin.recycle();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Main loop

  update(time, delta) {
    this.platforms.children.each((p) => {
      if (p.active) p.update();
    });
    if (this.state !== 'playing') return;
    const dt = delta / 1000;

    this.player.move(this.readInputDirection(), dt);
    this.physics.world.wrap(this.player, PLAYER.radius);

    // Camera only follows upward.
    const cam = this.cameras.main;
    const targetScroll = this.player.y - GAME_HEIGHT * 0.45;
    if (targetScroll < cam.scrollY) cam.scrollY = targetScroll;

    // Score = height climbed (the camera only ever moves up).
    const climbed = Math.floor(-cam.scrollY / PIXELS_PER_POINT);
    if (climbed > this.score) {
      this.score = climbed;
      this.scoreText.setText(String(this.score));
    }

    this.fillPlatforms();
    this.recycleOffscreen();
    this.collectCoins(time);
    this.background.update(time, Phaser.Math.Clamp(this.score / 600, 0, 1));

    if (this.player.y - PLAYER.radius > cam.scrollY + GAME_HEIGHT) this.gameOver();
  }

  readInputDirection() {
    let dir = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) dir -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) dir += 1;

    let touchDir = 0;
    for (const pointer of this.input.manager.pointers) {
      if (!pointer.isDown || this.uiPointers.has(pointer.id)) continue;
      touchDir = pointer.x < GAME_WIDTH / 2 ? -1 : 1; // latest wins
    }
    return Phaser.Math.Clamp(dir + touchDir, -1, 1);
  }

  // ---------------------------------------------------------------------------
  // State changes

  pauseGame() {
    if (this.state !== 'playing' || !this.scene.isActive()) return;
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  onHidden() {
    this.pauseGame();
  }

  onResume() {
    // Ignore touches that were held when we paused.
    this.uiPointers.clear();
    for (const pointer of this.input.manager.pointers) {
      if (pointer.isDown) this.uiPointers.add(pointer.id);
    }
    this.keys.left.reset();
    this.keys.right.reset();
    this.keys.a.reset();
    this.keys.d.reset();
  }

  gameOver() {
    this.state = 'dead';
    this.player.body.setVelocity(0, 0);
    this.player.body.setAcceleration(0, 0);
    Sfx.gameOver();
    this.cameras.main.shake(200, 0.006);
    this.time.delayedCall(350, () => {
      this.scene.pause();
      this.scene.launch('GameOverScene', {
        score: this.score,
        coins: this.runCoins,
        canContinue: !this.hasContinued,
      });
    });
  }

  /** Called by the game-over screen after a successful rewarded ad. */
  revive() {
    this.hasContinued = true;
    const cam = this.cameras.main;
    const y = cam.scrollY + GAME_HEIGHT * 0.8;
    this.getPlatform().spawn(GAME_WIDTH / 2, y, 'normal', 240);
    this.player.resetAt(GAME_WIDTH / 2, y - 120);
    this.player.jump(1.1);
    this.burst(GAME_WIDTH / 2, y - 120, 24, COLORS.accent);
    Sfx.revive();
    this.state = 'playing';
  }

  onShutdown() {
    this.game.events.off(Phaser.Core.Events.HIDDEN, this.onHidden, this);
    this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.input.keyboard.off('keydown-P', this.pauseGame, this);
    this.input.keyboard.off('keydown-ESC', this.pauseGame, this);
    this.uiPointers.clear();
  }
}
