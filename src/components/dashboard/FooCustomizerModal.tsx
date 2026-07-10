'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type FooConfig = {
  hasEmergencyFund: boolean;
  hasEmployerMatch: boolean;
  matchPct: string;
  hasDebt: boolean;
  debtRate: string;
  isUs: boolean;
  hdhpStatus: 'hdhp_enrolled' | 'hdhp_eligible' | 'none';
  isCanadian: boolean;
  tfsaStatus: 'since_2009' | 'recent' | 'none';
  tfsaYear: string;
  has529: boolean;
};

type FooCustomizerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: FooConfig;
  onSave: (config: FooConfig) => void;
};

export function FooCustomizerModal({ isOpen, onClose, initialConfig, onSave }: FooCustomizerModalProps) {
  const [config, setConfig] = useState<FooConfig>(initialConfig);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1a1a1a]/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[600px] h-full md:h-auto md:max-h-[85vh] bg-white md:rounded-3xl shadow-2xl z-[110] flex flex-col overflow-hidden border-2 border-[#e4e1d9]"
          >
            <div className="p-6 md:p-8 border-b border-[#e4e1d9] flex justify-between items-center bg-[#f5f4f0]">
              <div>
                <h2 className="text-xl font-black text-[#1a1a1a]">Personalize Your Blueprint</h2>
                <p className="text-xs font-bold text-[#5c5c5c] mt-1 uppercase tracking-widest">
                  Let&apos;s tailor the math to your exact situation
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-2xl text-[#1a1a1a] hover:opacity-50 transition-opacity"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 bg-white">
              
              {/* Emergency Fund */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1a1a1a] block">
                  1. Do you have a fully funded emergency fund (3-6 months of expenses)?
                </label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfig({ ...config, hasEmergencyFund: true })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${config.hasEmergencyFund ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setConfig({ ...config, hasEmergencyFund: false })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!config.hasEmergencyFund ? 'border-[#ef4444] bg-[#fef2f2] text-[#ef4444]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Employer Match */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1a1a1a] block">
                  2. Does your employer offer a 401(k) / RRSP match?
                </label>
                <div className="flex gap-3 mb-3">
                  <button 
                    onClick={() => setConfig({ ...config, hasEmployerMatch: true })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${config.hasEmployerMatch ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setConfig({ ...config, hasEmployerMatch: false })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!config.hasEmployerMatch ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    No
                  </button>
                </div>
                {config.hasEmployerMatch && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-[#5c5c5c] uppercase tracking-widest block mb-2">Match Percentage</label>
                    <input 
                      type="text" 
                      value={config.matchPct}
                      onChange={(e) => setConfig({ ...config, matchPct: e.target.value })}
                      placeholder="e.g. 5%"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#e4e1d9] focus:border-[#16a34a] focus:ring-0 transition-colors font-bold text-[#1a1a1a]"
                    />
                  </div>
                )}
              </div>

              {/* Debt */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1a1a1a] block">
                  3. Do you have any debt (excluding mortgage)?
                </label>
                <div className="flex gap-3 mb-3">
                  <button 
                    onClick={() => setConfig({ ...config, hasDebt: true })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${config.hasDebt ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setConfig({ ...config, hasDebt: false })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!config.hasDebt ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    No
                  </button>
                </div>
                {config.hasDebt && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-[#5c5c5c] uppercase tracking-widest block mb-2">Highest Interest Rate</label>
                    <select
                      value={config.debtRate}
                      onChange={(e) => setConfig({ ...config, debtRate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#e4e1d9] focus:border-[#16a34a] focus:ring-0 transition-colors font-bold text-[#1a1a1a]"
                    >
                      <option value="under 7%">Under 7% (Low Priority)</option>
                      <option value="over 7%">Over 7% (High Priority Toxic Debt)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* US Healthcare (HSA) */}
              {config.isUs && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[#1a1a1a] block">
                    4. Are you enrolled in a High-Deductible Health Plan (HDHP)?
                  </label>
                  <p className="text-[11px] text-[#5c5c5c] leading-relaxed mb-2">
                    This determines if you are eligible for the triple-tax-advantaged HSA.
                  </p>
                  <select
                    value={config.hdhpStatus}
                    onChange={(e) => setConfig({ ...config, hdhpStatus: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#e4e1d9] focus:border-[#16a34a] focus:ring-0 transition-colors font-bold text-[#1a1a1a]"
                  >
                    <option value="none">No, standard health plan</option>
                    <option value="hdhp_eligible">Yes, I am enrolled in an HDHP</option>
                  </select>
                </div>
              )}

              {/* Canadian TFSA */}
              {config.isCanadian && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[#1a1a1a] block">
                    4. Canadian TFSA Room
                  </label>
                  <p className="text-[11px] text-[#5c5c5c] leading-relaxed mb-2">
                    When did you turn 18 and become a resident? (Determines max room)
                  </p>
                  <select
                    value={config.tfsaStatus}
                    onChange={(e) => setConfig({ ...config, tfsaStatus: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#e4e1d9] focus:border-[#16a34a] focus:ring-0 transition-colors font-bold text-[#1a1a1a]"
                  >
                    <option value="since_2009">Before 2009 (Max room available)</option>
                    <option value="recent">After 2009</option>
                  </select>
                </div>
              )}

              {/* Education (529 / RESP) */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1a1a1a] block">
                  5. Are you prioritizing saving for children&apos;s education?
                </label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfig({ ...config, has529: true })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${config.has529 ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setConfig({ ...config, has529: false })}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${!config.has529 ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e4e1d9] text-[#5c5c5c] hover:border-[#1a1a1a]'}`}
                  >
                    No
                  </button>
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-[#e4e1d9] bg-[#f5f4f0]">
              <button
                onClick={handleSave}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-[#1a1a1a] hover:bg-[#333] transition-colors shadow-lg"
              >
                Generate Personalized FOO
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
