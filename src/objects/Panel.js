import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config.js';

/** Dimmed full-screen backdrop + rounded panel used by overlay scenes. */
export function createOverlayPanel(scene, panelHeight, panelWidth = 600) {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT / 2;

  const dim = scene.add
    .image(0, 0, 'pixel')
    .setOrigin(0)
    .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    .setTint(0x000000)
    .setAlpha(0)
    // Swallow taps so they don't reach the paused game below.
    .setInteractive();
  scene.tweens.add({ targets: dim, alpha: 0.55, duration: 180 });

  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(cx - panelWidth / 2, cy - panelHeight / 2 + 10, panelWidth, panelHeight, 36);
  g.fillStyle(COLORS.panel, 0.96);
  g.fillRoundedRect(cx - panelWidth / 2, cy - panelHeight / 2, panelWidth, panelHeight, 36);
  g.lineStyle(4, 0xffffff, 0.15);
  g.strokeRoundedRect(cx - panelWidth / 2, cy - panelHeight / 2, panelWidth, panelHeight, 36);

  return { dim, panel: g, top: cy - panelHeight / 2, cx, cy };
}
