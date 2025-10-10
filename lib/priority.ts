// Multi-factor priority scoring engine
import { ErrorLog, TopicPattern, ErrorType } from './types';
import { getExamWeight, getExamWeightFromLegacySystem, isHighYield } from './examWeights';
import { confidenceToPercent } from './confidenceMigration';

export type UrgencyLevel = 'urgent' | 'high' | 'moderate' | 'low';

export interface PriorityFactors {
  frequency: number;        // 0-1: normalized error count
  examWeight: number;       // 0-1: official USMLE weight
  recency: number;          // 0-1: how recently struggled
  lowConfidence: number;    // 0-1: proportion of low-confidence errors
  timePressure: number;     // 0-1: proportion of time-related errors
  qbankDifficulty: number;  // 0-1: Q-bank difficulty (harder = higher priority)
  performanceGap: number;   // 0-1: below national average (gap = higher priority)
}

export interface PriorityScore {
  topic: string;
  system: string;
  systemId?: string;
  score: number;          // 0-100 composite score
  rank: number;           // 1, 2, 3...
  urgency: UrgencyLevel;

  // Plain-language reasoning
  reasons: string[];      // ["frequent", "high-yield", "recent"]
  reasonChip: string;     // "frequent + high-yield + recent"

  // Factor breakdown (for debugging/testing)
  factors: PriorityFactors;
}

// Enhanced scoring weights (sum to 1.0)
const WEIGHTS = {
  FREQUENCY: 0.25,           // Slightly reduced from 0.30
  EXAM_WEIGHT: 0.20,         // Slightly reduced from 0.25
  RECENCY: 0.15,             // Reduced from 0.20
  LOW_CONFIDENCE: 0.15,      // Same
  TIME_PRESSURE: 0.10,       // Same
  QBANK_DIFFICULTY: 0.10,    // NEW: Hard questions wrong = urgent
  PERFORMANCE_GAP: 0.05,     // NEW: You vs national average
} as const;

// Q-Bank predictive value weights
// Higher weight = more predictive of exam performance
const QBANK_WEIGHTS: Record<string, number> = {
  uworld: 1.0,      // Gold standard - highest correlation with Step scores
  nbme: 0.95,       // Official NBME content - near-perfect exam simulation
  amboss: 0.85,     // Strong clinical vignettes and explanations
  kaplan: 0.6,      // More basic, less Step-like
  rx: 0.5,          // Entry level, good for fundamentals
  other: 0.4,       // Unknown quality/relevance
};

/**
 * Calculate frequency score (0-1) based on error count
 * Uses logarithmic scaling to prevent outliers from dominating
 */
function calculateFrequencyScore(errorCount: number, maxErrors: number): number {
  if (maxErrors === 0) return 0;
  // Log scale: 1 error = 0.1, 5 errors = 0.5, 10+ errors = 0.9+
  return Math.min(1, Math.log10(errorCount + 1) / Math.log10(maxErrors + 1));
}

/**
 * Calculate recency score (0-1) based on days since last error
 * Recent errors score higher
 */
function calculateRecencyScore(daysSince: number): number {
  // 0 days = 1.0, 7 days = 0.5, 30 days = 0.1
  if (daysSince === 0) return 1.0;
  if (daysSince >= 30) return 0.1;

  // Exponential decay: e^(-0.1 * days)
  return Math.exp(-0.1 * daysSince);
}

/**
 * Calculate low-confidence score (0-1) based on error confidence levels
 * Higher score = more guessing/eliminating
 */
function calculateLowConfidenceScore(pattern: TopicPattern, errors: ErrorLog[]): number {
  const topicErrors = errors.filter(e =>
    e.system === pattern.system && e.topic === pattern.topic
  );

  if (topicErrors.length === 0) return 0;

  const sum = topicErrors.reduce((acc, e) => acc + (1 - (confidenceToPercent(e.confidence) / 100)), 0);

  return sum / topicErrors.length;
}

/**
 * Calculate time-pressure score (0-1) based on time-related errors
 */
function calculateTimePressureScore(pattern: TopicPattern): number {
  const timeErrors = pattern.errorTypes.time;
  const totalErrors = pattern.errorCount;

  if (totalErrors === 0) return 0;
  return timeErrors / totalErrors;
}

/**
 * Calculate Q-bank difficulty score (0-1) based on national % correct
 * Lower national % = harder question = higher priority when you get it wrong
 */
