'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useQuizState } from '@/hooks/useQuizState';
import { STRATEGY_MAP } from '@/data/strategies';
import { calculateFIRE, yearsToFIREWithContribution, futureValue } from '@/lib/fire-engine';
import { compareFees, formatCurrency } from '@/lib/fee-math';
import { simulateAccumulation, generateMonteCarloPaths } from '@/lib/monte-carlo';

import { AnimatedNumber } from '@/components/dashboard/AnimatedNumber';
import { ChartTooltip } from '@/components/dashboard/ChartTooltip';
import { Section } from '@/components/dashboard/Section';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { StepCard } from '@/components/dashboard/StepCard';
import { EtfCard } from '@/components/dashboard/EtfCard';
import { MissionsTab } from '@/components/dashboard/MissionsTab';
import { ArmoryTab } from '@/components/dashboard/ArmoryTab';
import AdBanner from '@/components/ads/AdBanner';

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const { hydrated, answers, result, selectedStrategy, fireResult } = useQuizState();
  const [suppData, setSuppData] = useState<{ suppAnswers: Record<string, string>; customInputs: Record<string, string> } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [customSavings, setCustomSavings] = useState<number | null>(null);

  const loadingSteps = [
    'Analyzing your financial matrix...',
    'Simulating 500 market scenarios...',
    'Sequencing your tax strategy...',
    'Compiling your blueprint...',
  ];

  useEffect(() => {
    if (!hydrated) return;
    if (!answers['income']) { router.replace('/quiz'); return; }
    if (!selectedStrategy) { router.replace('/results'); return; }

    const storedSupp = localStorage.getItem('fire_supp_answers');
    if (!storedSupp) { router.replace('/dashboard/onboarding'); return; }
    setSuppData(JSON.parse(storedSupp));

    // Simulate loading steps for UX (genuine calculations happen instantly in JS)
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingStep(step);
      if (step >= loadingSteps.length - 1) {
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 600);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const strategy = selectedStrategy ? STRATEGY_MAP[selectedStrategy] : null;
  const userInputs = result?.userInputs;

  /* ── Derived supplementary data ── */
  const suppAnswers = suppData?.suppAnswers ?? {};
  const customInputs = suppData?.customInputs ?? {};
  const country = answers['country'] ?? 'us';
  const isUs = country === 'us';
  const isCanadian = country === 'canada';
  const hasEmployerMatch = suppAnswers['employer_match'] === 'yes_match';
  const matchPct = customInputs['employer_match'] ? `${customInputs['employer_match']}%` : '100%';
  const debtStatus = suppAnswers['highest_debt_rate'];
  const debtRate = customInputs['highest_debt_rate'] ? `${customInputs['highest_debt_rate']}%` : '';
  const hdhpStatus = suppAnswers['hdhp_eligibility'];
  const tfsaStatus = suppAnswers['tfsa_status'];
  const tfsaYear = customInputs['tfsa_status'];
  const has529 = suppAnswers['stranded_529'] === 'yes_529';
  const isSelfEmployed = suppAnswers['employer_match'] === 'self_employed';

  /* ── FIRE Calculations ── */
  const fire = useMemo(() => {
    if (!userInputs || !selectedStrategy) return null;
    return calculateFIRE({
      annualSpending: userInputs.annualSpending,
      annualIncome: userInputs.annualIncome,
      currentSavings: userInputs.currentSavings,
      age: userInputs.age,
      strategy: selectedStrategy,
      returnRate: 0.07,
      retirementAge: userInputs.targetRetirementAge ?? 65,
      numberOfChildren: userInputs.numberOfChildren ?? 0,
      country: userInputs.country,
      swr: 0.04,
      leanBudget: userInputs.leanBudget,
      fatBudget: userInputs.fatBudget,
      partTimeIncome: userInputs.partTimeIncome,
      traditionalAge: userInputs.traditionalAge,
    });
  }, [userInputs, selectedStrategy]);

  const realisticMonthlySavings = userInputs ? Math.max(0, (userInputs.annualIncome - userInputs.annualSpending) / 12) : 0;
  const standard20PctSavings = userInputs ? Math.round((userInputs.annualIncome * 0.20) / 12) : 0;
  const target = fire?.coastNumber ?? fire?.fireNumber ?? 0;
  const monthlySavings = customSavings !== null ? customSavings : (fire?.monthlySavingsNeeded ?? 0);
  const yearsToFire = userInputs && monthlySavings > 0 ? yearsToFIREWithContribution(target, userInputs.currentSavings, monthlySavings * 12, 0.07) : 99;
  const retirementAge = (userInputs?.age ?? 30) + yearsToFire;

  /* ── Monte Carlo ── */
  const monteCarlo = useMemo(() => {
    if (!fire || !userInputs) return null;
    return simulateAccumulation(userInputs.currentSavings, monthlySavings * 12, target, 0.07);
  }, [fire, userInputs, monthlySavings, target]);

  const mcPaths = useMemo(() => {
    if (!fire || !userInputs) return [];
    return generateMonteCarloPaths(
      userInputs.currentSavings,
      monthlySavings * 12,
      0.07,
      0.15,
      50,
      Math.max(yearsToFire + 5, 30)
    );
  }, [fire, userInputs, monthlySavings, yearsToFire]);

  /* ── Fee comparison ── */
  const feeComparison = useMemo(() => {
    if (!userInputs) return null;
    return compareFees({
      currentSavings: userInputs.currentSavings,
      monthlyContribution: monthlySavings,
      annualMarketReturn: 0.07,
      years: yearsToFire || 30,
    });
  }, [userInputs, monthlySavings, yearsToFire]);

  const feeChartData = useMemo(() => {
    if (!feeComparison) return [];
    return feeComparison.indexPath.map((snap, i) => ({
      year: snap.year,
      'Index Fund (0.05%)': snap.balance,
      'Advisor Fee (1.5%)': feeComparison.aumPath[i]?.balance ?? 0,
    }));
  }, [feeComparison]);

  /* ── Monte Carlo fan chart data ── */
  const fanChartData = useMemo(() => {
    if (!mcPaths.length) return [];
    const len = mcPaths[0].length;
    return Array.from({ length: len }, (_, yi) => {
      const yearBalances = mcPaths.map(p => p[yi]).sort((a, b) => a - b);
      const p10 = yearBalances[Math.floor(yearBalances.length * 0.1)];
      const p50 = yearBalances[Math.floor(yearBalances.length * 0.5)];
      const p90 = yearBalances[Math.floor(yearBalances.length * 0.9)];
      return { year: yi, p10, p50, p90 };
    });
  }, [mcPaths]);

  /* ── Milestones ── */
  const milestones = useMemo(() => {
    if (!userInputs || !fire) return [];
    const steps: { year: number; age: number; label: string; value: number; isKey: boolean }[] = [];
    const checkpoints = [3, 5, 10, Math.ceil(yearsToFire)].filter((v, i, arr) => arr.indexOf(v) === i && v > 0);
    for (const yr of checkpoints) {
      const val = futureValue(userInputs.currentSavings, monthlySavings, 0.07 / 12, yr * 12);
      const isKey = yr === Math.ceil(yearsToFire);
      steps.push({
        year: yr,
        age: userInputs.age + yr,
        label: isKey ? `🎯 FIRE Target — Age ${userInputs.age + yr}` : `Year ${yr}`,
        value: val,
        isKey,
      });
    }
    return steps;
  }, [userInputs, fire, yearsToFire, monthlySavings]);

  /* ── Tax sequence ── */
  const taxSequence = useMemo(() => {
    const steps: { order: number; name: string; detail: string; highlight: boolean }[] = [];
    let ord = 1;
    if (hasEmployerMatch) {
      steps.push({ order: ord++, name: 'Employer Match', detail: `Contribute at least ${matchPct} to capture the full match`, highlight: true });
    }
    if (debtStatus === 'over_5') {
      steps.push({ order: ord++, name: 'Pay Off High-Interest Debt', detail: `${debtRate} debt — guaranteed ${debtRate} return before investing`, highlight: true });
    }
    if (isUs && (hdhpStatus === 'hdhp_enrolled' || hdhpStatus === 'hdhp_eligible')) {
      steps.push({ order: ord++, name: 'Max HSA', detail: '$4,150/yr (single) or $8,300/yr (family). Triple-tax advantage.', highlight: true });
    }
    if (isCanadian) {
      if (tfsaStatus === 'since_2009') {
        steps.push({ order: ord++, name: 'Max TFSA', detail: 'All gains tax-free forever. $7,000/yr + all unused room since 2009.', highlight: true });
      } else if (tfsaStatus === 'recent_immigrant' && tfsaYear) {
        const room = (2025 - parseInt(tfsaYear)) * 6500;
        steps.push({ order: ord++, name: 'Maximize TFSA (Partial Room)', detail: `~$${room.toLocaleString()} estimated room since ${tfsaYear}. Do not over-contribute.`, highlight: true });
      }
      steps.push({ order: ord++, name: 'RRSP Contributions', detail: 'Deductible contributions reduce taxable income. Reinvest your refund.', highlight: false });
    }
    if (isUs) {
      steps.push({ order: ord++, name: '401(k) / IRA', detail: 'Max pre-tax or Roth contributions. $23,000/yr limit (2024).', highlight: false });
      if (has529) {
        steps.push({ order: ord++, name: 'SECURE 2.0 — 529 → Roth Rollover', detail: 'Roll up to $35,000 of unused 529 into a Roth IRA. No taxes, no penalties.', highlight: true });
      }
    }
    if (debtStatus === 'under_5') {
      steps.push({ order: ord++, name: 'Invest — Debt Stays', detail: `${debtRate} debt is cheaper than market returns. Arbitrage the difference.`, highlight: false });
    }
    steps.push({ order: ord++, name: 'Taxable Brokerage', detail: 'After maxing all sheltered accounts, invest the rest here.', highlight: false });
    return steps;
  }, [suppAnswers, hasEmployerMatch, matchPct, debtStatus, debtRate, isUs, isCanadian, hdhpStatus, tfsaStatus, tfsaYear, has529]);

  /* ── ETF Picks ── */
  const etfs = useMemo(() => {
    if (isUs) return [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', expense: '0.03%', description: 'Captures the entire U.S. stock market in a single ticker — over 3,900 companies. The simplest, broadest bet on the American economy.', isMain: true },
      { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', expense: '0.03%', description: 'The 500 largest U.S. companies. Less small-cap exposure than VTI but nearly identical long-term returns. Both are excellent choices.', isMain: false },
    ];
    if (isCanadian) return [
      { ticker: 'VEQT', name: 'Vanguard All-Equity ETF Portfolio', expense: '0.20%', description: 'A globally diversified, automatically rebalancing ETF holding the entire world\'s stock markets in one Canadian ticker. The simplest path to FIRE for Canadian investors.', isMain: true },
      { ticker: 'XEQT', name: 'iShares Core Equity ETF Portfolio', expense: '0.20%', description: 'BlackRock\'s equivalent of VEQT. Holds global stocks with a slight tilt toward Canadian equities. Both VEQT and XEQT are nearly interchangeable.', isMain: false },
    ];
    return [
      { ticker: 'VWCE', name: 'Vanguard FTSE All-World UCITS ETF', expense: '0.22%', description: 'The globally accepted gold standard for non-US/CA investors. Covers 3,800+ companies across 49 countries. Available on most European and international brokerages.', isMain: true },
      { ticker: 'IWDA', name: 'iShares Core MSCI World UCITS ETF', expense: '0.20%', description: 'Developed-market alternative to VWCE. Slightly lower expense ratio but excludes emerging markets. Widely available internationally.', isMain: false },
    ];
  }, [isUs, isCanadian]);

  /* ── Print handler ── */
  function handlePrint() {
    window.print();
  }

  if (!hydrated) return null;

  /* ── Loading Screen ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-8 text-white font-sans">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-16 h-16 border-4 border-[#333] border-t-[#16a34a] rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center text-xl">🔥</div>
        </div>
        <div className="text-center space-y-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm font-bold uppercase tracking-widest text-[#9ca3af]"
            >
              {loadingSteps[loadingStep]}
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-2 justify-center">
            {loadingSteps.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i <= loadingStep ? 'bg-[#16a34a]' : 'bg-[#333]'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!fire || !strategy || !userInputs) return null;

  const savingsRate = Math.round((monthlySavings * 12 / userInputs.annualIncome) * 100);

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1a1a] font-sans selection:bg-[#4ade80] selection:text-white print:bg-white" id="blueprint">

      {/* ── PRINT HEADER (hidden on screen) ── */}
      <div className="hidden print:block text-center py-8 border-b-2 border-[#1a1a1a] mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5c5c5c]">The FIRE Blueprint</p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Your Personal FIRE Strategy Blueprint</h1>
        <p className="text-sm text-[#5c5c5c] mt-2">{strategy.emoji} {strategy.name} · Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-[#e4e1d9] print:hidden">
        <Link href="/"><img src="/logo.png" className="h-14 object-contain" alt="The FIRE Blueprint" /></Link>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest bg-[#f0fdf4] px-3 py-1.5 rounded-full border border-[#16a34a]/30">
            PRO BLUEPRINT
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#333] transition-colors print:hidden"
          >
            Download PDF ↓
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 lg:py-12 space-y-14">

        {/* ════════════════════════════════════
            SECTION 1: HERO SUMMARY
        ════════════════════════════════════ */}
        <Section>
          <SectionHeader badge="Your Blueprint" title={`${strategy.emoji} Your ${strategy.name} Blueprint`} />
          
          {/* Big dark summary card */}
          <div className="bg-[#1a1a1a] rounded-3xl p-6 lg:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#16a34a] opacity-5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-6">{strategy.tagline}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl p-4 text-center bg-[#16a34a]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">{selectedStrategy === 'coast' ? 'Coast Number' : 'FIRE Number'}</div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tight text-white"><AnimatedNumber value={target} /></div>
                </div>
                <div className="rounded-2xl p-4 text-center bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">Years Away</div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tight text-white">
                    {yearsToFire === 99 ? 'Never' : <><AnimatedNumber value={yearsToFire} prefix="" /><span className="text-2xl"> yrs</span></>}
                  </div>
                </div>
                <div className="rounded-2xl p-4 text-center bg-white/5 border border-white/10 flex flex-col justify-between items-center relative">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">Monthly Investment (Edit)</div>
                    <div className="flex items-center justify-center gap-1 group">
                      <span className="text-2xl lg:text-3xl font-black tracking-tight text-white">$</span>
                      <input 
                        type="number" 
                        value={monthlySavings} 
                        onChange={(e) => setCustomSavings(Number(e.target.value))}
                        className="bg-transparent text-2xl lg:text-3xl font-black tracking-tight text-white w-28 text-left focus:outline-none border-b-2 border-transparent focus:border-[#16a34a] hover:border-white/30 transition-colors"
                      />
                    </div>
                  </div>
                  {standard20PctSavings > 0 && monthlySavings !== standard20PctSavings && (
                    <button 
                      onClick={() => setCustomSavings(standard20PctSavings)}
                      className="mt-3 text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] hover:text-white border border-[#4ade80]/30 hover:bg-[#4ade80]/10 px-2 py-1 rounded transition-colors"
                    >
                      Use standard 20% (${standard20PctSavings})
                    </button>
                  )}
                </div>
                <div className="rounded-2xl p-4 text-center bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">Savings Rate</div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tight text-white"><AnimatedNumber value={savingsRate} prefix="" suffix="%" /></div>
                </div>
              </div>
              <div className="text-sm text-[#9ca3af] leading-relaxed border-t border-white/10 pt-6">
                {fire.summary} <span className="text-[#4ade80]">The math is locked in. Your only job is to automate it and ignore the noise.</span>
                {monteCarlo && !monteCarlo.isUnreachable && (
                  <span className="block mt-2 text-[#9ca3af] text-xs">
                    Monte Carlo simulation: <strong className="text-[#4ade80]">Lucky market → {monteCarlo.p90} yrs</strong> · <strong className="text-white">Average → {monteCarlo.p50} yrs</strong> · <strong className="text-[#ef4444]">Unlucky → {monteCarlo.p10} yrs</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </Section>



        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        {/* ════════════════════════════════════
            SECTION 3: ETF PICKS
        ════════════════════════════════════ */}
        <Section>
          <SectionHeader badge="Your Investment Engine" title="The Exact Funds to Buy" />
          <p className="text-base text-[#5c5c5c] leading-relaxed">
            Based on your residency, these are the specific, low-cost index funds that will build your wealth. You do not need anything else.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {etfs.map(etf => <EtfCard key={etf.ticker} {...etf} />)}
          </div>
          {/* Vs advisor comparison */}
          {feeComparison && (
            <div className="rounded-2xl p-5 border-2 border-[#ef4444] bg-[#fef2f2]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ef4444] mb-1">The alternative — what you're avoiding</p>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-3xl font-black text-[#ef4444] tracking-tight">
                    <AnimatedNumber value={feeComparison.feeDifferenceLost} />
                  </div>
                  <p className="text-sm text-[#ef4444] font-medium">lost to a 1.5% financial advisor over {yearsToFire} years. That's {feeComparison.extraYearsOfWork} extra years of your life.</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">With {etfs[0].ticker}</div>
                  <div className="text-lg font-black text-[#16a34a]">{formatCurrency(feeComparison.finalBalanceIndex, true)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mt-1">With advisor</div>
                  <div className="text-lg font-black text-[#ef4444]">{formatCurrency(feeComparison.finalBalanceAUM, true)}</div>
                </div>
              </div>
            </div>
          )}
        </Section>

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        {/* ════════════════════════════════════
            SECTION 4: FEE IMPACT CHART
        ════════════════════════════════════ */}
        <Section>
          <SectionHeader badge="The Fee Reveal" title="What 1.5% Actually Costs You" color="red" />
          <p className="text-base text-[#5c5c5c] leading-relaxed">
            This is your specific portfolio — your savings, your monthly contributions — compared over your {yearsToFire}-year timeline. The gap is not abstract. It is your money.
          </p>
          <div className="rounded-2xl p-5 md:p-6 bg-white border-2 border-[#e4e1d9] print:border print:border-[#ccc]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#1a1a1a]">Portfolio Growth Over {yearsToFire} Years</h3>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[#5c5c5c]">
                <span className="flex items-center gap-2"><span className="w-3 h-1 inline-block rounded bg-[#16a34a]" />Index fund (0.05%)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-1 inline-block rounded border-dashed border border-[#ef4444] bg-transparent" />Advisor (1.5%)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={feeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="redFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e1d9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9a9a9a', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(v) => `Yr ${v}`} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: '#9a9a9a', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={55} dx={-10} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Index Fund (0.05%)" stroke="#16a34a" strokeWidth={3} fill="url(#greenFill2)" dot={false} />
                <Area type="monotone" dataKey="Advisor Fee (1.5%)" stroke="#ef4444" strokeWidth={2} fill="url(#redFill2)" dot={false} strokeDasharray="6 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        {/* ════════════════════════════════════
            SECTION 5: MONTE CARLO FAN CHART
        ════════════════════════════════════ */}
        <Section>
          <SectionHeader badge="Market Uncertainty" title="500 Possible Futures — You Win Most of Them" />
          <p className="text-base text-[#5c5c5c] leading-relaxed">
            We simulated 500 different market scenarios using historical volatility. Each line is a possible future. The green band shows the range of outcomes.
          </p>
          <div className="rounded-2xl p-5 md:p-6 bg-white border-2 border-[#e4e1d9]">
            <div className="flex gap-6 mb-6 text-[10px] font-bold uppercase tracking-wider text-[#5c5c5c] flex-wrap">
              <span className="flex items-center gap-2"><span className="w-3 h-1 inline-block rounded bg-[#16a34a]" />Lucky (top 10%)</span>
              <span className="flex items-center gap-2"><span className="w-3 h-1 inline-block rounded bg-[#1a1a1a]" />Median (50th)</span>
              <span className="flex items-center gap-2"><span className="w-3 h-1 inline-block rounded bg-[#ef4444]" />Unlucky (bottom 10%)</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={fanChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fanFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e1d9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9a9a9a', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(v) => `Yr ${v}`} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: '#9a9a9a', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={55} dx={-10} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl shadow-xl px-5 py-4 text-sm bg-[#1a1a1a] text-white border border-[#333]">
                      <p className="font-bold mb-2 text-[#e4e1d9]">Year {label}</p>
                      <p className="text-[#16a34a] font-medium">Lucky: {formatCurrency((payload.find((p: any) => p.dataKey === 'p90')?.value as number) ?? 0, true)}</p>
                      <p className="text-white font-medium">Median: {formatCurrency((payload.find((p: any) => p.dataKey === 'p50')?.value as number) ?? 0, true)}</p>
                      <p className="text-[#ef4444] font-medium">Unlucky: {formatCurrency((payload.find((p: any) => p.dataKey === 'p10')?.value as number) ?? 0, true)}</p>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey="p90" stroke="#16a34a" strokeWidth={2} fill="url(#fanFill)" dot={false} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="p50" stroke="#1a1a1a" strokeWidth={3} fill="none" dot={false} />
                <Area type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={2} fill="none" dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            {monteCarlo && !monteCarlo.isUnreachable && (
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Lucky scenario', years: monteCarlo.p90, color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4] border-[#16a34a]/20' },
                  { label: 'Median scenario', years: monteCarlo.p50, color: 'text-[#1a1a1a]', bg: 'bg-[#f5f4f0] border-[#e4e1d9]' },
                  { label: 'Unlucky scenario', years: monteCarlo.p10, color: 'text-[#ef4444]', bg: 'bg-[#fef2f2] border-[#ef4444]/20' },
                ].map(({ label, years, color, bg }) => (
                  <div key={label} className={`rounded-xl border-2 p-3 text-center ${bg}`}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#5c5c5c] mb-1">{label}</div>
                    <div className={`text-2xl font-black ${color}`}>{years} yrs</div>
                    <div className="text-[10px] text-[#9ca3af] font-bold">Age {(userInputs?.age ?? 30) + years}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl p-4 bg-[#fffbeb] border-2 border-[#fde68a]">
            <p className="text-xs text-[#78350f] font-medium leading-relaxed">
              <strong className="font-black">What this means:</strong> Even in the bottom 10% of market outcomes — the "unlucky" scenario where returns consistently underperform — you still reach your FIRE number. Consistency of contributions matters far more than market timing.
            </p>
          </div>
        </Section>

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />



        {/* ════════════════════════════════════
            SECTION 7: MILESTONES
        ════════════════════════════════════ */}
        {milestones.length > 0 && (
          <Section>
            <SectionHeader badge="Your Timeline" title="Portfolio Milestones" />
            <p className="text-base text-[#5c5c5c] leading-relaxed">
              Here is what your portfolio looks like at key checkpoints, assuming {formatCurrency(monthlySavings)}/month in contributions at 7% average returns.
            </p>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[#e4e1d9]" />
              <div className="space-y-4">
                {/* Today */}
                <div className="flex items-center gap-5 pl-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#e4e1d9] border-2 border-white flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-[#9ca3af]" />
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border-2 border-[#e4e1d9] p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Today · Age {userInputs?.age}</div>
                      <div className="text-sm font-black text-[#1a1a1a]">Starting point</div>
                    </div>
                    <div className="text-xl font-black text-[#1a1a1a]">{formatCurrency(userInputs?.currentSavings ?? 0, true)}</div>
                  </div>
                </div>

                {milestones.map((m) => (
                  <div key={m.year} className="flex items-center gap-5 pl-2">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center z-10 ${m.isKey ? 'bg-[#16a34a]' : 'bg-[#1a1a1a]'}`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className={`flex-1 rounded-2xl border-2 p-4 flex items-center justify-between gap-4 flex-wrap ${m.isKey ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e4e1d9] bg-white'}`}>
                      <div>
                        <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${m.isKey ? 'text-[#16a34a]' : 'text-[#9ca3af]'}`}>Year {m.year} · Age {m.age}</div>
                        <div className={`text-sm font-black ${m.isKey ? 'text-[#15803d]' : 'text-[#1a1a1a]'}`}>{m.label}</div>
                      </div>
                      <div className={`text-xl font-black ${m.isKey ? 'text-[#16a34a]' : 'text-[#1a1a1a]'}`}>{formatCurrency(m.value, true)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        <MissionsTab 
          hasEmergencyFund={true}
          hasEmployerMatch={hasEmployerMatch}
          matchPct={matchPct}
          hasDebt={debtStatus === 'over_5' || debtStatus === 'under_5'}
          debtRate={debtStatus === 'over_5' ? 'over 7%' : 'under 7%'}
          isUs={isUs}
          hdhpStatus={hdhpStatus}
          isCanadian={isCanadian}
          tfsaStatus={tfsaStatus}
          tfsaYear={tfsaYear}
          has529={has529}
          taxSequence={taxSequence}
          monthlySavings={monthlySavings}
          etfs={etfs}
          annualIncome={userInputs?.annualIncome ?? 0}
        />

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        <div className="my-12 print:hidden">
          <AdBanner />
        </div>

        <ArmoryTab country={country} />

        <div className="w-24 h-1 bg-[#e4e1d9] mx-auto rounded-full" />

        {/* ════════════════════════════════════
            SECTION 8: FOOTER
        ════════════════════════════════════ */}
        <section className="text-center py-8 print:hidden">
          <h2 className="text-2xl font-black mb-4 tracking-tight">You have everything you need.</h2>
          <p className="text-base text-[#5c5c5c] mb-8 max-w-lg mx-auto leading-relaxed">
            Automate the contributions. Buy the index fund. Ignore the noise. That is the entire strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handlePrint}
              className="px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors shadow-lg"
            >
              Download as PDF ↓
            </button>
            <Link href="/quiz" className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] hover:text-[#1a1a1a] px-6 py-4 transition-colors">
              Start Over ↺
            </Link>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-6 text-[#9ca3af]">
            The FIRE Blueprint · Not financial advice. Do your own research.
          </p>
        </section>

      </main>
    </div>
  );
}
