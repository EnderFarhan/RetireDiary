'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQuizState } from '@/hooks/useQuizState';
import { STRATEGY_MAP } from '@/data/strategies';
import { calculateFIRE, yearsToFIREWithContribution, requiredMonthlyContributionToTarget } from '@/lib/fire-engine';
import { simulateAccumulation } from '@/lib/monte-carlo';
import { compareFees, formatCurrency } from '@/lib/fee-math';
import AdSidebar from '@/components/ads/AdSidebar';
import AdBanner from '@/components/ads/AdBanner';

import { MissionsTab } from '@/components/dashboard/MissionsTab';
import { EtfCard } from '@/components/dashboard/EtfCard';
import { ArmoryTab } from '@/components/dashboard/ArmoryTab';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { MindsetTab } from '@/components/dashboard/MindsetTab';
import { FooCustomizerModal, FooConfig } from '@/components/dashboard/FooCustomizerModal';
import { AdvancedArchitectures } from '@/components/dashboard/AdvancedArchitectures';

/* ──────────────────────────────────────────────
   Slider component
────────────────────────────────────────────── */
function SliderRow({
  label, value, min, max, step, format, onChange, highlight, markers,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (v: number) => void;
  highlight?: boolean;
  markers?: Array<{ value: number; color?: string; tooltip?: string }>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#5c5c5c]">{label}</span>
        <span className={`text-base font-black ${highlight ? 'text-[#16a34a]' : 'text-[#1a1a1a]'}`}>
          {format(value)}
        </span>
      </div>
      <div className="relative w-full flex items-center h-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[#e4e1d9] rounded-lg appearance-none cursor-pointer accent-[#16a34a] z-10"
        />
        {markers && markers.map((marker, i) => {
          if (marker.value < min || marker.value > max) return null;
          return (
            <div 
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded-sm z-20 pointer-events-auto cursor-help group ${marker.color || 'bg-[#ef4444]'}`}
              style={{ left: `${((marker.value - min) / (max - min)) * 100}%`, transform: 'translate(-50%, -50%)' }}
            >
              {marker.tooltip && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[130%] bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 shadow-md">
                  {marker.tooltip}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Animated counter
────────────────────────────────────────────── */
function AnimatedNumber({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const duration = 1200;
    const from = displayed;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{prefix}{displayed.toLocaleString()}</>;
}

/* ──────────────────────────────────────────────
   Chart tooltip
────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-5 py-4 text-sm bg-[#1a1a1a] text-white border border-[#333]">
      <p className="font-bold mb-2 text-[#e4e1d9]">Year {label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, true)}
        </p>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main page
────────────────────────────────────────────── */
export default function CalculatePage() {
  const router = useRouter();
  const { result, selectedStrategy, hydrated, answers } = useQuizState();

  useEffect(() => {
    if (!hydrated) return;
    if (!result) router.replace('/quiz');
    else if (!selectedStrategy) router.replace('/results');
  }, [hydrated, result, selectedStrategy, router]);

  const strategy = selectedStrategy ? STRATEGY_MAP[selectedStrategy] : null;
  const userInputs = result?.userInputs;

  // Fallback for targetRetirementAge if cached before fix
  const targetRetirementAge = useMemo(() => {
    if (userInputs?.targetRetirementAge) return userInputs.targetRetirementAge;
    if (!answers || !userInputs) return undefined;
    
    let customValues: Record<string, any> = {};
    if (answers['__customValues']) {
      try { customValues = JSON.parse(answers['__customValues'] as string); } catch { /* noop */ }
    }
    if (customValues['timeline']) return Number(customValues['timeline']);

    const timelineOptId = answers['timeline'];
    if (timelineOptId === '5_10_years') return userInputs.age + 7;
    if (timelineOptId === '10_15_years') return userInputs.age + 12;
    if (timelineOptId === '15_20_years') return userInputs.age + 17;
    if (timelineOptId === 'flexible') return userInputs.age + 25;

    return undefined;
  }, [userInputs, answers]);

  // ── Slider state seeded from quiz ──
  const [monthlyContrib, setMonthlyContrib] = useState(0);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [annualSpending, setAnnualSpending] = useState(0);
  const [returnRate, setReturnRate] = useState(7);
  const [swr, setSwr] = useState(4);
  const [feeYears, setFeeYears] = useState(30);
  const [childCostOverride, setChildCostOverride] = useState<number | undefined>(undefined);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [leanBudget, setLeanBudget] = useState<number | undefined>(undefined);
  const [fatBudget, setFatBudget] = useState<number | undefined>(undefined);
  const [partTimeIncome, setPartTimeIncome] = useState<number | undefined>(undefined);
  const [traditionalAge, setTraditionalAge] = useState<number | undefined>(undefined);
  const [salaryIncreasePct, setSalaryIncreasePct] = useState(0);
  const [reinvestPct, setReinvestPct] = useState(0);
  const [seeded, setSeeded] = useState(false);
  const [hasMovedMonthlySlider, setHasMovedMonthlySlider] = useState(false);
  const [hasMovedSlider, setHasMovedSlider] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isFooModalOpen, setIsFooModalOpen] = useState(false);

  // ── FOO Configuration State ──
  const [fooConfig, setFooConfig] = useState<FooConfig>({
    hasEmergencyFund: false,
    hasEmployerMatch: true,
    matchPct: '5%',
    hasDebt: true,
    debtRate: 'over 5%',
    isUs: false,
    hdhpStatus: 'hdhp_enrolled',
    isCanadian: false,
    tfsaStatus: 'since_2009',
    tfsaYear: '2009',
    has529: false,
  });

  useEffect(() => {
    if (userInputs && selectedStrategy && !seeded) {
      // Calculate realistic savings capacity based on their income and spending
      const initialFIRE = calculateFIRE({
        annualSpending: userInputs.annualSpending,
        annualIncome: userInputs.annualIncome,
        currentSavings: userInputs.currentSavings,
        age: userInputs.age,
        strategy: selectedStrategy,
        returnRate: 0.07,
        retirementAge: targetRetirementAge ?? 65,
        numberOfChildren: userInputs.numberOfChildren ?? 0,
        country: userInputs.country,
        swr: 0.04,
        leanBudget: userInputs.leanBudget,
        fatBudget: userInputs.fatBudget,
        partTimeIncome: userInputs.partTimeIncome,
        traditionalAge: userInputs.traditionalAge,
        salaryIncreasePct: userInputs.salaryIncreasePct ?? 0,
        reinvestPct: userInputs.reinvestPct ?? 0,
      });

      setMonthlyContrib(initialFIRE.monthlySavingsNeeded);
      setHasMovedSlider(false);
      setHasMovedMonthlySlider(false);
      setCurrentSavings(userInputs.currentSavings);
      setAnnualSpending(userInputs.annualSpending);
      setChildrenCount(userInputs.numberOfChildren ?? 0);
      
      if (userInputs.leanBudget) setLeanBudget(userInputs.leanBudget);
      if (userInputs.fatBudget) setFatBudget(userInputs.fatBudget);
      if (userInputs.partTimeIncome) setPartTimeIncome(userInputs.partTimeIncome);
      if (userInputs.traditionalAge) setTraditionalAge(userInputs.traditionalAge);
      if (userInputs.salaryIncreasePct !== undefined) setSalaryIncreasePct(userInputs.salaryIncreasePct);
      if (userInputs.reinvestPct !== undefined) setReinvestPct(userInputs.reinvestPct);
      
      setFooConfig(prev => ({
        ...prev,
        isUs: userInputs.country === 'us',
        isCanadian: userInputs.country === 'canada'
      }));

      // Fee years is intentionally defaulted to 30 as per user request

      setSeeded(true);
    }
  }, [userInputs, selectedStrategy, targetRetirementAge, seeded]);

  // ── Base FIRE calculation (used for fireNumber, coastNumber) ──
  const baseFIRE = useMemo(() => {
    if (!userInputs || !selectedStrategy) return null;
    return calculateFIRE({
      annualSpending: annualSpending || userInputs.annualSpending,
      annualIncome: userInputs.annualIncome,
      currentSavings,
      age: userInputs.age,
      strategy: selectedStrategy,
      returnRate: returnRate / 100,
      retirementAge: targetRetirementAge ?? 65,
      numberOfChildren: childrenCount,
      country: userInputs.country,
      annualCostPerChildOverride: childCostOverride,
      swr: swr / 100,
      leanBudget,
      fatBudget,
      partTimeIncome,
      traditionalAge,
      salaryIncreasePct,
      reinvestPct,
    });
  }, [userInputs, selectedStrategy, annualSpending, currentSavings, returnRate, childCostOverride, childrenCount, swr, leanBudget, fatBudget, partTimeIncome, traditionalAge, salaryIncreasePct, reinvestPct]);

  const requiredMonthlyContrib = baseFIRE?.monthlySavingsNeeded ?? 0;
  
  // Auto-sync monthly savings whenever the FIRE target changes, UNLESS the user has
  // manually dragged the monthly savings slider (in which case they are overriding it intentionally).
  useEffect(() => {
    if (!hasMovedMonthlySlider && requiredMonthlyContrib > 0) {
      setMonthlyContrib(requiredMonthlyContrib);
    }
  }, [requiredMonthlyContrib, hasMovedMonthlySlider]);
  
  // Calculate Target Aggressiveness
  const realisticMaxSavings = userInputs ? (userInputs.annualIncome * 0.50) / 12 : 0;
  const extremeMaxSavings = userInputs ? (userInputs.annualIncome * 0.80) / 12 : 0;
  const isTargetExtremelyAggressive = userInputs && requiredMonthlyContrib > extremeMaxSavings;
  const isTargetAggressive = userInputs && requiredMonthlyContrib > realisticMaxSavings && requiredMonthlyContrib <= extremeMaxSavings;

  // ── Live years-to-FIRE based on the monthly savings SLIDER ──
  const liveYearsToFIRE = useMemo(() => {
    if (!baseFIRE) return 0;
    const target = baseFIRE.coastNumber ?? baseFIRE.fireNumber;
    return yearsToFIREWithContribution(
      target, currentSavings, monthlyContrib, returnRate / 100, 
      userInputs?.annualIncome, salaryIncreasePct, reinvestPct
    );
  }, [baseFIRE, currentSavings, monthlyContrib, returnRate, userInputs?.annualIncome, salaryIncreasePct, reinvestPct]);

  // ── Monte Carlo Simulation (Volatility) ──
  const liveMonteCarlo = useMemo(() => {
    if (!baseFIRE) return null;
    const target = baseFIRE.coastNumber ?? baseFIRE.fireNumber;
    return simulateAccumulation(currentSavings, monthlyContrib * 12, target, returnRate / 100);
  }, [baseFIRE, currentSavings, monthlyContrib, returnRate]);

  const liveRetirementAge = (userInputs?.age ?? 30) + liveYearsToFIRE;

  // ── Savings rate relative to income ──
  const liveSavingsRate = useMemo(() => {
    if (!userInputs?.annualIncome) return 0;
    return Math.round((monthlyContrib * 12 / userInputs.annualIncome) * 100);
  }, [monthlyContrib, userInputs?.annualIncome]);

  const etfs = useMemo(() => {
    if (fooConfig.isUs) return [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', expense: '0.03%', description: 'Own the entire U.S. stock market in a single ticker. 3,900 companies. The simplest, broadest bet on the American economy.', isMain: true },
      { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', expense: '0.03%', description: 'The 500 largest U.S. companies. Nearly identical long-term returns to VTI. Pick one and never sell it.', isMain: false },
    ];
    if (fooConfig.isCanadian) return [
      { ticker: 'VEQT', name: 'Vanguard All-Equity ETF Portfolio', expense: '0.20%', description: 'A globally diversified, automatically rebalancing ETF. The entire world in one Canadian ticker. The simplest path to wealth.', isMain: true },
      { ticker: 'XEQT', name: 'iShares Core Equity ETF Portfolio', expense: '0.20%', description: 'BlackRock\'s equivalent of VEQT. They are mathematically interchangeable. Pick one, set it to auto-buy, and ignore the noise.', isMain: false },
    ];
    return [
      { ticker: 'VWCE', name: 'Vanguard FTSE All-World UCITS ETF', expense: '0.22%', description: 'The gold standard for international investors. 3,800 companies across 49 countries. Buy it everywhere.', isMain: true },
      { ticker: 'IWDA', name: 'iShares Core MSCI World UCITS ETF', expense: '0.20%', description: 'Developed-market alternative to VWCE. Lower expense ratio, excludes emerging markets. Widely available. Set and forget.', isMain: false },
    ];
  }, [fooConfig.isUs, fooConfig.isCanadian]);

  // ── Fee comparison ──
  const feeComparison = useMemo(() => {
    if (!userInputs) return null;
    return compareFees({
      currentSavings,
      monthlyContribution: monthlyContrib,
      annualMarketReturn: returnRate / 100,
      years: feeYears,
    });
  }, [currentSavings, monthlyContrib, returnRate, feeYears, userInputs]);

  // ── Chart data ──
  const chartData = useMemo(() => {
    if (!feeComparison) return [];
    return feeComparison.indexPath.map((snap, i) => ({
      year: snap.year,
      'Index Fund (0.05%)': snap.balance,
      'With Advisor Fee (1.5%)': feeComparison.aumPath[i]?.balance ?? 0,
    }));
  }, [feeComparison]);

  if (!hydrated || !result || !selectedStrategy || !strategy || !userInputs) return null;

  const targetNumber = baseFIRE?.coastNumber ?? baseFIRE?.fireNumber ?? 0;
  const feeLost = feeComparison?.feeDifferenceLost ?? 0;
  const extraYears = feeComparison?.extraYearsOfWork ?? 0;

  // Realistic fallback calculations for the warning box
  const realisticYearsToFIRE = yearsToFIREWithContribution(targetNumber, currentSavings, realisticMaxSavings, returnRate / 100);
  const realisticRetirementAge = userInputs ? userInputs.age + Math.ceil(realisticYearsToFIRE) : 0;

  const sentimentIntro: Record<string, { title: string, desc: string }> = {
    robbing_us: {
      title: "You're right to be furious.",
      desc: `You already know financial advisors are a scam. Let's look at exactly how much they extract from your portfolio over ${feeYears} years compared to a 0.05% index fund.`
    },
    know_fees_matter: {
      title: "It's time to stop bleeding.",
      desc: `You know fees matter, but seeing the actual math is a wake-up call. Here is exactly how much a 1.5% advisor fee extracts from you over ${feeYears} years compared to a 0.05% index fund.`
    },
    dont_understand: {
      title: "The lie you are being sold.",
      desc: `Advisors charge 1.5% of your total assets. Not profit. Assets. A low-cost index fund charges 0.05%. That 1.45% gap is destroying your wealth. Look at the math:`
    },
    already_indexes: {
      title: "Good call on the index funds.",
      desc: `You're already avoiding the trap of high-fee advisors. Just to validate your excellent life choices, here is exactly how much money you are saving yourself over ${feeYears} years by using a 0.05% index fund instead of a 1.5% advisor.`
    },
    unknown: {
      title: "The lie you are being sold.",
      desc: `Advisors charge 1.5% of your total assets. Not profit. Assets. A low-cost index fund charges 0.05%. That 1.45% gap is destroying your wealth. Look at the math:`
    }
  };

  const sentimentData = sentimentIntro[userInputs?.advisorSentiment ?? 'unknown'] || sentimentIntro['unknown'];

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1a1a] font-sans selection:bg-[#4ade80] selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-[#e4e1d9]">
        <a href="/">
          <img src="/logo.png" className="h-14 object-contain" alt="The FIRE Blueprint" />
        </a>
        <Link href="/results" className="text-[10px] font-bold text-[#5c5c5c] hover:text-[#1a1a1a] uppercase tracking-widest transition-colors">
          ← Back to Strategies
        </Link>
      </header>

      <div className="flex justify-center w-full max-w-[100rem] mx-auto px-4">
        {/* Left Ad Sidebar (Hidden on smaller screens) */}
        <aside className="hidden xl:flex flex-col w-[200px] 2xl:w-[300px] shrink-0 pt-10">
          <AdSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto py-6 lg:py-8 space-y-10 px-2 sm:px-6">
        {/* ══ SECTION 1: YOUR FIRE NUMBERS ══ */}
        <section>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#16a34a] border border-[#16a34a]/30 rounded-full mb-3">
            Your mathematical blueprint
          </div>
          <h1 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight text-[#1a1a1a]">
            {strategy.emoji} Your {strategy.name} Blueprint
          </h1>
          
          <div className="mb-6 bg-white rounded-xl border-2 border-[#e4e1d9] p-4 shadow-sm">
            <p className="text-sm text-[#1a1a1a] font-medium leading-relaxed mb-3">
              {strategy.plainEnglish}
            </p>
            <details className="group">
              <summary className="text-sm font-bold text-[#16a34a] cursor-pointer hover:underline list-none flex items-center gap-1">
                <span className="group-open:hidden">View strategy mechanics ↓</span>
                <span className="hidden group-open:inline">Hide mechanics ↑</span>
              </summary>
              <div className="pt-3 text-xs text-[#5c5c5c] space-y-3 border-t border-[#e4e1d9] mt-3">
                <p><strong className="text-[#1a1a1a]">What it is:</strong> {strategy.deepDive.whatItIs}</p>
                <p><strong className="text-[#1a1a1a]">Why it works:</strong> {strategy.deepDive.whyItWorks}</p>
              </div>
            </details>
          </div>

          <p className="text-[10px] font-bold text-[#5c5c5c] mb-3 uppercase tracking-widest">
            Adjust your inputs (Math updates dynamically)
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: selectedStrategy === 'coast' ? 'Coast Number' : 'FIRE Number',
                value: formatCurrency(targetNumber, true),
                sub: selectedStrategy === 'coast' ? 'invest this, then coast' : `Based on ${swr}% withdrawal rate`,
                green: true,
              },
              {
                label: 'Years to Get There',
                value: liveMonteCarlo?.isUnreachable ? '∞' : `${Math.max(0, Math.ceil(liveYearsToFIRE))}`,
                sub: liveMonteCarlo && !liveMonteCarlo.isUnreachable
                     ? `Lucky: ${liveMonteCarlo.p90}y | Unlucky: ${liveMonteCarlo.p10}y`
                     : `retire around age ${liveRetirementAge}`,
                green: false,
                live: true,
                tooltip: `If you keep investing ${formatCurrency(monthlyContrib)} every month`,
              },
              {
                label: hasMovedSlider ? 'Monthly Savings' : 'Savings Needed for Goal',
                value: formatCurrency(monthlyContrib),
                sub: `${liveSavingsRate}% of your income`,
                green: false,
                red: isTargetExtremelyAggressive && !hasMovedSlider,
                yellow: isTargetAggressive && !hasMovedSlider,
                live: true,
              },
              {
                label: 'You Already Have',
                value: formatCurrency(currentSavings, true),
                sub: 'keep it invested',
                green: false,
              },
            ].map(({ label, value, sub, green, red, yellow, tooltip }) => (
              <div key={label} className={`relative group rounded-xl p-3 md:p-4 text-center border-2 ${green ? 'border-[#16a34a] bg-[#f0fdf4] shadow-sm' : red ? 'border-[#ef4444] bg-[#fef2f2] shadow-sm' : yellow ? 'border-[#eab308] bg-[#fefce8] shadow-sm' : 'border-[#e4e1d9] bg-white'}`}>
                <div className={`text-[9px] font-bold mb-1 uppercase tracking-widest ${green ? 'text-[#16a34a]' : red ? 'text-[#ef4444]' : yellow ? 'text-[#ca8a04]' : 'text-[#5c5c5c]'}`}>{label}</div>
                <div className={`text-xl lg:text-2xl font-black mb-1 tracking-tight ${green ? 'text-[#16a34a]' : red ? 'text-[#ef4444]' : yellow ? 'text-[#ca8a04]' : 'text-[#1a1a1a]'}`}>{value}</div>
                <div className="text-[10px] font-bold text-[#5c5c5c] leading-tight">{sub}</div>
                {tooltip && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[120%] bg-[#1a1a1a] text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold pointer-events-none">
                    {tooltip}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Missing Goal Warning */}
          {targetRetirementAge && isTargetExtremelyAggressive ? (
              <div className="rounded-xl p-4 mb-6 bg-[#fef2f2] border-2 border-[#ef4444] text-[#7f1d1d] shadow-sm flex items-start gap-3">
                <div className="text-xl shrink-0 mt-0.5">🛑</div>
                <div className="text-xs leading-relaxed">
                  <strong className="block text-sm mb-1.5">Warning: Mathematically Improbable</strong>
                  You want to exit at {targetRetirementAge}, but that requires saving <strong className="text-[#ef4444]">${Math.round(requiredMonthlyContrib).toLocaleString()}/month</strong> (over 80% of your income). This is mathematically improbable.
                  <br /><br />
                  To make this work, you need to drastically increase your income, expect massive salary growth, or explore a different strategy like <strong>Coast FIRE</strong> or <strong>Barista FIRE</strong>. Otherwise, a highly aggressive goal is saving 50% of your income <strong>(${Math.round(realisticMaxSavings).toLocaleString()}/month)</strong>.
                </div>
              </div>
          ) : targetRetirementAge && isTargetAggressive ? (
              <div className="rounded-2xl p-5 mb-6 bg-[#fefce8] border-2 border-[#eab308] text-[#854d0e] shadow-sm flex items-start gap-3">
                <div className="text-xl shrink-0 mt-0.5">⚠️</div>
                <div className="text-[13px] leading-relaxed">
                  <strong className="block text-base mb-2">Warning: High Aggression</strong>
                  Exiting at {targetRetirementAge} requires saving <strong className="text-[#ca8a04]">${Math.round(requiredMonthlyContrib).toLocaleString()}/month</strong>. 
                  <br /><br />
                  This is over 50% of your income. It is mathematically possible, but requires extreme discipline. If this feels too tight, try adjusting your Target Annual Spend or expected career growth below.
                </div>
              </div>
          ) : null}

          {/* Summary callout */}
          {!isTargetExtremelyAggressive && (
            <div className="rounded-xl p-4 mb-6 bg-[#1a1a1a] text-white shadow-md">
              <p className="text-xs leading-relaxed font-medium">
                {baseFIRE?.summary}{' '}
                <span className="text-[#4ade80]">
                  Move the sliders to see how saving more or less each month changes your timeline.
                </span>
              </p>
            </div>
          )}

          {/* ── Sliders ── */}
          <div className="rounded-xl p-4 md:p-6 bg-white border-2 border-[#e4e1d9] space-y-6">
            <h3 className="text-xs font-black text-[#1a1a1a] uppercase tracking-widest border-b border-[#e4e1d9] pb-3">
              Simulation Control Panel
            </h3>

            {/* Category: Contributions */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">1. Your Goals & Savings</h4>
              <SliderRow
                label="Target annual burn rate"
                value={annualSpending || (userInputs?.annualSpending ?? 0)}
                min={20000}
                max={Math.max(250000, (userInputs?.annualSpending ?? 0) * 2.5)}
                step={1000}
                format={(n) => formatCurrency(n)}
                onChange={(v) => { setAnnualSpending(v); }}
                highlight
              />
              <SliderRow
                label="Monthly savings input"
                value={monthlyContrib}
                min={100}
                max={Math.max(15000, requiredMonthlyContrib * 1.5, realisticMaxSavings * 1.5)}
                step={50}
                format={(n) => formatCurrency(n)}
                onChange={(v) => { setMonthlyContrib(v); setHasMovedSlider(true); setHasMovedMonthlySlider(true); }}
                markers={isTargetExtremelyAggressive ? [
                  { value: realisticMaxSavings, color: 'bg-[#16a34a]', tooltip: `Realistic: ${formatCurrency(realisticMaxSavings)} (50% of income)` },
                  { value: requiredMonthlyContrib, color: 'bg-[#ef4444]', tooltip: `Needed for goal: ${formatCurrency(requiredMonthlyContrib)} (Impossible)` }
                ] : isTargetAggressive ? [
                  { value: realisticMaxSavings, color: 'bg-[#16a34a]', tooltip: `Realistic: ${formatCurrency(realisticMaxSavings)} (50% of income)` },
                  { value: requiredMonthlyContrib, color: 'bg-[#ef4444]', tooltip: `Needed for goal: ${formatCurrency(requiredMonthlyContrib)} (Very High)` }
                ] : [
                  { value: requiredMonthlyContrib, color: 'bg-[#16a34a]', tooltip: `Needed for goal: ${formatCurrency(requiredMonthlyContrib)}` }
                ]}
                highlight
              />
              {userInputs?.monthlySavings !== undefined && (!userInputs.customValues || userInputs.customValues['monthly_savings'] === undefined) && (
                <p className="text-[10px] font-medium text-[#5c5c5c] leading-snug bg-white/80 p-3 rounded-xl border border-[#e4e1d9] mt-2 mb-4">
                  <strong className="text-[#1a1a1a] font-bold">Quiz Estimate:</strong> Because you selected a range in the quiz, we used an estimated average of {formatCurrency(userInputs.monthlySavings)}/mo. You can adjust this slider to see how saving your exact amount changes your timeline.
                </p>
              )}
              <SliderRow
                label="Current invested capital"
                value={currentSavings}
                min={0}
                max={1000000}
                step={1000}
                format={(n) => formatCurrency(n, true)}
                onChange={setCurrentSavings}
              />
            </div>
            
            {/* Category: Income Growth */}
            <div className="space-y-6 pt-2 border-t border-dashed border-[#e4e1d9]">
              <h4 className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">2. Career & Income Growth</h4>
              <SliderRow
                label="Expected annual salary increase (%)"
                value={salaryIncreasePct}
                min={0}
                max={20}
                step={1}
                format={(n) => `${n}%`}
                onChange={setSalaryIncreasePct}
              />
              <SliderRow
                label="Percentage of raise reinvested (%)"
                value={reinvestPct}
                min={0}
                max={100}
                step={5}
                format={(n) => `${n}%`}
                onChange={setReinvestPct}
                markers={[
                  { value: 50, color: 'bg-[#16a34a]', tooltip: 'Gold Standard: Reinvest half, enjoy half' }
                ]}
                highlight
              />
            </div>

            {/* Advanced Options Toggle */}
            <div className="flex justify-center border-t border-[#e4e1d9] pt-6 mt-6">
              <button 
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="px-6 py-3 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center gap-2"
              >
                {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Settings ⚙️'}
              </button>
            </div>

            {/* Advanced Settings Container */}
            {showAdvancedOptions && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-8"
              >
                {/* Category: Market & Strategy */}
                <div className="space-y-6 pt-2 border-t border-dashed border-[#e4e1d9]">
                  <h4 className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">3. Market & Strategy</h4>
                  <SliderRow
                    label="Expected annual investment return"
                    value={returnRate}
                    min={4}
                    max={12}
                    step={0.5}
                    format={(n) => `${n}%`}
                    onChange={setReturnRate}
                  />
                  <SliderRow
                    label="Safe Withdrawal Rate (SWR)"
                    value={swr}
                    min={2.5}
                    max={6}
                    step={0.1}
                    format={(n) => `${n}%`}
                    onChange={setSwr}
                  />

                  {selectedStrategy === 'lean' && (
                    <SliderRow
                      label="Lean FIRE Annual Budget"
                      value={leanBudget ?? (annualSpending || userInputs?.annualSpending || 0) * 0.75}
                      min={10000}
                      max={100000}
                      step={1000}
                      format={(n) => formatCurrency(n)}
                      onChange={setLeanBudget}
                    />
                  )}
                  
                  {selectedStrategy === 'fat' && (
                    <SliderRow
                      label="Fat FIRE Annual Budget"
                      value={fatBudget ?? (annualSpending || userInputs?.annualSpending || 0) * 1.5}
                      min={80000}
                      max={500000}
                      step={5000}
                      format={(n) => formatCurrency(n)}
                      onChange={setFatBudget}
                    />
                  )}

                  {selectedStrategy === 'barista' && (
                    <SliderRow
                      label="Expected Part-Time Income"
                      value={partTimeIncome ?? 18000}
                      min={5000}
                      max={100000}
                      step={1000}
                      format={(n) => formatCurrency(n)}
                      onChange={setPartTimeIncome}
                    />
                  )}

                  {selectedStrategy === 'coast' && (
                    <SliderRow
                      label="Traditional Retirement Age"
                      value={traditionalAge ?? 65}
                      min={55}
                      max={80}
                      step={1}
                      format={(n) => n.toString()}
                      onChange={setTraditionalAge}
                    />
                  )}
                </div>

                {/* Category: Family */}
                <div className="space-y-6 pt-4 border-t border-dashed border-[#e4e1d9]">
                  <h4 className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">4. Family</h4>
                  <SliderRow
                    label="Number of children (current or planned)"
                    value={childrenCount}
                    min={0}
                    max={10}
                    step={1}
                    format={(n) => n.toString()}
                    onChange={setChildrenCount}
                  />

                  {childrenCount > 0 && (
                    <div className="pt-6 mt-6 border-t border-dashed border-[#e4e1d9]">
                      <SliderRow
                        label="Expected annual cost per child"
                        value={childCostOverride ?? baseFIRE?.defaultCostPerChild ?? 0}
                        min={0}
                        max={50000}
                        step={1000}
                        format={(n) => formatCurrency(n)}
                        onChange={setChildCostOverride}
                      />
                      <p className="text-[11px] font-bold mt-4 text-[#5c5c5c] uppercase tracking-wider leading-relaxed">
                        The average cost in your region is <strong className="text-[#1a1a1a]">{formatCurrency(baseFIRE?.defaultCostPerChild ?? 0)}</strong>. 
                        This is added to your base annual spending. Set to $0 if you already included child costs in your monthly spending number.
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] font-bold text-[#5c5c5c] uppercase tracking-wider">
                    Tip: 7% is a reasonable long-term average for a global index fund portfolio, after inflation.
                  </p>
                </div>
              </motion.div>
            )}
          </div> {/* Close Sliders container */}
        </section>

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        {/* ══ 2. The Financial Order of Operations (FOO) ══ */}
        <section className="scroll-mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <SectionHeader badge="Your Action Plan" title="The Financial Order of Operations" />
          </div>
          
          <MissionsTab 
            hasEmergencyFund={fooConfig.hasEmergencyFund}
            hasEmployerMatch={fooConfig.hasEmployerMatch}
            matchPct={fooConfig.matchPct}
            hasDebt={fooConfig.hasDebt}
            debtRate={fooConfig.debtRate}
            isUs={fooConfig.isUs}
            hdhpStatus={fooConfig.hdhpStatus}
            isCanadian={fooConfig.isCanadian}
            tfsaStatus={fooConfig.tfsaStatus}
            tfsaYear={fooConfig.tfsaYear}
            has529={fooConfig.has529}
            taxSequence={[]}
            monthlySavings={monthlyContrib}
            etfs={etfs}
            annualIncome={userInputs?.annualIncome ?? 0}
            onCustomize={() => setIsFooModalOpen(true)}
          />
        </section>

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        {/* ══ 3. Execution & Strategy (Bottom Grid) ══ */}
        <div className="space-y-12">
          {/* Left Column: Funds to Buy */}
          <section>
            <SectionHeader badge="Your Investment Engine" title="The Exact Funds to Buy" />
            <p className="text-sm text-[#5c5c5c] leading-relaxed mb-6 mt-6">
              Based on your residency, these are the specific, low-cost index funds that will build your wealth. You do not need anything else.
            </p>
            <div className="grid gap-4">
              {etfs.map(etf => <EtfCard key={etf.ticker} {...etf} />)}
            </div>
          </section>

          {/* Right Column: Advanced Tactics & Rules */}
          <div className="space-y-12">
            <section>
              <SectionHeader badge="Advanced Tactics" title="Tax Hacks & Drawdown" />
              <div className="mt-6">
                <ArmoryTab country={userInputs?.country ?? 'us'} />
              </div>
            </section>

            <section>
              <SectionHeader badge="The Mindset" title="The Rules of Wealth" />
              <div className="mt-6">
                <MindsetTab annualIncome={userInputs?.annualIncome ?? 0} />
              </div>
            </section>
          </div>
        </div>

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        {/* ══ SECTION 2: FEE COMPARISON ══ */}
        <section>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ef4444] border border-[#ef4444]/30 rounded-full mb-3">
            The Fee Reveal
          </div>
          <h2 className="text-xl lg:text-3xl font-black mb-3 tracking-tight text-[#1a1a1a]">
            {sentimentData.title}
          </h2>
          <p className="text-sm text-[#5c5c5c] mb-6 leading-relaxed">
            {sentimentData.desc}
          </p>

          {/* Big number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-xl p-4 text-center mb-6 bg-[#1a1a1a] text-white shadow-lg"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2">
              Extra fees paid to a financial advisor over {feeYears} years
            </p>
            <div className="text-4xl lg:text-6xl font-black mb-3 text-[#ef4444] tracking-tighter">
              <AnimatedNumber value={feeLost} />
            </div>
            <p className="text-xs font-medium text-[#9ca3af]">
              That&apos;s roughly{' '}
              <strong className="text-white text-sm">{extraYears} extra years</strong>{' '}
              of saving just to cover the advisor&apos;s cut.
            </p>
          </motion.div>

          {/* Chart */}
          <div className="rounded-xl p-4 md:p-6 bg-white border-2 border-[#e4e1d9] mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#1a1a1a]">Portfolio growth</h3>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[#5c5c5c]">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-1 inline-block rounded bg-[#16a34a]" />
                  Index fund (0.05%)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-1 inline-block rounded border-dashed border border-[#ef4444] bg-transparent" />
                  Advisor (1.5%)
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e1d9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9a9a9a', fontWeight: 'bold' }}
                  tickLine={false} axisLine={false} tickFormatter={(v) => `Yr ${v}`} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: '#9a9a9a', fontWeight: 'bold' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={55} dx={-10} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Index Fund (0.05%)"
                  stroke="#16a34a" strokeWidth={3} fill="url(#greenFill)" dot={false} />
                <Area type="monotone" dataKey="With Advisor Fee (1.5%)"
                  stroke="#ef4444" strokeWidth={2} fill="url(#redFill)"
                  dot={false} strokeDasharray="6 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Final balances */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4 border-2 border-[#16a34a] bg-[#f0fdf4]">
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1 text-[#16a34a]">
                With index fund (0.05% fee)
              </div>
              <div className="text-xl lg:text-2xl font-black text-[#16a34a] tracking-tight">
                {formatCurrency(feeComparison?.finalBalanceIndex ?? 0, true)}
              </div>
              <div className="text-[10px] font-bold mt-1 text-[#16a34a] opacity-70 uppercase tracking-widest">after {feeYears} years</div>
            </div>
            <div className="rounded-xl p-4 border-2 border-[#ef4444] bg-[#fef2f2]">
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1 text-[#ef4444]">
                With financial advisor (1.5% fee)
              </div>
              <div className="text-xl lg:text-2xl font-black text-[#ef4444] tracking-tight">
                {formatCurrency(feeComparison?.finalBalanceAUM ?? 0, true)}
              </div>
              <div className="text-[10px] font-bold mt-1 text-[#ef4444] opacity-70 uppercase tracking-widest">after {feeYears} years</div>
            </div>
          </div>

          {/* Explainer note */}
          <div className="rounded-xl p-4 mb-6 bg-[#fffbeb] border-2 border-[#fde68a]">
            <p className="text-[11px] leading-relaxed text-[#78350f] font-medium">
              <strong className="font-black">Why does 1.45% matter so much?</strong> Because the fee is charged on your entire balance every year — not just your gains. As your balance grows, so does the dollar amount of the fee. And every dollar paid in fees is a dollar that can no longer compound for you. It&apos;s a quiet, continuous drain that most people never notice until they do the math.
            </p>
          </div>

          {/* Time horizon slider for Fee Reveal */}
          <div className="mt-10 bg-white p-4 md:p-6 rounded-xl border-2 border-[#e4e1d9] shadow-sm max-w-2xl mx-auto">
            <h4 className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest mb-3">Chart Controls</h4>
            <SliderRow
              label="Time horizon for fee comparison"
              value={feeYears}
              min={10}
              max={40}
              step={1}
              format={(n) => `${n} years`}
              onChange={setFeeYears}
            />
          </div>
        </section>

        <section className="scroll-mt-12">
          <AdvancedArchitectures />
        </section>

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />
        
        <div className="my-12">
          <AdBanner />
        </div>

        <section className="text-center py-8 mt-4">
          <Link href="/results" className="text-[10px] font-bold uppercase tracking-widest text-[#5c5c5c] hover:text-[#1a1a1a] px-4 py-3 transition-colors">
            ← Back to Strategies
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-widest mt-8 text-[#9a9a9a]">
            Not happy with these numbers? Go back and try a different strategy.
          </p>
        </section>
      </main>

      {/* Right Ad Sidebar (Hidden on smaller screens) */}
      <aside className="hidden xl:flex flex-col w-[200px] 2xl:w-[300px] shrink-0 pt-10">
        <AdSidebar />
      </aside>
    </div>

      <FooCustomizerModal 
        isOpen={isFooModalOpen}
        onClose={() => setIsFooModalOpen(false)}
        initialConfig={fooConfig}
        onSave={setFooConfig}
      />
    </div>
  );
}
