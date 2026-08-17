// Synthesized two-tone chime via Web Audio API instead of an audio file —
// no asset to host/load, and the exact same sound everywhere. Browsers
// block audio (including generated tones) until the page has had at least
// one real user gesture, so the AudioContext is created lazily and
// "unlocked" on the admin's first click/keydown rather than on load.

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

export function unlockNotificationSound(): void {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function playNotificationChime(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // A short, pleasant two-note chime (rising fifth) rather than a harsh beep.
  const notes: Array<{ freq: number; start: number; duration: number }> = [
  { freq: 880, start: 0, duration: 0.16 },
  { freq: 1318.5, start: 0.1, duration: 0.22 }];


  notes.forEach(({ freq, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  });
}
