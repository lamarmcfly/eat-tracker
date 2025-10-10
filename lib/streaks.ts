// Streak & Gamification System
// Tracks daily logging streaks, XP, levels, and achievements

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string; // ISO date string
  totalXP: number;
  level: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  xpReward: number;
}

const STORAGE_KEY = 'eat_streak_data';

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  logError: 10,
  completeStudyBlock: 25,
  reviewError: 5,
  viewInsights: 2,
  consecutiveDay: 5, // Bonus for maintaining streak
  weeklyGoal: 50, // Bonus for logging 7 days in a row
};

/**
 * Level thresholds (XP required to reach each level)
 */
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5500,   // Level 8
  8000,   // Level 9
  11000,  // Level 10
  15000,  // Level 11
  20000,  // Level 12
  26000,  // Level 13
  33000,  // Level 14
  41000,  // Level 15
  50000,  // Level 16 (max for now)
];

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlockedAt'>> = {
  firstError: {
    id: 'first-error',
    title: 'First Step',
    description: 'Logged your first error',
    icon: '🎯',
    xpReward: 10,
  },
  streak7: {
    id: 'streak-7',
    title: 'Week Warrior',
    description: '7-day logging streak',
    icon: '🔥',
    xpReward: 50,
  },
  streak30: {
    id: 'streak-30',
    title: 'Streak Master',
    description: '30-day logging streak',
    icon: '🏆',
    xpReward: 200,
  },
  errors50: {
    id: 'errors-50',
    title: 'Error Hunter',
    description: 'Logged 50 errors',
    icon: '🎖️',
    xpReward: 100,
  },
  errors100: {
    id: 'errors-100',
    title: 'Centurion',
    description: 'Logged 100 errors',
    icon: '💯',
    xpReward: 250,
  },
  insightsViewer: {
    id: 'insights-viewer',
    title: 'Data Scientist',
    description: 'Viewed insights 25 times',
    icon: '📊',
    xpReward: 50,
  },
  planCompleter: {
    id: 'plan-completer',
    title: 'Study Savant',
    description: 'Completed 10 study blocks',
    icon: '📚',
    xpReward: 100,
  },
  earlyBird: {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Logged an error before 8 AM',
    icon: '🌅',
    xpReward: 25,
  },
  nightOwl: {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Logged an error after 10 PM',
    icon: '🦉',
    xpReward: 25,
  },
  levelUp5: {
    id: 'level-up-5',
    title: 'Rising Star',
    description: 'Reached Level 5',
    icon: '⭐',
    xpReward: 100,
  },
  levelUp10: {
    id: 'level-up-10',
    title: 'Elite Learner',
    description: 'Reached Level 10',
    icon: '🌟',
    xpReward: 250,
  },
};

/**
 * Get current streak data from localStorage
 */
export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return getDefaultStreakData();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return getDefaultStreakData();
  }

  try {
    const parsed = JSON.parse(stored) as StreakData;
    // Convert achievement dates back to Date objects
    parsed.achievements = parsed.achievements.map(a => ({
      ...a,
      unlockedAt: new Date(a.unlockedAt),
    }));
    return parsed;
  } catch {
    return getDefaultStreakData();
  }
}

/**
 * Save streak data to localStorage
 */
export function saveStreakData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Update streak when an error is logged
 */
