import { StemType } from '../types';

class StemAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private stemGainNodes: Map<StemType, GainNode> = new Map();
  private stemSources: Map<StemType, AudioBufferSourceNode> = new Map();
  private stemBuffers: Map<StemType, AudioBuffer> = new Map();
  private stemAnalyzers: Map<StemType, AnalyserNode> = new Map();

  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private duration = 16.0; // 16 seconds demo loop
  private playbackRate = 1.0;
  private isLooping = true;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    // Lazy init on first user gesture
  }

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    const stemTypes: StemType[] = ['vocals', 'drums', 'bass', 'other'];
    stemTypes.forEach(stem => {
      if (!this.ctx || !this.masterGain) return;
      const gain = this.ctx.createGain();
      const analyser = this.ctx.createAnalyser();
      analyser.fftSize = 64;

      gain.connect(analyser);
      analyser.connect(this.masterGain);

      this.stemGainNodes.set(stem, gain);
      this.stemAnalyzers.set(stem, analyser);
    });

    this.generateDemoStems();
  }

  // Synthesizes a high-quality 4-stem practice backing track (120 BPM Funk/Rock)
  private generateDemoStems() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bpm = 120;
    const secondsPerBeat = 60 / bpm;
    const totalBars = 8;
    const totalBeats = totalBars * 4;
    const length = Math.floor(totalBeats * secondsPerBeat * sampleRate);
    this.duration = totalBeats * secondsPerBeat;

    // 1. DRUMS BUFFER
    const drumBuffer = this.ctx.createBuffer(2, length, sampleRate);
    const drumL = drumBuffer.getChannelData(0);
    const drumR = drumBuffer.getChannelData(1);

    // 2. BASS BUFFER
    const bassBuffer = this.ctx.createBuffer(2, length, sampleRate);
    const bassL = bassBuffer.getChannelData(0);
    const bassR = bassBuffer.getChannelData(1);

    // 3. OTHER (GUITAR / KEYS) BUFFER
    const otherBuffer = this.ctx.createBuffer(2, length, sampleRate);
    const otherL = otherBuffer.getChannelData(0);
    const otherR = otherBuffer.getChannelData(1);

    // 4. VOCALS BUFFER
    const vocalBuffer = this.ctx.createBuffer(2, length, sampleRate);
    const vocalL = vocalBuffer.getChannelData(0);
    const vocalR = vocalBuffer.getChannelData(1);

    for (let beat = 0; beat < totalBeats; beat++) {
      const beatTime = beat * secondsPerBeat;
      const beatSample = Math.floor(beatTime * sampleRate);
      const isDownbeat = beat % 4 === 0;
      const isBackbeat = beat % 4 === 2;

      // --- DRUMS SYNTHESIS ---
      // Kick on 1 and 3
      if (isDownbeat || beat % 4 === 2) {
        const kickDuration = Math.min(Math.floor(0.25 * sampleRate), length - beatSample);
        for (let i = 0; i < kickDuration; i++) {
          const t = i / sampleRate;
          const freq = 120 * Math.exp(-t * 18);
          const env = Math.exp(-t * 12);
          const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
          drumL[beatSample + i] += sample;
          drumR[beatSample + i] += sample;
        }
      }

      // Snare on 2 and 4
      if (beat % 4 === 1 || beat % 4 === 3) {
        const snareDuration = Math.min(Math.floor(0.22 * sampleRate), length - beatSample);
        for (let i = 0; i < snareDuration; i++) {
          const t = i / sampleRate;
          const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 20);
          const noise = (Math.random() * 2 - 1) * Math.exp(-t * 15);
          const sample = (tone * 0.4 + noise * 0.6) * 0.7;
          drumL[beatSample + i] += sample;
          drumR[beatSample + i] += sample;
        }
      }

      // Hi-Hats every 8th note
      for (let eighth = 0; eighth < 2; eighth++) {
        const hatSample = beatSample + Math.floor(eighth * 0.5 * secondsPerBeat * sampleRate);
        const hatDuration = Math.min(Math.floor(0.06 * sampleRate), length - hatSample);
        for (let i = 0; i < hatDuration; i++) {
          const t = i / sampleRate;
          const noise = (Math.random() * 2 - 1) * Math.exp(-t * 50);
          drumL[hatSample + i] += noise * 0.25;
          drumR[hatSample + i] += noise * 0.25;
        }
      }

      // --- BASS SYNTHESIS (Progression: Am - F - C - G) ---
      const bar = Math.floor(beat / 4) % 4;
      const bassFreqs = [55.0, 43.65, 65.41, 49.0]; // A1, F1, C2, G1
      const rootFreq = bassFreqs[bar];
      const bassNoteDuration = Math.floor(secondsPerBeat * 0.85 * sampleRate);
      for (let i = 0; i < bassNoteDuration; i++) {
        const idx = beatSample + i;
        if (idx >= length) break;
        const t = i / sampleRate;
        const env = Math.exp(-t * 2.5);
        // Slap bass / warm sub
        const fund = Math.sin(2 * Math.PI * rootFreq * t);
        const harm = Math.sin(2 * Math.PI * rootFreq * 2 * t) * 0.4;
        const sample = (fund + harm) * env * 0.5;
        bassL[idx] += sample;
        bassR[idx] += sample;
      }

      // --- GUITAR / CHORDS (Other) ---
      const chordNotes = [
        [220, 261.63, 329.63], // Am (A, C, E)
        [174.61, 220, 261.63], // F (F, A, C)
        [261.63, 329.63, 392], // C (C, E, G)
        [196, 246.94, 293.66], // G (G, B, D)
      ][bar];

      const strumOffset = (beat % 2 === 1) ? 0 : Math.floor(0.03 * sampleRate);
      const chordDuration = Math.floor(secondsPerBeat * 0.9 * sampleRate);
      for (let i = 0; i < chordDuration; i++) {
        const idx = beatSample + strumOffset + i;
        if (idx >= length) break;
        const t = i / sampleRate;
        const env = Math.exp(-t * 3.0);
        let sample = 0;
        chordNotes.forEach((f, cIdx) => {
          // Acoustic/electric rhythm pluck
          sample += (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) / chordNotes.length;
        });
        otherL[idx] += sample * env * 0.35;
        otherR[idx] += sample * env * 0.35;
      }

      // --- VOCALS (Lead vocal melody / singing synth formant) ---
      const vocalMelody = [
        440, 493.88, 523.25, 493.88, // A4, B4, C5, B4
        349.23, 392.00, 440.00, 392.00, // F4, G4, A4, G4
        523.25, 587.33, 659.25, 587.33, // C5, D5, E5, D5
        392.00, 440.00, 493.88, 440.00  // G4, A4, B4, A4
      ][beat % 16];

      const vocalDuration = Math.floor(secondsPerBeat * 0.9 * sampleRate);
      for (let i = 0; i < vocalDuration; i++) {
        const idx = beatSample + i;
        if (idx >= length) break;
        const t = i / sampleRate;
        // Warm vocal vibrato
        const vibrato = 1.0 + 0.015 * Math.sin(2 * Math.PI * 5.5 * t);
        const f = vocalMelody * vibrato;
        // Human voice vowel simulation (formant rich)
        const v1 = Math.sin(2 * Math.PI * f * t);
        const v2 = 0.5 * Math.sin(2 * Math.PI * f * 2 * t);
        const v3 = 0.25 * Math.sin(2 * Math.PI * f * 3 * t);
        const env = Math.sin((i / vocalDuration) * Math.PI); // Smooth in and out
        const sample = (v1 + v2 + v3) * env * 0.28;
        vocalL[idx] += sample;
        vocalR[idx] += sample;
      }
    }

    this.stemBuffers.set('drums', drumBuffer);
    this.stemBuffers.set('bass', bassBuffer);
    this.stemBuffers.set('other', otherBuffer);
    this.stemBuffers.set('vocals', vocalBuffer);
  }

  public async play(): Promise<void> {
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;

    this.stopAllSources();

    this.startTime = this.ctx.currentTime - (this.pauseOffset / this.playbackRate);

    const stemTypes: StemType[] = ['vocals', 'drums', 'bass', 'other'];
    stemTypes.forEach(stem => {
      const buffer = this.stemBuffers.get(stem);
      const gainNode = this.stemGainNodes.get(stem);
      if (!this.ctx || !buffer || !gainNode) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = this.isLooping;
      source.playbackRate.value = this.playbackRate;
      source.connect(gainNode);

      const offset = (this.pauseOffset % this.duration);
      source.start(0, offset);
      this.stemSources.set(stem, source);
    });

    this.isPlaying = true;
    this.startTimeTracking();
  }

  public pause(): void {
    if (!this.isPlaying || !this.ctx) return;
    const elapsed = (this.ctx.currentTime - this.startTime) * this.playbackRate;
    this.pauseOffset = elapsed % this.duration;

    this.stopAllSources();
    this.isPlaying = false;
    this.stopTimeTracking();
  }

  public stop(): void {
    this.pauseOffset = 0;
    this.pause();
  }

  public seek(seconds: number): void {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }
    this.pauseOffset = Math.max(0, Math.min(seconds, this.duration));
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.pauseOffset);
    }
    if (wasPlaying) {
      this.play();
    }
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    this.stemSources.forEach(source => {
      source.playbackRate.value = rate;
    });
  }

  public setStemVolume(stem: StemType, volume: number): void {
    const gainNode = this.stemGainNodes.get(stem);
    if (gainNode && this.ctx) {
      gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public updateMix(tracks: { id: StemType; volume: number; isMuted: boolean; isSolo: boolean }[]): void {
    const hasAnySolo = tracks.some(t => t.isSolo);

    tracks.forEach(t => {
      let effectiveVol = t.volume;
      if (t.isMuted) {
        effectiveVol = 0;
      } else if (hasAnySolo && !t.isSolo) {
        effectiveVol = 0;
      }
      this.setStemVolume(t.id, effectiveVol);
    });
  }

  public getStemLevel(stem: StemType): number {
    const analyser = this.stemAnalyzers.get(stem);
    if (!analyser || !this.isPlaying) return 0;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / (data.length * 255);
  }

  public async loadCustomStem(stem: StemType, fileData: ArrayBuffer): Promise<void> {
    this.initContext();
    if (!this.ctx) return;
    const decodedBuffer = await this.ctx.decodeAudioData(fileData);
    this.stemBuffers.set(stem, decodedBuffer);
    if (decodedBuffer.duration > this.duration) {
      this.duration = decodedBuffer.duration;
    }
    if (this.isPlaying) {
      this.play();
    }
  }

  public async loadFullTrack(fileData: ArrayBuffer): Promise<number> {
    this.initContext();
    if (!this.ctx) return 0;
    this.stop();
    const decodedBuffer = await this.ctx.decodeAudioData(fileData);
    this.duration = decodedBuffer.duration;
    // Load as default full track into other stem and clear pause offset
    this.stemBuffers.set('other', decodedBuffer);
    this.pauseOffset = 0;
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0);
    }
    return this.duration;
  }

  public setOnTimeUpdate(cb: (time: number) => void): void {
    this.onTimeUpdateCallback = cb;
  }

  public getDuration(): number {
    return this.duration;
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx) return this.pauseOffset;
    const elapsed = (this.ctx.currentTime - this.startTime) * this.playbackRate;
    return elapsed % this.duration;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private stopAllSources() {
    this.stemSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    });
    this.stemSources.clear();
  }

  private startTimeTracking() {
    const tick = () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.getCurrentTime());
      }
      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame(tick);
      }
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopTimeTracking() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

export const audioEngine = new StemAudioEngine();
