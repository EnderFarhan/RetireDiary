import { StrategyId } from '@/data/questions';
import { QuizResult } from '@/lib/quiz-scoring';
import { FIREResult } from '@/lib/fire-engine';

export type { StrategyId, QuizResult, FIREResult };

export interface StoredQuizState {
  answers: Record<string, string>;
  result: QuizResult | null;
  selectedStrategy: StrategyId | null;
  fireResult: FIREResult | null;
  completedAt?: string;
}

export const STORAGE_KEY = 'fire_quiz_state';
