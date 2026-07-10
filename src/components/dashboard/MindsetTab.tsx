import { motion } from 'framer-motion';

export function MindsetTab({ annualIncome }: { annualIncome: number }) {
  const showCertificationTip = Number(annualIncome) < 100000;

  return (
    <div className="space-y-8">
      
      {/* Dynamic Income Multiplier */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-[#1a1a1a] text-white rounded-2xl shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-[#16a34a]/20 transition-all duration-700 pointer-events-none" />
        
        {showCertificationTip ? (
          <div>
            <h4 className="text-lg font-bold text-[#e4e1d9] mb-2">Kill Low-Leverage Income.</h4>
            <p className="text-[#9ca3af] leading-relaxed mb-4">
              Trading hours for minimum wage on weekends is a loser's game. To accelerate wealth, increase your baseline income. Stop working yourself to exhaustion for pennies.
            </p>
            <div className="bg-black/40 p-4 rounded-xl border border-white/10">
              <p className="text-sm font-bold text-white mb-2">Action Step:</p>
              <p className="text-sm text-[#9ca3af]">
                Invest your time into high-ROI skills or certifications (AWS, Salesforce, Trades). A $20k salary bump invested over 10 years shaves a decade off your working life. Your baseline income is your ultimate wealth-building tool.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-bold text-[#e4e1d9] mb-2">The Tax Shield.</h4>
            <p className="text-[#9ca3af] leading-relaxed mb-4">
              At your income level, your biggest lifetime expense is no longer housing or food. It is taxes. Stop leaking capital to the government.
            </p>
            <div className="bg-black/40 p-4 rounded-xl border border-white/10">
              <p className="text-sm font-bold text-white mb-2">Action Step:</p>
              <p className="text-sm text-[#9ca3af]">
                Lower your Adjusted Gross Income (AGI). Aggressively max out every pre-tax and tax-deferred vehicle available before putting a single dollar into a standard brokerage account.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Rules of Wealth */}
      <div className="grid md:grid-cols-2 gap-6">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border-2 border-[#e4e1d9] shadow-sm">
          <h4 className="text-lg font-black text-[#1a1a1a] mb-2">1. Pay Yourself First</h4>
          <p className="text-[#5c5c5c] text-sm leading-relaxed">
            If you wait to save what is left at the end of the month, there will be nothing left. Automate transfers the exact day your paycheck hits. Your wealth is your first expense.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border-2 border-[#e4e1d9] shadow-sm">
          <h4 className="text-lg font-black text-[#1a1a1a] mb-2">2. The 20% Baseline</h4>
          <p className="text-[#5c5c5c] text-sm leading-relaxed">
            FIRE requires extreme savings (40-60%). If this breaks you, default to a strict 20% baseline. You will still retire a multi-millionaire. Wealth should not feel like a prison.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border-2 border-[#e4e1d9] shadow-sm">
          <h4 className="text-lg font-black text-[#1a1a1a] mb-2">3. The Health Dividend</h4>
          <p className="text-[#5c5c5c] text-sm leading-relaxed">
            A $5M portfolio is worthless if you spend your 60s in a hospital bed. Invest in your physical health and mobility with the exact same intensity as your index funds.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl border-2 border-[#e4e1d9] shadow-sm">
          <h4 className="text-lg font-black text-[#1a1a1a] mb-2">4. Retire TO Something</h4>
          <p className="text-[#5c5c5c] text-sm leading-relaxed">
            Retirement is a psychological transition. If you don't cultivate purpose and community before you quit, you will be miserable. You must retire TO something, not just FROM something.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
