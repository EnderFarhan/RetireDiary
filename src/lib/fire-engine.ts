import { StrategyId } from '@/data/questions';

export interface FIREInputs {
  annualSpending: number;
  annualIncome: number;
  currentSavings: number;
  age: number;
  strategy: StrategyId;
  /** Real (inflation-adjusted) annual return, default 0.07 */
  returnRate?: number;
  /** For Barista: estimated annual part-time income */
  partTimeIncome?: number;
  /** For Coast: target full-retirement age */
  retirementAge?: number;
  numberOfChildren?: number;
  country?: string;
  annualCostPerChildOverride?: number;
  swr?: number;
  leanBudget?: number;
  fatBudget?: number;
  traditionalAge?: number;
  salaryIncreasePct?: number;
  reinvestPct?: number;
}

export interface FIREResult {
  fireNumber: number;
  /** Coast Number (only relevant for coast strategy) */
  coastNumber?: number;
  currentSavings: number;
  additionalNeeded: number;
  /** Years to reach FIRE number from today */
  yearsToFIRE: number;
  /** Required monthly savings to hit FIRE number */
  monthlySavingsNeeded: number;
  /** Implied savings rate as % of income */
  savingsRate: number;
  strategy: StrategyId;
  retirementAge: number;
  summary: string;
  /** Exposed to the UI so it can initialize the child cost slider */
  defaultCostPerChild: number;
  totalChildCost: number;
}

/**
 * Future value of a lump sum + regular contributions.
 * FV = PV*(1+r)^n + PMT*[((1+r)^n - 1)/r]
 */
export function futureValue(pv: number, pmt: number, r: number, n: number): number {
  if (r === 0) return pv + pmt * n;
  return pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
}

/**
 * Years to grow a portfolio to a target given initial annual savings and salary growth.
 */
export function yearsToTarget(
  currentSavings: number,
  initialAnnualSavings: number,
  targetAmount: number,
  annualReturn: number,
  annualIncome: number = 0,
  salaryIncreasePct: number = 0,
  reinvestPct: number = 0
): number {
  if (currentSavings >= targetAmount) return 0;
  
  let balance = currentSavings;
  let currentIncome = annualIncome;
  let currentSavingsAmount = initialAnnualSavings;
  
  for (let year = 1; year <= 80; year++) {
    balance = balance * (1 + annualReturn) + currentSavingsAmount;
    if (balance >= targetAmount) {
      return year;
    }
    // End of year promotion / salary increase
    const raise = currentIncome * (salaryIncreasePct / 100);
    currentIncome += raise;
    currentSavingsAmount += raise * (reinvestPct / 100);
  }
  
  return 99; // Cap at 80 years
}

/**
 * Given an exact initial monthly contribution, return how many years to hit a FIRE target.
 */
export function yearsToFIREWithContribution(
  fireTarget: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturn: number,
  annualIncome: number = 0,
  salaryIncreasePct: number = 0,
  reinvestPct: number = 0
): number {
  return yearsToTarget(
    currentSavings, 
    monthlyContribution * 12, 
    fireTarget, 
    annualReturn,
    annualIncome,
    salaryIncreasePct,
    reinvestPct
  );
}

/**
 * Solves for the required initial monthly contribution to hit a target in N years, 
 * accounting for future salary increases and reinvestment.
 */
export function requiredMonthlyContributionToTarget(
  currentSavings: number,
  targetAmount: number,
  annualReturn: number,
  years: number,
  annualIncome: number = 0,
  salaryIncreasePct: number = 0,
  reinvestPct: number = 0
): number {
  if (years <= 0) return 0;

  // Simulate the Future Value of the "extra" contributions from promotions alone
  let fvExtra = 0;
  let currentIncome = annualIncome;
  let cumulativeExtraContribution = 0;
  
  for (let i = 1; i <= years; i++) {
    fvExtra = fvExtra * (1 + annualReturn) + cumulativeExtraContribution;
    const raise = currentIncome * (salaryIncreasePct / 100);
    currentIncome += raise;
    cumulativeExtraContribution += raise * (reinvestPct / 100);
  }

  // Target = PV*(1+r)^N + C_initial*[(1+r)^N - 1]/r + fvExtra
  const factor = Math.pow(1 + annualReturn, years);
  const fvPV = currentSavings * factor;
  
  const shortfall = targetAmount - fvPV - fvExtra;
  if (shortfall <= 0) return 0; // Current savings + extra promo contributions cover it

  if (annualReturn === 0) {
    return Math.max(0, shortfall / (years * 12));
  }

  const annualContribution = (shortfall * annualReturn) / (factor - 1);
  return annualContribution / 12;
}

