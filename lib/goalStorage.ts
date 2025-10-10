// Student Goal Settings Storage
import { StudentGoals } from './types';

const STORAGE_KEY = 'eat_student_goals';

// Internal storage format with dates as strings
interface StoredStudentGoals extends Omit<StudentGoals, 'step1Date' | 'step2ckDate' | 'step3Date'> {
  step1Date?: string;
  step2ckDate?: string;
  step3Date?: string;
}

export const goalStorage = {
  /**
   * Save student goals
   */
  saveGoals(goals: StudentGoals): void {
    const toStore: StoredStudentGoals = {
      ...goals,
      step1Date: goals.step1Date?.toISOString(),
      step2ckDate: goals.step2ckDate?.toISOString(),
      step3Date: goals.step3Date?.toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  },

  /**
   * Get student goals
   */
  getGoals(): StudentGoals | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    try {
      const stored: StoredStudentGoals = JSON.parse(data);
      return {
        ...stored,
        step1Date: stored.step1Date ? new Date(stored.step1Date) : undefined,
        step2ckDate: stored.step2ckDate ? new Date(stored.step2ckDate) : undefined,
        step3Date: stored.step3Date ? new Date(stored.step3Date) : undefined,
      };
    } catch {
      return null;
    }
  },

  /**
   * Clear goals
   */
  clearGoals(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
