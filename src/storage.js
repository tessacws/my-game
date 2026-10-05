import { STORAGE_PREFIX } from './config.js';

// Thin wrapper around localStorage that never throws (private mode, blocked storage, etc.).
const memory = new Map();

function read(key, fallback) {
  const fullKey = STORAGE_PREFIX + key;
  try {
    const raw = window.localStorage.getItem(fullKey);
    if (raw === null) return memory.has(fullKey) ? memory.get(fullKey) : fallback;
    return JSON.parse(raw);
  } catch {
    return memory.has(fullKey) ? memory.get(fullKey) : fallback;
  }
}

function write(key, value) {
  const fullKey = STORAGE_PREFIX + key;
  memory.set(fullKey, value);
  try {
    window.localStorage.setItem(fullKey, JSON.stringify(value));
  } catch {
    // Storage unavailable: keep the in-memory value for this session.
  }
}

export const Storage = {
  getBestScore() {
    return Number(read('bestScore', 0)) || 0;
  },
  /** Saves the score if it beats the best. Returns true on a new record. */
  submitScore(score) {
    if (score > this.getBestScore()) {
      write('bestScore', score);
      return true;
    }
    return false;
  },
  getCoins() {
    return Number(read('coins', 0)) || 0;
  },
  addCoins(amount) {
    const total = this.getCoins() + amount;
    write('coins', total);
    return total;
  },
  isMuted() {
    return Boolean(read('muted', false));
  },
  setMuted(muted) {
    write('muted', Boolean(muted));
  },
};
