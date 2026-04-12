/**
 * Industry Standard POS Auditory Feedback
 * Uses Web Audio API to synthesize sounds without external assets.
 */

let audioCtx: AudioContext | null = null;

const getAudioCtx = () => {
    if (!audioCtx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContext();
    }
    return audioCtx;
};

/**
 * Clean, high-pitched "Beep" for successful scans.
 * 880Hz (A5) Sine wave for 100ms.
 */
export const playSuccessBeep = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
};

/**
 * Harsher, low-pitched "Buzz" for errors or unknown products.
 * 110Hz (A2) Sawtooth wave for 200ms.
 */
export const playErrorBuzzer = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
};
