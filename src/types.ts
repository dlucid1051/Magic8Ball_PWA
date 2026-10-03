export type AnswerSentiment = 'positive' | 'neutral' | 'negative';

export interface MagicAnswer {
  id: number;
  text: string;
  sentiment: AnswerSentiment;
}

export type AppCycleState = 'idle' | 'shaking' | 'revealing' | 'settled';

export interface AssetStorageStatus {
  isInitialized: boolean;
  spriteStored: boolean;
  audioStored: boolean;
  storageType: 'indexedDB' | 'memory-fallback';
}

export interface ShakeSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  motionEnabled: boolean;
  sensitivity: 'low' | 'medium' | 'high'; // low = 25, medium = 18, high = 12 m/s²
  animationSpeedMs: number; // 60ms - 90ms per frame
}
