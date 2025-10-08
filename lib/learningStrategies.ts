// Evidence-based learning strategies for medical education
// Based on cognitive science research and medical education literature

import { ErrorLog, ErrorType, CognitiveLevel } from './types';

export type LearningStrategy =
  | 'active-recall'      // Retrieval practice
  | 'spaced-repetition'  // Distributed practice
  | 'interleaving'       // Mixed practice
  | 'dual-coding'        // Visual + verbal
  | 'elaboration'        // Teach-back, self-explanation
  | 'practice-testing'   // Timed questions
  | 'concrete-examples'  // Case-based learning
  | 'metacognitive';     // Reflection on errors

export type TimeFrame = 'today' | 'tomorrow' | '48h' | '1-week' | '2-weeks';

export interface Recommendation {
  id: string;
  strategy: LearningStrategy;
  priority: number; // 1-5 (5 = highest)
  systemId?: string;
  systemName: string;
  topic: string;

  // Concrete action
  action: string; // e.g., "10-Q retrieval block in Cardio Phys"
  timeFrame: TimeFrame;
  duration: number; // minutes

  // Why this recommendation
  rationale: string;

  // Supporting data
  errorCount: number;
  recentErrors: number;
  cognitiveLevel?: CognitiveLevel;
}

/**
 * Evidence-based learning technique mappings
 *
 * Sources:
 * - Dunlosky et al. (2013) "Improving Students' Learning With Effective Learning Techniques"
 * - Roediger & Butler (2011) "The critical role of retrieval practice in long-term retention"
 * - Karpicke & Blunt (2011) "Retrieval practice produces more learning than elaborative studying"
 * - Kornell & Bjork (2008) "Learning concepts and categories: Is spacing the 'enemy of induction'?"
 */

interface StrategyProfile {
  name: string;
  description: string;
  evidenceStrength: 'high' | 'moderate' | 'low';
  bestFor: {
    errorTypes: ErrorType[];
    cognitiveLevel?: CognitiveLevel;
    timeToExam?: 'urgent' | 'near' | 'far';
  };
  templates: {
    action: string;
    duration: number;
    timeFrame: TimeFrame;
  }[];
}