const BASE_CHILD_COST_PER_COUNTRY: Record<string, number> = {
  us: 15000,
  uk: 12000,
  canada: 10000,
  australia: 11000,
  europe: 8000,
  other: 5000,
};

export function calculateFIRE(inputs: FIREInputs): FIREResult {
  const {
    annualSpending,
    annualIncome,
    currentSavings,
    age,
    strategy,
    returnRate = 0.07,
    partTimeIncome = 18000,
    retirementAge = 65,
    numberOfChildren = 0,
    country = 'us',
    annualCostPerChildOverride,
    swr = 0.04,
    leanBudget,
    fatBudget,
    traditionalAge = 65,
    salaryIncreasePct = 0,
    reinvestPct = 0,
  } = inputs;

  const defaultCostPerChild = BASE_CHILD_COST_PER_COUNTRY[country] ?? BASE_CHILD_COST_PER_COUNTRY['us'];
  const costPerChild = annualCostPerChildOverride ?? defaultCostPerChild;
  const totalChildCost = numberOfChildren * costPerChild;
  
  // Adjust base spending to include the added cost of children
  const adjustedAnnualSpending = annualSpending + totalChildCost;

  const monthlyReturn = returnRate / 12;

  let fireNumber: number;
  let coastNumber: number | undefined;
  let effectiveSpending: number;

  switch (strategy) {
    case 'lean': {
      // Lean FIRE means aggressive minimalism. 
      const baseLean = leanBudget ?? (annualSpending * 0.75);
      effectiveSpending = baseLean + totalChildCost;
      fireNumber = effectiveSpending / swr;
      break;
    }
    case 'fat': {
      // Fat FIRE means luxury. 
      const baseFat = fatBudget ?? (annualSpending * 1.5);
      effectiveSpending = baseFat + totalChildCost;
      fireNumber = effectiveSpending / swr;
      break;
    }
    case 'coast': {
      // Full FIRE number
      const fullFIRENumber = adjustedAnnualSpending / swr;
      fireNumber = fullFIRENumber;
      // Coasting starts at retirementAge. The years left to compound without contributions is traditionalAge - retirementAge
      const yearsCoasting = Math.max(traditionalAge - retirementAge, 0);
      // Coast Number = the amount they need invested AT retirementAge
      coastNumber = fullFIRENumber / Math.pow(1 + returnRate, yearsCoasting);
      effectiveSpending = adjustedAnnualSpending;
      break;
    }
    case 'barista': {
      // Only need portfolio to cover (spending - partTimeIncome)
      const portfolioNeeded = Math.max(adjustedAnnualSpending - partTimeIncome, 0);
      fireNumber = portfolioNeeded / swr;
      effectiveSpending = adjustedAnnualSpending;
      break;
    }
    default: {
      // Traditional FIRE
      fireNumber = adjustedAnnualSpending / swr;
      effectiveSpending = adjustedAnnualSpending;
    }
  }

  const targetAmount = strategy === 'coast' ? (coastNumber ?? fireNumber) : fireNumber;
  const additionalNeeded = Math.max(targetAmount - currentSavings, 0);

  const targetYears = Math.max(retirementAge - age, 1);
  const monthlySavingsNeeded = Math.ceil(requiredMonthlyContributionToTarget(
    currentSavings, targetAmount, returnRate, targetYears, annualIncome, salaryIncreasePct, reinvestPct
  ));
  const savingsRate = Math.round((monthlySavingsNeeded * 12 / annualIncome) * 100);

  const summaryMap: Record<StrategyId, string> = {
    traditional: `Save ~${savingsRate}% of your income and you could fully retire in ${targetYears} years at age ${retirementAge}.`,
    lean: `Keep spending under $${Math.round(effectiveSpending / 1000)}k/yr, save ${savingsRate}% of your income, and you could hit Lean FIRE in ${targetYears} years.`,
    fat: `With a $${Math.round(annualSpending / 1000)}k/yr lifestyle you need $${Math.round(fireNumber / 1000)}k. Save ${savingsRate}% of your income to retire by ${retirementAge}.`,
    coast: `You need $${Math.round(targetAmount / 1000)}k invested by age ${retirementAge} and it grows to $${Math.round(fireNumber / 1000)}k by age ${traditionalAge} — no more saving required.`,
    barista: `Build $${Math.round(fireNumber / 1000)}k in investments, pick up $${Math.round(partTimeIncome / 1000)}k/yr part-time, and you're effectively retired from the grind.`,
  };

  return {
    fireNumber,
    coastNumber,
    currentSavings,
    additionalNeeded,
    yearsToFIRE: targetYears,
    monthlySavingsNeeded,
    savingsRate,
    strategy,
    retirementAge,
    summary: summaryMap[strategy],
    defaultCostPerChild,
    totalChildCost,
  };
}
