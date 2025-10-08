import { describe, it, expect } from 'vitest';
import {
  calculatePriorityScore,
  calculateAllPriorities,
  getTopPriorities,
  getPrioritiesByUrgency,
} from './priority';
import { TopicPattern, ErrorLog, ErrorType } from './types';

// Helper to create test error
function createError(
  topic: string,
  system: string,
  errorType: ErrorType,
  confidence: 'guessed' | 'eliminated' | 'confident' | 'certain',
  daysAgo: number = 0
): ErrorLog {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);

  return {
    id: `error-${Math.random()}`,
    timestamp,
    description: `Test error for ${topic}`,
    system: system as any,
    systemId: 'sys-cardiovascular', // Use high-weight system
    topic,
    errorType,
    confidence,
    nextSteps: ['Review'],
  };
}

// Helper to create test pattern
function createPattern(
  topic: string,
  errorCount: number,
  errorTypes: Record<ErrorType, number>,
  daysAgo: number = 0
): TopicPattern {
  const lastSeen = new Date();
  lastSeen.setDate(lastSeen.getDate() - daysAgo);

  return {
    topic,
    system: 'Cardiovascular' as any,
    systemId: 'sys-cardiovascular',
    errorCount,
    errorTypes,
    averageConfidence: 1.5,
    lastSeen,
  };
}

describe('Priority - Score Calculation', () => {
  it('should calculate high score for frequent + high-yield + recent errors', () => {
    const pattern = createPattern(
      'Heart Failure',
      10, // High frequency
      { knowledge: 8, reasoning: 2, process: 0, time: 0 },
      1 // Very recent
    );

    const errors = Array.from({ length: 10 }, (_, i) =>
      createError('Heart Failure', 'Cardiovascular', 'knowledge', 'guessed', i)
    );

    const score = calculatePriorityScore(pattern, errors, 10);

    expect(score.score).toBeGreaterThan(70); // Should be high priority
    expect(score.urgency).toBe('high'); // Or urgent
    expect(score.reasons).toContain('frequent');
    expect(score.reasonChip).toContain('frequent');
  });

  it('should calculate lower score for infrequent + low-weight + old errors', () => {
    const pattern = createPattern(
      'Rare Condition',
      2, // Low frequency
      { knowledge: 2, reasoning: 0, process: 0, time: 0 },
      30 // Old
    );

    const errors = [
      createError('Rare Condition', 'Behavioral Science', 'knowledge', 'confident', 30),
      createError('Rare Condition', 'Behavioral Science', 'knowledge', 'confident', 25),
    ];

    const score = calculatePriorityScore(pattern, errors, 10);

    expect(score.score).toBeLessThan(40); // Should be low priority
    expect(score.urgency).toBe('low'); // Or moderate
  });

  it('should factor in low confidence heavily', () => {
    const pattern = createPattern(
      'Complex Topic',
      5,
      { knowledge: 3, reasoning: 2, process: 0, time: 0 },
      2
    );

    const errors = [
      createError('Complex Topic', 'Cardiovascular', 'knowledge', 'guessed', 2),
      createError('Complex Topic', 'Cardiovascular', 'knowledge', 'guessed', 1),
      createError('Complex Topic', 'Cardiovascular', 'reasoning', 'eliminated', 1),
      createError('Complex Topic', 'Cardiovascular', 'reasoning', 'guessed', 0),
      createError('Complex Topic', 'Cardiovascular', 'knowledge', 'eliminated', 0),
    ];

    const score = calculatePriorityScore(pattern, errors, 10);

    expect(score.reasons).toContain('low confidence');
    expect(score.factors.lowConfidence).toBeGreaterThan(0.5);
  });

  it('should factor in time pressure', () => {
    const pattern = createPattern(
      'Timed Topic',
      6,
      { knowledge: 1, reasoning: 1, process: 0, time: 4 }, // 66% time errors
      1
    );

    const errors = Array.from({ length: 6 }, (_, i) =>
      createError('Timed Topic', 'Cardiovascular', i < 4 ? 'time' : 'knowledge', 'confident', 0)
    );

    const score = calculatePriorityScore(pattern, errors, 10);

    expect(score.reasons).toContain('time pressure');
    expect(score.factors.timePressure).toBeGreaterThan(0.5);
  });

  it('should assign correct urgency levels', () => {
    const patterns = [
      createPattern('Urgent', 10, { knowledge: 10, reasoning: 0, process: 0, time: 0 }, 0),
      createPattern('High', 7, { knowledge: 7, reasoning: 0, process: 0, time: 0 }, 2),
      createPattern('Moderate', 4, { knowledge: 4, reasoning: 0, process: 0, time: 0 }, 5),
      createPattern('Low', 2, { knowledge: 2, reasoning: 0, process: 0, time: 0 }, 15),
    ];

    const errors: ErrorLog[] = [];
    const maxErrors = 10;

    const scores = patterns.map(p => calculatePriorityScore(p, errors, maxErrors));

    // High frequency + recent should be urgent/high
    expect(['urgent', 'high']).toContain(scores[0].urgency);

    // Lower priority should have lower urgency
    expect(scores[3].urgency).toBe('low');
  });
});

