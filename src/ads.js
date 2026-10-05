// Ad integration stubs.
//
// Every function returns a Promise so real implementations (e.g. AdMob via
// @capacitor-community/admob) can be dropped in without touching game code:
//
//   import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
//   export async function showRewardedAd() {
//     await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/yyy' });
//     const reward = await AdMob.showRewardVideoAd();
//     return Boolean(reward);
//   }

import { INTERSTITIAL_EVERY, SHOW_AD_PLACEHOLDERS } from './config.js';

let initialized = false;
let gameOverCount = 0;

/** Initialise the ad SDK. Safe to call multiple times. */
export async function initAds() {
  if (initialized) return;
  initialized = true;
  // Real: await AdMob.initialize({ initializeForTesting: true });
  console.info('[ads] initAds (stub)');
}

/** Show a banner ad (menu / game-over screens only). */
export async function showBanner() {
  // Real: await AdMob.showBanner({ adId, position: BannerAdPosition.BOTTOM_CENTER });
  console.info('[ads] showBanner (stub)');
}

/** Hide the banner ad (call when gameplay starts). */
export async function hideBanner() {
  // Real: await AdMob.hideBanner();
  console.info('[ads] hideBanner (stub)');
}

/** Show a full-screen interstitial. Resolves when it is closed. */
export async function showInterstitial() {
  console.info('[ads] showInterstitial (stub)');
  await placeholder('Interstitial ad', 1200);
}

/**
 * Show a rewarded video. Resolves true if the user earned the reward.
 * Stub: always resolves true.
 */
export async function showRewardedAd() {
  console.info('[ads] showRewardedAd (stub)');
  await placeholder('Rewarded ad', 1500);
  return true;
}

/**
 * Call once per game over (from the game-over screen, never during gameplay).
 * Shows an interstitial every INTERSTITIAL_EVERY game overs.
 */
export async function onGameOver() {
  gameOverCount += 1;
  if (gameOverCount % INTERSTITIAL_EVERY === 0) {
    await showInterstitial();
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Development placeholder: a DOM overlay that blocks input for a moment so the
// ad flow is visible while testing. Disabled via SHOW_AD_PLACEHOLDERS.
function placeholder(label, durationMs) {
  if (!SHOW_AD_PLACEHOLDERS || typeof document === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.setAttribute('data-ad-placeholder', label);
    el.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:9999',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'gap:12px',
      'background:rgba(0,0,0,0.85)',
      'color:#fff',
      'font:600 22px system-ui,sans-serif',
      'touch-action:none',
    ].join(';');
    el.innerHTML = `<div>${label}</div><div style="font-size:14px;opacity:.7">(placeholder – no real ads yet)</div>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.remove();
      resolve();
    }, durationMs);
  });
}
