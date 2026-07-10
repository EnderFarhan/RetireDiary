export interface SupplementaryQuestionOption {
  id: string;
  label: string;
  requiresCustomInput?: boolean;
}

export interface SupplementaryQuestion {
  id: string;
  text: string;
  leftContext: string;
  options: SupplementaryQuestionOption[];
  supportsCustomInput?: boolean;
  customInputConfig?: {
    label: string;
    unit: string;
    placeholder: string;
    type?: 'number' | 'text';
  };
  condition?: (originalAnswers: Record<string, string>) => boolean;
}

export const SUPPLEMENTARY_QUESTIONS: SupplementaryQuestion[] = [
  {
    id: 'employer_match',
    text: "Does your employer offer a 401(k) match?",
    leftContext: "This is free money. Leaving it on the table is mathematically indefensible. Your first dollars go here.",
    options: [
      { id: 'yes_match', label: 'Yes. I get a match.', requiresCustomInput: true },
      { id: 'no_match', label: 'No match. Zero.' },
      { id: 'self_employed', label: 'Self-employed. I own the business.' },
    ],
    supportsCustomInput: true,
    customInputConfig: {
      label: 'What is the exact match percentage?',
      unit: '%',
      placeholder: 'e.g., 4',
      type: 'number'
    }
  },
  {
    id: 'hdhp_eligibility',
    text: "Do you have access to a High-Deductible Health Plan (HDHP)?",
    leftContext: "This unlocks the HSA. It is the only triple-tax-advantaged account in the U.S. code. Tax-free in, tax-free growth, tax-free out. If you have it, we use it.",
    condition: (answers) => answers['country'] === 'us',
    options: [
      { id: 'hdhp_enrolled', label: 'Yes. Currently enrolled.' },
      { id: 'hdhp_eligible', label: 'Eligible, but not enrolled.' },
      { id: 'not_eligible', label: 'No. Standard plan.' },
      { id: 'dont_know', label: "I don't know." },
    ]
  },
  {
    id: 'tfsa_status',
    text: "Have you been a Canadian resident since before 2009?",
    leftContext: "TFSA room starts at age 18. If you've been a resident since 2009, you have massive contribution room. If you immigrated recently, overcontributing triggers a brutal 1% per month penalty. Get this right.",
    condition: (answers) => answers['country'] === 'canada',
    options: [
      { id: 'since_2009', label: 'Yes. Resident since 2009.' },
      { id: 'recent_immigrant', label: 'No. Immigrated later.', requiresCustomInput: true },
    ],
    supportsCustomInput: true,
    customInputConfig: {
      label: 'What year did you become a Canadian resident?',
      unit: 'Year',
      placeholder: 'e.g., 2018',
      type: 'number'
    }
  },
  {
    id: 'stranded_529',
    text: "Do you have unused 529 College Savings?",
    leftContext: "The new tax code allows you to roll $35,000 of unused 529 cash directly into a Roth IRA. Tax-free. Penalty-free. It's a loophole we will exploit.",
    condition: (answers) => answers['country'] === 'us',
    options: [
      { id: 'yes_529', label: 'Yes. Unused funds.' },
      { id: 'no_529', label: "No." },
    ]
  },
  {
    id: 'highest_debt_rate',
    text: "What is the interest rate on your most expensive debt?",
    leftContext: "We use a strict 5% threshold. Debt over 5% gets liquidated immediately. Debt under 5% gets minimum payments while we invest the rest for positive arbitrage. It's just math.",
    options: [
      { id: 'no_debt', label: 'Zero non-mortgage debt.' },
      { id: 'under_5', label: 'Low interest (under 5%).', requiresCustomInput: true },
      { id: 'over_5', label: 'High interest (over 5%).', requiresCustomInput: true },
    ],
    supportsCustomInput: true,
    customInputConfig: {
      label: 'What is the exact interest rate on your highest debt?',
      unit: '%',
      placeholder: 'e.g., 22.5',
      type: 'number'
    }
  },
];