export function updateStreakOnLog(): {
  data: StreakData;
  xpGained: number;
  levelUp: boolean;
  newAchievements: Achievement[];
} {
  const data = getStreakData();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let xpGained = XP_REWARDS.logError;
  const newAchievements: Achievement[] = [];

  // Check streak continuation
  if (data.lastLogDate === today) {
    // Already logged today - no streak update, but still award XP
  } else if (data.lastLogDate === yesterday) {
    // Continuing streak
    data.currentStreak++;
    xpGained += XP_REWARDS.consecutiveDay;

    // Check for streak achievements
    if (data.currentStreak === 7 && !hasAchievement(data, 'streak-7')) {
      const achievement = unlockAchievement('streak7');
      data.achievements.push(achievement);
      newAchievements.push(achievement);
      xpGained += achievement.xpReward;
    }
    if (data.currentStreak === 30 && !hasAchievement(data, 'streak-30')) {
      const achievement = unlockAchievement('streak30');
      data.achievements.push(achievement);
      newAchievements.push(achievement);
      xpGained += achievement.xpReward;
    }

    // Weekly goal bonus
    if (data.currentStreak % 7 === 0) {
      xpGained += XP_REWARDS.weeklyGoal;
    }
  } else {
    // Streak broken - start over
    data.currentStreak = 1;
  }

  // Update longest streak
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  // Update last log date
  data.lastLogDate = today;

  // Add XP
  const oldLevel = data.level;
  data.totalXP += xpGained;
  data.level = calculateLevel(data.totalXP);

  const levelUp = data.level > oldLevel;

  // Check for level-up achievements
  if (levelUp) {
    if (data.level === 5 && !hasAchievement(data, 'level-up-5')) {
      const achievement = unlockAchievement('levelUp5');
      data.achievements.push(achievement);
      newAchievements.push(achievement);
      data.totalXP += achievement.xpReward;
    }
    if (data.level === 10 && !hasAchievement(data, 'level-up-10')) {
      const achievement = unlockAchievement('levelUp10');
      data.achievements.push(achievement);
      newAchievements.push(achievement);
      data.totalXP += achievement.xpReward;
    }
  }

  saveStreakData(data);

  return { data, xpGained, levelUp, newAchievements };
}

/**
 * Award XP for actions other than logging
 */
export function awardXP(action: keyof typeof XP_REWARDS): {
  data: StreakData;
  xpGained: number;
  levelUp: boolean;
} {
  const data = getStreakData();
  const xpGained = XP_REWARDS[action];
  const oldLevel = data.level;

  data.totalXP += xpGained;
  data.level = calculateLevel(data.totalXP);

  const levelUp = data.level > oldLevel;

  saveStreakData(data);

  return { data, xpGained, levelUp };
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]; // Max level
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

/**
 * Get XP progress to next level (0-1)
 */
export function getXPProgress(totalXP: number, currentLevel: number): number {
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  return xpInCurrentLevel / xpNeededForLevel;
}

/**
 * Check if user has specific achievement
 */
function hasAchievement(data: StreakData, achievementId: string): boolean {
  return data.achievements.some(a => a.id === achievementId);
}

/**
 * Unlock achievement
 */
function unlockAchievement(achievementKey: keyof typeof ACHIEVEMENTS): Achievement {
  const template = ACHIEVEMENTS[achievementKey];
  return {
    ...template,
    unlockedAt: new Date(),
  };
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date string (YYYY-MM-DD)
 */
function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Default streak data for new users
 */
function getDefaultStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastLogDate: '',
    totalXP: 0,
    level: 1,
    achievements: [],
  };
}

/**
 * Check and award error count achievements
 */
export function checkErrorCountAchievements(errorCount: number): Achievement[] {
  const data = getStreakData();
  const newAchievements: Achievement[] = [];

  if (errorCount === 1 && !hasAchievement(data, 'first-error')) {
    const achievement = unlockAchievement('firstError');
    data.achievements.push(achievement);
    newAchievements.push(achievement);
    data.totalXP += achievement.xpReward;
  }

  if (errorCount === 50 && !hasAchievement(data, 'errors-50')) {
    const achievement = unlockAchievement('errors50');
    data.achievements.push(achievement);
    newAchievements.push(achievement);
    data.totalXP += achievement.xpReward;
  }

  if (errorCount === 100 && !hasAchievement(data, 'errors-100')) {
    const achievement = unlockAchievement('errors100');
    data.achievements.push(achievement);
    newAchievements.push(achievement);
    data.totalXP += achievement.xpReward;
  }

  // Check for time-based achievements
  const hour = new Date().getHours();
  if (hour < 8 && !hasAchievement(data, 'early-bird')) {
    const achievement = unlockAchievement('earlyBird');
    data.achievements.push(achievement);
    newAchievements.push(achievement);
    data.totalXP += achievement.xpReward;
  }
  if (hour >= 22 && !hasAchievement(data, 'night-owl')) {
    const achievement = unlockAchievement('nightOwl');
    data.achievements.push(achievement);
    newAchievements.push(achievement);
    data.totalXP += achievement.xpReward;
  }

  if (newAchievements.length > 0) {
    saveStreakData(data);
  }

  return newAchievements;
}
