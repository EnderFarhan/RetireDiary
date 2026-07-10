'use client';

import { StepCard } from './StepCard';
import { formatCurrency } from '@/lib/fee-math';
import { motion } from 'framer-motion';

type MissionsTabProps = {
  hasEmergencyFund: boolean;
  hasEmployerMatch: boolean;
  matchPct: string;
  hasDebt: boolean;
  debtRate: string;
  isUs: boolean;
  hdhpStatus: string;
  isCanadian: boolean;
  tfsaStatus: string;
  tfsaYear: string;
  has529: boolean;
  taxSequence: { name: string }[];
  monthlySavings: number;
  etfs: { ticker: string }[];
  annualIncome: number;
  onCustomize?: () => void;
};

export function MissionsTab({
  hasEmergencyFund, hasEmployerMatch, matchPct, hasDebt, debtRate, isUs, hdhpStatus,
  isCanadian, tfsaStatus, tfsaYear, has529, taxSequence, monthlySavings, etfs, annualIncome,
  onCustomize
}: MissionsTabProps) {

  // We determine the active step based on a simulated progression.
  // For the sake of the gamified UI, we will highlight the *first* incomplete mission.
  // We'll simulate that they haven't completed anything yet, so step 1 is active.
  let currentStep = 1;

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return { isActive: false, isCompleted: true };
    if (stepIndex === currentStep) return { isActive: true, isCompleted: false };
    return { isActive: false, isCompleted: false };
  };

  let globalStepCounter = 1;

  return (
    <div className="space-y-12">
      <div className="bg-[#1a1a1a] rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16a34a] opacity-5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black mb-2 text-white">The Order of Operations</h2>
            <p className="text-[#9ca3af] text-sm max-w-2xl">
              Execution requires focus. Ignore everything except your active mission. Complete it, then move to the next.
            </p>
          </div>
          {onCustomize && (
            <button 
              onClick={onCustomize}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 flex-shrink-0"
            >
              Personalize Blueprint ⚙️
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[3.25rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#16a34a] before:via-[#e4e1d9] before:to-[#e4e1d9]">
        
        {!hasEmergencyFund && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="critical"
              title="Build The Buffer"
              body="Stop investing. Accumulate 3 to 6 months of bare-bones living expenses in a High-Yield Savings Account. Cash is leverage."
              why="Without cash, an emergency forces you into high-interest debt. Debt destroys leverage. Build the buffer."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}

        {hasDebt && debtRate === 'over 7%' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="critical"
              title="Liquidate High-Interest Debt"
              body="Your debt costs you over 7%. Every extra dollar goes here before you invest another dime."
              why="The market returns 7%. Your debt costs more. Paying it down is mathematically superior and carries zero risk."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}

        {hasEmployerMatch && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="high"
              title="Capture Free Money (If Offered)"
              body="If your employer offers a 401(k) / RRSP match, log into your HR portal immediately. Set your contribution to capture 100% of the match limit."
              why="Leaving an employer match on the table is mathematically indefensible. It is a guaranteed return on your money."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}
        
        {hasDebt && debtRate === 'under 7%' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="normal"
              title="Arbitrage Low-Interest Debt"
              body="Your debt costs under 7%. Do not pay a cent extra. Pay the minimums and invest the rest."
              why="If debt costs 4% and investments yield 7%, paying debt early actively destroys wealth. Let inflation eat the debt while your investments compound."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}
        
        {isUs && (hdhpStatus === 'hdhp_enrolled' || hdhpStatus === 'hdhp_eligible') && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="high"
              title="Max the HSA (Triple-Tax Weapon)"
              body="Contribute the legal maximum. Invest the balance in index funds. Do not leave it as cash."
              why="The only triple-tax-advantaged account in the code. Pre-tax in, tax-free growth, tax-free out. Exploit it."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}
        
        {isCanadian && tfsaStatus === 'since_2009' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="high"
              title="Max the TFSA (Tax-Free Wealth)"
              body="Max your contribution this year plus all unused room since 2009. Buy broad market index funds inside."
              why="100% tax-free growth and withdrawals forever. No taxable income. This is the holy grail."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}
        
        {isCanadian && tfsaStatus === 'recent_immigrant' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="high"
              title={`Maximize Your TFSA (Room from ${tfsaYear ?? 'your arrival'})`}
              body={`Your TFSA room started accumulating the year you turned 18 OR became a Canadian resident. Calculate your exact room to avoid penalties.`}
              why="Over-contributing to a TFSA triggers a 1% penalty on the excess amount per month. Verify your room through the CRA My Account portal."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}
        
        {isUs && has529 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="high"
              title="SECURE 2.0 — Roll Your 529 into a Roth IRA"
              body="You can roll up to $35,000 of unused 529 funds directly into the beneficiary's Roth IRA with zero taxes and zero penalties."
              why="Rescue up to $35,000 of dead equity into a Roth IRA — giving it decades of tax-free growth for retirement instead."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}
        

        {isCanadian && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="high"
              title="Max the RRSP (Income Shield)"
              body="Deductible contributions slash your taxes today. Reinvest the tax refund immediately."
              why="The government gives you an upfront loan to compound. For high earners, this is mathematically optimal."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}

        {isUs && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative z-10">
            <StepCard
              step={globalStepCounter}
              priority="high"
              title="Max the 401(k) / IRA"
              body="Max out the pre-tax or Roth legal limits every single year."
              why="Tax-advantaged space is use-it-or-lose-it. Shield your wealth from the drag of taxes."
              {...getStepStatus(globalStepCounter++)}
            />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative z-10">
          <StepCard
            step={globalStepCounter}
            priority="normal"
            title="The Brokerage Bridge"
            body="After maxing tax shelters, every remaining dollar goes here."
            why="No contribution limits. No withdrawal restrictions. This is the bridge account that allows you to exit early."
            {...getStepStatus(globalStepCounter++)}
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative z-10">
          <StepCard
            step={globalStepCounter}
            priority="normal"
            title={`Automate ${formatCurrency(monthlySavings)}/mo → Buy ${etfs[0]?.ticker || 'ETFs'}`}
            body={`Set up an automatic recurring transfer. Automate the purchases. Never log in to check the price. Let the asset do the work.`}
            why="Consistency and automation beat everything. Remove human emotion from the equation."
            {...getStepStatus(globalStepCounter++)}
          />
        </motion.div>

      </div>
    </div>
  );
}
