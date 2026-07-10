'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { SUPPLEMENTARY_QUESTIONS } from '@/data/supplementary-questions';
import { CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { hydrated, answers } = useQuizState();
  const scrollRef = useRef<HTMLElement>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppAnswers, setSuppAnswers] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (hydrated && !answers['income']) {
      router.replace('/quiz');
    }
  }, [hydrated, answers, router]);

  const activeQuestions = useMemo(() => {
    return SUPPLEMENTARY_QUESTIONS.filter(q => !q.condition || q.condition(answers));
  }, [answers]);

  const totalQuestions = activeQuestions.length;
  const question = activeQuestions[currentIndex];
  const progress = ((currentIndex) / totalQuestions) * 100; // Not perfectly accurate but good enough for visual

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  if (!hydrated || activeQuestions.length === 0) return null;

  const selectedOption = suppAnswers[question.id];
  const selectedOptionDef = question.options.find(o => o.id === selectedOption);
  const hasCustomInput = selectedOptionDef?.requiresCustomInput && question.customInputConfig;
  const isCustomMode = !!showCustomInput[question.id] || hasCustomInput; // Force mode if required
  
  function handleSelect(optionId: string) {
    const optDef = question.options.find(o => o.id === optionId);
    setShowCustomInput(prev => ({ ...prev, [question.id]: !!optDef?.requiresCustomInput }));
    setSuppAnswers(prev => ({ ...prev, [question.id]: optionId }));
    
    // Clear custom input if not needed
    if (!optDef?.requiresCustomInput) {
        setCustomInputs(prev => {
            const next = { ...prev };
            delete next[question.id];
            return next;
        });
    }
  }

  function handleCustomChange(val: string) {
    setCustomInputs(prev => ({ ...prev, [question.id]: val }));
  }

  function handleNext() {
    if (!selectedOption) return;
    if (hasCustomInput && !customInputs[question.id]) return; // Block if custom input required but empty
    
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    localStorage.setItem('fire_supp_answers', JSON.stringify({ suppAnswers, customInputs }));
    await new Promise((r) => setTimeout(r, 800));
    router.push('/dashboard');
  }

  const isLast = currentIndex === totalQuestions - 1;
  const cfg = question.customInputConfig;
  const currentCustomVal = customInputs[question.id];
  const canProceed = !!selectedOption && (!hasCustomInput || (hasCustomInput && !!currentCustomVal));

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#f5f4f0] text-[#1a1a1a] selection:bg-[#4ade80] selection:text-white font-sans overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#e4e1d9]">
        <motion.div
          className="h-full bg-[#16a34a]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#e4e1d9] bg-white">
        <a href="/">
          <img src="/logo.png" className="h-14 object-contain" alt="The FIRE Blueprint" />
        </a>
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-[#5c5c5c] uppercase tracking-wider">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
      </header>

      {/* Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — context panel (desktop only) */}
        <aside className="hidden lg:flex flex-col justify-center px-12 py-16 w-2/5 flex-shrink-0 bg-white border-r border-[#e4e1d9] text-[#1a1a1a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id + '-left'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#16a34a] border border-[#16a34a]/30 rounded-full mb-6 bg-[#f0fdf4]">
                Question {currentIndex + 1}
              </div>
              <p className="text-2xl font-light leading-relaxed mb-6 italic text-[#1a1a1a]/80" style={{ fontFamily: 'Georgia, serif' }}>
                &ldquo;{question.leftContext}&rdquo;
              </p>
              <div className="flex gap-2 flex-wrap mt-8">
                {activeQuestions.map((q, i) => (
                  <div key={q.id} className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: i < currentIndex ? '#16a34a' : i === currentIndex ? '#1a1a1a' : '#e4e1d9',
                    }} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* RIGHT PANEL — Fixed flex container */}
        <div className="flex-1 flex flex-col bg-[#f5f4f0] h-full overflow-hidden">
          {/* Scrollable question area */}
          <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 lg:px-16 flex flex-col">
            <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-12">
            <div className="inline-flex lg:hidden items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#16a34a] border border-[#16a34a]/30 rounded-full mb-6">
              Question {currentIndex + 1} of {totalQuestions}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={question.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#1a1a1a] mb-5 tracking-tight">
                  {question.text}
                </h2>

              {/* ── Option tiles ── */}
              <div className="space-y-3 mb-6">
                {question.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#f0fdf4] border-[#16a34a] shadow-[0_4px_12px_rgba(22,163,74,0.15)] -translate-y-0.5' 
                            : 'bg-white border-[#e4e1d9] hover:border-[#1a1a1a] hover:bg-[#f9fafb]'
                        }`}
                      >
                        <span className={`text-base block ${isSelected ? 'text-[#16a34a] font-bold' : 'text-[#1a1a1a] font-medium'}`}>
                          {option.label}
                        </span>
                      </button>
                  );
                })}
              </div>

              {/* ── Custom input ── */}
              <AnimatePresence>
                {hasCustomInput && isCustomMode && cfg && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 rounded-[2rem] border border-[#e4e1d9] bg-white p-6 shadow-sm mx-auto max-w-md w-full overflow-hidden"
                    >
                    <label className="block text-[11px] font-bold mb-3 uppercase tracking-widest text-[#16a34a] text-center">
                        {cfg.label}
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                        <input
                            type={cfg.type || "text"}
                            placeholder={cfg.placeholder}
                            value={currentCustomVal || ''}
                            onChange={(e) => handleCustomChange(e.target.value)}
                            className="w-full rounded-2xl border-2 border-[#e4e1d9] px-4 py-4 text-xl font-black text-[#1a1a1a] outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all bg-white"
                            autoFocus
                        />
                        </div>
                        <span className="text-sm font-bold text-[#5c5c5c] flex-shrink-0">
                        {cfg.unit}
                        </span>
                    </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
          </div>
        </main>

        {/* Fixed bottom navigation */}
          <div className="bg-[#f5f4f0] border-t border-[#e4e1d9] py-6 px-6 lg:px-16 flex-shrink-0">
            <div className="flex items-center justify-between max-w-xl mx-auto w-full">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${currentIndex === 0 ? 'text-[#e4e1d9] cursor-not-allowed' : 'text-[#5c5c5c] hover:text-[#1a1a1a]'}`}
              >
                ← Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                className={`px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                  !canProceed 
                    ? 'bg-[#e4e1d9] text-[#9a9a9a] cursor-not-allowed' 
                    : 'bg-[#16a34a] text-white hover:bg-[#15803d] hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20 cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Finalizing...
                  </>
                ) : isLast ? 'Finish →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
