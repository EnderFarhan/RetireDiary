export function AdvancedArchitectures() {
  return (
    <div className="space-y-12">
      {/* ── 2. Advanced FIRE Architectures ── */}
      <div className="bg-[#1a1a1a] rounded-3xl p-8 lg:p-10 text-white shadow-xl">
        <h2 className="text-2xl font-black mb-6 text-white">Advanced FIRE Architectures</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#16a34a] border border-[#16a34a]/30 rounded-full mb-3">
              Drawdown Blueprint
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">The Roth Conversion Ladder</h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed mb-4">
              If your money is locked in a retirement account until age 59½, how do you retire at 45? The Roth Ladder is the legal escape hatch. 
              You convert funds to a Traditional IRA, then convert exactly your annual living expenses into a Roth IRA each year. 
              Wait 5 years, and that principal can be withdrawn completely penalty-free.
            </p>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white border border-white/30 rounded-full mb-3">
              Burnout Protocol
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Coast FIRE Downshifting</h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed mb-4">
              If you hit severe burnout, you don't need to reach your full FIRE number before quitting. You just need to reach your 
              "Coast Number." Once there, your portfolio will compound to your final goal without another dime of contributions. 
              You can immediately downshift to a low-stress job that just covers your daily groceries and rent.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Execution Tools ── */}
      <div className="grid gap-6">
        {/* Direct Brokerage Links */}
        <div className="bg-white rounded-2xl border-2 border-[#e4e1d9] p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-[#1a1a1a] mb-2">Open Your Engine Account</h3>
          <p className="text-sm text-[#5c5c5c] mb-6">
            Stop procrastinating. Click one of these direct links right now to open your low-cost brokerage account.
          </p>
          <div className="space-y-3 mt-auto">
            <a href="https://investor.vanguard.com/accounts-and-plans" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-[#e4e1d9] hover:border-[#16a34a] transition-colors group">
              <span className="font-black text-[#1a1a1a]">Vanguard (US)</span>
              <span className="text-[#16a34a] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="https://www.fidelity.com/open-account/overview" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-[#e4e1d9] hover:border-[#16a34a] transition-colors group">
              <span className="font-black text-[#1a1a1a]">Fidelity (US)</span>
              <span className="text-[#16a34a] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="https://www.wealthsimple.com/en-ca/open" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-[#e4e1d9] hover:border-[#16a34a] transition-colors group">
              <span className="font-black text-[#1a1a1a]">Wealthsimple (CA)</span>
              <span className="text-[#16a34a] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
