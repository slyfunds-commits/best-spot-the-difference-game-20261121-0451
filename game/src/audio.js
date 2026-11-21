// Small WebAudio sounds, made from oscillators — no audio files to load. The context is
// created on the first user gesture, so the browser's autoplay rules never block the page
// from loading, and every call is a no-op until then.
let context = null;

function audio() {
  if (context) return context;
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

/** Unlock the sound on a gesture (pointer down or a key). */
export function unlockAudio() {
  const ctx = audio();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

/** One tone: frequency in Hz, length in seconds, wave shape, and volume 0..1. */
function tone(freq, dur, type, volume, when = 0) {
  const ctx = audio();
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** A found difference: a bright two-note chime. */
export function playFound() {
  tone(660, 0.16, 'sine', 0.22);
  tone(990, 0.28, 'sine', 0.2, 0.09);
}

/** A wrong click: a low, short buzz. */
export function playMiss() {
  tone(140, 0.18, 'sawtooth', 0.1);
}

/** A hint: a soft rising blip. */
export function playHint() {
  tone(520, 0.12, 'sine', 0.14);
  tone(780, 0.18, 'sine', 0.12, 0.08);
}

/** A scene cleared: a little rising arpeggio. */
export function playClear() {
  tone(523, 0.14, 'triangle', 0.2);
  tone(659, 0.14, 'triangle', 0.2, 0.11);
  tone(784, 0.22, 'triangle', 0.2, 0.22);
  tone(1047, 0.34, 'triangle', 0.2, 0.33);
}

/** Time running out: a tick. */
export function playTick() {
  tone(880, 0.06, 'square', 0.06);
}

/** The game won: a longer fanfare. */
export function playWin() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  for (let i = 0; i < notes.length; i += 1) tone(notes[i], 0.2, 'triangle', 0.18, i * 0.13);
}
