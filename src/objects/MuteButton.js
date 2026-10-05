import IconButton from './IconButton.js';
import { isMuted, toggleMute } from '../sound.js';

/** Sound on/off toggle that reflects and persists the global mute state. */
export default class MuteButton extends IconButton {
  constructor(scene, x, y, size = 88) {
    super(scene, x, y, isMuted() ? 'muted' : 'sound', (btn) => {
      btn.setIcon(toggleMute() ? 'muted' : 'sound');
    }, size);
  }
}
