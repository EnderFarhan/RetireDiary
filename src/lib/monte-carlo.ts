/**
 * Monte Carlo Simulation Engine for FIRE trajectories.
 * Uses a Gaussian random walk to simulate market volatility (Sequence of Returns Risk).
 */

// Box-Muller transform to generate standard normal random variables
function randn_bm(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export interface MonteCarloResult {
  p10: number; // 10th percentile (Poor market, takes longer)
  p50: number; // 50th percentile (Average market)
  p90: number; // 90th percentile (Lucky market, finishes faster)
  isUnreachable: boolean;
}

/**
 * Simulates the accumulation phase to find the spread of years to reach the target.
 */
export function simulateAccumulation(
  currentSavings: number,
  annualContribution: number,
  targetAmount: number,
  meanReturn: number = 0.07,
  volatility: number = 0.15,
  simulations: number = 500
): MonteCarloResult {
  if (currentSavings >= targetAmount) {
    return { p10: 0, p50: 0, p90: 0, isUnreachable: false };
  }
  
  if (annualContribution <= 0 && meanReturn <= 0) {
    return { p10: 99, p50: 99, p90: 99, isUnreachable: true };
  }

  const results: number[] = [];
  const maxYears = 80;

  for (let i = 0; i < simulations; i++) {
    let balance = currentSavings;
    let years = 0;
    
    while (balance < targetAmount && years < maxYears) {
      years++;
      // Generate randomized return for this year
      const r = meanReturn + randn_bm() * volatility;
      balance = balance * (1 + r) + annualContribution;
    }
    
    results.push(years);
  }

  // Sort ascending. 
  // For 'Years to FIRE', lower is better. 
  // p90 (90th percentile of luck) = 10% index of years array (fewest years)
  // p10 (10th percentile of luck) = 90% index of years array (most years)
  results.sort((a, b) => a - b);

  const idx90 = Math.floor(results.length * 0.1); // Lucky (fast)
  const idx50 = Math.floor(results.length * 0.5); // Average
  const idx10 = Math.floor(results.length * 0.9); // Poor (slow)

  const p90 = results[idx90];
  const p50 = results[idx50];
  const p10 = results[idx10];

  return {
    p90,
    p50,
    p10,
    isUnreachable: p50 >= maxYears,
  };
}

/**
 * Generates full balance paths for visual charts.
 * @returns Array of paths, where each path is an array of balances per year.
 */
export function generateMonteCarloPaths(
  currentSavings: number,
  annualContribution: number,
  meanReturn: number = 0.07,
  volatility: number = 0.15,
  simulations: number = 50,
  yearsToSimulate: number = 30
): number[][] {
  const paths: number[][] = [];
  
  for (let i = 0; i < simulations; i++) {
    const path: number[] = [currentSavings];
    let balance = currentSavings;
    
    for (let y = 1; y <= yearsToSimulate; y++) {
      const r = meanReturn + randn_bm() * volatility;
      balance = Math.max(0, balance * (1 + r) + annualContribution);
      path.push(balance);
    }
    paths.push(path);
  }
  
  return paths;
}
