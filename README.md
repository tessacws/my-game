# Sky Hopper

A mobile-first, portrait, one-touch 2D casual game built with **Phaser 3**, **Vite** and plain JavaScript.
Bounce a ball upward across moving platforms, collect coins and climb as high as you can.

All graphics are drawn at runtime with Canvas gradients and all sound effects are synthesized with
the Web Audio API, so the game has no image or audio files.

## Run it

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev       # start the dev server: http://localhost:5173 (also reachable on your LAN for phone testing)
npm run build     # production build into dist/
npm run preview   # serve the built dist/ locally
```

### Deploying to GitHub Pages

`vite.config.js` uses a relative base path (`base: './'`), so the contents of `dist/` work from any
sub-path, including `https://<user>.github.io/<repo>/`. Build, then publish the `dist/` folder
(for example to a `gh-pages` branch, or with the "GitHub Actions → Static HTML" Pages workflow pointed at `dist/`).

## How to play

| Action | Touch | Keyboard |
| --- | --- | --- |
| Move left / right | Hold the left / right half of the screen | `←` `→` or `A` `D` |
| Pause / resume | Pause button (top right) | `P` or `Esc` |
| Start from the menu | **PLAY** | `Enter` / `Space` |
| Restart (game over) | **RESTART** | `Enter` / `Space` / `R` |
| Home (pause / game over) | **HOME** | `H` |
| Continue (game over) | **Watch ad to continue** | `C` |

- The ball bounces automatically whenever it lands on a platform from above.
- Leaving the screen on one side brings you back on the other.
- Your score is the height you have climbed. Fall below the screen and it's game over.
- **Green** platforms are solid. **Blue** platforms slide sideways. **Brown, cracked** platforms
  (from score 50) give you one bounce and then crumble.
- As you climb, gaps grow, platforms shrink and move faster, and the sky turns to night.
- Coins float above some platforms. Your best score and total coins are saved in `localStorage`.
- You can continue once per run by watching a rewarded ad (currently a stub that always succeeds).
- The speaker button mutes and unmutes sound; the setting is remembered.

## File structure

```
├── index.html                 # Page shell, mobile viewport meta, #game container
├── vite.config.js             # base: './' for GitHub Pages
├── src/
│   ├── main.js                # Phaser.Game config (Scale.FIT, 720x1280, Arcade physics) and scene list
│   ├── config.js              # All tuning: sizes, colours, physics, difficulty curve, ad frequency
│   ├── ads.js                 # Ad stubs: initAds, showBanner, hideBanner, showInterstitial, showRewardedAd, onGameOver
│   ├── sound.js               # Web Audio sound effects and the mute toggle
│   ├── storage.js             # Safe localStorage wrapper (best score, coins, mute)
│   ├── scenes/
│   │   ├── BootScene.js       # Generates textures, then opens the menu
│   │   ├── MenuScene.js       # Title, Play, best score, coins, mute
│   │   ├── GameScene.js       # Gameplay: player, platform generation and pooling, coins, HUD, difficulty
│   │   ├── PauseScene.js      # Overlay: Resume, Home, mute
│   │   └── GameOverScene.js   # Overlay: score, best, Watch ad to continue, Restart, Home
│   └── objects/
│       ├── textures.js        # Procedural textures (sky, ball, platforms, coin, particles, clouds)
│       ├── Player.js          # Ball physics and controls
│       ├── Platform.js        # Pooled platform (normal / moving / breaking)
│       ├── Coin.js            # Pooled coin that rides on a platform
│       ├── Background.js      # Day-to-night sky, stars, parallax clouds
│       ├── Button.js          # Rounded text button
│       ├── IconButton.js      # Round icon button (pause / sound)
│       ├── MuteButton.js      # Sound toggle bound to the global mute state
│       └── Panel.js           # Dimmed backdrop and panel for overlays
```

## Ads (AdMob-ready stubs)

`src/ads.js` exposes promise-based stubs with the same shape a real integration needs:

- `showBanner()` / `hideBanner()`: the banner shows on the menu and game-over screens and hides when gameplay starts.
- `showInterstitial()`: called by `onGameOver()` on every 3rd game over (`INTERSTITIAL_EVERY` in `config.js`),
  only from the game-over screen and never during gameplay.
- `showRewardedAd()`: resolves `true`. It powers the one-time "Watch ad to continue".

In development, each stub shows a short placeholder overlay. Turn this off with `SHOW_AD_PLACEHOLDERS = false`.
To ship real ads, wrap the build with [Capacitor](https://capacitorjs.com/) and replace the stub bodies with
calls to `@capacitor-community/admob` (an example is in the comment at the top of `ads.js`).

## Performance notes

- Platforms and coins are pooled and recycled. Gameplay creates no new objects once the pool is warm.
- Textures are generated once at boot. Platform textures are cached by width, in 5 px steps.
- Score and coin text only re-render when their value changes.
- Listeners on game-level emitters are removed when a scene shuts down, and one shared `AudioContext`
  serves the whole app. Restarting repeatedly keeps object and listener counts flat.
