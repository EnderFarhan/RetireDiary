export type StrategyId = 'lean' | 'traditional' | 'fat' | 'coast' | 'barista';

export interface QuestionOption {
  id: string;
  label: string;
  scores: Partial<Record<StrategyId, number>>;
  /** Raw value used for calculations (income, spending, savings, age) */
  value?: number;
}

export interface CustomInputConfig {
  /** Label shown above the input */
  label: string;
  /** Unit shown after the value */
  unit: string;
  /** Input placeholder */
  placeholder: string;
  min: number;
  max: number;
  step: number;
  /** How to convert the raw input to a per-year value for calculations */
  toAnnual?: (v: number) => number;
}

export interface Question {
  id: string;
  text: string;
  /** Shown in the left panel on desktop */
  leftContext: string;
  options: QuestionOption[];
  /** If true, shows a "type my exact number" text input alongside the tiles */
  supportsCustomInput?: boolean;
  customInputConfig?: CustomInputConfig;
}

export const QUESTIONS: Question[] = [
  {
    id: 'income',
    text: "What is your net income?",
    leftContext: "We need exact inputs to calculate your outputs.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'My exact net annual income',
      unit: '/ year',
      placeholder: 'e.g. 65000',
      min: 10000,
      max: 2000000,
      step: 1000,
    },
    options: [
      { id: 'under_40k', label: 'Under $40,000', value: 35000, scores: { lean: 3, barista: 2 } },
      { id: '40k_75k', label: '$40,000–$75,000', value: 57500, scores: { lean: 3, traditional: 1, coast: 2, barista: 2 } },
      { id: '75k_120k', label: '$75,000–$120,000', value: 97500, scores: { traditional: 2, coast: 3, barista: 1 } },
      { id: '120k_200k', label: '$120,000–$200,000', value: 160000, scores: { fat: 2, coast: 2, traditional: 1 } },
      { id: 'over_200k', label: '$200,000+', value: 250000, scores: { fat: 3, traditional: 1 } },
    ],
  },

  {
    id: 'monthly_spend',
    text: "What is your exact monthly burn rate?",
    leftContext: "Do not guess. Your financial freedom depends on knowing your exact burn rate.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'My exact monthly spending',
      unit: '/ month',
      placeholder: 'e.g. 4500',
      min: 500,
      max: 50000,
      step: 100,
      toAnnual: (v) => v * 12,
    },
    options: [
      { id: 'under_2k', label: 'Under $2,000', value: 1500, scores: { lean: 3, barista: 2 } },
      { id: '2k_4k', label: '$2,000–$4,000', value: 3000, scores: { traditional: 2, coast: 2, barista: 1 } },
      { id: '4k_7k', label: '$4,000–$7,000', value: 5500, scores: { traditional: 3, coast: 2 } },
      { id: '7k_12k', label: '$7,000–$12,000', value: 9500, scores: { fat: 2, traditional: 1 } },
      { id: 'over_12k', label: 'Over $12,000', value: 15000, scores: { fat: 3 } },
    ],
  },
  {
    id: 'sunday_blues',
    text: "What is the pain level of your current vehicle (job)?",
    leftContext: "Be honest. How bad do you want out?",
    options: [
      { id: 'fantasize_quit', label: 'I want out yesterday. Complete burnout.', scores: { lean: 2, barista: 3 } },
      { id: 'burnt_out', label: "High pain. I'm running on fumes.", scores: { barista: 2, traditional: 2, lean: 1 } },
      { id: 'want_options', label: "Moderate. I just want leverage and options.", scores: { traditional: 2, coast: 2 } },
      { id: 'love_job', label: "Low pain. I like the job, I just want the wealth.", scores: { coast: 3, fat: 2 } },
    ],
  },
  {
    id: 'frugality',
    text: "Are you willing to cut expenses to buy back your time faster?",
    leftContext: "Lowering your burn rate accelerates your timeline. What is your tolerance?",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'My Lean FIRE budget',
      unit: '/ year',
      placeholder: 'e.g. 35000',
      min: 10000,
      max: 200000,
      step: 1000,
    },
    options: [
      { id: 'hell_yes', label: "Yes. I will cut anything to buy back my time.", scores: { lean: 3, traditional: 1 } },
      { id: 'decent_cut', label: "I can cut back a solid amount.", scores: { traditional: 2, coast: 2, lean: 1 } },
      { id: 'some_cuts', label: "A little, but I'm keeping my lifestyle.", scores: { coast: 3, barista: 2, traditional: 1 } },
      { id: 'no_cuts', label: "No. I want maximum leverage without compromise.", scores: { fat: 3 } },
    ],
  },
  {
    id: 'age',
    text: "What is your current age?",
    leftContext: "Compound interest requires time. We need this for the equation.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'My exact age',
      unit: 'years old',
      placeholder: 'e.g. 31',
      min: 18,
      max: 75,
      step: 1,
    },
    options: [
      { id: 'under_25', label: 'Under 25', value: 22, scores: { coast: 3, lean: 1, traditional: 1 } },
      { id: '25_32', label: '25–32', value: 28, scores: { coast: 3, traditional: 1, lean: 2 } },
      { id: '33_40', label: '33–40', value: 36, scores: { traditional: 2, barista: 3, lean: 1 } },
      { id: '41_50', label: '41–50', value: 45, scores: { barista: 3, traditional: 1, lean: 2 } },
      { id: 'over_50', label: '50+', value: 54, scores: { barista: 3, lean: 2 } },
    ],
  },
  {
    id: 'parttime',
    text: "Are you willing to work a low-stress part-time job?",
    leftContext: "This covers your baseline expenses while your portfolio compounds.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'Expected part-time income',
      unit: '/ year',
      placeholder: 'e.g. 20000',
      min: 5000,
      max: 100000,
      step: 1000,
    },
    options: [
      { id: 'sounds_ideal', label: "Yes, a low-stress job sounds ideal.", scores: { barista: 3, coast: 2 } },
      { id: 'if_i_loved_it', label: "Only if it aligns with my passions.", scores: { barista: 2, coast: 2 } },
      { id: 'temporarily', label: "Temporarily, but not forever.", scores: { traditional: 1, barista: 2, coast: 1 } },
      { id: 'full_freedom', label: "No. Complete freedom, zero obligations.", scores: { traditional: 2, lean: 3, fat: 2 } },
    ],
  },
  {
    id: 'promotions',
    text: "Will you increase your inputs over time?",
    leftContext: "Increasing income and avoiding lifestyle creep is the ultimate cheat code. Every extra dollar invested accelerates your timeline.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'Custom: Salary increase %, Reinvestment %',
      unit: '% raise, % reinvested',
      placeholder: 'e.g. 5, 50',
      min: 0,
      max: 100,
      step: 1,
    },
    options: [
      { id: 'no_growth', label: 'No growth expected (0% raise, 0% reinvested)', scores: { lean: 2, barista: 1 } },
      { id: 'standard', label: 'Standard raises, some creep (3% raise, 25% reinvested)', scores: { traditional: 2, coast: 1 } },
      { id: 'strong', label: 'Strong career growth, investing half (5% raise, 50% reinvested)', scores: { fat: 1, coast: 2, traditional: 1 } },
      { id: 'aggressive', label: 'Aggressive climber, investing everything extra (10% raise, 100% reinvested)', scores: { fat: 2, traditional: 2 } },
    ],
  },
  {
    id: 'dream_life',
    text: "What does your end state look like?",
    leftContext: "Be specific. What is the lifestyle you are actually buying?",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'My Fat FIRE budget',
      unit: '/ year',
      placeholder: 'e.g. 150000',
      min: 80000,
      max: 1000000,
      step: 5000,
    },
    options: [
      { id: 'simple_chill', label: "Simple and free. High time wealth, low expenses.", scores: { lean: 3 } },
      { id: 'normal_no_alarm', label: "My current life, just without the job.", scores: { traditional: 2, coast: 2, barista: 1 } },
      { id: 'travel_luxury', label: "Abundance. Travel, luxury, maximum leverage.", scores: { fat: 3, traditional: 1 } },
      { id: 'passion_projects', label: "Building my own projects on my own terms.", scores: { barista: 2, coast: 2 } },
    ],
  },
  {
    id: 'children',
    text: "How many children do you have or plan to have?",
    leftContext: "Dependents change the math. We must factor them in.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'Exact number of children',
      unit: 'kids',
      placeholder: 'e.g. 2',
      min: 0,
      max: 10,
      step: 1,
    },
    options: [
      { id: '0_kids', label: 'None', value: 0, scores: { lean: 2, fat: 1 } },
      { id: '1_kid', label: '1 child', value: 1, scores: { traditional: 1, coast: 1 } },
      { id: '2_kids', label: '2 children', value: 2, scores: { traditional: 2, coast: 1 } },
      { id: '3_kids', label: '3 children', value: 3, scores: { traditional: 2, barista: 1 } },
      { id: '4_plus_kids', label: '4 or more', value: 4, scores: { traditional: 1, barista: 2 } },
    ],
  },
  {
    id: 'country',
    text: "Which region do you live in?",
    leftContext: "The cost of raising a child varies dramatically around the world. This helps us estimate a baseline cost.",
    options: [
      { id: 'us', label: 'United States', scores: {} },
      { id: 'uk', label: 'United Kingdom', scores: {} },
      { id: 'canada', label: 'Canada', scores: {} },
      { id: 'australia', label: 'Australia / New Zealand', scores: {} },
      { id: 'europe', label: 'Europe', scores: {} },
      { id: 'other', label: 'Other', scores: {} },
    ],
  },
  {
    id: 'savings',
    text: "What is your exact investment balance?",
    leftContext: "Zero is a valid starting point. We just need the baseline.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'My exact investment balance',
      unit: 'total',
      placeholder: 'e.g. 42000',
      min: 0,
      max: 5000000,
      step: 1000,
    },
    options: [
      { id: 'nothing_yet', label: 'Nothing yet ($0)', value: 0, scores: { lean: 2, barista: 2 } },
      { id: 'under_5k', label: 'Less than $5,000', value: 2500, scores: { lean: 2, barista: 1 } },
      { id: '5k_25k', label: '$5,000–$25,000', value: 15000, scores: { lean: 2, barista: 2, coast: 1 } },
      { id: '25k_100k', label: '$25,000–$100,000', value: 62500, scores: { coast: 3, traditional: 1, barista: 1 } },
      { id: '100k_300k', label: '$100,000–$300,000', value: 200000, scores: { coast: 2, traditional: 2, fat: 2 } },
      { id: 'over_300k', label: 'Over $300,000', value: 400000, scores: { fat: 3, traditional: 1, coast: 1 } },
    ],
  },
  {
    id: 'fee_awareness',
    text: "Do you know how much your investments are charging you in fees?",
    leftContext: "Your answer dictates the math we show you next.",
    options: [
      { id: 'robbing_us', label: "Yes. Financial advisors are a scam.", scores: {} },
      { id: 'know_fees_matter', label: "I know they matter, but I haven't optimized.", scores: {} },
      { id: 'dont_understand', label: "I don't understand the fee structure yet.", scores: {} },
      { id: 'already_indexes', label: "I already use low-cost index funds. Just give me the roadmap.", scores: {} },
    ],
  },
  {
    id: 'traditional_age',
    text: "What is your traditional retirement age?",
    leftContext: "We use this to calculate when your current assets will naturally cover your baseline without another penny saved.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'Traditional retirement age',
      unit: 'years old',
      placeholder: 'e.g. 65',
      min: 55,
      max: 80,
      step: 1,
    },
    options: [
      { id: '60', label: 'Age 60', value: 60, scores: { coast: 1 } },
      { id: '65', label: 'Age 65 (Standard)', value: 65, scores: { coast: 2 } },
      { id: '67', label: 'Age 67', value: 67, scores: { coast: 1 } },
      { id: '70', label: 'Age 70+', value: 70, scores: { coast: 1 } },
    ],
  },
  {
    id: 'timeline',
    text: "What is your target timeline to exit the system?",
    leftContext: "A shorter timeline requires aggressive inputs. Pick your reality.",
    supportsCustomInput: true,
    customInputConfig: {
      label: 'My target retirement age',
      unit: 'years old',
      placeholder: 'e.g. 45',
      min: 25,
      max: 75,
      step: 1,
    },
    options: [
      { id: '5_10_years', label: "5–10 years (Maximum effort)", value: 7, scores: { lean: 3, traditional: 2 } },
      { id: '10_15_years', label: "10–15 years (Moderate effort)", value: 12, scores: { traditional: 3, barista: 2, fat: 1 } },
      { id: '15_20_years', label: "15–20 years (Steady accumulation)", value: 17, scores: { traditional: 2, fat: 2, coast: 1 } },
      { id: 'flexible', label: "Flexible. I want the math to dictate the pace.", value: 25, scores: { coast: 3, barista: 3, traditional: 1 } },
    ],
  },
];
