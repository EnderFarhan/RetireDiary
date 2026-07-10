'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, DollarSign, Calculator, Lock, Target, ShieldCheck, CheckCircle2, ChevronDown, Compass, Coffee, Briefcase, Zap, Flame, Plus, Minus } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { compareFees, formatCurrency } from '@/lib/fee-math';
import { generateMonteCarloPaths } from '@/lib/monte-carlo';

// ────────────────────────────────────────────────────────
// HELPER COMPONENTS & ANIMATIONS
// ────────────────────────────────────────────────────────
const NoiseOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-30">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-lg px-4 py-3 text-sm bg-[#1a1a1a] text-white">
      <p className="font-bold mb-1">Year {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, true)}
        </p>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 1. HERO SECTION
// ────────────────────────────────────────────────────────
const Hero = () => {
  return (
    <section className="relative min-h-[60dvh] w-full flex items-center px-6 overflow-hidden bg-white pt-24 md:pt-32 pb-8 md:pb-24">
      <div className="max-w-6xl mx-auto w-full flex flex-col-reverse md:grid md:grid-cols-2 gap-4 md:gap-8 items-center relative z-10">

        {/* Left text column */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left"
        >
          <motion.h1 variants={fadeUp} className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-black text-[#1a1a1a] leading-[1.1] md:leading-[1.05] mb-3 md:mb-5 tracking-tighter">
            The financial industry is stealing <span className="text-[#ef4444]">30%</span> of your wealth. Here is the math to stop them.
          </motion.h1>

          <motion.h2 variants={fadeUp} className="text-sm md:text-xl italic font-light text-[#5c5c5c] mb-3 md:mb-5" style={{ fontFamily: 'Georgia, serif' }}>
            Retirement isn't an age. It's an equation.
          </motion.h2>

          <motion.p variants={fadeUp} className="text-xs md:text-lg text-[#5c5c5c] mb-5 md:mb-8 max-w-lg leading-relaxed">
            You trade 40 hours a week for money. Then you pay a guy in a suit 1.5% a year to underperform the market. It is a terrible trade. We are going to fix the equation and buy back your time.
          </motion.p>

          <motion.div variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              href="/quiz"
              className="group relative inline-flex items-center gap-2 md:gap-3 bg-[#16a34a] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base overflow-hidden shadow-lg shadow-green-900/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get The Free Blueprint <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right organic 3D shape (Video) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-full max-w-[180px] md:max-w-[550px] aspect-square mx-auto flex items-center justify-center pointer-events-none overflow-hidden mb-1 md:mb-0"
          style={{
            WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 80%)',
            maskImage: 'radial-gradient(circle at center, black 50%, transparent 80%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#16a34a]/10 to-white/0 blur-3xl rounded-full" />
          <video
            src="/ezgif.com-crop-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              filter: 'contrast(1.2) brightness(1.05)'
            }}
            className="w-full h-full object-contain absolute z-10 scale-[0.95] mix-blend-multiply"
          />
        </motion.div>
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────────────
// 2. CREDIBILITY & SOCIAL PROOF
// ────────────────────────────────────────────────────────
const CREDIBILITY_STATS = [
  { value: "90%+", label: "Pros who fail to beat the market" },
  { value: "4%", label: "The rule to never run out of money" },
  { value: "0.05%", label: "The maximum fee you should pay" },
  { value: "25x", label: "Multiplier to buy back your freedom" },
  { value: "0 BS", label: "No confusing finance jargon" },
  { value: "$1M+", label: "Lost to a 'small' 1.5% advisor fee" },
];

const Credibility = () => {
  return (
    <section className="py-8 bg-white border-y border-[#e4e1d9] overflow-hidden flex">
      <motion.div
        className="flex whitespace-nowrap items-center w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
      >
        {[...CREDIBILITY_STATS, ...CREDIBILITY_STATS].map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center shrink-0 mx-8 md:mx-16">
            <div className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-[#5c5c5c] font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

// ────────────────────────────────────────────────────────
// 2.5. THE REALITY HOOK (Monte Carlo Simulation)
// ────────────────────────────────────────────────────────
const MonteCarloHook = () => {
  const [hasRun, setHasRun] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [chartData, setChartData] = useState<any[]>(() => {
    // Generate initial mock data so the chart isn't empty
    const paths = generateMonteCarloPaths(0, 12000, 0.07, 0.15, 100, 30);
    const finalBalances = paths.map((p, i) => ({ balance: p[p.length - 1], index: i }));
    finalBalances.sort((a, b) => a.balance - b.balance);
    const p10Path = paths[finalBalances[Math.floor(finalBalances.length * 0.1)].index];
    const p50Path = paths[finalBalances[Math.floor(finalBalances.length * 0.5)].index];
    const p90Path = paths[finalBalances[Math.floor(finalBalances.length * 0.9)].index];
    const initialData: any[] = [];
    for (let y = 0; y <= 30; y++) {
      initialData.push({ year: y, Lucky: p90Path[y], Average: p50Path[y], Unlucky: p10Path[y] });
    }
    return initialData;
  });

  const runSimulation = () => {
    setIsSimulating(true);
    // Simulate 100 paths for 30 years
    const paths = generateMonteCarloPaths(0, 12000, 0.07, 0.15, 100, 30);
    
    // Transform into Recharts format, picking only 3 paths to visualize clearly
    // (a 90th percentile, 50th percentile, and 10th percentile path)
    const finalBalances = paths.map((p, i) => ({ balance: p[p.length - 1], index: i }));
    finalBalances.sort((a, b) => a.balance - b.balance);
    
    const p10Path = paths[finalBalances[Math.floor(finalBalances.length * 0.1)].index];
    const p50Path = paths[finalBalances[Math.floor(finalBalances.length * 0.5)].index];
    const p90Path = paths[finalBalances[Math.floor(finalBalances.length * 0.9)].index];

    const newChartData: any[] = [];
    for (let y = 0; y <= 30; y++) {
      newChartData.push({
        year: y,
        Lucky: p90Path[y],
        Average: p50Path[y],
        Unlucky: p10Path[y],
      });
    }

    // Animate data entering
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setChartData(newChartData.slice(0, step));
      if (step > 30) {
        clearInterval(interval);
        setHasRun(true);
        setIsSimulating(false);
      }
    }, 30);
  };

  return (
    <section className="py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid lg:grid-cols-2 gap-10 items-center bg-[#f0fdf4] rounded-[2rem] p-8 md:p-12 border border-[#bbf7d0]"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1a] tracking-tight mb-4">
            The Math of the Stock Market.
          </h2>
          <p className="text-base text-[#5c5c5c] leading-relaxed mb-6">
            Average returns are a lie. The market is volatile. Our calculator runs 500 <strong>Monte Carlo simulations</strong> to show you the exact probability of success if you retire into a crash vs a boom. We deal in reality, not averages. 
          </p>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={`group inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-md ${
              hasRun 
                ? 'bg-white text-[#16a34a] border border-[#16a34a] hover:bg-[#f0fdf4]' 
                : 'bg-[#16a34a] text-white hover:bg-[#15803d]'
            }`}
          >
            {hasRun ? 'Re-run Simulation' : 'Run Market Simulation'} 
            <Zap size={16} className={isSimulating ? 'animate-pulse' : ''} />
          </button>
        </div>

        <div className="h-[300px] w-full bg-white rounded-xl p-4 shadow-sm border border-[#e4e1d9] relative">
          {!hasRun && !isSimulating && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] z-10 rounded-xl cursor-pointer"
              onClick={runSimulation}
            >
              <span className="text-sm font-bold text-[#1a1a1a] bg-white px-4 py-2 rounded-full shadow-sm border border-[#e4e1d9]">Click to run live simulation</span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e1d9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `Yr ${v}`} />
              <YAxis tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `$${(v / 1000).toFixed(0)}k`} width={45} />
              <Line type="monotone" dataKey="Lucky" stroke="#4ade80" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Average" stroke="#16a34a" strokeWidth={3} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Unlucky" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </section>
  );
};

// ────────────────────────────────────────────────────────
// 3. THE CURIOSITY HOOK (The Math of FIRE)
// ────────────────────────────────────────────────────────
const CuriosityHook = () => {
  return (
    <section id="math" className="py-10 md:py-12 px-6 bg-[#1a1a1a] text-white rounded-[2rem] mx-4 md:mx-auto max-w-5xl my-10 overflow-hidden relative">
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-3 tracking-tight leading-tight text-white">
            Wealth is a definitive formula.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white text-base mb-6 leading-relaxed">
            Forget turning 65. The traditional timeline is a scam designed to keep you working and paying fees. When you strip away the BS, buying back your time comes down to one indisputable law of math: the 4% rule.
          </motion.p>
          <motion.div variants={fadeUp} className="bg-[#2a2a2a] p-5 rounded-2xl border border-[#333] mb-6 relative">
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#16a34a] rounded-full flex items-center justify-center shadow-lg">
              <Calculator size={18} className="text-white" />
            </div>
            <div className="font-mono text-xl md:text-2xl font-bold text-center text-[#4ade80] mb-2 tracking-widest">
              YOUR SAVINGS RATE = YOUR TIMELINE
            </div>
            <p className="text-xs text-center text-[#9a9a9a]">
              (It's not about how much you make. It's about what you keep.)
            </p>
          </motion.div>
          <motion.ul variants={staggerContainer} className="space-y-3 text-sm">
            <motion.li variants={fadeUp} className="flex items-start gap-3">
              <Target className="text-[#4ade80] shrink-0 mt-0.5" size={16} />
              <p className="text-[#d1d5db]"><strong>Step 1:</strong> Calculate your exact annual expenses.</p>
            </motion.li>
            <motion.li variants={fadeUp} className="flex items-start gap-3">
              <DollarSign className="text-[#4ade80] shrink-0 mt-0.5" size={16} />
              <p className="text-[#d1d5db]"><strong>Step 2:</strong> Build a portfolio that generates enough to cover them.</p>
            </motion.li>
            <motion.li variants={fadeUp} className="flex items-start gap-3">
              <Lock className="text-[#4ade80] shrink-0 mt-0.5" size={16} />
              <p className="text-[#d1d5db]"><strong>Step 3:</strong> Keep fees near zero so compounding works for YOU, not the financial industry.</p>
            </motion.li>
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="bg-white p-8 rounded-[1.5rem] border border-[#e4e1d9] shadow-xl text-[#1a1a1a]">
            <h3 className="text-xl font-black mb-2">No more finance jargon.</h3>
            <p className="text-[#5c5c5c] mb-6 text-sm">We don't use words designed to mask the truth.</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-[#ef4444] line-through font-medium">Asset Allocation</span>
                <span className="text-xs font-bold text-[#16a34a]">Where to park your cash</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-[#ef4444] line-through font-medium">Equities & Fixed Income</span>
                <span className="text-xs font-bold text-[#16a34a]">Stocks and Bonds</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-[#ef4444] line-through font-medium">AUM Fee</span>
                <span className="text-xs font-bold text-[#16a34a]">Hidden Portfolio Tax</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────────────
// 4. THE CORRUPTION HOOK (Static Data Viz)
// ────────────────────────────────────────────────────────
const CorruptionHook = () => {
  // Hardcoded scenario: $0 current savings, $1,000/month, 7% return, 30 years
  const feeComparison = useMemo(() => {
    return compareFees({
      currentSavings: 0,
      monthlyContribution: 1000,
      annualMarketReturn: 0.07,
      years: 30,
      aumFeeRate: 0.015,
      indexFeeRate: 0.0005,
    });
  }, []);

  const chartData = useMemo(() => {
    return feeComparison.indexPath.map((snap, i) => ({
      year: snap.year,
      'Index Fund (0.05%)': snap.balance,
      'With Advisor Fee (1.5%)': feeComparison.aumPath[i]?.balance ?? 0,
    }));
  }, [feeComparison]);

  const feeLost = feeComparison.feeDifferenceLost;

  return (
    <section id="lie" className="py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1a] tracking-tight mb-4">
          The 1.5% Wealth Tax.
        </h2>
        <p className="text-base text-[#5c5c5c] max-w-3xl mx-auto leading-relaxed">
          Financial advisors charge a 1.5% fee. It sounds small, but it's a tax on your entire net worth every single year. Over 20 years, they statistically underperform a basic index fund. You are paying them a premium to lose your money.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[2rem] border border-[#e4e1d9] shadow-sm"
        >
          <div className="mb-6 flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-[#ef4444] uppercase tracking-wider mb-1">Example: Wealth Siphoned by 1.5% Fee</p>
              <div className="text-4xl font-black text-[#ef4444] tracking-tighter">
                {formatCurrency(feeLost, true)}
              </div>
              <p className="text-xs text-[#5c5c5c] mt-1">
                Based on investing $1,000/month for 30 years.
              </p>
            </div>
            <div className="hidden sm:block text-right text-xs text-[#9a9a9a]">
              <div className="flex items-center gap-1 justify-end"><span className="w-2 h-2 rounded bg-[#16a34a]"></span> 0.05% Index Fund</div>
              <div className="flex items-center gap-1 justify-end mt-1"><span className="w-2 h-2 rounded bg-[#ef4444]"></span> 1.5% Advisor Fee</div>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} tickFormatter={(v) => `Yr ${v}`} />
                <YAxis tick={{ fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Index Fund (0.05%)" stroke="#16a34a" strokeWidth={2.5} fill="url(#greenFill)" dot={false} />
                <Area type="monotone" dataKey="With Advisor Fee (1.5%)" stroke="#ef4444" strokeWidth={2} fill="url(#redFill)" dot={false} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="lg:col-span-4 space-y-6"
        >
          <motion.div variants={fadeUp} className="bg-white p-6 rounded-[1.5rem] border border-[#e4e1d9] shadow-sm">
            <h3 className="font-black text-lg text-[#1a1a1a] mb-2">That was just an example.</h3>
            <p className="text-[#5c5c5c] text-sm mb-4 leading-relaxed">
              The math is universal, but the inputs are yours. To see exactly how much cash the finance industry is siphoning from your accounts, you need to plug in your own numbers.
            </p>
            <Link
              href="/quiz"
              className="group w-full inline-flex justify-center items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors hover:bg-[#333]"
            >
              Calculate Your Math <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded-xl text-[#16a34a] text-sm">
            <ShieldCheck size={20} className="shrink-0 mt-0.5" />
            <p>Our quiz takes less than 2 minutes and requires zero financial knowledge.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────────────
// 4.5. THE STRATEGIES (Different Paths to FIRE)
// ────────────────────────────────────────────────────────
const FIRE_STRATEGIES = [
  {
    id: 'lean',
    title: 'Lean FIRE',
    icon: <Compass className="text-[#16a34a]" size={24} />,
    hook: 'Minimize inputs. Exit the rat race in record time.',
    detail: 'Lean FIRE focuses on drastically reducing your expenses. Lower inputs (expenses) mean a lower target (Escape Number). It is the fastest mathematical route out of the 9-to-5, trading luxury for immediate time wealth.'
  },
  {
    id: 'traditional',
    title: 'Traditional FIRE',
    icon: <Flame className="text-[#16a34a]" size={24} />,
    hook: 'Replace your income. Zero work required.',
    detail: 'The baseline approach. You aim to replace your current income through investments. It requires disciplined saving (often 50%+ of your income) and low-cost index funds to build a portfolio large enough that the 4% rule covers your living expenses indefinitely.'
  },
  {
    id: 'fat',
    title: 'Fat FIRE',
    icon: <Zap className="text-[#16a34a]" size={24} />,
    hook: 'Maximum leverage. Abundant lifestyle.',
    detail: 'Fat FIRE is for high-earners who refuse to compromise on luxury. It requires a much larger portfolio (typically $2.5M+), meaning it takes longer to reach, but provides maximum financial leverage and options once achieved.'
  },
  {
    id: 'coast',
    title: 'Coast FIRE',
    icon: <Briefcase className="text-[#16a34a]" size={24} />,
    hook: 'Front-load the inputs. Let compound interest do the heavy lifting.',
    detail: 'You aggressively save early in your career until your portfolio is large enough that it will naturally compound to your retirement goal. Once you hit Coast, you downshift to a lower-stress job just to cover your baseline expenses.'
  },
  {
    id: 'barista',
    title: 'Barista FIRE',
    icon: <Coffee className="text-[#16a34a]" size={24} />,
    hook: 'Downshift. Cover the baseline, eliminate the stress.',
    detail: 'Instead of waiting for 100% coverage, you retire from your high-stress career early. Your investments cover part of your living expenses, and you work a fun, low-stress part-time job to cover the rest and secure health insurance.'
  }
];

const StrategyCard = ({ strategy, index }: { strategy: any, index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-5 rounded-2xl border border-[#e4e1d9] shadow-sm flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#f0fdf4] shrink-0 flex items-center justify-center border border-[#bbf7d0]">
          {React.cloneElement(strategy.icon, { size: 20 })}
        </div>
        <h3 className="text-lg font-black text-[#1a1a1a]">{strategy.title}</h3>
      </div>
      <p className="text-[#5c5c5c] text-[13px] font-medium leading-relaxed mb-4 flex-1">
        {strategy.hook}
      </p>
      
      <div className="mt-auto">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[11px] font-bold text-[#16a34a] hover:text-[#15803d] transition-colors uppercase tracking-wider"
        >
          {isExpanded ? 'Show Less' : 'Learn More'} <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[#5c5c5c] text-[13px] leading-relaxed pb-2 border-t border-gray-100 pt-3">
                {strategy.detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const StrategiesSection = () => {
  return (
    <section id="strategies" className="scroll-mt-24 py-8 md:py-10 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight mb-3">
          Choose your vehicle.
        </h2>
        <p className="text-sm md:text-base text-[#5c5c5c] max-w-2xl mx-auto leading-relaxed">
          Financial independence is about leverage and options. You don't have to live in a van. Pick the math that buys the lifestyle you actually want.
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FIRE_STRATEGIES.map((strategy, i) => (
          <StrategyCard key={strategy.id} strategy={strategy} index={i} />
        ))}

        {/* 6th Card - Assessment Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1a1a] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center h-full border border-[#333]"
        >
          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] shrink-0 flex items-center justify-center border border-[#444] mb-3">
            <Target className="text-[#4ade80]" size={20} />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Which path is yours?</h3>
          <p className="text-white/70 text-[13px] font-medium leading-relaxed">
            Stop guessing. Take the 2-minute assessment below to calculate the exact strategy that fits your inputs and lifestyle goals.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────────────
// 4.6. THE FAQ (Addressing Beginner Doubts)
// ────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How do I know what my 'Escape Number' is?",
    a: "It's simpler than the financial industry wants you to believe. Take your expected annual living expenses in retirement and multiply that number by 25. For example, if you need $60,000 a year to live comfortably, your Escape Number is $1,500,000. Once you hit that number, the '4% Rule' states you can safely withdraw enough to live on forever without depleting the principal."
  },
  {
    q: "What if the stock market crashes right after I retire?",
    a: "The mathematical models (like the Trinity Study) that prove the 4% safe withdrawal rate already account for severe market crashes, including the Great Depression and the 2008 financial crisis. You don't need the market to go up every year, you just need it to grow at an average of 7% over the long haul."
  },
  {
    q: "Do I have to eat rice and beans to pull this off?",
    a: "Not at all. That's the 'Lean FIRE' approach. Many people prefer 'Fat FIRE' (retiring with a luxury budget) or 'Coast FIRE' (front-loading investments so you can downshift to an easy, fun job while your money compounds in the background). You build the math around your ideal lifestyle, not the other way around."
  },
  {
    q: "Isn't investing by myself too risky without an advisor?",
    a: "Data proves the exact opposite. Over a 20-year timeline, more than 90% of highly paid, professional financial advisors fail to beat the performance of a simple, unmanaged S&P 500 Index Fund. By buying a low-cost index fund yourself, you are virtually guaranteed to outperform most professionals, all while saving hundreds of thousands of dollars in hidden fees."
  }
];

const FAQItem = ({ faq, index }: { faq: any, index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-[#e4e1d9]"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left"
      >
        <h4 className="text-base md:text-lg font-bold text-[#1a1a1a] pr-8">{faq.q}</h4>
        <div className="shrink-0 text-[#16a34a]">
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[#5c5c5c] text-sm md:text-base leading-relaxed pb-6 pr-4">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQSection = () => {
  return (
    <section id="faq" className="scroll-mt-28 pt-4 pb-8 md:pt-8 md:pb-10 px-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1a] tracking-tight mb-4">
          Common Questions.
        </h2>
        <p className="text-base text-[#5c5c5c] leading-relaxed">
          The math works. The only thing stopping you is the lies you've been sold.
        </p>
      </motion.div>

      <div className="bg-white rounded-[2rem] border border-[#e4e1d9] p-6 md:p-10 shadow-sm">
        {FAQS.map((faq, i) => (
          <FAQItem key={i} faq={faq} index={i} />
        ))}
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────────────
// 5. THE PITCH (Checkout Conversion CTA)
// ────────────────────────────────────────────────────────
const ThePitch = () => (
  <section id="blueprint" className="scroll-mt-28 pt-8 pb-16 md:pt-10 md:pb-20 px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-[2.5rem] border border-[#e4e1d9] shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-[#16a34a]" />

      <h2 className="text-3xl md:text-4xl font-black text-[#1a1a1a] mb-4 tracking-tight leading-tight">
        Get the blueprint. <br /> Zero cost.
      </h2>

      <p className="text-base text-[#5c5c5c] mb-8 max-w-xl mx-auto leading-relaxed">
        Stop guessing. Stop paying middlemen. Plug in your numbers to generate your exact mathematical blueprint and see your timeline. <strong>100% free. No BS.</strong>
      </p>

      <Link
        href="/quiz"
        className="group relative inline-flex items-center gap-3 bg-[#1a1a1a] text-white px-10 py-5 rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-xl"
      >
        <span className="relative z-10 flex items-center gap-2">
          Generate Your Blueprint <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </span>
        <span className="absolute inset-0 bg-[#333] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
      </Link>

      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[#9a9a9a] font-medium">
        <CheckCircle2 size={14} className="text-[#16a34a]" /> Takes 2 minutes
        <span className="mx-2">•</span>
        <CheckCircle2 size={14} className="text-[#16a34a]" /> No finance degree required
      </div>
    </motion.div>
  </section>
);

// ────────────────────────────────────────────────────────
// MAIN PAGE EXPORT
// ────────────────────────────────────────────────────────
export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-white text-[#1a1a1a] selection:bg-[#4ade80] selection:text-white">
      <NoiseOverlay />

      {/* Parallax background elements */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div style={{ y }} className="relative w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#16a34a]/5 rounded-full blur-[100px]" />
          <div className="absolute top-3/4 right-1/4 w-[600px] h-[600px] bg-[#ef4444]/5 rounded-full blur-[120px]" />
        </motion.div>
      </div>

      {/* Animated Glassmorphic Pill Nav */}
      <motion.nav
        initial={{ y: -100, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="fixed top-6 left-1/2 w-[90%] max-w-5xl z-50 px-3 md:px-6 py-2.5 md:py-3 flex justify-between items-center bg-white/70 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60"
      >
        <div className="flex items-center h-full shrink-0 pl-2 md:pl-4 py-1">
          <img src="/logo.png" alt="RetireDiary" className="h-8 md:h-10 scale-[1.2] md:scale-[1.35] object-contain mix-blend-multiply origin-left" />
        </div>
        <div className="hidden md:flex items-center gap-6 lg:gap-10 text-[10px] font-bold tracking-widest text-[#5c5c5c] uppercase">
          <Link href="#math" className="hover:text-[#1a1a1a] transition-colors relative group">
            The Math
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#16a34a] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="#lie" className="hover:text-[#1a1a1a] transition-colors relative group">
            The Lie
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#16a34a] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="#strategies" className="hover:text-[#1a1a1a] transition-colors relative group">
            Strategies
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#16a34a] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="#faq" className="hover:text-[#1a1a1a] transition-colors relative group">
            FAQ
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#16a34a] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="#blueprint" className="hover:text-[#1a1a1a] transition-colors relative group">
            Blueprint
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#16a34a] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
        <Link href="/quiz" className="shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-[#16a34a] text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-[#15803d] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-900/20">
          Calculate
        </Link>
      </motion.nav>

      <main className="flex-1">
        <Hero />
        <Credibility />
        <CuriosityHook />
        <CorruptionHook />
        <MonteCarloHook />
        <StrategiesSection />
        <FAQSection />
        <ThePitch />
      </main>

      <footer className="bg-[#1a1a1a] text-white rounded-t-[3rem] px-8 py-12 text-center mt-auto">
        <p className="text-xs text-[#9a9a9a] max-w-xl mx-auto mb-4">
          A bespoke, mathematically rigorous approach to reclaiming your time and opting out of the corporate narrative.
        </p>
        <p className="text-[10px] text-[#5c5c5c]">
          © {new Date().getFullYear()} RetireDiary. All rights reserved. Not financial advice. We're just the protective friend at the bar showing you the math.
        </p>
      </footer>
    </div>
  );
}