describe('Priority - All Priorities Calculation', () => {
  it('should rank patterns by composite score', () => {
    const patterns = [
      createPattern('Low Priority', 2, { knowledge: 2, reasoning: 0, process: 0, time: 0 }, 20),
      createPattern('High Priority', 10, { knowledge: 10, reasoning: 0, process: 0, time: 0 }, 0),
      createPattern('Medium Priority', 5, { knowledge: 5, reasoning: 0, process: 0, time: 0 }, 3),
    ];

    const errors: ErrorLog[] = [];
    const priorities = calculateAllPriorities(patterns, errors);

    expect(priorities[0].rank).toBe(1);
    expect(priorities[0].topic).toBe('High Priority');

    expect(priorities[1].rank).toBe(2);
    expect(priorities[1].topic).toBe('Medium Priority');

    expect(priorities[2].rank).toBe(3);
    expect(priorities[2].topic).toBe('Low Priority');
  });

  it('should calculate all priority scores', () => {
    const patterns = [
      createPattern('Topic A', 5, { knowledge: 5, reasoning: 0, process: 0, time: 0 }, 1),
      createPattern('Topic B', 3, { knowledge: 3, reasoning: 0, process: 0, time: 0 }, 5),
    ];

    const errors: ErrorLog[] = [];
    const priorities = calculateAllPriorities(patterns, errors);

    expect(priorities).toHaveLength(2);
    priorities.forEach(p => {
      expect(p.score).toBeGreaterThanOrEqual(0);
      expect(p.score).toBeLessThanOrEqual(100);
      expect(p.rank).toBeGreaterThan(0);
      expect(p.urgency).toBeDefined();
      expect(p.reasonChip).toBeDefined();
    });
  });
});

describe('Priority - Top Priorities', () => {
  it('should return top N priorities', () => {
    const patterns = Array.from({ length: 20 }, (_, i) =>
      createPattern(`Topic ${i}`, 10 - i, { knowledge: 10 - i, reasoning: 0, process: 0, time: 0 }, i)
    );

    const errors: ErrorLog[] = [];
    const top5 = getTopPriorities(patterns, errors, 5);

    expect(top5).toHaveLength(5);
    expect(top5[0].rank).toBe(1);
    expect(top5[4].rank).toBe(5);
  });

  it('should default to top 10', () => {
    const patterns = Array.from({ length: 15 }, (_, i) =>
      createPattern(`Topic ${i}`, 10 - i, { knowledge: 10 - i, reasoning: 0, process: 0, time: 0 }, i)
    );

    const errors: ErrorLog[] = [];
    const top = getTopPriorities(patterns, errors);

    expect(top).toHaveLength(10);
  });
});