function calculateQBankDifficultyScore(pattern: TopicPattern, errors: ErrorLog[]): number {
  const topicErrors = errors.filter(e =>
    e.system === pattern.system && e.topic === pattern.topic
  );

  const errorsWithPercentCorrect = topicErrors.filter(
    e => e.externalQuestion?.percentCorrect !== undefined
  );

  if (errorsWithPercentCorrect.length === 0) return 0;

  // Calculate average difficulty (inverse of national % correct)
  const avgPercentCorrect = errorsWithPercentCorrect.reduce((sum, e) =>
    sum + (e.externalQuestion?.percentCorrect || 0), 0
  ) / errorsWithPercentCorrect.length;

  // Invert: 25% national correct (hard) → 0.75 score (high priority)
  //         75% national correct (easy) → 0.25 score (lower priority)
  return 1 - (avgPercentCorrect / 100);
}

/**
 * Calculate performance gap score (0-1) based on you vs national average
 * If 75% of people get it right and you got it wrong → you're in bottom 25%
 * Higher national % = bigger gap = higher priority
 */
function calculatePerformanceGapScore(pattern: TopicPattern, errors: ErrorLog[]): number {
  const topicErrors = errors.filter(e =>
    e.system === pattern.system && e.topic === pattern.topic
  );

  const errorsWithPercentCorrect = topicErrors.filter(
    e => e.externalQuestion?.percentCorrect !== undefined
  );

  if (errorsWithPercentCorrect.length === 0) return 0;

  // Calculate average national performance where student failed
  const avgPercentCorrect = errorsWithPercentCorrect.reduce((sum, e) =>
    sum + (e.externalQuestion?.percentCorrect || 0), 0
  ) / errorsWithPercentCorrect.length;

  // If 75% got it right and you got it wrong → 0.75 score (you're behind)
  // If 25% got it right and you got it wrong → 0.25 score (everyone struggles)
  return avgPercentCorrect / 100;
}

/**
 * Calculate composite priority score for a topic pattern
 */
