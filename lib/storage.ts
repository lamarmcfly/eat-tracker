// Privacy-first local storage utilities
import { ErrorLog, StudyPlan } from './types';

const STORAGE_KEYS = {
  ERRORS: 'eat-tracker-errors',
  PLAN: 'eat-tracker-plan',
} as const;

export const storage = {
  // Error logs
  getErrors: (): ErrorLog[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ERRORS);
    if (!data) return [];
    return JSON.parse(data, (key, value) => {
      if (key === 'timestamp') return new Date(value);
      return value;
    });
  },

  saveError: (error: ErrorLog): void => {
    if (typeof window === 'undefined') return;
    const errors = storage.getErrors();
    errors.push(error);
    localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(errors));
  },

  deleteError: (id: string): void => {
    if (typeof window === 'undefined') return;
    const errors = storage.getErrors().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(errors));
  },

  // Study plan
  getPlan: (): StudyPlan | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (!data) return null;
    return JSON.parse(data, (key, value) => {
      if (key === 'generatedAt' || key === 'weekStart') return new Date(value);
      return value;
    });
  },

  savePlan: (plan: StudyPlan): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