export const LEARNING_STRATEGIES: Record<LearningStrategy, StrategyProfile> = {
  'active-recall': {
    name: 'Active Recall',
    description: 'Retrieval practice without looking at notes',
    evidenceStrength: 'high',
    bestFor: {
      errorTypes: ['knowledge', 'reasoning'],
      cognitiveLevel: 'first-order',
    },
    templates: [
      { action: '10-Q retrieval block', duration: 15, timeFrame: 'tomorrow' },
      { action: '5-Q flash card session', duration: 10, timeFrame: 'today' },
      { action: '15-Q timed retrieval', duration: 20, timeFrame: '48h' },
      { action: 'Write key facts from memory', duration: 10, timeFrame: 'today' },
    ],
  },
  'spaced-repetition': {
    name: 'Spaced Repetition',
    description: 'Review at increasing intervals',
    evidenceStrength: 'high',
    bestFor: {
      errorTypes: ['knowledge'],
      timeToExam: 'far',
    },
    templates: [
      { action: 'Quick review (Day 1, 3, 7)', duration: 10, timeFrame: 'tomorrow' },
      { action: '5-min spaced review', duration: 5, timeFrame: '1-week' },
      { action: 'Flash card review', duration: 10, timeFrame: '48h' },
    ],
  },
  'interleaving': {
    name: 'Interleaving',
    description: 'Mix different topics in practice',
    evidenceStrength: 'high',
    bestFor: {
      errorTypes: ['reasoning'],
      cognitiveLevel: 'higher-order',
    },
    templates: [
      { action: 'Mixed topic practice set (3 systems)', duration: 25, timeFrame: 'tomorrow' },
      { action: 'Interleaved Q-bank (20Q, random)', duration: 30, timeFrame: 'today' },
      { action: 'Cross-system comparison exercise', duration: 15, timeFrame: '48h' },
    ],
  },
  'dual-coding': {
    name: 'Dual Coding',
    description: 'Combine visual and verbal learning',
    evidenceStrength: 'moderate',
    bestFor: {
      errorTypes: ['knowledge', 'reasoning'],
    },
    templates: [
      { action: 'Draw concept map from memory', duration: 15, timeFrame: 'today' },
      { action: 'Sketch pathophysiology diagram', duration: 10, timeFrame: 'tomorrow' },
      { action: 'Label anatomy image (timed)', duration: 10, timeFrame: '48h' },
    ],
  },
  'elaboration': {
    name: 'Elaboration',
    description: 'Explain concepts in your own words',
    evidenceStrength: 'moderate',
    bestFor: {
      errorTypes: ['reasoning'],
      cognitiveLevel: 'higher-order',
    },
    templates: [
      { action: '5-min teach-back (pretend patient)', duration: 5, timeFrame: '48h' },
      { action: 'Explain mechanism aloud', duration: 10, timeFrame: 'tomorrow' },
      { action: 'Write 1-para explanation', duration: 10, timeFrame: 'today' },
      { action: 'Compare/contrast 2 conditions', duration: 15, timeFrame: 'tomorrow' },
    ],
  },
  'practice-testing': {
    name: 'Practice Testing',
    description: 'Timed questions under exam conditions',
    evidenceStrength: 'high',
    bestFor: {
      errorTypes: ['time', 'process'],
      timeToExam: 'urgent',
    },
    templates: [
      { action: 'Timed Q-bank block (20Q, 30min)', duration: 30, timeFrame: 'tomorrow' },
      { action: '10Q timed mini-block', duration: 15, timeFrame: 'today' },
      { action: 'Full practice exam (4hr)', duration: 240, timeFrame: '1-week' },
    ],
  },
  'concrete-examples': {
    name: 'Concrete Examples',
    description: 'Case-based learning with real scenarios',
    evidenceStrength: 'moderate',
    bestFor: {
      errorTypes: ['reasoning'],
      cognitiveLevel: 'higher-order',
    },
    templates: [
      { action: 'Review 3 clinical cases', duration: 20, timeFrame: 'tomorrow' },
      { action: 'Write differential for case', duration: 15, timeFrame: 'today' },
      { action: 'Work through case vignette', duration: 10, timeFrame: '48h' },
    ],
  },
  'metacognitive': {
    name: 'Metacognitive Reflection',
    description: 'Analyze errors and identify patterns',
    evidenceStrength: 'moderate',
    bestFor: {
      errorTypes: ['process'],
    },
    templates: [
      { action: 'Review last 5 errors (why wrong?)', duration: 15, timeFrame: 'today' },
      { action: 'Error pattern analysis session', duration: 20, timeFrame: 'tomorrow' },
      { action: 'Confidence calibration check', duration: 10, timeFrame: '48h' },
    ],
  },
};

/**
 * Calculate time urgency based on exam date
 */
export function getTimeUrgency(examDate?: Date): 'urgent' | 'near' | 'far' {
  if (!examDate) return 'far';

  const now = new Date();
  const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 14) return 'urgent';
  if (daysUntil <= 60) return 'near';
  return 'far';
}

/**
 * Check for confidence mismatch (overconfident or underconfident)
 */
export function hasConfidenceMismatch(errors: ErrorLog[]): {
  overconfident: number; // Confident but wrong
  underconfident: number; // Guessed but could have known
} {
  let overconfident = 0;
  let underconfident = 0;

  errors.forEach(error => {
    // Overconfident: confident/certain but knowledge/reasoning error
    if ((error.confidence === 'confident' || error.confidence === 'certain') &&
        (error.errorType === 'knowledge' || error.errorType === 'reasoning')) {
      overconfident++;
    }

    // Underconfident: guessed but it was a process/time error (knew content)
    if (error.confidence === 'guessed' &&
        (error.errorType === 'process' || error.errorType === 'time')) {
      underconfident++;
    }
  });

  return { overconfident, underconfident };
}

/**
 * Detect repeat errors (same topic within time window)
 */
export function getRepeatedErrors(errors: ErrorLog[], daysWindow: number = 7): Map<string, ErrorLog[]> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - daysWindow * 24 * 60 * 60 * 1000);
  const recentErrors = errors.filter(e => new Date(e.timestamp) >= cutoff);

  const topicMap = new Map<string, ErrorLog[]>();

  recentErrors.forEach(error => {
    const key = `${error.system}:${error.topic}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, []);
    }
    topicMap.get(key)!.push(error);
  });

  // Only return topics with 2+ errors
  return new Map(
    Array.from(topicMap.entries()).filter(([_, errs]) => errs.length >= 2)
  );
}