export function calculatePriorityScore(
  pattern: TopicPattern,
  allErrors: ErrorLog[],
  maxErrorCount: number
): PriorityScore {
  const daysSince = Math.floor(
    (Date.now() - pattern.lastSeen.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate individual factors (all 0-1)
  const factors: PriorityFactors = {
    frequency: calculateFrequencyScore(pattern.errorCount, maxErrorCount),
    examWeight: pattern.systemId
      ? getExamWeight(pattern.systemId)
      : getExamWeightFromLegacySystem(pattern.system),
    recency: calculateRecencyScore(daysSince),
    lowConfidence: calculateLowConfidenceScore(pattern, allErrors),
    timePressure: calculateTimePressureScore(pattern),
    qbankDifficulty: calculateQBankDifficultyScore(pattern, allErrors),
    performanceGap: calculatePerformanceGapScore(pattern, allErrors),
  };

  // Calculate weighted composite score (0-100)
  let score = (
    factors.frequency * WEIGHTS.FREQUENCY +
    factors.examWeight * WEIGHTS.EXAM_WEIGHT +
    factors.recency * WEIGHTS.RECENCY +
    factors.lowConfidence * WEIGHTS.LOW_CONFIDENCE +
    factors.timePressure * WEIGHTS.TIME_PRESSURE +
    factors.qbankDifficulty * WEIGHTS.QBANK_DIFFICULTY +
    factors.performanceGap * WEIGHTS.PERFORMANCE_GAP
  ) * 100;

  // Apply Q-Bank weighting multiplier
  // Errors from high-quality Q-banks (UWorld, NBME) get prioritized
  const topicErrors = allErrors.filter(e =>
    e.system === pattern.system && e.topic === pattern.topic
  );

  if (topicErrors.length > 0 && topicErrors.some(e => e.externalQuestion?.questionBank)) {
    // Calculate average Q-bank quality for this topic
    const qbankErrors = topicErrors.filter(e => e.externalQuestion?.questionBank);
    const avgQBankWeight = qbankErrors.reduce((sum, e) => {
      const qbank = e.externalQuestion?.questionBank || 'other';
      return sum + (QBANK_WEIGHTS[qbank] || 0.4);
    }, 0) / qbankErrors.length;

    // Apply multiplier (0.4 to 1.0 range means -60% to no change)
    score *= avgQBankWeight;
  }

  // Determine urgency level
  const urgency: UrgencyLevel =
    score >= 80 ? 'urgent' :
    score >= 60 ? 'high' :
    score >= 40 ? 'moderate' : 'low';

  // Generate plain-language reasons
  const reasons = generateReasons(factors, pattern, daysSince);
  const reasonChip = reasons.slice(0, 3).join(' + ');

  return {
    topic: pattern.topic,
    system: pattern.system,
    systemId: pattern.systemId,
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    rank: 0, // Will be assigned after sorting
    urgency,
    reasons,
    reasonChip,
    factors,
  };
}

/**
 * Generate human-readable reasons for priority
 * Returns ordered list of contributing factors
 */
function generateReasons(
  factors: PriorityFactors,
  pattern: TopicPattern,
  daysSince: number
): string[] {
  const reasons: string[] = [];

  // Frequency
  if (factors.frequency > 0.7) {
    reasons.push('frequent');
  } else if (factors.frequency > 0.4) {
    reasons.push('moderate errors');
  }

  // Exam weight
  if (factors.examWeight > 0.7) {
    reasons.push('high-yield');
  } else if (factors.examWeight > 0.4) {
    reasons.push('exam-relevant');
  }

  // Recency
  if (daysSince <= 1) {
    reasons.push('very recent');
  } else if (daysSince <= 3) {
    reasons.push('recent');
  }

  // Low confidence
  if (factors.lowConfidence > 0.6) {
    reasons.push('low confidence');
  } else if (factors.lowConfidence > 0.4) {
    reasons.push('guessing often');
  }

  // Time pressure
  if (factors.timePressure > 0.5) {
    reasons.push('time pressure');
  } else if (factors.timePressure > 0.3) {
    reasons.push('timing issues');
  }

  // Q-Bank difficulty
  if (factors.qbankDifficulty > 0.7) {
    reasons.push('hard question');
  } else if (factors.qbankDifficulty > 0.5) {
    reasons.push('challenging');
  }

  // Performance gap
  if (factors.performanceGap > 0.7) {
    reasons.push('below average');
  } else if (factors.performanceGap > 0.5) {
    reasons.push('gap exists');
  }

  // Dominant error type (if significant)
  const dominantError = getDominantErrorType(pattern);
  if (dominantError.proportion > 0.6) {
    if (dominantError.type === 'knowledge') {
      reasons.push('knowledge gap');
    } else if (dominantError.type === 'reasoning') {
      reasons.push('application struggles');
    } else if (dominantError.type === 'process') {
      reasons.push('strategy needed');
    }
  }

  return reasons;
}

/**
 * Get the dominant error type for a pattern
 */
function getDominantErrorType(pattern: TopicPattern): {
  type: ErrorType;
  proportion: number;
} {
  const entries = Object.entries(pattern.errorTypes) as [ErrorType, number][];
  const dominant = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  );

  return {
    type: dominant[0],
    proportion: pattern.errorCount > 0 ? dominant[1] / pattern.errorCount : 0,
  };
}

/**
 * Calculate priority scores for all patterns and rank them
 */
export function calculateAllPriorities(
  patterns: TopicPattern[],
  allErrors: ErrorLog[]
): PriorityScore[] {
  const maxErrorCount = Math.max(...patterns.map(p => p.errorCount), 1);

  const scored = patterns.map(pattern =>
    calculatePriorityScore(pattern, allErrors, maxErrorCount)
  );

  // Sort by score (highest first) and assign ranks
  scored.sort((a, b) => b.score - a.score);
  scored.forEach((item, index) => {
    item.rank = index + 1;
  });

  return scored;
}

/**
 * Get top N priorities
 */
export function getTopPriorities(
  patterns: TopicPattern[],
  allErrors: ErrorLog[],
  limit: number = 10
): PriorityScore[] {
  const all = calculateAllPriorities(patterns, allErrors);
  return all.slice(0, limit);
}

/**
 * Get all priorities by urgency level
 */
export function getPrioritiesByUrgency(
  patterns: TopicPattern[],
  allErrors: ErrorLog[],
  urgency: UrgencyLevel
): PriorityScore[] {
  const all = calculateAllPriorities(patterns, allErrors);
  return all.filter(p => p.urgency === urgency);
}
