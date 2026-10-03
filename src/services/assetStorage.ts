import { AssetStorageStatus } from '../types';

const DB_NAME = 'Magic8BallPWA_DB';
const DB_VERSION = 1;
const SPRITE_STORE = 'sprites';
const AUDIO_STORE = 'audio';

let dbInstance: IDBDatabase | null = null;
let cachedSpriteObjectUrl: string | null = null;
let cachedAudioObjectUrl: string | null = null;
let webAudioContext: AudioContext | null = null;

// Initialize native IndexedDB
export function openAssetDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SPRITE_STORE)) {
        db.createObjectStore(SPRITE_STORE);
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Generic store getter
export async function getAssetBlob(storeName: string, key: string): Promise<Blob | null> {
  try {
    const db = await openAssetDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result instanceof Blob ? req.result : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`IndexedDB read error on [${storeName}:${key}]:`, err);
    return null;
  }
}

// Generic store setter
export async function setAssetBlob(storeName: string, key: string, blob: Blob): Promise<void> {
  try {
    const db = await openAssetDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(blob, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`IndexedDB write error on [${storeName}:${key}]:`, err);
  }
}

// Preload and cache assets in IndexedDB
export async function initAndPreloadAssets(): Promise<{
  spriteUrl: string;
  audioUrl: string;
  status: AssetStorageStatus;
}> {
  let spriteBlob: Blob | null = null;
  let audioBlob: Blob | null = null;
  let storageType: 'indexedDB' | 'memory-fallback' = 'indexedDB';

  try {
    await openAssetDatabase();
    spriteBlob = await getAssetBlob(SPRITE_STORE, 'shake_sprite_sheet');
    audioBlob = await getAssetBlob(AUDIO_STORE, 'shake_audio');
  } catch {
    storageType = 'memory-fallback';
  }

  // Pre-fetch Sprite sheet if not yet in IndexedDB
  if (!spriteBlob) {
    try {
      const resp = await fetch('/sprites/magic8_shake_sprite.webp');
      if (resp.ok) {
        spriteBlob = await resp.blob();
        await setAssetBlob(SPRITE_STORE, 'shake_sprite_sheet', spriteBlob);
      }
    } catch (err) {
      console.warn('Could not fetch sprite sheet from network:', err);
    }
  }

  // Pre-fetch Audio file if not yet in IndexedDB
  if (!audioBlob) {
    try {
      const resp = await fetch('/sounds/magic8_shake.mp3').catch(() =>
        fetch('/sounds/magic8_shake.wav')
      );
      if (resp.ok) {
        audioBlob = await resp.blob();
        await setAssetBlob(AUDIO_STORE, 'shake_audio', audioBlob);
      }
    } catch (err) {
      console.warn('Could not fetch audio from network:', err);
    }
  }

  if (spriteBlob) {
    cachedSpriteObjectUrl = URL.createObjectURL(spriteBlob);
  } else {
    // Fallback to static URL
    cachedSpriteObjectUrl = '/sprites/magic8_shake_sprite.webp';
  }

  if (audioBlob) {
    cachedAudioObjectUrl = URL.createObjectURL(audioBlob);
  } else {
    cachedAudioObjectUrl = '/sounds/magic8_shake.mp3';
  }

  return {
    spriteUrl: cachedSpriteObjectUrl,
    audioUrl: cachedAudioObjectUrl,
    status: {
      isInitialized: true,
      spriteStored: !!spriteBlob,
      audioStored: !!audioBlob,
      storageType,
    },
  };
}

// Audio Synthesizer Fallback using Web Audio API
// Produces an authentic liquid slosh with mystic sub-harmonic resonance
export function playSynthesizedSloshSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!webAudioContext || webAudioContext.state === 'closed') {
      webAudioContext = new AudioContextClass();
    }
    if (webAudioContext.state === 'suspended') {
      webAudioContext.resume();
    }

    const ctx = webAudioContext;
    const now = ctx.currentTime;

    // 1. Water Slosh: Filtered white noise with lowpass sweeps
    const bufferSize = ctx.sampleRate * 1.2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(520, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.9);
    filter.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 1.15);

    // 2. Deep mystical resonant chime (as if the liquid die taps the glass)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.8);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.95);
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
  }
}

// Master Audio Player: plays from cached IndexedDB audio or falls back to Web Audio synth
export async function playShakeAudio(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;

  if (cachedAudioObjectUrl) {
    try {
      const audio = new Audio(cachedAudioObjectUrl);
      audio.volume = 0.85;
      await audio.play();
      return;
    } catch {
      // Autoplay or decode fallback to synthesizer
      playSynthesizedSloshSound();
    }
  } else {
    playSynthesizedSloshSound();
  }
}

// Mystical reveal chime sound when the answer settles
export function playRevealChime(soundEnabled: boolean) {
  if (!soundEnabled) return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!webAudioContext || webAudioContext.state === 'closed') {
      webAudioContext = new AudioContextClass();
    }
    if (webAudioContext.state === 'suspended') {
      webAudioContext.resume();
    }

    const ctx = webAudioContext;
    const now = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99]; // C5, E5, G5 celestial chord
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + 1.25);
    });
  } catch (err) {
    console.warn('Chime audio error:', err);
  }
}

// Aerodynamic whoosh sound for 3D ball flip
export function playFlipWhooshSound(soundEnabled: boolean) {
  if (!soundEnabled) return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!webAudioContext || webAudioContext.state === 'closed') {
      webAudioContext = new AudioContextClass();
    }
    if (webAudioContext.state === 'suspended') {
      webAudioContext.resume();
    }

    const ctx = webAudioContext;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.45;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.18);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.42);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.45);
  } catch (err) {
    console.warn('Flip audio error:', err);
  }
}
