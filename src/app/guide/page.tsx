'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import AdBanner from '@/components/ads/AdBanner';

export default function GuideIntroPage() {
  const router = useRouter();
  const { hydrated, result } = useQuizState();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (hydrated && !result) {
      router.replace('/quiz');
    }
  }, [hydrated, result, router]);

  const handleGenerateGuide = () => {
    setIsProcessing(true);
    // Simulate generation time
    setTimeout(() => {
      router.push('/dashboard/onboarding');
    }, 1500);
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1a1a] font-sans selection:bg-[#4ade80] selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-[#e4e1d9]">
        <Link href="/">
          <img src="/logo.png" className="h-14 object-contain" alt="The FIRE Blueprint" />
        </Link>
        <Link href="/calculate" className="text-xs font-bold text-[#5c5c5c] hover:text-[#1a1a1a] uppercase tracking-widest transition-colors">
          ← Back to Calculator
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#16a34a] border border-[#16a34a]/30 rounded-full mb-6">
            The Blueprint
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight text-[#1a1a1a] leading-tight">
            Stop guessing.<br/>Start executing.
          </h1>
          <p className="text-lg lg:text-xl mb-12 text-[#5c5c5c] leading-relaxed max-w-2xl">
            You have seen the math. You know exactly how much the financial industry is extracting from you. Now, get the step-by-step mathematical blueprint to build your portfolio, automate the inputs, and legally optimize your taxes. Zero cost.
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="space-y-6 mb-16">
          {[
            {
              title: "Module 1: The Mindset",
              desc: "Deprogram the anxiety of starting late. Retirement is not an age. It is a mathematical crossover point where your passive income exceeds your burn rate. That is it.",
            },
            {
              title: "Module 2: The Core Engine",
              desc: "We give you the exact ticker symbols (VTI, VOO, VEQT) that capture total market returns for 0.03% fees. Stop picking single stocks. Stop paying middlemen.",
            },
            {
              title: "Module 3: Tax Architecture",
              desc: "We sequence your exact tax shelters based on your residency. From the HSA triple-tax advantage to TFSA/RRSP optimization. We exploit the tax code legally.",
            },
            {
              title: "Module 4: Dynamic Customization",
              desc: "Your blueprint adapts to your exact inputs and timeline. If you are burnt out, we calculate your Coast FIRE downshift. If your income is low, we provide high-ROI paths to increase it.",
            },
          ].map((mod, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              key={i} 
              className="bg-white rounded-3xl p-6 lg:p-8 border-2 border-[#e4e1d9] shadow-sm flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-black text-xl">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-black mb-2 tracking-tight text-[#1a1a1a]">{mod.title}</h3>
                <p className="text-base text-[#5c5c5c] leading-relaxed">{mod.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Checkout Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#1a1a1a] rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#16a34a] opacity-10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-md text-center md:text-left">
              <h2 className="text-3xl font-black mb-3">The Blueprint</h2>
              <p className="text-sm font-medium text-[#9ca3af] mb-6">
                Dynamically generated from your inputs. 100% free. No BS.
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center gap-4">
              <button
                onClick={handleGenerateGuide}
                disabled={isProcessing}
                className="w-full md:w-80 px-8 py-5 rounded-full text-sm font-black uppercase tracking-widest transition-all bg-[#16a34a] text-white shadow-xl shadow-green-900/40 hover:bg-[#15803d] hover:scale-105 active:scale-95 flex justify-center items-center h-16 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Generate The Blueprint →'
                )}
              </button>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                No credit card required
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-16">
          <AdBanner />
        </div>
      </main>
    </div>
  );
}
