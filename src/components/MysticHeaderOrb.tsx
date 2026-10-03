import React from 'react';

interface MysticHeaderOrbProps {
  onClick?: () => void;
}

export const MysticHeaderOrb: React.FC<MysticHeaderOrbProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center gap-3 cursor-pointer select-none"
      title="Magic 8-Ball Oracle"
    >
      {/* Dynamic Ambient Aura Glow */}
      <div className="relative flex items-center justify-center">
        {/* Soft breathing celestial halo */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/25 to-cyan-500/20 blur-md group-hover:blur-lg group-hover:opacity-100 opacity-70 transition-all duration-700 animate-pulse pointer-events-none" />

        {/* Outer Orbit Ring Accent */}
        <div className="absolute -inset-0.5 rounded-full border border-indigo-500/30 group-hover:border-indigo-400/60 transition-colors duration-500 pointer-events-none" />

        {/* 3D Physical Orb Container */}
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105 group-active:scale-95">
          {/* Deep Obsidian Sphere Base with Radial Dark Shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#070b16] to-[#020409]" />

          {/* Bioluminescent Liquid Core Viewport */}
          <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-[#0e1630] via-[#091024] to-[#04060e] overflow-hidden flex items-center justify-center shadow-inner">
            {/* Deep Swirling Fluid Nebula Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_35%,rgba(99,102,241,0.45)_0%,rgba(30,27,75,0.8)_55%,rgba(2,6,23,0.95)_100%)] opacity-90 group-hover:opacity-100 transition-opacity" />

            {/* Micro Fluid Specular Light Ring */}
            <div className="absolute inset-0 rounded-full border border-indigo-400/20 group-hover:border-indigo-400/40 transition-colors" />

            {/* Floating Mystical Die Facet (Subtle 3D Floating Triangle) */}
            <div className="relative flex items-center justify-center transition-transform duration-700 group-hover:-translate-y-0.5 group-hover:rotate-6">
              <svg
                viewBox="0 0 40 40"
                className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_6px_rgba(79,70,229,0.7)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Translucent Die Face */}
                <path
                  d="M20 6 L33 30 L7 30 Z"
                  fill="url(#dieGrad)"
                  stroke="#818cf8"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Floating Numeral 8 inside Die */}
                <text
                  x="20"
                  y="24"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="900"
                  fontFamily="'Cinzel', Georgia, serif"
                  textAnchor="middle"
                  className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                >
                  8
                </text>
                <defs>
                  <linearGradient id="dieGrad" x1="20" y1="6" x2="20" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4338ca" stopOpacity="0.95" />
                    <stop offset="0.6" stopColor="#1e1b4b" stopOpacity="0.85" />
                    <stop offset="1" stopColor="#0f172a" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Primary Top Convex Glass Specular Flare */}
          <div className="absolute top-1 left-1.5 w-4 h-2 rounded-full bg-gradient-to-b from-white/70 via-indigo-200/30 to-transparent transform -rotate-25 pointer-events-none filter blur-[0.4px]" />

          {/* Tiny Brilliant 4-Point Star Glint */}
          <div className="absolute top-1.5 left-2 w-1.5 h-1.5 pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all">
            <div className="absolute inset-0 bg-white rounded-full blur-[0.5px]" />
          </div>

          {/* Bottom Rim Light Reflection (Bounce Illumination) */}
          <div className="absolute bottom-0 inset-x-2 h-1.5 rounded-b-full bg-gradient-to-t from-indigo-400/40 via-purple-500/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Title Lockup with Premium Celestial Presence */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent group-hover:to-white transition-all">
            Magic 8-Ball
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm">
            PWA
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-0.5">
          Mystic Fortune Oracle
        </span>
      </div>
    </div>
  );
};
