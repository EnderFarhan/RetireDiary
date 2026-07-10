import { StrategyId } from './questions';

export interface FIREStrategy {
  id: StrategyId;
  name: string;
  emoji: string;
  tagline: string;
  /** 2-3 sentence plain-English definition for anyone */
  plainEnglish: string;
  deepDive: {
    whatItIs: string;
    whyItWorks: string;
    dayInTheLife: string;
    bestFor: string[];
    watchOutFor: string[];
  };
  typicalTimeline: string;
  savingsRate: string;
  fireNumberExample: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STRATEGIES: FIREStrategy[] = [
  {
    id: 'traditional',
    name: 'Traditional FIRE',
    emoji: '🔥',
    tagline: 'The baseline. Replace your income. Zero work required.',
    plainEnglish:
      "You save half your paycheck, dump it into low-cost index funds, and wait until you have 25 times your annual spend. Then you walk away. Forever.",
    deepDive: {
      whatItIs:
        "The classic approach. Cut expenses, maximize your savings rate (50–70%), and buy low-cost index funds. Once you hit 25x your annual expenses, the 4% rule takes over. You are done.",
      whyItWorks:
        "The math is undeniable. At a 50% savings rate, you buy your freedom in 17 years, regardless of income. At 70%, it takes 8-9 years. The 4% rule ensures your portfolio outlives you.",
      dayInTheLife:
        "You own your time. You live off the dividends and growth of your portfolio. The asset does the work so you don't have to.",
      bestFor: [
        'People with moderate-to-high income',
        'Those willing to cut lifestyle significantly during accumulation',
        'Anyone who wants a clean break from work with no strings attached',
        'People 10–20 years from their target retirement age',
      ],
      watchOutFor: [
        'Requires significant lifestyle sacrifice during the saving phase',
        "The 4% rule isn't a guarantee — market crashes can hurt",
        'Healthcare before 65 is a real cost to plan for',
        'Sequence of returns risk in early retirement',
      ],
    },
    typicalTimeline: '10–17 years',
    savingsRate: '50%–70%',
    fireNumberExample: '$1.25M for $50k/yr spending',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'lean',
    name: 'Lean FIRE',
    emoji: '🥬',
    tagline: 'Minimize inputs. Exit the rat race in record time.',
    plainEnglish:
      "Same math, lower inputs. You keep your spending under $40k a year. Because your target is smaller, you get there faster. This is the speedrun to freedom.",
    deepDive: {
      whatItIs:
        'A commitment to low inputs. You set a lean budget (under $40k/yr), multiply by 25, and sprint toward it with a 60–80%+ savings rate.',
      whyItWorks:
        "A $40k burn rate only requires $1M in assets. That is a highly achievable target. At a 70% savings rate, you can hit this in under a decade.",
      dayInTheLife:
        'You trade luxury for time. You optimize for free entertainment and low cost of living. You have less stuff, but 100% control over your time.',
      bestFor: [
        "Natural minimalists who don't need much to be happy",
        'People who prioritize time over luxury',
        'Those who want the fastest possible path out',
        'Anyone willing to live in a low cost-of-living area',
      ],
      watchOutFor: [
        'Very little margin for unexpected expenses',
        'Can feel restrictive if your values change later',
        'Healthcare and inflation can erode a lean budget faster',
        'Social costs of living very differently from peers',
      ],
    },
    typicalTimeline: '5–12 years',
    savingsRate: '60%–80%+',
    fireNumberExample: '$1M for $40k/yr spending',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'fat',
    name: 'Fat FIRE',
    emoji: '🏖️',
    tagline: 'Maximum leverage. Abundant lifestyle.',
    plainEnglish:
      "You refuse to compromise. You want travel, luxury, and zero budget anxiety. It requires a massive portfolio ($2.5M+), meaning it takes longer. But you never downgrade your lifestyle.",
    deepDive: {
      whatItIs:
        'Fat FIRE is for high earners who want maximum leverage. Your annual burn rate is $100k+, requiring a $2.5M–$7M+ portfolio. It demands high income and ruthless savings discipline.',
      whyItWorks:
        "The math scales. If you burn $120k/year, you need $3M. It takes 15–20 years of high income and aggressive investing. The ROI is absolute freedom with absolute abundance.",
      dayInTheLife:
        "Zero financial constraints. First-class flights, premium real estate, high-end experiences. You live your ideal life, fully funded by your assets.",
      bestFor: [
        'High earners ($150k+/yr) who save well',
        "People who genuinely enjoy their lifestyle and won't compromise it",
        'Those with longer timelines who can be patient',
        "Anyone where the 'fat' lifestyle is the whole point",
      ],
      watchOutFor: [
        'Requires very high income or a very long timeline',
        'Lifestyle inflation is a real risk during accumulation',
        'The number can feel impossibly large early on',
        "Don't mistake this for 'spend more in retirement' — you need to actually save enough to get there first",
      ],
    },
    typicalTimeline: '15–25+ years',
    savingsRate: '40%–60%',
    fireNumberExample: '$3M for $120k/yr spending',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'coast',
    name: 'Coast FIRE',
    emoji: '🏄',
    tagline: 'Front-load the inputs. Let compound interest do the heavy lifting.',
    plainEnglish:
      "You invest aggressively early on until you hit your Coast Number. Then you stop saving. Compound interest does the rest. You downshift to a low-stress job just to cover your daily burn rate.",
    deepDive: {
      whatItIs:
        "Phase 1: Sprint until you hit your Coast Number (the exact amount that will compound to your retirement goal by 65 without another dollar added). Phase 2: Coast. Work a low-stress job that just pays the bills.",
      whyItWorks:
        "Leverage time. If you hit a Coast Number of $117k at age 28, it compounds to $1.5M by 65 at 7% growth. You gave the asset 37 years to do the work for you.",
      dayInTheLife:
        "You work, but on your terms. You take a job that covers expenses but eliminates the stress. The pressure is gone because your future is mathematically secured.",
      bestFor: [
        'Younger people (under 35) who can front-load savings',
        'Those who want to reduce work stress NOW without quitting',
        'People open to working a less lucrative but more fulfilling job',
        'Anyone who already has a solid investment base built',
      ],
      watchOutFor: [
        'You still need to work and cover daily expenses for decades',
        'Market downturns could delay your coast timeline',
        'Requires discipline not to dip into the invested coast number',
        'Healthcare costs before 65 still need to be funded by work',
      ],
    },
    typicalTimeline: '3–10 years to hit Coast Number, then work until ~65',
    savingsRate: '50%+ (phase 1 only)',
    fireNumberExample: 'Coast Number ~$117k at age 28 → grows to $1.5M by 65',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'barista',
    name: 'Barista FIRE',
    emoji: '☕',
    tagline: 'Downshift. Cover the baseline, eliminate the stress.',
    plainEnglish:
      "Your investments cover most of your bills. You work a low-stress part-time gig to cover the gap. You buy back your time without needing the massive portfolio.",
    deepDive: {
      whatItIs:
        "Your portfolio covers the majority of your burn rate. You work a low-stress part-time job (for income or health benefits) to cover the rest. You exit the corporate grind years earlier.",
      whyItWorks:
        'If you burn $48k/year but earn $18k part-time, your portfolio only needs to generate $30k/year. That means a $750k portfolio instead of $1.2M. You shave a decade off your timeline.',
      dayInTheLife:
        "You work 20 hours a week doing something low-stress. The rest of your time is yours. You have the leverage of a massive safety net and the freedom to avoid the 9-to-5 grind.",
      bestFor: [
        'People who are burnt out NOW and need an exit sooner',
        'Those who genuinely enjoy part-time work or passion projects',
        'Anyone who needs employer health insurance before 65',
        'People who want flexibility without waiting for the full FIRE number',
      ],
      watchOutFor: [
        "Still dependent on some income — market crashes hurt more",
        "Part-time income isn't guaranteed",
        "Need to be careful about lifestyle inflation once you 'semi-retire'",
        "Healthcare coverage gaps can be expensive if part-time job doesn't offer it",
      ],
    },
    typicalTimeline: '7–15 years',
    savingsRate: '40%–60%',
    fireNumberExample: '$750k if you spend $48k/yr and earn $18k part-time',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
];

export const STRATEGY_MAP: Record<StrategyId, FIREStrategy> = Object.fromEntries(
  STRATEGIES.map((s) => [s.id, s])
) as Record<StrategyId, FIREStrategy>;
