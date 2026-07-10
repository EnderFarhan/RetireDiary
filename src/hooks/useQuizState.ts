'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Answers, calculateQuizResults, QuizResult } from '@/lib/quiz-scoring';
import { StrategyId } from '@/data/questions';
import { FIREResult, calculateFIRE } from '@/lib/fire-engine';
import { STORAGE_KEY, StoredQuizState } from '@/types';

const EMPTY_STATE: StoredQuizState = {
  answers: {},
  result: null,
  selectedStrategy: null,
  fireResult: null,
};

function loadFromStorage(): StoredQuizState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return JSON.parse(raw) as StoredQuizState;
  } catch {
    return EMPTY_STATE;
  }
}

function saveToStorage(state: StoredQuizState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage not available
  }
}

interface QuizContextValue {
  hydrated: boolean;
  answers: Answers;
  result: QuizResult | null;
  selectedStrategy: StrategyId | null;
  fireResult: FIREResult | null;
  setAnswer: (questionId: string, optionId: string) => void;
  submitQuiz: (answers: Answers) => QuizResult;
  selectStrategy: (strategy: StrategyId) => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredQuizState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  const setAnswer = useCallback((questionId: string, optionId: string) => {
    setState((prev) => {
      const next = { ...prev, answers: { ...prev.answers, [questionId]: optionId } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const submitQuiz = useCallback((answers: Answers): QuizResult => {
    const result = calculateQuizResults(answers);
    setState((prev) => {
      const next = { ...prev, answers, result, completedAt: new Date().toISOString() };
      saveToStorage(next);
      return next;
    });
    return result;
  }, []);

  const selectStrategy = useCallback(
    (strategy: StrategyId) => {
      const result = state.result;
      if (!result) return;

      const fireResult = calculateFIRE({
        annualSpending: result.userInputs.annualSpending,
        annualIncome: result.userInputs.annualIncome,
        currentSavings: result.userInputs.currentSavings,
        age: result.userInputs.age,
        strategy,
      });

      setState((prev) => {
        const next = { ...prev, selectedStrategy: strategy, fireResult };
        saveToStorage(next);
        return next;
      });
    },
    [state.result]
  );

  const resetQuiz = useCallback(() => {
    setState(EMPTY_STATE);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('fire_quiz_custom_values');
    }
  }, []);

  return React.createElement(
    QuizContext.Provider,
    {
      value: {
        hydrated,
        answers: state.answers,
        result: state.result,
        selectedStrategy: state.selectedStrategy,
        fireResult: state.fireResult,
        setAnswer,
        submitQuiz,
        selectStrategy,
        resetQuiz,
      }
    },
    children
  );
}

export function useQuizState() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuizState must be used within a QuizProvider');
  }
  return context;
}
