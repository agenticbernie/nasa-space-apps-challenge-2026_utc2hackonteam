// 100% procedural Web Audio API soundtrack & SFX engine — zero external audio URLs / zero 404s

export type MusicContext = 'title' | 'station' | 'red_alert' | 'none';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private muted = false;
  private masterVolume = 0.72;

  private musicContext: MusicContext = 'none';
  private musicPaused = false;
  private musicTimer: number | null = null;
  private musicStep = 0;

  private redAlertKlaxonTimer: number | null = null;
  private redAlertTimeout: number | null = null;
  private redAlertPulseTimer: number | null = null;
  private redAlertActive = false;

  private lastTypeBlipAt = 0;
  private lastTrolleyRollAt = 0;
  private lastRoverDriveAt = 0;
  private lastScanPingAt = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.muted) return null;
    return this.ctx;
  }

  private getOutputNode(): AudioNode | null {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return null;
    return this.masterGain;
  }

  public unlockAudio() {
    this.ensureContext();
    if (!this.muted && this.musicContext !== 'none' && !this.musicPaused && this.musicTimer === null) {
      this.startMusicLoop();
    }
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(mute ? 0 : this.masterVolume, now, 0.04);
    }
    if (mute) {
      this.clearRedAlertTimers();
      this.stopMusicLoop();
    } else {
      this.ensureContext();
      if (this.redAlertActive) {
        this.startBackgroundPulseLoop();
      }
      if (this.musicContext !== 'none' && !this.musicPaused) {
        this.startMusicLoop();
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(vol) ? vol : 0.72));
    this.masterVolume = clamped;
    if (clamped === 0 && !this.muted) {
      this.setMuted(true);
      return;
    }
    if (clamped > 0 && this.muted) {
      this.muted = false;
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.masterVolume, now, 0.03);
    }
    if (!this.muted && this.musicContext !== 'none' && !this.musicPaused && this.musicTimer === null) {
      this.startMusicLoop();
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setMusicContext(next: MusicContext, paused = false) {
    const changed = next !== this.musicContext || paused !== this.musicPaused;
    this.musicContext = next;
    this.musicPaused = paused;
    if (!changed && (this.musicTimer !== null || next === 'none' || paused || this.muted)) {
      return;
    }
    this.stopMusicLoop();
    if (next !== 'none' && !paused && !this.muted) {
      this.musicStep = 0;
      this.startMusicLoop();
    }
  }

  private stopMusicLoop() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private startMusicLoop() {
    this.stopMusicLoop();
    const intervalMs = this.musicContext === 'red_alert' ? 280 : this.musicContext === 'title' ? 380 : 560;
    this.musicTimer = window.setInterval(() => {
      if (this.muted || this.musicPaused || this.musicContext === 'none') return;
      this.tickMusicNote();
    }, intervalMs);
  }

  private playMusicTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    vol: number,
    cutoff = 2400,
  ) {
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  private tickMusicNote() {
    const step = this.musicStep++;
    if (this.musicContext === 'title') {
      // Curious, warm Lydian cosmic wonder melody for ages 7-12 (C major / Lydian)
      const arpNotes = [
        523.25, 659.25, 783.99, 987.77, 1046.5, 987.77, 783.99, 659.25,
        587.33, 739.99, 880.0, 1174.66, 880.0, 739.99, 659.25, 523.25,
      ];
      const padBass = [130.81, 130.81, 146.83, 164.81];
      const melody = arpNotes[step % arpNotes.length];
      this.playMusicTone(melody, 0.42, 'triangle', 0.055, 2200);
      if (step % 4 === 0) {
        const bass = padBass[Math.floor(step / 4) % padBass.length];
        this.playMusicTone(bass, 1.4, 'sine', 0.075, 600);
        this.playMusicTone(bass * 1.5, 1.2, 'sine', 0.04, 900);
      }
      return;
    }

    if (this.musicContext === 'station') {
      // Calm ambient space station synth + subtle warm HVAC drone
      const calmChords = [
        [220.0, 329.63, 440.0], // Am add9 feel
        [174.61, 261.63, 392.0], // Fmaj7 feel
        [196.0, 293.66, 440.0], // Gsus4
        [164.81, 246.94, 392.0], // Em7
      ];
      if (step % 6 === 0) {
        const chord = calmChords[Math.floor(step / 6) % calmChords.length];
        chord.forEach((f, idx) => {
          this.playMusicTone(f, 2.9, idx === 0 ? 'sine' : 'triangle', idx === 0 ? 0.055 : 0.028, 1100);
        });
      }
      // Gentle sparse starlight chime
      if (step % 4 === 2) {
        const pings = [659.25, 783.99, 880.0, 587.33];
        this.playMusicTone(pings[Math.floor(step / 4) % pings.length], 0.65, 'sine', 0.028, 1800);
      }
      return;
    }

    if (this.musicContext === 'red_alert') {
      // Urgent Solar Particle Storm rhythmic pulse + minor tension
      const bassPulse = [110.0, 110.0, 116.54, 110.0, 98.0, 98.0, 110.0, 130.81];
      const f = bassPulse[step % bassPulse.length];
      this.playMusicTone(f, 0.22, 'sawtooth', 0.065, 720);
      if (step % 2 === 1) {
        const urgentHigh = [440.0, 466.16, 523.25, 466.16];
        this.playMusicTone(urgentHigh[Math.floor(step / 2) % urgentHigh.length], 0.16, 'square', 0.025, 1400);
      }
    }
  }

  public playBeep(freq = 660, duration = 0.08, type: OscillatorType = 'square', volume = 0.06) {
    const ctx = this.ensureContext();
    const out = this.getOutputNode();
    if (!ctx || !out) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  public playUiClick() {
    this.playBeep(760, 0.042, 'triangle', 0.065);
    setTimeout(() => this.playBeep(1020, 0.035, 'sine', 0.045), 25);
  }

  public playTypewriterBlip(charIndex = 0) {
    const nowMs = performance.now();
    if (nowMs - this.lastTypeBlipAt < 45) return;
    this.lastTypeBlipAt = nowMs;
    const pitch = 520 + (charIndex % 5) * 48;
    this.playBeep(pitch, 0.026, 'triangle', 0.032);
  }

  public playConsoleOpen() {
    this.playBeep(520, 0.06, 'triangle', 0.08);
    setTimeout(() => this.playBeep(780, 0.09, 'triangle', 0.07), 55);
  }

  public playDecisionConfirm() {
    this.playBeep(440, 0.07, 'square', 0.05);
    setTimeout(() => this.playBeep(660, 0.08, 'square', 0.05), 65);
    setTimeout(() => this.playBeep(880, 0.14, 'triangle', 0.07), 130);
  }

  public playWarningAlarm() {
    const ctx = this.ensureContext();
    const out = this.getOutputNode();
    if (!ctx || !out) return;
    const now = ctx.currentTime;

    for (let i = 0; i < 2; i++) {
      const start = now + i * 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(840, start);
      osc.frequency.linearRampToValueAtTime(520, start + 0.18);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.19);

      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.2);
    }
  }

  public playAirlockDoor() {
    this.playAirlockSlide(false);
  }

  public playAirlockSlide(opening: boolean) {
    const ctx = this.ensureContext();
    const out = this.getOutputNode();
    if (!ctx || !out) return;
    const now = ctx.currentTime;

    const dur = 0.32;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(opening ? 1300 : 900, now);
    filter.frequency.exponentialRampToValueAtTime(opening ? 2400 : 450, now + dur);
    filter.Q.value = 1.5;

    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.001, now);
    hissGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    hissGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(out);
    noise.start(now);
    noise.stop(now + dur);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(opening ? 95 : 140, now);
    osc.frequency.exponentialRampToValueAtTime(opening ? 165 : 48, now + 0.32);

    gain.gain.setValueAtTime(0.095, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.35);

    this.playBeep(opening ? 880 : 520, 0.06, 'triangle', 0.05);
  }

  public playSuccessChime() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 0.16, 'triangle', 0.065), idx * 90);
    });
  }

  public playRepairSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 0.18, 'triangle', 0.08), idx * 75);
    });
  }

  public playAchievementFanfare() {
    const fanfare = [
      { f: 523.25, d: 0.11, t: 0 },
      { f: 659.25, d: 0.11, t: 95 },
      { f: 783.99, d: 0.11, t: 190 },
      { f: 1046.5, d: 0.36, t: 295 },
      { f: 783.99, d: 0.34, t: 295 },
    ];
    fanfare.forEach((n) => {
      setTimeout(() => this.playBeep(n.f, n.d, 'triangle', 0.075), n.t);
    });
  }

  public playFootstep(stepIndex = 0) {
    const ctx = this.ensureContext();
    const out = this.getOutputNode();
    if (!ctx || !out) return;
    const now = ctx.currentTime;

    // Metallic deck floor thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = stepIndex % 2 === 0 ? 96 : 86;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.055);

    gain.gain.setValueAtTime(0.036, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.065);

    // Subtle metal plate boot tap
    const tap = ctx.createOscillator();
    const tapGain = ctx.createGain();
    tap.type = 'sine';
    tap.frequency.setValueAtTime(stepIndex % 2 === 0 ? 440 : 390, now);
    tap.frequency.exponentialRampToValueAtTime(180, now + 0.022);
    tapGain.gain.setValueAtTime(0.015, now);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    tap.connect(tapGain);
    tapGain.connect(out);
    tap.start(now);
    tap.stop(now + 0.028);
  }

  public playTrolleyRoll() {
    const nowMs = performance.now();
    if (nowMs - this.lastTrolleyRollAt < 430) return;
    this.lastTrolleyRollAt = nowMs;

    const ctx = this.ensureContext();
    const out = this.getOutputNode();
    if (!ctx || !out) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(58, now);
    osc.frequency.linearRampToValueAtTime(72, now + 0.14);
    osc.frequency.linearRampToValueAtTime(52, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.value = 260;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.32);

    // Soft caster rattle click
    setTimeout(() => this.playBeep(310, 0.022, 'triangle', 0.02), 90);
  }

  public playRoverDrivePulse() {
    const nowMs = performance.now();
    if (nowMs - this.lastRoverDriveAt < 220) return;
    this.lastRoverDriveAt = nowMs;
    this.playBeep(145, 0.065, 'triangle', 0.032);
  }

  public playRoverScanPing() {
    const nowMs = performance.now();
    if (nowMs - this.lastScanPingAt < 650) return;
    this.lastScanPingAt = nowMs;
    this.playBeep(1180, 0.06, 'sine', 0.055);
    setTimeout(() => this.playBeep(1560, 0.09, 'sine', 0.05), 65);
  }

  public playCommsMessage() {
    const notes = [783.99, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 0.11, 'triangle', 0.06), idx * 75);
    });
  }

  private playKlaxonSweep() {
    const ctx = this.ensureContext();
    const out = this.getOutputNode();
    if (!ctx || !out) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.linearRampToValueAtTime(860, now + 0.24);
    osc.frequency.linearRampToValueAtTime(520, now + 0.48);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.042, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.54);
  }

  private clearRedAlertTimers() {
    if (this.redAlertKlaxonTimer !== null) {
      clearInterval(this.redAlertKlaxonTimer);
      this.redAlertKlaxonTimer = null;
    }
    if (this.redAlertTimeout !== null) {
      clearTimeout(this.redAlertTimeout);
      this.redAlertTimeout = null;
    }
    if (this.redAlertPulseTimer !== null) {
      clearInterval(this.redAlertPulseTimer);
      this.redAlertPulseTimer = null;
    }
  }

  private startBackgroundPulseLoop() {
    this.clearRedAlertTimers();
    this.redAlertPulseTimer = window.setInterval(() => {
      if (!this.redAlertActive || this.muted) return;
      this.playBeep(680, 0.12, 'triangle', 0.022);
    }, 2600);
  }

  public startRedAlertAlarm() {
    this.redAlertActive = true;
    this.clearRedAlertTimers();
    if (!this.muted) {
      this.playKlaxonSweep();
    }
    this.redAlertKlaxonTimer = window.setInterval(() => {
      if (!this.redAlertActive || this.muted) return;
      this.playKlaxonSweep();
    }, 780);

    this.redAlertTimeout = window.setTimeout(() => {
      if (!this.redAlertActive) return;
      this.startBackgroundPulseLoop();
    }, 4500);
  }

  public setRedAlertPaused(paused: boolean) {
    if (!this.redAlertActive) return;
    if (paused) {
      this.clearRedAlertTimers();
    } else if (!this.muted) {
      this.startBackgroundPulseLoop();
    }
  }

  public stopRedAlertAlarm() {
    this.redAlertActive = false;
    this.clearRedAlertTimers();
  }

  public playRoverPickup() {
    this.playBeep(587.33, 0.06, 'triangle', 0.065);
    setTimeout(() => this.playBeep(880, 0.08, 'triangle', 0.065), 60);
    setTimeout(() => this.playBeep(1174.66, 0.12, 'triangle', 0.06), 120);
  }

  public playSparkError() {
    const ctx = this.ensureContext();
    const out = this.getOutputNode();
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    const dur = 0.28;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (i % 7 < 3 ? 0.65 : 0.15);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1100;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    noise.start(now);
    noise.stop(now + dur);

    this.playBeep(210, 0.18, 'sawtooth', 0.065);
    setTimeout(() => this.playBeep(155, 0.22, 'sawtooth', 0.06), 110);
  }

  public playMedHeal() {
    const notes = [523.25, 659.25, 987.77];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playBeep(f, 0.14, 'sine', 0.065), idx * 80);
    });
  }

  public playBotanyCare() {
    this.playBeep(493.88, 0.07, 'sine', 0.055);
    setTimeout(() => this.playBeep(739.99, 0.11, 'triangle', 0.055), 70);
  }
}

export const soundEngine = new SoundEngine();
