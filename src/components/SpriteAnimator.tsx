import React, { useEffect, useState, useRef } from 'react';

interface SpriteAnimatorProps {
  isPlaying: boolean;
  frameDurationMs?: number;
  spriteSheetUrl?: string | null;
  useIndividualFrames?: boolean;
  onComplete?: () => void;
  className?: string;
}

const TOTAL_FRAMES = 16;
const GRID_COLUMNS = 4;
const GRID_ROWS = 4;

export const SpriteAnimator: React.FC<SpriteAnimatorProps> = ({
  isPlaying,
  frameDurationMs = 75,
  spriteSheetUrl,
  useIndividualFrames = false,
  onComplete,
  className = '',
}) => {
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Reset to start of sequence
    setCurrentFrame(0);
    let frame = 0;

    const interval = window.setInterval(() => {
      frame += 1;
      if (frame >= TOTAL_FRAMES) {
        clearInterval(interval);
        timerRef.current = null;
        setCurrentFrame(TOTAL_FRAMES - 1);
        // Defer onComplete outside the current execution cycle so parent state isn't updated during render
        setTimeout(() => {
          onCompleteRef.current?.();
        }, 0);
      } else {
        setCurrentFrame(frame);
      }
    }, frameDurationMs);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, frameDurationMs]);

  // Calculate 4x4 Sprite Sheet background-position
  const col = currentFrame % GRID_COLUMNS;
  const row = Math.floor(currentFrame / GRID_COLUMNS);
  // In CSS, background-position percentage for N items is (index / (N - 1)) * 100%
  const posX = (col / (GRID_COLUMNS - 1)) * 100;
  const posY = (row / (GRID_ROWS - 1)) * 100;

  const resolvedSpriteUrl = spriteSheetUrl || '/sprites/magic8_shake_sprite.webp';
  const individualFrameUrl = `/sprites/frame_${currentFrame}.webp`;

  return (
    <div
      className={`relative w-full h-full rounded-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-label={`Animation frame ${currentFrame + 1} of ${TOTAL_FRAMES}`}
    >
      {!imageError && !useIndividualFrames && (
        <div
          className="absolute inset-0 w-full h-full bg-no-repeat transition-none"
          style={{
            backgroundImage: `url(${resolvedSpriteUrl})`,
            backgroundSize: `${GRID_COLUMNS * 100}% ${GRID_ROWS * 100}%`,
            backgroundPosition: `${posX}% ${posY}%`,
          }}
        />
      )}

      {!imageError && useIndividualFrames && (
        <img
          src={individualFrameUrl}
          alt={`Frame ${currentFrame}`}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* Fallback procedural viscous liquid if images fail to load */}
      {imageError && (
        <div className="absolute inset-0 bg-radial from-blue-950 via-[#070b1a] to-[#020409] flex items-center justify-center">
          <div
            className={`w-28 h-28 rounded-full border border-blue-500/20 bg-blue-600/10 blur-sm ${
              isPlaying ? 'animate-spin' : ''
            }`}
          />
        </div>
      )}

      {/* Surface liquid shimmer & glass specular reflection */}
      <div className="absolute inset-0 pointer-events-none rounded-full bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12]" />
      <div className="absolute inset-x-8 top-3 h-10 rounded-full bg-gradient-to-b from-white/15 to-transparent blur-[2px] opacity-40 pointer-events-none" />
    </div>
  );
};
