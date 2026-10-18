export type StemType = 'vocals' | 'drums' | 'bass' | 'piano' | 'brass' | 'other';

export interface StemTrack {
  id: StemType;
  name: string;
  subtitle: string;
  color: string;
  iconName: string;
  volume: number; // 0 to 1
  isMuted: boolean;
  isSolo: boolean;
  url?: string;
  buffer?: AudioBuffer;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  pitchSemitones: number;
  songTitle: string;
  artist: string;
}
