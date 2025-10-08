import { describe, it, expect } from 'vitest';
import { generateEnhancedStudyPlan, getUrgencyDescription, getUrgencyColor, getUrgencyIcon } from './scheduler';
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
    systemId: 'sys-cardiovascular',
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

describe('Scheduler - Basic Plan Generation', () => {
  it('should generate a study plan from patterns and errors', () => {
    const patterns = [
      createPattern('Heart Failure', 10, { knowledge: 8, reasoning: 2, process: 0, time: 0 }, 1),
      createPattern('Diabetes', 5, { knowledge: 3, reasoning: 2, process: 0, time: 0 }, 3),
    ];

    const errors = [
      ...Array.from({ length: 10 }, (_, i) =>
        createError('Heart Failure', 'Cardiovascular', 'knowledge', 'guessed', i % 3)
      ),
      ...Array.from({ length: 5 }, (_, i) =>
        createError('Diabetes', 'Endocrine', 'knowledge', 'confident', i)
      ),
    ];

    const plan = generateEnhancedStudyPlan(patterns, errors);

    expect(plan).toBeDefined();
    expect(plan.blocks.length).toBeGreaterThan(0);
    expect(plan.generatedAt).toBeInstanceOf(Date);
    expect(plan.weekStart).toBeInstanceOf(Date);
  });

  it('should include urgency levels in blocks', () => {
    const patterns = [
      createPattern('High Priority', 10, { knowledge: 10, reasoning: 0, process: 0, time: 0 }, 0),
    ];

    const errors = Array.from({ length: 10 }, (_, i) =>
      createError('High Priority', 'Cardiovascular', 'knowledge', 'guessed', i)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const hasUrgency = plan.blocks.every(block => block.urgency !== undefined);
    expect(hasUrgency).toBe(true);
  });

  it('should include "why scheduled" explanations', () => {
    const patterns = [
      createPattern('Topic A', 8, { knowledge: 6, reasoning: 2, process: 0, time: 0 }, 1),
    ];

    const errors = Array.from({ length: 8 }, (_, i) =>
      createError('Topic A', 'Cardiovascular', 'knowledge', 'guessed', i)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const hasExplanations = plan.blocks.every(block => block.whyScheduled);
    expect(hasExplanations).toBe(true);

    // Check that explanations are plain language
    plan.blocks.forEach(block => {
      expect(block.whyScheduled).not.toMatch(/\d/); // No raw numbers
      expect(block.whyScheduled).not.toMatch(/score/i); // No "score"
      expect(block.whyScheduled).toMatch(/\+/); // Should have " + " separator
    });
  });
});

describe('Scheduler - Urgency-Based Intervals', () => {
  it('should create more sessions for urgent topics', () => {
    const urgentPattern = createPattern(
      'Urgent Topic',
      10,
      { knowledge: 10, reasoning: 0, process: 0, time: 0 },
      0
    );

    const lowPattern = createPattern(
      'Low Topic',
      2,
      { knowledge: 2, reasoning: 0, process: 0, time: 0 },
      20
    );

    const patterns = [urgentPattern, lowPattern];
    const errors = Array.from({ length: 10 }, (_, i) =>
      createError('Urgent Topic', 'Cardiovascular', 'knowledge', 'guessed', i % 2)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const urgentBlocks = plan.blocks.filter(b => b.topic === 'Urgent Topic');
    const lowBlocks = plan.blocks.filter(b => b.topic === 'Low Topic');

    // Urgent should have more review sessions
    expect(urgentBlocks.length).toBeGreaterThan(lowBlocks.length);
  });

  it('should use spaced intervals (24h, 3d, 7d, 14d)', () => {
    const patterns = [
      createPattern('Topic', 8, { knowledge: 6, reasoning: 2, process: 0, time: 0 }, 1),
    ];

    const errors = Array.from({ length: 8 }, (_, i) =>
      createError('Topic', 'Cardiovascular', 'knowledge', 'guessed', i)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const days = plan.blocks.map(b => b.day).sort((a, b) => a - b);

    // Should include early spacing (1-3 days)
    expect(days.some(d => d <= 3)).toBe(true);

    // Should include mid-range (around 1 week)
    expect(days.some(d => d >= 6 && d <= 8)).toBe(true);
  });

  it('should vary activity types across sessions', () => {
    const patterns = [
      createPattern('Topic', 8, { knowledge: 6, reasoning: 2, process: 0, time: 0 }, 1),
    ];

    const errors = Array.from({ length: 8 }, (_, i) =>
      createError('Topic', 'Cardiovascular', 'knowledge', 'guessed', i)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const activities = new Set(plan.blocks.map(b => b.activity));

    // Should have variety
    expect(activities.size).toBeGreaterThan(1);
  });
});

describe('Scheduler - Error Type Adaptation', () => {
  it('should prioritize content review for knowledge gaps', () => {
    const patterns = [
      createPattern(
        'Knowledge Gap',
        10,
        { knowledge: 9, reasoning: 1, process: 0, time: 0 }, // 90% knowledge errors
        1
      ),
    ];

    const errors = Array.from({ length: 10 }, (_, i) =>
      createError('Knowledge Gap', 'Cardiovascular', i < 9 ? 'knowledge' : 'reasoning', 'guessed', i)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const blocks = plan.blocks.filter(b => b.topic === 'Knowledge Gap');

    // Should have strategy indicating knowledge review
    expect(blocks.some(b => b.errorTypeStrategy === 'knowledge-review')).toBe(true);
  });

  it('should prioritize practice for reasoning errors', () => {
    const patterns = [
      createPattern(
        'Application Issue',
        10,
        { knowledge: 1, reasoning: 9, process: 0, time: 0 }, // 90% reasoning errors
        1
      ),
    ];

    const errors = Array.from({ length: 10 }, (_, i) =>
      createError('Application Issue', 'Cardiovascular', i < 9 ? 'reasoning' : 'knowledge', 'confident', i)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const blocks = plan.blocks.filter(b => b.topic === 'Application Issue');

    // Should have strategy indicating practice problems
    expect(blocks.some(b => b.errorTypeStrategy === 'practice-problems')).toBe(true);
  });

  it('should suggest strategy coaching for time/process errors', () => {
    const patterns = [
      createPattern(
        'Time Pressure',
        10,
        { knowledge: 0, reasoning: 0, process: 5, time: 5 }, // 100% process/time
        1
      ),
    ];

    const errors = Array.from({ length: 10 }, (_, i) =>
      createError('Time Pressure', 'Cardiovascular', i < 5 ? 'time' : 'process', 'confident', i)
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const blocks = plan.blocks.filter(b => b.topic === 'Time Pressure');

    // Should have strategy indicating strategy coaching
    expect(blocks.some(b => b.errorTypeStrategy === 'strategy-coaching')).toBe(true);
  });
});

describe('Scheduler - Interleaving', () => {
  it('should interleave different topics within same day', () => {
    const patterns = [
      createPattern('Topic A', 8, { knowledge: 8, reasoning: 0, process: 0, time: 0 }, 1),
      createPattern('Topic B', 7, { knowledge: 7, reasoning: 0, process: 0, time: 0 }, 1),
      createPattern('Topic C', 6, { knowledge: 6, reasoning: 0, process: 0, time: 0 }, 1),
    ];

    const errors = [
      ...Array.from({ length: 8 }, () => createError('Topic A', 'Cardiovascular', 'knowledge', 'guessed', 1)),
      ...Array.from({ length: 7 }, () => createError('Topic B', 'Respiratory', 'knowledge', 'guessed', 1)),
      ...Array.from({ length: 6 }, () => createError('Topic C', 'Gastrointestinal', 'knowledge', 'guessed', 1)),
    ];

    const plan = generateEnhancedStudyPlan(patterns, errors);

    // Check first day has multiple topics
    const day1Blocks = plan.blocks.filter(b => b.day === 1);
    const day1Topics = new Set(day1Blocks.map(b => b.topic));

    expect(day1Topics.size).toBeGreaterThan(1); // Should have multiple topics on day 1
  });
});

describe('Scheduler - Edge Cases', () => {
  it('should handle empty patterns gracefully', () => {
    const plan = generateEnhancedStudyPlan([], []);

    expect(plan).toBeDefined();
    expect(plan.blocks).toHaveLength(0);
  });

  it('should handle single error', () => {
    const patterns = [
      createPattern('Single Error', 1, { knowledge: 1, reasoning: 0, process: 0, time: 0 }, 0),
    ];

    const errors = [
      createError('Single Error', 'Cardiovascular', 'knowledge', 'guessed', 0),
    ];

    const plan = generateEnhancedStudyPlan(patterns, errors);

    expect(plan.blocks.length).toBeGreaterThan(0);
  });

  it('should handle many errors without performance issues', () => {
    const patterns = Array.from({ length: 50 }, (_, i) =>
      createPattern(`Topic ${i}`, 5, { knowledge: 5, reasoning: 0, process: 0, time: 0 }, i)
    );

    const errors = patterns.flatMap(p =>
      Array.from({ length: 5 }, () =>
        createError(p.topic, 'Cardiovascular', 'knowledge', 'guessed', 0)
      )
    );

    const startTime = Date.now();
    const plan = generateEnhancedStudyPlan(patterns, errors);
    const duration = Date.now() - startTime;

    expect(plan).toBeDefined();
    expect(duration).toBeLessThan(500); // Should be fast (< 500ms)
  });

  it('should limit total topics based on default (no exam date)', () => {
    const patterns = Array.from({ length: 20 }, (_, i) =>
      createPattern(`Topic ${i}`, 10 - i, { knowledge: 10 - i, reasoning: 0, process: 0, time: 0 }, i)
    );

    const errors = patterns.flatMap(p =>
      Array.from({ length: p.errorCount }, () =>
        createError(p.topic, 'Cardiovascular', 'knowledge', 'guessed', 0)
      )
    );

    const plan = generateEnhancedStudyPlan(patterns, errors);

    const uniqueTopics = new Set(plan.blocks.map(b => b.topic));
    expect(uniqueTopics.size).toBeLessThanOrEqual(8); // Default limit is 8
  });

  it('should handle exam date and adjust topic limit', () => {
    const examDate = new Date();
    examDate.setDate(examDate.getDate() + 15); // 2 weeks away

    const patterns = Array.from({ length: 20 }, (_, i) =>
      createPattern(`Topic ${i}`, 10 - i, { knowledge: 10 - i, reasoning: 0, process: 0, time: 0 }, i)
    );

    const errors = patterns.flatMap(p =>
      Array.from({ length: p.errorCount }, () =>
        createError(p.topic, 'Cardiovascular', 'knowledge', 'guessed', 0)
      )
    );

    const plan = generateEnhancedStudyPlan(patterns, errors, examDate);

    expect(plan.examDate).toEqual(examDate);
    expect(plan.daysUntilExam).toBeDefined();
    expect(plan.daysUntilExam).toBeGreaterThan(0);
  });
});

describe('Scheduler - Utility Functions', () => {
  it('should provide urgency descriptions', () => {
    expect(getUrgencyDescription('urgent')).toContain('immediate');
    expect(getUrgencyDescription('high')).toContain('priority');
    expect(getUrgencyDescription('moderate')).toContain('moderate');
    expect(getUrgencyDescription('low')).toContain('periodic');
  });

  it('should provide urgency colors', () => {
    expect(getUrgencyColor('urgent')).toContain('red');
    expect(getUrgencyColor('high')).toContain('orange');
    expect(getUrgencyColor('moderate')).toContain('yellow');
    expect(getUrgencyColor('low')).toContain('blue');
  });

  it('should provide urgency icons', () => {
    expect(getUrgencyIcon('urgent')).toBe('🔴');
    expect(getUrgencyIcon('high')).toBe('🟠');
    expect(getUrgencyIcon('moderate')).toBe('🟡');
    expect(getUrgencyIcon('low')).toBe('🔵');
  });
});
