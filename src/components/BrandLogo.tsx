import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  theme?: 'light' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showBadge = true,
  theme = 'light',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base sm:text-lg px-4 sm:px-5 py-2 sm:py-2.5 gap-2.5',
    xl: 'text-xl sm:text-2xl px-6 py-3 gap-3',
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`inline-flex items-center select-none font-black italic tracking-tight rounded-2xl transition-all duration-200 group ${
        showBadge
          ? isLight
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200 hover:border-cyan-500/50 hover:shadow-md'
            : 'bg-[#0B1120] text-white shadow-lg border border-slate-800 hover:border-cyan-500/50'
          : ''
      } ${sizeClasses[size]} ${className}`}
    >
      {/* "LOS" in Vibrant Electric Cyan */}
      <span className={`${isLight ? 'text-cyan-600' : 'text-cyan-400'} font-black tracking-tighter`}>
        LOS
      </span>

      {/* "FARRUS" in Deep Slate / White with Sunset Underline */}
      <div className="relative inline-flex flex-col items-center">
        <span className={`${isLight ? 'text-slate-900' : 'text-white'} font-extrabold tracking-wide uppercase`}>
          FARRUS
        </span>
        <span className="w-full h-[2.5px] sm:h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 rounded-full mt-0.5 shadow-sm shadow-orange-500/30" />
      </div>

      {/* "HUB" in Sunset Gold Gradient */}
      <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent font-black tracking-tighter uppercase ml-0.5">
        HUB
      </span>
    </div>
  );
};
