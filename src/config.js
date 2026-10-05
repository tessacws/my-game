// Central game configuration & tuning values.

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export const STORAGE_PREFIX = 'skyHopper.';

export const COLORS = {
  skyTop: 0x2b2f77,
  skyBottom: 0x7fd3ff,
  night: 0x0b0d26,
  text: '#ffffff',
  textDim: '#c9d4ff',
  accent: 0xffc93c,
  button: 0xff6b6b,
  buttonDark: 0xd94848,
  buttonAlt: 0x4c6ef5,
  buttonAltDark: 0x3651c7,
  buttonAd: 0x37b24d,
  buttonAdDark: 0x2b8a3e,
  panel: 0x1b1f4b,
  player: 0xffe066,
  playerDark: 0xf08c00,
  platformNormal: [0x8ce99a, 0x2f9e44],
  platformMoving: [0x74c0fc, 0x1971c2],
  platformBreaking: [0xe8b273, 0x9c5b24],
  coin: 0xffd43b,
  coinDark: 0xe67700,
};

export const FONT = {
  family: '"Trebuchet MS", "Segoe UI", Roboto, Arial, sans-serif',
};

export const PLAYER = {
  radius: 26,
  gravity: 1800,
  jumpVelocity: 1080, // jump height = v^2 / (2g) ≈ 324px
  maxFallSpeed: 1400,
  maxSpeedX: 560,
  accelX: 3600,
  dragX: 3000,
};

export const PLATFORM = {
  height: 26,
  poolSize: 18,
  coinPoolSize: 10,
};

// Difficulty ramps from "easy" to "hard" as the score goes from 0 to DIFFICULTY.maxScore.
export const DIFFICULTY = {
  maxScore: 400,
  gap: { easy: 150, hard: 275 }, // vertical distance between platforms (must stay < jump height)
  gapJitter: 0.25, // +/- fraction of the gap
  width: { easy: 180, hard: 115 },
  movingChance: { easy: 0.05, hard: 0.55 },
  movingSpeed: { easy: 70, hard: 230 },
  breakingStartScore: 50,
  breakingChance: { easy: 0.12, hard: 0.35 },
  coinChance: 0.28,
};

// 1 point per this many pixels climbed.
export const PIXELS_PER_POINT = 50;

// Show an interstitial ad on every Nth game over (never during gameplay).
export const INTERSTITIAL_EVERY = 3;

// Show visual placeholder overlays for the ad stubs (useful during development).
export const SHOW_AD_PLACEHOLDERS = true;
