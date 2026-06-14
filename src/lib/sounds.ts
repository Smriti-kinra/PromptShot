let audioCtx: AudioContext | null = null;
let isMuted = localStorage.getItem("promptshot_sound_muted") === "true";
let scanOscillator: OscillatorNode | null = null;
let scanGain: GainNode | null = null;
let scanInterval: any = null;

function getAudioContext(): AudioContext | null {
  if (isMuted) return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  return audioCtx;
}

export const soundManager = {
  isMuted() {
    return isMuted;
  },

  toggleMute(forceState?: boolean) {
    if (forceState !== undefined) {
      isMuted = forceState;
    } else {
      isMuted = !isMuted;
    }
    localStorage.setItem("promptshot_sound_muted", isMuted ? "true" : "false");
    
    if (isMuted) {
      this.stopScan();
      if (audioCtx) {
        audioCtx.close().then(() => {
          audioCtx = null;
        });
      }
    }
    return isMuted;
  },

  playClick() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  playScan() {
    const ctx = getAudioContext();
    if (!ctx || scanOscillator) return;

    scanOscillator = ctx.createOscillator();
    scanGain = ctx.createGain();

    scanOscillator.type = "triangle";
    scanOscillator.frequency.setValueAtTime(110, ctx.currentTime);
    
    const now = ctx.currentTime;
    scanOscillator.frequency.linearRampToValueAtTime(145, now + 1);
    scanOscillator.frequency.linearRampToValueAtTime(110, now + 2);
    
    scanInterval = setInterval(() => {
      if (!scanOscillator || !ctx) {
        if (scanInterval) {
          clearInterval(scanInterval);
          scanInterval = null;
        }
        return;
      }
      const t = ctx.currentTime;
      try {
        scanOscillator.frequency.cancelScheduledValues(t);
        scanOscillator.frequency.setValueAtTime(scanOscillator.frequency.value, t);
        scanOscillator.frequency.linearRampToValueAtTime(145, t + 1);
        scanOscillator.frequency.linearRampToValueAtTime(110, t + 2);
      } catch (e) {
        // Safe guard in case oscillator stopped
      }
    }, 2000);

    scanGain.gain.setValueAtTime(0.06, ctx.currentTime);

    scanOscillator.connect(scanGain);
    scanGain.connect(ctx.destination);

    scanOscillator.start();
  },

  stopScan() {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
    
    if (scanOscillator) {
      try {
        scanOscillator.stop();
      } catch (e) {}
      scanOscillator = null;
    }
    
    if (scanGain && audioCtx) {
      try {
        scanGain.gain.setValueAtTime(scanGain.gain.value, audioCtx.currentTime);
        scanGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      } catch (e) {}
      scanGain = null;
    }
  },

  playThud() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lowpass = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.22);

    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(140, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  },

  playVictory() {
    const ctx = getAudioContext();
    if (!ctx) return;

    // A beautiful major pentatonic arpeggio sweep (C4, E4, G4, A4, C5, E5)
    const notes = [261.63, 329.63, 392.00, 440.00, 523.25, 659.25];
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      noteOsc.type = "sine";
      noteOsc.frequency.setValueAtTime(freq, now + index * 0.08);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.setValueAtTime(0, now + index * 0.08);
      noteGain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.3);

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start(now + index * 0.08);
      noteOsc.stop(now + index * 0.08 + 0.35);
    });
  },

  playWelcome() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ascending G-major chord tones (G4, B4, D5) representing target loading/welcome
    const notes = [392.00, 493.88, 587.33];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.075);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0, now + index * 0.075);
      gain.gain.linearRampToValueAtTime(0.04, now + index * 0.075 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.075 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.075);
      osc.stop(now + index * 0.075 + 0.3);
    });
  }
};
