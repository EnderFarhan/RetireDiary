import { QUESTIONS, StrategyId, type QuestionOption } from '@/data/questions';

export type Answers = Record<string, string>; // questionId -> optionId

export interface StrategyScore {
  strategy: StrategyId;
  score: number;
  percentage: number;
}

export interface QuizResult {
  scores: Record<StrategyId, number>;
  ranked: StrategyScore[];
  topThree: StrategyScore[];
  userInputs: {
    annualIncome: number;
    monthlySpending: number;
    annualSpending: number;
    currentSavings: number;
    age: number;
    targetRetirementAge?: number;
    numberOfChildren: number;
    country: string;
    advisorSentiment: string;
    leanBudget?: number;
    fatBudget?: number;
    partTimeIncome?: number;
    traditionalAge?: number;
    salaryIncreasePct?: number;
    reinvestPct?: number;
    monthlySavings?: number;
    customValues?: Record<string, number>;
  };
}

const STRATEGY_IDS: StrategyId[] = ['lean', 'traditional', 'fat', 'coast', 'barista'];

/** Maximum achievable points per strategy across all questions */
const MAX_SCORES: Record<StrategyId, number> = {
  lean: 0,
  traditional: 0,
  fat: 0,
  coast: 0,
  barista: 0,
};

// Dynamically compute MAX_SCORES based on the current questions
QUESTIONS.forEach((q) => {
  const strategyMax: Record<StrategyId, number> = { lean: 0, traditional: 0, fat: 0, coast: 0, barista: 0 };
  q.options.forEach((opt) => {
    for (const [strategy, points] of Object.entries(opt.scores)) {
      if ((points || 0) > strategyMax[strategy as StrategyId]) {
        strategyMax[strategy as StrategyId] = points || 0;
      }
    }
  });
  for (const strategy of STRATEGY_IDS) {
    MAX_SCORES[strategy] += strategyMax[strategy];
  }
});

function getSelectedOption(questionId: string, optionId: string): QuestionOption | undefined {
  const question = QUESTIONS.find((q) => q.id === questionId);
  return question?.options.find((o) => o.id === optionId);
}

function extractUserInputs(answers: Answers): QuizResult['userInputs'] {
  // Custom values typed by the user (exact numbers) override bracket midpoints
  let customValues: Record<string, number> = {};
  if (answers['__customValues']) {
    try { customValues = JSON.parse(answers['__customValues'] as string); } catch { /* noop */ }
  }

  const incomeOption = getSelectedOption('income', answers['income'] ?? '');
  const savingsOption = getSelectedOption('savings', answers['savings'] ?? '');
  const ageOption = getSelectedOption('age', answers['age'] ?? '');
  const feeOption = getSelectedOption('fee_awareness', answers['fee_awareness'] ?? '');
  const childrenOption = getSelectedOption('children', answers['children'] ?? '');
  const countryOption = getSelectedOption('country', answers['country'] ?? '');
  const spendOption = getSelectedOption('monthly_spend', answers['monthly_spend'] ?? '');

  // Use exact custom value if entered, otherwise fall back to bracket midpoint
  const annualIncome = customValues['income'] ?? incomeOption?.value ?? 75000;
  
  const netMonthlyIncome = annualIncome / 12;
  
  // Use explicit monthly spend if provided, otherwise derive it
  let monthlySpending = customValues['monthly_spend'] ?? spendOption?.value;
  if (monthlySpending === undefined) {
    // Fallback to minimal survival spending if not explicitly provided
    monthlySpending = Math.max(netMonthlyIncome * 0.8, 1500);
  }

  const currentSavings = customValues['savings'] ?? savingsOption?.value ?? 15000;
  const age = customValues['age'] ?? ageOption?.value ?? 30;
  const timelineOption = getSelectedOption('timeline', answers['timeline'] ?? '');
  const targetRetirementAge = customValues['timeline'] ?? (timelineOption?.value !== undefined ? (age + timelineOption.value) : undefined);
  const numberOfChildren = customValues['children'] ?? childrenOption?.value ?? 0;
  const country = countryOption?.id ?? 'us';
  const promotionOptionId = answers['promotions'] ?? '';
  
  let salaryIncreasePct = 0;
  let reinvestPct = 0;
  
  if (customValues['promotions'] !== undefined) {
    // If they typed something in custom, we don't have a structured way to parse "5, 50" from a single number easily if it just parses as a single float, 
    // but we can just use the option if it's there. Actually, the custom string in the form might be parsed weirdly if it's "5, 50".
    // For now, let's just rely on the predefined options if they didn't use a structured custom format, or we can just map the options.
  }
  
  if (promotionOptionId === 'no_growth') { salaryIncreasePct = 0; reinvestPct = 0; }
  else if (promotionOptionId === 'standard') { salaryIncreasePct = 3; reinvestPct = 25; }
  else if (promotionOptionId === 'strong') { salaryIncreasePct = 5; reinvestPct = 50; }
  else if (promotionOptionId === 'aggressive') { salaryIncreasePct = 10; reinvestPct = 100; }

  return {
    annualIncome,
    monthlySpending,
    annualSpending: monthlySpending * 12,
    currentSavings,
    age,
    targetRetirementAge,
    numberOfChildren,
    country,
    advisorSentiment: feeOption?.id ?? 'unknown',
    leanBudget: customValues['frugality'],
    fatBudget: customValues['dream_life'],
    partTimeIncome: customValues['parttime'],
    traditionalAge: customValues['traditional_age'] ?? getSelectedOption('traditional_age', answers['traditional_age'] ?? '')?.value ?? 65,
    salaryIncreasePct,
    reinvestPct,
    customValues,
  };
}

export function calculateQuizResults(answers: Answers): QuizResult {
  // Accumulate scores
  const scores: Record<StrategyId, number> = {
    lean: 0,
    traditional: 0,
    fat: 0,
    coast: 0,
    barista: 0,
  };

  for (const [questionId, optionId] of Object.entries(answers)) {
    const option = getSelectedOption(questionId, optionId);
    if (!option) continue;
    for (const [strategy, points] of Object.entries(option.scores)) {
      scores[strategy as StrategyId] += points;
    }
  }

  // Normalize to percentages based on max possible per strategy
  const ranked: StrategyScore[] = STRATEGY_IDS.map((strategy) => ({
    strategy,
    score: scores[strategy],
    percentage: Math.round((scores[strategy] / MAX_SCORES[strategy]) * 100),
  })).sort((a, b) => b.percentage - a.percentage);

  return {
    scores,
    ranked,
    topThree: ranked.slice(0, 3),
    userInputs: extractUserInputs(answers),
  };
}
