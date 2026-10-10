// Audio & Voice Engine for "Chakam!"
// Powered by Web Speech Synthesis and Web Audio API for zero-dependency sound effects

const AUNTY_VOICE_LINES = [
  "Chakam! Is it not you? Do your work now now!",
  "You dey play? You think say I no see you? Stand up!",
  "Time is going. Time don go. Chakam! What are you waiting for?",
  "Don't let me call your mother. I will! Put that phone down!",
  "You said Monday. It's Friday. Which Monday? Chakam!",
  "Finish it! Now now. Not later. Now!",
  "Aunty is disappointed. Very disappointed. Chakam!",
  "You want to suffer? Continue. See me see you. Do the task!",
  "Clown. Clown. Clown. Chakam! Fix your life!",
  "Okay. You've done it. Aunty is proud. Small. Keep moving!"
];

class SoundEngine {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play an urgent Nigerian buzzer sound
  playBuzzer() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio buzzer error", e);
    }
  }

  // Play celebratory success chime
  playSuccess() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {
      console.warn("Audio success error", e);
    }
  }

  // Play strike warning sound
  playStrike() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("Strike sound error", e);
    }
  }
}

export const sounds = new SoundEngine();

// Speech Synthesis for Aunty Chakam
export function speakAunty(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1; // Sassy, high-energy tone
    
    // Attempt to pick a lively female voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => (v.lang.includes('NG') || v.lang.includes('GB') || v.lang.includes('US')) && v.name.toLowerCase().includes('female')) 
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    if (enVoice) {
      utterance.voice = enVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error", err);
  }
}

export function getRandomAuntyLine() {
  const idx = Math.floor(Math.random() * AUNTY_VOICE_LINES.length);
  return AUNTY_VOICE_LINES[idx];
}

export { AUNTY_VOICE_LINES };
