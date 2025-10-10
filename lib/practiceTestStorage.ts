// Practice Test Storage & Retrieval
import { PracticeTest, ExamTarget } from './types';

const STORAGE_KEY = 'eat_practice_tests';

// Internal storage format with date as string
interface StoredPracticeTest extends Omit<PracticeTest, 'date'> {
  date: string;
}

export const practiceTestStorage = {
  /**
   * Save a practice test result
   */
  saveTest(test: PracticeTest): void {
    const stored = this.getStoredTests();

    // Convert Date objects to ISO strings for storage
    const testToStore: StoredPracticeTest = {
      ...test,
      date: test.date.toISOString(),
    };

    stored.push(testToStore);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  },

  /**
   * Get stored tests (internal format with string dates)
   */
  getStoredTests(): StoredPracticeTest[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  /**
   * Get all practice tests (with Date objects)
   */
  getTests(): PracticeTest[] {
    const stored = this.getStoredTests();
    return stored.map((t) => ({
      ...t,
      date: new Date(t.date),
    }));
  },

  /**
   * Get tests filtered by exam target
   */
  getTestsByExam(examTarget: ExamTarget): PracticeTest[] {
    return this.getTests().filter(t => t.examTarget === examTarget);
  },

  /**
   * Get tests sorted by date (most recent first)
   */
  getTestsSorted(): PracticeTest[] {
    return this.getTests().sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  /**
   * Delete a practice test
   */
  deleteTest(id: string): void {
    const stored = this.getStoredTests().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  },

  /**
   * Update a practice test
   */
  updateTest(id: string, updates: Partial<PracticeTest>): void {
    const stored = this.getStoredTests();
    const index = stored.findIndex(t => t.id === id);

    if (index !== -1) {
      const updatedTest: StoredPracticeTest = {
        ...stored[index],
        ...updates,
        date: updates.date ? updates.date.toISOString() : stored[index].date,
      };
      stored[index] = updatedTest;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  },

  /**
   * Clear all practice tests (for testing/reset)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
