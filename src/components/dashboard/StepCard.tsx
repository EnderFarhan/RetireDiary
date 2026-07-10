'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function StepCard({ step, title, body, why, priority, isActive, isCompleted }: { step: number | string; title: string; body: string; why: string; priority: 'critical' | 'high' | 'normal'; isActive?: boolean; isCompleted?: boolean }) {
  const [open, setOpen] = useState(false);
  
  // If we are gamifying, active/inactive overrides the raw priority colors for the container
  let containerClasses = '';
  let badgeClasses = '';
  let labelMap = { critical: 'Urgent', high: 'Priority', normal: '' };
  
  if (isActive) {
    containerClasses = 'border-[#16a34a] bg-[#f0fdf4] shadow-[0_0_20px_rgba(22,163,74,0.15)] ring-1 ring-[#16a34a]/50 scale-[1.02]';
    badgeClasses = 'bg-[#16a34a] text-white';
  } else if (isCompleted) {
    containerClasses = 'border-[#e4e1d9] bg-[#f5f4f0] opacity-70';
    badgeClasses = 'bg-[#1a1a1a] text-white';
  } else {
    // Standard unreached
    containerClasses = 'border-[#e4e1d9] bg-white';
    badgeClasses = 'bg-[#e4e1d9] text-[#5c5c5c]';
  }

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all duration-300 relative ${containerClasses}`}>
      {isCompleted && (
        <div className="absolute top-4 right-4 text-[#16a34a]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-colors ${badgeClasses}`}>
          {step}
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={`text-base font-black ${isActive || isCompleted ? 'text-[#1a1a1a]' : 'text-[#5c5c5c]'}`}>{title}</h3>
            {labelMap[priority] && isActive && (
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${priority === 'critical' ? 'bg-[#ef4444]' : 'bg-[#16a34a]'}`}>
                {labelMap[priority]}
              </span>
            )}
          </div>
          <p className={`text-sm leading-relaxed ${isActive ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`}>{body}</p>
          
          {(isActive || isCompleted) && (
            <button
              onClick={() => setOpen(o => !o)}
              className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#16a34a] hover:underline"
            >
              {open ? 'Hide explanation ↑' : 'Why this matters ↓'}
            </button>
          )}

          <AnimatePresence>
            {open && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-[#5c5c5c] leading-relaxed mt-3 border-t border-dashed border-[#e4e1d9] pt-3 overflow-hidden"
              >
                {why}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
