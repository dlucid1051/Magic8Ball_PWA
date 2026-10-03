/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AppCycleState,
  MagicAnswer,
  ShakeSettings,
  AssetStorageStatus,
} from './types';
import {
  CLASSIC_MAGIC_ANSWERS,
  INITIAL_DEFAULT_TEXT,
  getRandomAnswer,
} from './constants/answers';
import {
  initAndPreloadAssets,
  playShakeAudio,
  playRevealChime,
} from './services/assetStorage';
import { useShakeDetection } from './hooks/useShakeDetection';
import { MagicBall } from './components/MagicBall';
import { QuestionInput } from './components/QuestionInput';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SettingsModal } from './components/SettingsModal';
import { MysticHeaderOrb } from './components/MysticHeaderOrb';

const INSTRUCTION_INITIAL =
  'Type, speak, or concentrate on a question then tap or shake the Magic 8-Ball';
const INSTRUCTION_SHAKING = 'Consulting the spirit realm...';

export default function App() {
  const [appState, setAppState] = useState<AppCycleState>('idle');
  const [currentAnswer, setCurrentAnswer] = useState<MagicAnswer | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings with persistent localStorage backing
  const [settings, setSettings] = useState<ShakeSettings>(() => {
    const DEFAULT_SETTINGS: ShakeSettings = {
      soundEnabled: true,
      hapticsEnabled: true,
      motionEnabled: true,
      sensitivity: 'medium',
      animationSpeedMs: 75,
    };
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem('magic8ball_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [storageStatus, setStorageStatus] = useState<AssetStorageStatus>({
    isInitialized: false,
    spriteStored: false,
    audioStored: false,
    storageType: 'indexedDB',
  });

  // Track next answer queued during shake
  const pendingAnswerRef = useRef<MagicAnswer | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const isLockedRef = useRef<boolean>(false);
  const resetLockTimeoutRef = useRef<number | null>(null);

  // Initialize IndexedDB assets on mount
  const loadAssets = useCallback(async () => {
    try {
      const res = await initAndPreloadAssets();
      setSpriteUrl(res.spriteUrl);
      setStorageStatus(res.status);
    } catch (err) {
      console.warn('Asset loading notice:', err);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Main Shake & Reveal Trigger
  const handleTriggerShake = useCallback(() => {
    // Synchronously check lock to immediately ignore further motion/shakes
    if (isLockedRef.current || appState === 'shaking' || appState === 'revealing') {
      return;
    }
    // Immediately lock out any further shake events
    isLockedRef.current = true;

    // Pick random answer from classic 20 pool
    const selectedAnswer = getRandomAnswer(currentAnswer?.id);
    pendingAnswerRef.current = selectedAnswer;

    // Enter Shake & Reveal State
    setAppState('shaking');

    // Trigger Audio & Haptics
    playShakeAudio(settings.soundEnabled);

    if (settings.hapticsEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {
        console.warn('Haptics vibrate notice:', e);
      }
    }
  }, [appState, currentAnswer?.id, settings.soundEnabled, settings.hapticsEnabled]);

  // Hook up physical hardware shake detection
  const { permissionState, requestPermission, resetPermission } = useShakeDetection({
    onShake: handleTriggerShake,
    enabled: settings.motionEnabled && appState !== 'shaking' && appState !== 'revealing',
    sensitivity: settings.sensitivity,
  });

  // Animation Engine 16th frame callback
  const handleAnimationComplete = useCallback(() => {
    // 16-frame shake sequence is done, now transition to viscous liquid reveal
    setAppState('revealing');

    if (pendingAnswerRef.current) {
      setCurrentAnswer(pendingAnswerRef.current);
    }

    // Play mystical reveal chime sound
    playRevealChime(settings.soundEnabled);

    // After viscous float up settles, automatically restore UI to Initial State layout
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }

    revealTimeoutRef.current = window.setTimeout(() => {
      // Response & Reset State:
      // UI returns to initial state layout (prompt returns, input box visible),
      // while the answer remains in the 8-Ball viewport!
      setAppState('settled');

      // Add a safety buffer after settling before re-enabling motion detection
      // to guarantee hand deceleration after the shake doesn't cause a double-shake
      if (resetLockTimeoutRef.current) {
        clearTimeout(resetLockTimeoutRef.current);
      }
      resetLockTimeoutRef.current = window.setTimeout(() => {
        isLockedRef.current = false;
      }, 500);
    }, 900);
  }, [settings.soundEnabled]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
      if (resetLockTimeoutRef.current) {
        clearTimeout(resetLockTimeoutRef.current);
      }
    };
  }, []);

  const handleUpdateSettings = (newVals: Partial<ShakeSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newVals };
      try {
        localStorage.setItem('magic8ball_settings', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist settings to localStorage', e);
      }
      return updated;
    });
  };

  const handleResetFactorySettings = useCallback(() => {
    const DEFAULT_SETTINGS: ShakeSettings = {
      soundEnabled: true,
      hapticsEnabled: true,
      motionEnabled: true,
      sensitivity: 'medium',
      animationSpeedMs: 75,
    };
    try {
      localStorage.removeItem('magic8ball_settings');
    } catch (e) {
      console.warn('Could not clear settings from localStorage', e);
    }
    setSettings(DEFAULT_SETTINGS);
    resetPermission();
  }, [resetPermission]);

  const isBusy = appState === 'shaking' || appState === 'revealing';

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07090e] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 pb-6">
      {/* Background Starfield & Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-indigo-900/15 blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-900/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* App Header / Navigation */}
      <header className="relative z-20 w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <MysticHeaderOrb onClick={handleTriggerShake} />

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* In-App PWA Install Prompt Button */}
          <PWAInstallButton />

          {/* Quick Sound Toggle */}
          <button
            type="button"
            onClick={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition cursor-pointer"
            title={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
            aria-label="Toggle sound"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition cursor-pointer"
            title="Settings & Hardware Sensors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Experience Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Dynamic Instruction Prompt */}
        <div className="text-center min-h-[60px] flex flex-col items-center justify-center px-2">
          {isBusy ? (
            <div className="flex items-center justify-center gap-2 text-base sm:text-lg md:text-xl font-semibold text-indigo-300 animate-pulse">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
              <span>{INSTRUCTION_SHAKING}</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm sm:text-base text-slate-300">
              <span>Type, speak, or concentrate on a question then</span>
              <button
                type="button"
                onClick={handleTriggerShake}
                disabled={isBusy}
                className="text-base sm:text-lg md:text-xl font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/60 hover:decoration-indigo-300 transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 rounded px-1 disabled:pointer-events-none"
                title="Click or tap to consult the Magic 8-Ball"
              >
                <span>tap or shake the Magic 8-Ball</span>
              </button>
            </div>
          )}

          {/* Reserved height for question badge so top height never changes */}
          <div className="h-5 flex items-center justify-center">
            {userQuestion && (
              <div
                className={`text-xs text-indigo-400/90 italic truncate max-w-sm transition-opacity duration-300 ${
                  isBusy ? 'opacity-40' : 'opacity-100'
                }`}
              >
                &ldquo;{userQuestion}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* 3D Magic 8-Ball Viewport & Physical Sphere */}
        <MagicBall
          appState={appState}
          currentAnswer={currentAnswer}
          defaultText={INITIAL_DEFAULT_TEXT}
          onBallClick={handleTriggerShake}
          spriteSheetUrl={spriteUrl}
          animationSpeedMs={settings.animationSpeedMs}
          onAnimationComplete={handleAnimationComplete}
        />

        {/* Interaction Controls & Question Input Area */}
        <div className="w-full mt-3 flex flex-col items-center gap-4">
          {/* Question Text Input Field (Fades out without collapsing layout height) */}
          <div className="w-full min-h-[58px] flex items-center justify-center">
            <div
              className={`w-full transition-all duration-300 ${
                isBusy
                  ? 'opacity-0 pointer-events-none scale-95'
                  : 'opacity-100 pointer-events-auto scale-100'
              }`}
            >
              <QuestionInput
                question={userQuestion}
                onChange={setUserQuestion}
                onClear={() => setUserQuestion('')}
                disabled={isBusy}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Settings & Hardware Sensor Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetFactorySettings={handleResetFactorySettings}
        storageStatus={storageStatus}
        permissionState={permissionState}
        onRequestPermission={requestPermission}
        onForceRecache={loadAssets}
      />
    </div>
  );
}
