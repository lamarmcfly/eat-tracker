// Onboarding State Management
const STORAGE_KEY = 'eat_onboarding_completed';

export const onboardingStorage = {
  /**
   * Check if user has completed onboarding
   */
  hasCompletedOnboarding(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  },

  /**
   * Mark onboarding as completed
   */
  markCompleted(): void {
    localStorage.setItem(STORAGE_KEY, 'true');
  },

  /**
   * Reset onboarding (for testing or user request)
   */
  resetOnboarding(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
