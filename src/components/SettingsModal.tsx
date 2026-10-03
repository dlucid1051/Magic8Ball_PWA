import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Vibrate,
  Smartphone,
  Gauge,
  Database,
  Sliders,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ShakeSettings, AssetStorageStatus } from '../types';
import { ShakePermissionState } from '../hooks/useShakeDetection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShakeSettings;
  onUpdateSettings: (newSettings: Partial<ShakeSettings>) => void;
  onResetFactorySettings: () => void;
  storageStatus: AssetStorageStatus;
  permissionState: ShakePermissionState;
  onRequestPermission: () => Promise<boolean>;
  onForceRecache?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetFactorySettings,
  storageStatus,
  permissionState,
  onRequestPermission,
  onForceRecache,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const isMotionActive = settings.motionEnabled && permissionState === 'granted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">App Settings & Hardware</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Settings"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm">
          {/* Sound & Haptics Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Audio & Haptics
            </h3>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-3">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-indigo-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <div className="font-medium text-white">Shake Sound Effects</div>
                  <div className="text-xs text-slate-400">
                    Viscous liquid slosh & mystical reveal chimes
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptics Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <Vibrate
                  className={`w-5 h-5 ${
                    settings.hapticsEnabled ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                />
                <div>
                  <div className="font-medium text-white">Haptic Vibration</div>
                  <div className="text-xs text-slate-400">
                    Physical impulse on mobile devices
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.hapticsEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Shake Motion & Permissions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hardware Motion Detection
            </h3>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-medium text-white truncate">Motion Sensor Status</span>
                </div>
                <span
                  className={`inline-flex items-center justify-center text-center shrink-0 text-xs px-2.5 py-1 rounded-full font-medium leading-none ${
                    !settings.motionEnabled
                      ? 'bg-slate-700 text-slate-300'
                      : permissionState === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : permissionState === 'prompt'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {!settings.motionEnabled
                    ? 'Disabled'
                    : permissionState === 'granted'
                    ? 'Active'
                    : permissionState === 'prompt'
                    ? 'Permission Needed'
                    : permissionState}
                </span>
              </div>

              {/* Physical Shake Enable/Disable Button */}
              <button
                type="button"
                onClick={async () => {
                  if (isMotionActive) {
                    onUpdateSettings({ motionEnabled: false });
                  } else {
                    if (permissionState !== 'granted') {
                      await onRequestPermission();
                    }
                    onUpdateSettings({ motionEnabled: true });
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isMotionActive
                    ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30'
                }`}
              >
                {isMotionActive ? (
                  <span>Disable Physical Device Shake</span>
                ) : (
                  <span>Enable Physical Device Shake</span>
                )}
              </button>

              {/* Sensitivity selector */}
              <div>
                <label className="text-xs text-slate-300 flex items-center gap-1.5 mb-2">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  Shake Sensitivity Threshold
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onUpdateSettings({ sensitivity: level })}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition capitalize cursor-pointer ${
                        settings.sensitivity === level
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Animation Engine Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Animation Engine (16 Frames)
            </h3>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2">
              <label className="text-xs text-slate-300 block">Frame Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Brisk (60ms)', val: 60 },
                  { label: 'Standard (75ms)', val: 75 },
                  { label: 'Cinematic (95ms)', val: 95 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => onUpdateSettings({ animationSpeedMs: item.val })}
                    className={`py-1.5 px-1 text-xs font-medium rounded-lg border transition cursor-pointer ${
                      settings.animationSpeedMs === item.val
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Storage & PWA Diagnostics */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Offline Storage Engine
            </h3>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  Asset Storage
                </span>
                <span className="text-white font-medium capitalize">
                  {storageStatus.storageType}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>16-Frame Sprite Sheet</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  IndexedDB Cached
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Audio Engine Soundfonts</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  IndexedDB Cached
                </span>
              </div>

              {onForceRecache && (
                <button
                  type="button"
                  onClick={onForceRecache}
                  className="mt-2 w-full py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-750 hover:bg-slate-700 rounded-lg transition border border-slate-700/60 cursor-pointer"
                >
                  Verify / Reload Offline Cache
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clickable Factory Reset Red Text with Small Verify Prompt */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-center min-h-[36px]">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-semibold text-rose-500 hover:text-rose-400 underline underline-offset-4 decoration-rose-500/50 hover:decoration-rose-400 transition cursor-pointer focus:outline-none py-1"
            >
              Factory Reset
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 text-xs animate-in fade-in whitespace-nowrap">
              <span className="text-rose-300 font-medium">Reset all settings to default?</span>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetFactorySettings();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition active:scale-95 cursor-pointer"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
