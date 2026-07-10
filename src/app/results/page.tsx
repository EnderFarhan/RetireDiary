'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { STRATEGY_MAP } from '@/data/strategies';
import { StrategyId } from '@/data/questions';
import { StrategyScore } from '@/lib/quiz-scoring';
import { calculateFIRE } from '@/lib/fire-engine';
import AdBanner from '@/components/ads/AdBanner';

const RANK_LABELS = ['#1 Best Fit', '#2 Good Match', '#3 Alternative', '#4 Alternative', '#5 Alternative'];

function StrategyCard({
  rank,
  strategyScore,
  onSelect,
}: {
  rank: number;
  strategyScore: StrategyScore;
  onSelect: (id: StrategyId) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const strategy = STRATEGY_MAP[strategyScore.strategy];
  const isTop = rank === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.12, duration: 0.4 }}
      className={`rounded-3xl border-2 overflow-hidden bg-white ${isTop ? 'border-[#16a34a] shadow-[0_8px_30px_rgba(22,163,74,0.12)]' : 'border-[#e4e1d9]'}`}
    >
      {/* Card Header */}
      <div className="p-5 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          {/* Left: rank + name */}
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white ${isTop ? 'bg-[#16a34a]' : 'bg-[#1a1a1a]'}`}>
              {rank + 1}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{strategy.emoji}</span>
                <h3 className="text-lg font-black text-[#1a1a1a]">{strategy.name}</h3>
              </div>
              <p className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider">
                {RANK_LABELS[rank]}
              </p>
            </div>
          </div>

          {/* Right: match % */}
          <div className="text-right flex-shrink-0">
            <div className={`text-2xl font-black tracking-tighter ${isTop ? 'text-[#16a34a]' : 'text-[#1a1a1a]'}`}>
              {strategyScore.percentage}%
            </div>
            <div className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-widest">match</div>
          </div>
        </div>

        {/* Match bar */}
        <div className="mt-5 h-2 rounded-full bg-[#e4e1d9]">
          <motion.div
            className={`h-full rounded-full ${isTop ? 'bg-[#16a34a]' : 'bg-[#1a1a1a]'}`}
            initial={{ width: 0 }}
            animate={{ width: `${strategyScore.percentage}%` }}
            transition={{ delay: rank * 0.12 + 0.3, duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Tagline */}
        <p className="mt-4 text-sm font-medium italic text-[#5c5c5c]">
          &ldquo;{strategy.tagline}&rdquo;
        </p>

        {/* Plain English */}
        <p className="mt-3 text-sm leading-relaxed text-[#1a1a1a]">
          {strategy.plainEnglish}
        </p>

        {/* Key stats row */}
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { label: 'Timeline', val: strategy.typicalTimeline },
            { label: 'Savings Rate', val: strategy.savingsRate },
            { label: 'Example', val: strategy.fireNumberExample },
          ].map(({ label, val }) => (
            <div key={label} className="flex-1 min-w-[100px] rounded-xl p-3 bg-[#f5f4f0] border border-[#e4e1d9]">
              <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-1">{label}</div>
              <div className="text-xs font-black text-[#1a1a1a]">{val}</div>
            </div>
          ))}
        </div>

        {/* Action row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <button
            onClick={() => onSelect(strategy.id)}
            className={`w-full sm:flex-1 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isTop ? 'bg-[#16a34a] text-white shadow-lg shadow-green-900/20 hover:bg-[#15803d]' : 'bg-[#1a1a1a] text-white hover:bg-[#333]'}`}
          >
            Calculate This Strategy →
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full sm:w-auto px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors flex-shrink-0"
          >
            {expanded ? '▲ Less' : '▼ Why this fits you'}
          </button>
        </div>
      </div>

      {/* Expandable deep-dive */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[#e4e1d9] bg-[#f5f4f0]"
          >
            <div className="p-5 lg:p-8 space-y-4">
              {/* Glossary note */}
              <div className="rounded-xl p-4 bg-white border border-[#e4e1d9]">
                <p className="text-[10px] font-bold mb-1.5 text-[#1a1a1a] uppercase tracking-widest">What is the Target Number?</p>
                <p className="text-xs leading-relaxed text-[#5c5c5c]">
                  Your Target Number = Annual Spend × 25. This is the exact amount you need invested to safely withdraw 4%/year forever. It's backed by 50+ years of market data. Hit this number, and you never have to trade time for money again.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-[#1a1a1a] mb-1">What it actually is</h4>
                <p className="text-xs leading-relaxed text-[#5c5c5c]">{strategy.deepDive.whatItIs}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-[#1a1a1a] mb-1">Why the math works</h4>
                <p className="text-xs leading-relaxed text-[#5c5c5c]">{strategy.deepDive.whyItWorks}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-[#1a1a1a] mb-1">What your life looks like after</h4>
                <p className="text-xs leading-relaxed text-[#5c5c5c]">{strategy.deepDive.dayInTheLife}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-3">
                <div>
                  <h4 className="text-xs font-black text-[#16a34a] mb-2">✓ Best for</h4>
                  <ul className="space-y-1.5">
                    {strategy.deepDive.bestFor.map((item) => (
                      <li key={item} className="text-xs leading-relaxed text-[#1a1a1a] flex items-start gap-1.5">
                        <span className="text-[#16a34a] font-bold">·</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#ef4444] mb-2">⚠ Watch out for</h4>
                  <ul className="space-y-1.5">
                    {strategy.deepDive.watchOutFor.map((item) => (
                      <li key={item} className="text-xs leading-relaxed text-[#1a1a1a] flex items-start gap-1.5">
                        <span className="text-[#ef4444] font-bold">·</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { result, hydrated, selectStrategy, resetQuiz } = useQuizState();
  const [isLoading, setIsLoading] = useState(true);
  const [showAllStrategies, setShowAllStrategies] = useState(false);

  const isUnrealistic = useMemo(() => {
    if (!result || !result.userInputs) return false;
    const topStrategy = result.topThree[0];
    const userInputs = result.userInputs;
    const targetAge = userInputs.targetRetirementAge;
    
    if (!targetAge) return false;

    const fireResult = calculateFIRE({
      annualSpending: userInputs.annualSpending,
      annualIncome: userInputs.annualIncome,
      currentSavings: userInputs.currentSavings,
      age: userInputs.age,
      strategy: topStrategy.strategy,
      returnRate: 0.07,
      retirementAge: targetAge,
      numberOfChildren: userInputs.numberOfChildren ?? 0,
      country: userInputs.country,
      swr: 0.04,
      leanBudget: userInputs.leanBudget,
      fatBudget: userInputs.fatBudget,
      partTimeIncome: userInputs.partTimeIncome,
      traditionalAge: userInputs.traditionalAge,
    });

    return fireResult.monthlySavingsNeeded > ((userInputs.annualIncome * 0.72) / 12);
  }, [result]);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, [hydrated]);

  useEffect(() => {
    if (hydrated && !result) {
      router.replace('/quiz');
    }
  }, [hydrated, result, router]);

  function handleSelectStrategy(id: StrategyId) {
    selectStrategy(id);
    router.push('/calculate');
  }

  if (!hydrated || !result) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f4f0]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-[#e4e1d9] border-t-[#16a34a] rounded-full mb-6"
        />
        <p className="text-sm font-bold text-[#5c5c5c] uppercase tracking-widest">
          Crunching your numbers...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1a1a] font-sans selection:bg-[#4ade80] selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-[#e4e1d9]">
        <a href="/">
          <img src="/logo.png" className="h-14 object-contain" alt="The FIRE Blueprint" />
        </a>
        <button 
          onClick={() => {
            resetQuiz();
            router.push('/quiz');
          }}
          className="text-xs font-bold text-[#5c5c5c] hover:text-[#1a1a1a] uppercase tracking-widest transition-colors"
        >
          ⟲ Start Over
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 lg:py-16">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex w-fit self-start items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#16a34a] border border-[#16a34a]/30 rounded-full mb-4">
            Based on your answers
          </div>
          <h1 className="text-3xl lg:text-5xl font-black mb-4 tracking-tight text-[#1a1a1a]">
            Here is your math.
          </h1>

          {isUnrealistic && (
            <div className="rounded-xl p-4 mb-6 bg-[#fef2f2] border-2 border-[#ef4444] text-[#7f1d1d] shadow-sm flex items-start gap-3">
              <span className="text-lg mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-xs leading-relaxed font-medium mb-1">
                  <strong className="font-black text-[#ef4444]">Warning: The Math Does Not Work</strong>
                </p>
                <p className="text-xs leading-relaxed font-medium">
                  Your timeline of {result.userInputs.targetRetirementAge ? result.userInputs.targetRetirementAge - result.userInputs.age : ''} years is mathematically impossible without drastically increasing your inputs (income) or decreasing your outputs (expenses). We ranked these based on your inputs, but you need to face reality and adjust your timeline or consider Barista/Coast FIRE.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm lg:text-xl mb-8 text-[#5c5c5c] leading-relaxed">
            These vehicles are ranked by how well they match your inputs. Click &ldquo;Calculate This Strategy&rdquo; to generate your blueprint. Don't overthink it.
          </p>
        </motion.div>

        {/* Strategy Cards */}
        <div className="space-y-8">
          {(showAllStrategies ? result.ranked : result.topThree).map((strategyScore, rank) => (
            <div key={strategyScore.strategy}>
              <StrategyCard
                rank={rank}
                strategyScore={strategyScore}
                onSelect={handleSelectStrategy}
              />
              {(rank === 0 || rank === 2) && <AdBanner />}
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setShowAllStrategies((s) => !s)}
            className="text-xs font-bold uppercase tracking-widest text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors"
          >
            {showAllStrategies ? '↑ Show top 3 only' : '↓ View all other strategies'}
          </button>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm font-medium mt-16 text-[#5c5c5c]"
        >
          Not sure which to pick? Start with #1 — you can always come back and switch.
        </motion.p>
      </main>
    </div>
  );
}
