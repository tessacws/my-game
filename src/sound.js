import { Storage } from './storage.js';

// Tiny procedural sound engine built on the Web Audio API.
// One shared AudioContext for the whole app (created lazily on first user gesture).

let ctx = null;
let master = null;
let muted = Storage.isMuted();

function getContext() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Call from a user gesture (tap / key) so mobile browsers allow audio. */
export function unlockAudio() {
  const c = getContext();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function tone({ type = 'sine', from, to = from, duration = 0.15, volume = 0.3, delay = 0 }) {
  if (muted) return;
  const c = getContext();
  if (!c || c.state !== 'running') return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
  // Disconnect when done so nodes can be garbage collected.
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function noise({ duration = 0.2, volume = 0.25, filterFreq = 1200 }) {
  if (muted) return;
  const c = getContext();
  if (!c || c.state !== 'running') return;
  const length = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start();
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

export const Sfx = {
  jump() {
    tone({ type: 'sine', from: 320, to: 720, duration: 0.14, volume: 0.25 });
  },
  coin() {
    tone({ type: 'square', from: 988, duration: 0.07, volume: 0.12 });
    tone({ type: 'square', from: 1319, duration: 0.18, volume: 0.12, delay: 0.07 });
  },
  break() {
    noise({ duration: 0.25, volume: 0.35, filterFreq: 900 });
  },
  click() {
    tone({ type: 'triangle', from: 660, to: 520, duration: 0.08, volume: 0.2 });
  },
  gameOver() {
    tone({ type: 'sawtooth', from: 440, to: 110, duration: 0.6, volume: 0.18 });
  },
  revive() {
    tone({ type: 'sine', from: 440, to: 880, duration: 0.12, volume: 0.2 });
    tone({ type: 'sine', from: 660, to: 1320, duration: 0.2, volume: 0.2, delay: 0.1 });
  },
};

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = Boolean(value);
  Storage.setMuted(muted);
  if (master && ctx) master.gain.setValueAtTime(muted ? 0 : 0.5, ctx.currentTime);
}

export function toggleMute() {
  setMuted(!muted);
  return muted;
}
