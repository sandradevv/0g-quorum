import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  iconOnly?: boolean;
  showBadge?: boolean;
}

const SIZES = { sm: { icon: 24, text: "text-sm" }, md: { icon: 32, text: "text-base" }, lg: { icon: 42, text: "text-xl" }, xl: { icon: 56, text: "text-2xl" } };

export const Logo: React.FC<LogoProps> = ({ size = "md", className = "", iconOnly = false, showBadge = true }) => {
  const { icon, text } = SIZES[size] || SIZES.md;
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={icon} height={icon} viewBox="0 0 48 48" fill="none" className="transition-transform duration-300 hover:scale-105">
          <defs>
            <linearGradient id="zgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06b6d4" /><stop offset="50%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
            <linearGradient id="zgRose" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fb7185" /><stop offset="100%" stopColor="#f43f5e" /></linearGradient>
            <linearGradient id="zgSky" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
            <linearGradient id="zgEmerald" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
            <linearGradient id="zgViolet" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
            <radialGradient id="zgCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" /><stop offset="100%" stopColor="#14b8a6" stopOpacity="0" /></radialGradient>
          </defs>
          <circle cx="24" cy="24" r="18" fill="url(#zgCore)" />
          <path d="M24 4L41.32 14V34L24 44L6.68 34V14L24 4Z" stroke="url(#zgGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90" />
          <path d="M24 13V35M14.5 18.5L33.5 29.5M14.5 29.5L33.5 18.5" stroke="#14b8a6" strokeWidth="1.2" strokeDasharray="2 2" strokeOpacity="0.6" />
          <circle cx="24" cy="24" r="4.5" fill="#080b11" stroke="url(#zgGrad)" strokeWidth="2" />
          <circle cx="24" cy="24" r="2" fill="#14b8a6" />
          <circle cx="24" cy="13" r="2.8" fill="url(#zgRose)" />
          <circle cx="14.5" cy="24" r="2.8" fill="url(#zgSky)" />
          <circle cx="33.5" cy="24" r="2.8" fill="url(#zgEmerald)" />
          <circle cx="24" cy="35" r="2.8" fill="url(#zgViolet)" />
        </svg>
      </div>
      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-mono font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase ${text}`}>
              0G<span className="text-teal-600 dark:text-teal-400 ml-1">QUORUM</span>
            </span>
            {showBadge && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded">
                BFT Swarm
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wide">
            Verifiable Multi-Agent Consensus
          </span>
        </div>
      )}
    </div>
  );
};
