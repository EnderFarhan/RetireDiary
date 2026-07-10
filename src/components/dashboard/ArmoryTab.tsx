'use client';

import { useState } from 'react';

export function ArmoryTab({ country }: { country: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const template = `Hi [Advisor Name],\n\nI have decided to transition to a self-directed index portfolio. Please do not liquidate my positions, as I will be initiating an in-kind ACATS transfer to [Vanguard/Fidelity/Schwab/Wealthsimple].\n\nI am not looking to discuss this on a call. Please confirm receipt of this email.\n\nBest,\n[Your Name]`;
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">

      {/* ── 1. The Ultimate Tax Arsenal (Country Specific) ── */}
      <div className="bg-[#1a1a1a] rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#16a34a]/10 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-2xl font-black mb-2 text-white">Tax Architecture</h2>
        <p className="text-[#9ca3af] mb-8 max-w-2xl text-sm leading-relaxed">
          Tax codes are legal instructions to incentivize behavior. Your primary goal is to shield every single dollar of growth from annual taxation using these structures.
        </p>

        {country === 'canada' && (
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">TFSA (CELI) <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Holy Grail</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                100% tax-free growth forever. Withdrawals do not count as taxable income. Max this out first.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">RRSP (REER) <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white uppercase tracking-widest">Income Shield</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Reduces taxable income today, generating a massive refund. The secret is taking that refund and reinvesting it immediately.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">FHSA (CELIAPP) <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Ultimate Hack</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Tax-deductible in, tax-free out for a first home. If you don't buy a home, it rolls into your RRSP. Free money.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">RESP (REEE) <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white uppercase tracking-widest">Free Money</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                The government matches 20%. That is an instant, guaranteed 20% return on investment. Do not ignore this.
              </p>
            </div>
          </div>
        )}

        {country === 'uk' && (
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Stocks & Shares ISA <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Holy Grail</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                £20k/yr pure tax-free growth. No capital gains tax. No dividend tax. This is the core wealth engine.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">SIPP <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white uppercase tracking-widest">Income Shield</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                The government tops up your contributions by 20% automatically. High earners claim back 40-45%. Use it.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Lifetime ISA (LISA) <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Ultimate Hack</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Contribute up to £4k/yr, government adds 25%. Use for first home or retirement at 60. Instant 25% ROI.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Junior ISA (JISA) <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white uppercase tracking-widest">Generational Wealth</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                £9k/yr tax-free wrapper for your children. Locked until 18, then rolls into an adult ISA. Massive compounding advantage.
              </p>
            </div>
          </div>
        )}

        {country === 'australia' && (
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Superannuation <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Holy Grail</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Contributions taxed at a flat 15% instead of your marginal rate. Maxing your Super caps is mathematically unbeatable.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">FHSSS <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Ultimate Hack</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Use the 15% tax environment of your Super to save for a home deposit faster. Pure efficiency.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Franking Credits <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white uppercase tracking-widest">Dividend Shield</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Offsets your personal tax liability with corporate taxes already paid. Eliminates double taxation.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Debt Recycling <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white uppercase tracking-widest">Advanced Math</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Convert non-deductible debt into tax-deductible debt by drawing down equity to invest in income-producing assets.
              </p>
            </div>
          </div>
        )}

        {(country === 'us' || !['canada', 'uk', 'australia'].includes(country)) && (
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Roth IRA <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Holy Grail</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                After-tax money goes in. Tax-free growth forever. Tax-free withdrawals. This is the most powerful wealth vehicle in existence.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Traditional 401(k) <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white uppercase tracking-widest">Income Shield</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Lowers your taxable income immediately. Maxing out the $23k limit saves you thousands in upfront taxes, leaving more capital to compound.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">HSA <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Ultimate Hack</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                The only Triple-Tax-Advantaged account. Tax-deductible in, tax-free growth, tax-free out. Pay medical out of pocket now. Let this compound indefinitely.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#16a34a]/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">529 to Roth IRA <span className="px-2 py-0.5 rounded text-[10px] bg-[#16a34a]/20 text-[#16a34a] uppercase tracking-widest">Generational Wealth</span></h3>
              <p className="text-[#9ca3af] text-sm leading-relaxed">
                Roll up to $35,000 of unused 529 funds directly into a Roth IRA. Zero taxes. Zero penalties. The ultimate head start.
              </p>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
}
