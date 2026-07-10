'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from '@/data/questions';
import { useQuizState } from '@/hooks/useQuizState';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { saveLead } from '@/lib/supabase';

// Custom numeric values stored separately from option answers
// key = questionId, value = raw number typed by user
type CustomValues = Record<string, number>;
const CUSTOM_STORAGE_KEY = 'fire_quiz_custom_values';

function loadCustomValues(): CustomValues {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY) ?? '{}'); } catch { return {}; }
}
function saveCustomValues(v: CustomValues) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(v)); } catch { /* noop */ }
}

export default function QuizPage() {
  const router = useRouter();
  const { answers, setAnswer, submitQuiz, hydrated, resetQuiz } = useQuizState();
  const scrollRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customValues, setCustomValues] = useState<CustomValues>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});

  const [emailCaptured, setEmailCaptured] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  useEffect(() => {
    // Check if email was already captured in this session
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('fire_quiz_email');
      if (savedEmail) {
        setEmailCaptured(true);
      }
    }
  }, []);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmittingEmail(true);
    await saveLead(email);
    localStorage.setItem('fire_quiz_email', email);
    setEmailCaptured(true);
    setIsSubmittingEmail(false);
  }

  const question = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = (currentIndex / totalQuestions) * 100;
  const selectedOption = answers[question.id];
  const hasCustomInput = question.supportsCustomInput && question.customInputConfig;
  const isCustomMode = !!showCustomInput[question.id];

  useEffect(() => {
    if (!hydrated) return;
    setCustomValues(loadCustomValues());
    const lastAnsweredIndex = QUESTIONS.reduce(
      (acc, q, i) => (answers[q.id] ? i : acc), -1
    );
    if (lastAnsweredIndex >= 0 && lastAnsweredIndex < totalQuestions - 1) {
      setCurrentIndex(lastAnsweredIndex + 1);
    }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  function handleSelect(optionId: string) {
    // If user selects a tile, clear the custom mode for this question
    setShowCustomInput((prev) => ({ ...prev, [question.id]: false }));
    setAnswer(question.id, optionId);
  }

  function handleCustomChange(raw: string) {
    if (raw === '') {
      const next = { ...customValues };
      delete next[question.id];
      setCustomValues(next);
      saveCustomValues(next);
      setAnswer(question.id, '');
      return;
    }
    const num = Number(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    const next = { ...customValues, [question.id]: num };
    setCustomValues(next);
    saveCustomValues(next);
    // Mark a special option id so we know custom was used
    setAnswer(question.id, `custom_${question.id}`);
  }

  function toggleCustomMode() {
    const next = !isCustomMode;
    setShowCustomInput((prev) => ({ ...prev, [question.id]: next }));
    if (next) {
      // Clear the tile selection when switching to custom mode
      // (we'll set it when they type)
    }
  }

  function handleNext() {
    if (!selectedOption) return;
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
    // Merge custom values into a special answers key so the scoring hook can read them
    const mergedAnswers = { ...answers, __customValues: JSON.stringify(customValues) as unknown as string };
    submitQuiz(mergedAnswers);
    await new Promise((r) => setTimeout(r, 800));
    router.push('/results');
  }

  const isLast = currentIndex === totalQuestions - 1;
  const cfg = question.customInputConfig;
  const currentCustomVal = customValues[question.id];
  const canProceed = !!selectedOption && (!isCustomMode || (isCustomMode && !!currentCustomVal));

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  if (!emailCaptured) {
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-[#f5f4f0] text-[#1a1a1a] selection:bg-[#4ade80] selection:text-white font-sans items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2rem] border border-[#e4e1d9] shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#16a34a]" />
          
          <div className="w-12 h-12 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-6 border border-[#bbf7d0]">
            <Mail className="text-[#16a34a]" size={24} />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-3 tracking-tight">
            Where should we send your results?
          </h1>
          <p className="text-[#5c5c5c] text-sm mb-8 leading-relaxed">
            Enter your email to start the assessment. We will use this to email your personalized FIRE strategy and exact mathematical timeline.
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-[#e4e1d9] px-4 py-4 text-base font-medium text-[#1a1a1a] outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingEmail || !email.includes('@')}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${
                isSubmittingEmail || !email.includes('@')
                  ? 'bg-[#e4e1d9] text-[#9a9a9a] cursor-not-allowed'
                  : 'bg-[#1a1a1a] text-white hover:bg-[#333] shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmittingEmail ? 'Loading...' : 'Start Assessment →'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 bg-[#f9fafb] p-3 rounded-lg border border-gray-100">
            <ShieldCheck className="text-[#16a34a] shrink-0 mt-0.5" size={16} />
            <p className="text-[11px] text-[#5c5c5c] font-medium leading-relaxed">
              <strong>No account creation required.</strong> This is completely frictionless. We just need to know where to send your numbers.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <button
            onClick={() => {
              if (confirm('Are you sure you want to start over?')) {
                resetQuiz();
                setCurrentIndex(0);
                setCustomValues({});
              }
            }}
            className="text-[10px] font-bold text-[#9a9a9a] hover:text-[#ef4444] uppercase tracking-widest transition-colors"
          >
            Start Over
          </button>
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
                {QUESTIONS.map((q, i) => (
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

              {/* ── Custom number input ── */}
              {hasCustomInput && isCustomMode && cfg && (
                <div className="mb-6 rounded-[2rem] border border-[#e4e1d9] bg-white p-6 shadow-sm mx-auto max-w-md">
                  <label className="block text-[11px] font-bold mb-3 uppercase tracking-widest text-[#16a34a] text-center">
                    {cfg.label}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      {(cfg.unit === '/ year' || cfg.unit === '/ month' || cfg.unit === 'total') && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5c5c5c]">$</span>
                      )}
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder={cfg.placeholder}
                        value={currentCustomVal !== undefined ? currentCustomVal.toLocaleString('en-US') : ''}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        className="w-full rounded-2xl border-2 border-[#e4e1d9] px-4 py-4 text-xl font-black text-[#1a1a1a] outline-none focus:border-[#16a34a] focus:ring-4 focus:ring-[#16a34a]/10 transition-all bg-white"
                        style={{
                          paddingLeft: (cfg.unit === '/ year' || cfg.unit === '/ month' || cfg.unit === 'total') ? '2.5rem' : '1rem',
                        }}
                        autoFocus
                      />
                    </div>
                    <span className="text-sm font-bold text-[#5c5c5c] flex-shrink-0">
                      {cfg.unit}
                    </span>
                  </div>
                  {currentCustomVal && (
                    <p className="text-[11px] font-bold mt-4 text-[#16a34a] uppercase tracking-wider flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} /> Using your exact number
                    </p>
                  )}
                </div>
              )}

              {/* ── Toggle custom input ── */}
              {hasCustomInput && (
                <div className="mb-4 border-b border-dashed border-[#e4e1d9] pb-4">
                  <button
                    onClick={toggleCustomMode}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 font-bold uppercase tracking-widest text-xs transition-all ${
                      isCustomMode 
                        ? 'border-[#ef4444] text-[#ef4444] bg-[#fef2f2] hover:bg-[#fee2e2]' 
                        : 'border-[#1a1a1a] text-[#1a1a1a] bg-white hover:bg-[#f5f4f0] shadow-sm'
                    }`}
                  >
                    {isCustomMode ? (
                      <><span>←</span> Cancel Custom Entry</>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>✏️</span> Enter your exact number <span className="opacity-50 lowercase tracking-normal">(recommended)</span>
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* ── Option tiles ── */}
              {(!hasCustomInput || !isCustomMode) && (
                <div className="space-y-3">
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
              )}
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
                    Calculating...
                  </>
                ) : isLast ? 'See Results →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
