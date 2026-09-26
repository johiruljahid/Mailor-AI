import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  compactWordmark?: boolean;
}

export const LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 p-[1px] shadow-lg shadow-indigo-950/50 border border-indigo-500/30 group ${className}`}
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1"
      >
        <defs>
          <linearGradient id="mailoraGradient" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="accentGlow" x1="16" y1="12" x2="28" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Outer stylized mail envelope with folded wings resembling an 'M' */}
        <rect
          x="6"
          y="10"
          width="32"
          height="24"
          rx="6"
          stroke="url(#mailoraGradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 group-hover:stroke-indigo-400"
        />

        {/* Inner envelope fold lines creating an aerodynamic 'M' geometry */}
        <path
          d="M8 12L22 23L36 12"
          stroke="url(#mailoraGradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Assistant / Neural Spark Core that forms the central focal point of the M */}
        <path
          d="M15 31L22 24.5L29 31"
          stroke="url(#accentGlow)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Intelligence sparkle accent */}
        <circle cx="34" cy="10" r="2.8" fill="#38bdf8" className="animate-pulse" />
        <path
          d="M34 5.5V7M34 13v1.5M30.5 10H32M36 10h1.5"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  compactWordmark = false,
}) => {
  const sizeMap = {
    sm: { mark: 26, text: 'text-base', sub: 'text-[9px]' },
    md: { mark: 34, text: 'text-lg', sub: 'text-[10px]' },
    lg: { mark: 42, text: 'text-xl', sub: 'text-xs' },
    xl: { mark: 52, text: 'text-2xl', sub: 'text-sm' },
  };

  const { mark, text, sub } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark size={mark} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-white ${text}`}>
              Mailora
            </span>
            <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 text-xs px-1.5 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/30">
              AI
            </span>
          </div>
          {!compactWordmark && (
            <span className={`text-slate-400 font-medium tracking-normal mt-0.5 ${sub}`}>
              Your AI Employee for Email
            </span>
          )}
        </div>
      )}
    </div>
  );
};