describe('Priority - Filter by Urgency', () => {
  it('should filter priorities by urgency level', () => {
    const patterns = [
      createPattern('Urgent 1', 10, { knowledge: 10, reasoning: 0, process: 0, time: 0 }, 0),
      createPattern('Urgent 2', 9, { knowledge: 9, reasoning: 0, process: 0, time: 0 }, 0),
      createPattern('Low 1', 2, { knowledge: 2, reasoning: 0, process: 0, time: 0 }, 20),
    ];

    const errors: ErrorLog[] = [];
    const urgent = getPrioritiesByUrgency(patterns, errors, 'urgent');
    const low = getPrioritiesByUrgency(patterns, errors, 'low');

    // Should have some urgent priorities
    expect(urgent.length).toBeGreaterThan(0);

    // Should have some low priorities
    expect(low.length).toBeGreaterThan(0);

    // All returned items should match requested urgency
    urgent.forEach(p => expect(p.urgency).toBe('urgent'));
    low.forEach(p => expect(p.urgency).toBe('low'));
  });
});

describe('Priority - Reason Generation', () => {
  it('should generate human-readable reasons', () => {
    const pattern = createPattern(
      'Test Topic',
      8,
      { knowledge: 6, reasoning: 2, process: 0, time: 0 },
      1
    );

    const errors = [
      createError('Test Topic', 'Cardiovascular', 'knowledge', 'guessed', 1),
      createError('Test Topic', 'Cardiovascular', 'knowledge', 'guessed', 0),
    ];

    const score = calculatePriorityScore(pattern, errors, 10);

    expect(score.reasons.length).toBeGreaterThan(0);
    expect(score.reasonChip).toMatch(/\+/); // Should have "+" separator
    expect(score.reasonChip).not.toMatch(/\d/); // Should not contain numbers
    expect(score.reasonChip).not.toMatch(/score/i); // Should not say "score"
  });

  it('should limit reason chip to 3 factors', () => {
    const pattern = createPattern(
      'Complex Topic',
      10,
      { knowledge: 8, reasoning: 1, process: 0, time: 1 },
      0
    );

    const errors = Array.from({ length: 10 }, (_, i) =>
      createError('Complex Topic', 'Cardiovascular', 'knowledge', 'guessed', i % 3)
    );

    const score = calculatePriorityScore(pattern, errors, 10);

    const parts = score.reasonChip.split(' + ');
    expect(parts.length).toBeLessThanOrEqual(3);
  });

  it('should use plain language (no jargon)', () => {
    const pattern = createPattern(
      'Test Topic',
      5,
      { knowledge: 5, reasoning: 0, process: 0, time: 0 },
      1
    );

    const errors: ErrorLog[] = [];
    const score = calculatePriorityScore(pattern, errors, 10);

    // Should not contain technical terms
    expect(score.reasonChip).not.toMatch(/algorithm|metric|coefficient/i);

    // Should contain simple words
    const validWords = ['frequent', 'recent', 'high-yield', 'exam-relevant', 'low confidence', 'moderate', 'time pressure'];
    const hasValidWord = validWords.some(word => score.reasonChip.toLowerCase().includes(word.toLowerCase()));
    expect(hasValidWord).toBe(true);
  });
});

describe('Priority - Edge Cases', () => {
  it('should handle empty error list', () => {
    const pattern = createPattern(
      'Topic',
      5,
      { knowledge: 5, reasoning: 0, process: 0, time: 0 },
      1
    );

    const score = calculatePriorityScore(pattern, [], 5);

    expect(score).toBeDefined();
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });

  it('should handle all error types equally represented', () => {
    const pattern = createPattern(
      'Balanced',
      8,
      { knowledge: 2, reasoning: 2, process: 2, time: 2 },
      1
    );

    const errors: ErrorLog[] = [];
    const score = calculatePriorityScore(pattern, errors, 10);

    expect(score).toBeDefined();
    expect(score.urgency).toBeDefined();
  });

  it('should handle very old errors', () => {
    const pattern = createPattern(
      'Ancient',
      5,
      { knowledge: 5, reasoning: 0, process: 0, time: 0 },
      365 // 1 year ago
    );

    const errors: ErrorLog[] = [];
    const score = calculatePriorityScore(pattern, errors, 10);

    expect(score.factors.recency).toBeLessThan(0.2); // Very low recency
    expect(score.urgency).toBe('low'); // Should be low priority
  });
});
