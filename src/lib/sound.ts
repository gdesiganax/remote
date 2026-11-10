/** Synthetic katana slash sound via Web Audio API (no external files). */

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

/** Call once on first user gesture so browsers allow audio. */
export async function unlockAudio(): Promise<void> {
  const ctx = getCtx();
  if (!ctx || unlocked) return;
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Silent buffer to fully unlock on iOS/Safari
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    unlocked = true;
  } catch {
    // ignore
  }
}

export function playSlashSound(): void {
  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const now = ctx.currentTime;

  // Noise burst (crack)
  const bufferSize = Math.floor(ctx.sampleRate * 0.14);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 16) * 0.55;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 2400;
  noiseFilter.Q.value = 0.7;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.42, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.15);

  // Metallic whoosh
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(720, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
  const oscFilter = ctx.createBiquadFilter();
  oscFilter.type = 'lowpass';
  oscFilter.frequency.setValueAtTime(4500, now);
  oscFilter.frequency.exponentialRampToValueAtTime(350, now + 0.22);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.15, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
  osc.connect(oscFilter);
  oscFilter.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.24);

  // Blade tip ring
  const ring = ctx.createOscillator();
  ring.type = 'sine';
  ring.frequency.setValueAtTime(2600, now + 0.02);
  ring.frequency.exponentialRampToValueAtTime(700, now + 0.16);
  const ringGain = ctx.createGain();
  ringGain.gain.setValueAtTime(0.1, now + 0.02);
  ringGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
  ring.connect(ringGain);
  ringGain.connect(ctx.destination);
  ring.start(now + 0.02);
  ring.stop(now + 0.17);
}
