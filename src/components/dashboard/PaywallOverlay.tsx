'use client';

import { useState } from 'react';

export function PaywallOverlay({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (isUnlocked) {
    return <div className="mt-12 w-full max-w-7xl mx-auto">{children}</div>;
  }

  return (
    <div className="relative mt-12 w-full max-w-7xl mx-auto">
      {/* Overlay */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl bg-white/60 backdrop-blur-[8px] border border-white/40 shadow-[inset_0_0_100px_rgba(255,255,255,0.8)]">
        <div className="bg-[#1a1a1a] text-white p-8 md:p-12 rounded-3xl max-w-lg text-center shadow-2xl mx-4 transform translate-y-[-10%]">
          <div className="w-16 h-16 bg-[#16a34a]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black mb-4 tracking-tight">Unlock Your Full Blueprint</h3>
          <p className="text-[#9ca3af] mb-8 leading-relaxed text-sm">
            Get the exact step-by-step financial order of operations, specific low-cost ETF picks, and advanced tax architectures based on your unique numbers.
          </p>
          <button 
            onClick={() => setIsUnlocked(true)}
            className="w-full py-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-[#16a34a]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Unlock for $49 (Test)
          </button>
          <p className="text-[10px] uppercase tracking-widest text-[#5c5c5c] mt-4 font-bold">One-time payment. Lifetime access.</p>
        </div>
      </div>

      {/* Blurred Content */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
