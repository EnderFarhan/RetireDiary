export interface FeeComparisonParams {
  currentSavings: number;
  monthlyContribution: number;
  annualMarketReturn: number; // e.g. 0.07
  years: number;
  /** AUM fee rate, default 0.015 (1.5%) */
  aumFeeRate?: number;
  /** Index fund fee rate, default 0.0005 (0.05%) */
  indexFeeRate?: number;
}

export interface YearlySnapshot {
  year: number;
  balance: number;
  totalContributions: number;
  totalFeesPaid: number;
  totalGrowth: number;
}

export interface FeeComparisonResult {
  indexPath: YearlySnapshot[];
  aumPath: YearlySnapshot[];
  /** Total fees paid with index fund over full period */
  totalFeesIndex: number;
  /** Total fees paid with AUM advisor over full period */
  totalFeesAUM: number;
  /** Dollar difference lost to AUM fees vs index */
  feeDifferenceLost: number;
  /** Final balance with index fund */
  finalBalanceIndex: number;
  /** Final balance with AUM advisor */
  finalBalanceAUM: number;
  /** Percentage of final balance lost to AUM fees */
  percentageLost: number;
  /** Equivalent extra years of work the fee costs */
  extraYearsOfWork: number;
}

function buildPath(
  currentSavings: number,
  monthlyContribution: number,
  annualMarketReturn: number,
  feeRate: number,
  years: number
): YearlySnapshot[] {
  const snapshots: YearlySnapshot[] = [];
  let balance = currentSavings;
  let totalContributions = currentSavings;
  let totalFeesPaid = 0;

  // Net annual return after fee
  const netAnnualReturn = annualMarketReturn - feeRate;
  const annualContribution = monthlyContribution * 12;

  for (let year = 1; year <= years; year++) {
    // Annual compounding to match the core FIRE engine exactly
    balance = balance * (1 + netAnnualReturn) + annualContribution;
    totalContributions += annualContribution;
    totalFeesPaid += balance * feeRate;

    snapshots.push({
      year,
      balance: Math.round(balance),
      totalContributions: Math.round(totalContributions),
      totalFeesPaid: Math.round(totalFeesPaid),
      totalGrowth: Math.round(balance - totalContributions),
    });
  }

  return snapshots;
}

export function compareFees(params: FeeComparisonParams): FeeComparisonResult {
  const {
    currentSavings,
    monthlyContribution,
    annualMarketReturn,
    years,
    aumFeeRate = 0.015,
    indexFeeRate = 0.0005,
  } = params;

  const indexPath = buildPath(currentSavings, monthlyContribution, annualMarketReturn, indexFeeRate, years);
  const aumPath = buildPath(currentSavings, monthlyContribution, annualMarketReturn, aumFeeRate, years);

  const finalBalanceIndex = indexPath[indexPath.length - 1]?.balance ?? 0;
  const finalBalanceAUM = aumPath[aumPath.length - 1]?.balance ?? 0;
  const totalFeesIndex = indexPath[indexPath.length - 1]?.totalFeesPaid ?? 0;
  const totalFeesAUM = aumPath[aumPath.length - 1]?.totalFeesPaid ?? 0;

  const feeDifferenceLost = finalBalanceIndex - finalBalanceAUM;
  const percentageLost =
    finalBalanceIndex > 0
      ? Math.round((feeDifferenceLost / finalBalanceIndex) * 100)
      : 0;

  // Extra years of work: how many more years you'd need to work to make up the fee gap
  // Rough approximation: gap / (annual income from work, proxy as monthly contribution * 12)
  const annualSavings = monthlyContribution * 12;
  const extraYearsOfWork =
    annualSavings > 0 ? Math.round(feeDifferenceLost / annualSavings) : 0;

  return {
    indexPath,
    aumPath,
    totalFeesIndex,
    totalFeesAUM,
    feeDifferenceLost,
    finalBalanceIndex,
    finalBalanceAUM,
    percentageLost,
    extraYearsOfWork,
  };
}

/** Format a number as USD currency, abbreviated for large values */
export function formatCurrency(n: number, abbreviate = false): string {
  if (abbreviate) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
