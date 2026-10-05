import { COLORS, PLATFORM, PLAYER } from '../config.js';

// All graphics are generated at runtime with Canvas 2D – no image files.

const css = (hex, alpha = 1) => {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
};

function canvasTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  draw(tex.getContext(), w, h);
  tex.refresh();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createBaseTextures(scene) {
  // Sky gradient (drawn small and stretched – it's a smooth vertical gradient).
  canvasTexture(scene, 'sky', 4, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(COLORS.skyTop));
    g.addColorStop(1, css(COLORS.skyBottom));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Player ball with radial gradient + highlight.
  const r = PLAYER.radius;
  canvasTexture(scene, 'player', r * 2 + 4, r * 2 + 4, (ctx) => {
    const c = r + 2;
    const g = ctx.createRadialGradient(c - r * 0.35, c - r * 0.35, r * 0.1, c, c, r);
    g.addColorStop(0, '#fffbe6');
    g.addColorStop(0.35, css(COLORS.player));
    g.addColorStop(1, css(COLORS.playerDark));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
    // Stripe so rotation is visible.
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(c, c, r * 0.62, -0.6, 0.6);
    ctx.stroke();
  });

  // Coin.
  canvasTexture(scene, 'coin', 44, 44, (ctx) => {
    const g = ctx.createRadialGradient(16, 14, 2, 22, 22, 21);
    g.addColorStop(0, '#fff3bf');
    g.addColorStop(0.5, css(COLORS.coin));
    g.addColorStop(1, css(COLORS.coinDark));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(22, 22, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, 22, 12, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Soft particle.
  canvasTexture(scene, 'particle', 16, 16, (ctx) => {
    const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
  });

  // Cloud: a few overlapping soft circles.
  canvasTexture(scene, 'cloud', 220, 100, (ctx) => {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    [
      [60, 62, 34],
      [105, 45, 42],
      [155, 60, 34],
      [110, 70, 30],
    ].forEach(([x, y, rad]) => {
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Star.
  canvasTexture(scene, 'star', 8, 8, (ctx) => {
    const g = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, 8);
  });

  // Solid white pixel (used for overlays).
  canvasTexture(scene, 'pixel', 2, 2, (ctx) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 2, 2);
  });

  // Warm up a few common platform widths.
  ['normal', 'moving', 'breaking'].forEach((type) => platformTexture(scene, type, 180));
}

const PLATFORM_COLORS = {
  normal: COLORS.platformNormal,
  moving: COLORS.platformMoving,
  breaking: COLORS.platformBreaking,
};

/**
 * Returns the texture key for a platform of a given type and width,
 * generating it on demand. Widths are bucketed to 5px so the cache stays small.
 */
export function platformTexture(scene, type, width) {
  const w = Math.max(40, Math.round(width / 5) * 5);
  const key = `platform-${type}-${w}`;
  if (scene.textures.exists(key)) return key;
  const h = PLATFORM.height;
  const [light, dark] = PLATFORM_COLORS[type];
  canvasTexture(scene, key, w, h + 6, (ctx) => {
    // Drop shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, 2, 6, w - 4, h, h / 2);
    ctx.fill();
    // Body gradient.
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(light));
    g.addColorStop(1, css(dark));
    ctx.fillStyle = g;
    roundRect(ctx, 0, 0, w, h, h / 2);
    ctx.fill();
    // Highlight.
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRect(ctx, 8, 3, w - 16, 6, 3);
    ctx.fill();
    if (type === 'breaking') {
      // Cracks.
      ctx.strokeStyle = 'rgba(70,35,10,0.7)';
      ctx.lineWidth = 2;
      for (let x = w * 0.25; x < w - 10; x += w * 0.25) {
        ctx.beginPath();
        ctx.moveTo(x, 2);
        ctx.lineTo(x - 6, h * 0.45);
        ctx.lineTo(x + 4, h * 0.7);
        ctx.lineTo(x - 2, h - 2);
        ctx.stroke();
      }
    }
    if (type === 'moving') {
      // Arrows hint.
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      const cy = h / 2 + 2;
      ctx.beginPath();
      ctx.moveTo(12, cy);
      ctx.lineTo(22, cy - 6);
      ctx.lineTo(22, cy + 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w - 12, cy);
      ctx.lineTo(w - 22, cy - 6);
      ctx.lineTo(w - 22, cy + 6);
      ctx.fill();
    }
  });
  return key;
}
