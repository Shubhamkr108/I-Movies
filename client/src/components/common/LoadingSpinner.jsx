import React from 'react';
import { Film } from 'lucide-react';

export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin"></div>
        <Film className="absolute inset-0 m-auto w-1/2 h-1/2 text-purple-400" />
      </div>
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0F] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-purple-900/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-2">
          <span className="gradient-text">IMovies</span>
        </h2>
        <p className="text-gray-400 text-sm">Loading your cinema experience...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#12121A] border border-white/5">
      <div className="shimmer aspect-[2/3] w-full"></div>
      <div className="p-4 space-y-3">
        <div className="shimmer h-4 rounded w-3/4"></div>
        <div className="shimmer h-3 rounded w-1/2"></div>
        <div className="shimmer h-3 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
