import { StemType } from '../types';

class StemAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private stemGainNodes: Map<StemType, GainNode> = new Map();
  private stemFilters: Map<StemType, BiquadFilterNode> = new Map();
  private stemSources: Map<StemType, AudioBufferSourceNode> = new Map();
  private stemBuffers: Map<StemType, AudioBuffer> = new Map();
  private stemAnalyzers: Map<StemType, AnalyserNode> = new Map();

  private fullTrackBuffer: AudioBuffer | null = null;
  private fullTrackSource: AudioBufferSourceNode | null = null;
  private hasDedicatedStems = false;

  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private duration = 0;
  private playbackRate = 1.0;
  private isLooping = true;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private animationFrameId: number | null = null;

  constructor() {}

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    const stemTypes: StemType[] = ['vocals', 'drums', 'bass', 'piano', 'brass', 'other'];
    stemTypes.forEach((stem) => {
      if (!this.ctx || !this.masterGain) return;

      const gain = this.ctx.createGain();
      const analyser = this.ctx.createAnalyser();
      analyser.fftSize = 64;

      // Create crossover band filter for instant multi-stem practice
      let filter: BiquadFilterNode = this.ctx.createBiquadFilter();

      if (stem === 'bass') {
        // Bassline & Kick low end: Cutoff 250Hz
        filter.type = 'lowpass';
        filter.frequency.value = 260;
      } else if (stem === 'piano') {
        // Keyboards / Piano: Body & chords 250Hz - 1100Hz
        filter.type = 'bandpass';
        filter.frequency.value = 650;
        filter.Q.value = 0.9;
      } else if (stem === 'vocals') {
        // Vocals: Main vocal intelligibility band 1000Hz - 3200Hz
        filter.type = 'bandpass';
        filter.frequency.value = 1750;
        filter.Q.value = 0.8;
      } else if (stem === 'brass') {
        // Brass & Horns: Saxophone & trumpet punch 1800Hz - 4200Hz
        filter.type = 'bandpass';
        filter.frequency.value = 2900;
        filter.Q.value = 1.1;
      } else if (stem === 'drums') {
        // Drums & Percussion: High-pass transients & cymbals > 3600Hz
        filter.type = 'highpass';
        filter.frequency.value = 3600;
      } else {
        // Guitars & Other: Stereo / high-mid presence
        filter.type = 'peaking';
        filter.frequency.value = 2400;
        filter.gain.value = 2.0;
      }

      filter.connect(gain);
      gain.connect(analyser);
      analyser.connect(this.masterGain);

      this.stemFilters.set(stem, filter);
      this.stemGainNodes.set(stem, gain);
      this.stemAnalyzers.set(stem, analyser);
    });
  }

  public hasTrack(): boolean {
    return this.fullTrackBuffer !== null || this.stemBuffers.size > 0;
  }

  public async play(): Promise<void> {
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying || (!this.fullTrackBuffer && this.stemBuffers.size === 0)) return;

    this.stopAllSources();
    this.startTime = this.ctx.currentTime - this.pauseOffset / this.playbackRate;

    const stemTypes: StemType[] = ['vocals', 'drums', 'bass', 'piano', 'brass', 'other'];

    if (this.hasDedicatedStems) {
      // Direct dedicated isolated stems from Demucs AI
      stemTypes.forEach((stem) => {
        const buffer = this.stemBuffers.get(stem);
        const gainNode = this.stemGainNodes.get(stem);
        if (!this.ctx || !buffer || !gainNode) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = this.isLooping;
        source.playbackRate.value = this.playbackRate;
        source.connect(gainNode);

        const offset = this.pauseOffset % this.duration;
        source.start(0, offset);
        this.stemSources.set(stem, source);
      });
    } else if (this.fullTrackBuffer) {
      // Connect full track source through all 6 parallel stem crossover filters
      this.fullTrackSource = this.ctx.createBufferSource();
      this.fullTrackSource.buffer = this.fullTrackBuffer;
      this.fullTrackSource.loop = this.isLooping;
      this.fullTrackSource.playbackRate.value = this.playbackRate;

      stemTypes.forEach((stem) => {
        const filter = this.stemFilters.get(stem);
        if (filter && this.fullTrackSource) {
          this.fullTrackSource.connect(filter);
        }
      });

      const offset = this.pauseOffset % this.duration;
      this.fullTrackSource.start(0, offset);
    }

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
    if (this.fullTrackSource) {
      this.fullTrackSource.playbackRate.value = rate;
    }
    this.stemSources.forEach((source) => {
      source.playbackRate.value = rate;
    });
  }

  public setStemVolume(stem: StemType, volume: number): void {
    const gainNode = this.stemGainNodes.get(stem);
    if (gainNode && this.ctx) {
      gainNode.gain.setValueAtTime(Math.max(0, Math.min(1.5, volume)), this.ctx.currentTime);
    }
  }

  public updateMix(tracks: { id: StemType; volume: number; isMuted: boolean; isSolo: boolean }[]): void {
    const hasAnySolo = tracks.some((t) => t.isSolo);

    tracks.forEach((t) => {
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
    this.hasDedicatedStems = true;
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
    this.fullTrackBuffer = decodedBuffer;
    this.hasDedicatedStems = false;
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
    if (this.fullTrackSource) {
      try {
        this.fullTrackSource.stop();
        this.fullTrackSource.disconnect();
      } catch {}
      this.fullTrackSource = null;
    }
    this.stemSources.forEach((source) => {
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
