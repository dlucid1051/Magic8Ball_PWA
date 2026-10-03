import React from 'react';
import { AppCycleState, MagicAnswer } from '../types';
import { SpriteAnimator } from './SpriteAnimator';

interface MagicBallProps {
  appState: AppCycleState;
  currentAnswer: MagicAnswer | null;
  defaultText: string;
  onBallClick: () => void;
  spriteSheetUrl?: string | null;
  animationSpeedMs?: number;
  useIndividualFrames?: boolean;
  onAnimationComplete?: () => void;
}

export const MagicBall: React.FC<MagicBallProps> = ({
  appState,
  currentAnswer,
  defaultText,
  onBallClick,
  spriteSheetUrl,
  animationSpeedMs = 75,
  useIndividualFrames = false,
  onAnimationComplete,
}) => {
  const isShaking = appState === 'shaking';
  const isRevealing = appState === 'revealing';
  const isSettled = appState === 'settled';
  const isIdle = appState === 'idle';

  // Text to display in the viewport
  const displayText = currentAnswer ? currentAnswer.text : defaultText;

  return (
    <div className="relative flex flex-col items-center justify-center my-6 group">
      {/* 3D Sphere Container with physical shake */}
      <div
        className={`relative w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] md:w-[370px] md:h-[370px] rounded-full cursor-pointer select-none transition-transform duration-300 outline-none active:scale-98 border border-slate-700/60 ring-1 ring-white/10 ${
          isShaking ? 'animate-ball-shake' : 'hover:scale-[1.015]'
        }`}
        onClick={onBallClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onBallClick();
          }
        }}
        aria-label="Magic 8-Ball. Click or shake to consult."
        style={{
          boxShadow:
            '0 20px 45px -10px rgba(0, 0, 0, 0.95), 0 0 30px rgba(30, 27, 75, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.18), inset 0 -12px 24px -6px rgba(99, 102, 241, 0.25)',
        }}
      >
        {/* Sphere Base 3D Shading */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 28%, #384252 0%, #1e293b 22%, #0f172a 46%, #050811 75%, #020307 100%)',
          }}
        />

        {/* Specular Highlight (Upper Left Curved Light Sheen) */}
        <div
          className="absolute top-4 left-7 sm:top-6 sm:left-10 w-44 sm:w-56 h-28 sm:h-36 rounded-full pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at 40% 30%, rgba(255, 255, 255, 0.65) 0%, rgba(165, 180, 252, 0.15) 45%, transparent 70%)',
            transform: 'rotate(-25deg)',
          }}
        />

        {/* Full 360-degree Rim Bounce Light conforming to the outer circle */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-40"
          style={{
            boxShadow:
              'inset 0 -14px 20px -4px rgba(99, 102, 241, 0.4), inset 0 0 12px rgba(15, 23, 42, 0.9)',
          }}
        />

        {/* The Viewport Window (Liquid Reservoir) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Cylindrical Outer Bezel / Window Frame */}
          <div
            className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full p-2.5 sm:p-3 flex items-center justify-center overflow-hidden"
            style={{
              background:
                'linear-gradient(145deg, #1e293b 0%, #090d16 50%, #020408 100%)',
              boxShadow:
                'inset 0 4px 8px rgba(0,0,0,0.9), inset 0 -3px 6px rgba(255,255,255,0.08), 0 6px 16px rgba(0,0,0,0.85)',
            }}
          >
            {/* Inner Metallic Bezel Rim */}
            <div className="absolute inset-1.5 rounded-full border border-slate-700/60 pointer-events-none" />

            {/* Viewport Core: Dark Blue Viscous Reservoir */}
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#030611] shadow-inner flex items-center justify-center">
              {/* 16-Frame Sprite Animator Engine */}
              <SpriteAnimator
                isPlaying={isShaking}
                frameDurationMs={animationSpeedMs}
                spriteSheetUrl={spriteSheetUrl}
                useIndividualFrames={useIndividualFrames}
                onComplete={onAnimationComplete}
                className={isShaking ? 'opacity-95' : 'opacity-30'}
              />

              {/* Floating 20-Sided Die & Viscous Text */}
              <div
                className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-700 ${
                  isShaking
                    ? 'opacity-0 scale-60 translate-y-8 blur-md'
                    : isRevealing
                    ? 'opacity-90 scale-95 translate-y-1 blur-[1px]'
                    : 'opacity-100 scale-100 translate-y-0 blur-none'
                }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Floating Triangle (Die Facet) with viscous floating physics */}
                <div
                  className={`relative w-36 h-36 sm:w-42 sm:h-42 flex items-center justify-center ${
                    isSettled || isIdle ? 'animate-gentle-float' : ''
                  }`}
                >
                  {/* Floating Die Blue Triangle SVG */}
                  <svg
                    viewBox="0 0 200 200"
                    className="absolute inset-0 w-full h-full drop-shadow-[0_4px_12px_rgba(30,58,138,0.7)]"
                  >
                    <defs>
                      <linearGradient id="dieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e3a8a" />
                        <stop offset="50%" stopColor="#172554" />
                        <stop offset="100%" stopColor="#0b1329" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="100,20 185,165 15,165"
                      fill="url(#dieGradient)"
                      stroke="#60a5fa"
                      strokeWidth="2.5"
                      strokeOpacity="0.75"
                      strokeLinejoin="round"
                    />
                    {/* Facet bevel reflections */}
                    <line
                      x1="100"
                      y1="20"
                      x2="100"
                      y2="165"
                      stroke="#93c5fd"
                      strokeWidth="1"
                      strokeOpacity="0.25"
                    />
                    <line
                      x1="15"
                      y1="165"
                      x2="142"
                      y2="92"
                      stroke="#93c5fd"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                    />
                    <line
                      x1="185"
                      y1="165"
                      x2="58"
                      y2="92"
                      stroke="#93c5fd"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                    />
                  </svg>

                  {/* Viscous Answer Text (Floating inside the triangle) */}
                  <div className="relative z-10 w-28 sm:w-32 pt-5 flex items-center justify-center text-center px-1">
                    <p
                      className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-100 leading-tight transition-all duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                        isSettled ? 'text-white' : 'text-slate-200'
                      }`}
                      style={{
                        fontFamily: "'Cinzel', serif",
                        textShadow:
                          '0 0 8px rgba(191, 219, 254, 0.9), 0 0 16px rgba(59, 130, 246, 0.6), 0 2px 4px #000000',
                      }}
                    >
                      {displayText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Glass Dome Reflection */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 65%)',
                }}
              />

              {/* Liquid Rim Shadows */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_24px_rgba(0,0,0,0.95)] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Ground Contact Shadow */}
      <div className="w-52 sm:w-64 h-6 -mt-3 rounded-[100%] bg-black/90 blur-md pointer-events-none" />
      {/* Ambient Floor Glow */}
      <div
        className={`w-64 h-8 -mt-5 rounded-[100%] bg-indigo-600/25 blur-xl transition-all duration-700 pointer-events-none ${
          isShaking ? 'scale-125 opacity-70 bg-blue-500/35' : 'opacity-40'
        }`}
      />
    </div>
  );
};
