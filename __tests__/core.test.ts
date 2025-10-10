import { describe, it, expect, beforeEach } from 'vitest';
import { analyzePatterns } from '@/lib/insights';
import { getTopPriorities } from '@/lib/priority';
import { generateStudyPlan } from '@/lib/planner';
import type { ErrorLog } from '@/lib/types';

describe('Core Functionality', () => {
  const sampleErrors: ErrorLog[] = [
    {
      id: 'error-1',
      timestamp: new Date('2025-01-01'),
      description: 'Confused preload and afterload',
      system: 'Cardiovascular',
      topic: 'Preload vs Afterload',
      errorType: 'knowledge',
      confidence: 'guessed',
      nextSteps: ['Review Frank-Starling curve'],
    },
    {
      id: 'error-2',
      timestamp: new Date('2025-01-02'),
      description: 'Wrong calculation of cardiac output',
      system: 'Cardiovascular',
      topic: 'Cardiac Output',
      errorType: 'reasoning',
      confidence: 'eliminated',
      nextSteps: ['Practice CO calculations'],
    },
    {
      id: 'error-3',
      timestamp: new Date('2025-01-03'),
      description: 'Forgot aldosterone mechanism',
      system: 'Renal',
      topic: 'Aldosterone',
      errorType: 'knowledge',
      confidence: 'confident',
      nextSteps: ['Review RAAS pathway'],
    },
  ];

  describe('Insights Aggregation', () => {
    it('should identify patterns from error logs', () => {
      const patterns = analyzePatterns(sampleErrors);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.topic === 'Preload vs Afterload')).toBe(true);
      expect(patterns.some(p => p.system === 'Cardiovascular')).toBe(true);
    });

    it('should count errors per topic', () => {
      const doubleErrors = [...sampleErrors, sampleErrors[0]]; // Duplicate first error
      const patterns = analyzePatterns(doubleErrors);

      const preloadPattern = patterns.find(p => p.topic === 'Preload vs Afterload');
      expect(preloadPattern?.errorCount).toBe(2);
    });

    it('should handle empty error array', () => {
      const patterns = analyzePatterns([]);
      expect(patterns).toEqual([]);
    });
  });

  describe('Priority Calculation', () => {
    it('should calculate top priorities from patterns', () => {
      const patterns = analyzePatterns(sampleErrors);
      const priorities = getTopPriorities(patterns, sampleErrors, 5);

      expect(priorities.length).toBeGreaterThan(0);
      expect(priorities[0]).toHaveProperty('urgency');
      expect(priorities[0]).toHaveProperty('topic');
      expect(priorities[0]).toHaveProperty('system');
    });

    it('should assign urgency levels correctly', () => {
      const patterns = analyzePatterns(sampleErrors);
      const priorities = getTopPriorities(patterns, sampleErrors, 5);

      const urgencies = priorities.map(p => p.urgency);
      urgencies.forEach(urgency => {
        expect(['urgent', 'high', 'moderate', 'low']).toContain(urgency);
      });
    });

    it('should handle empty patterns', () => {
      const priorities = getTopPriorities([], [], 5);
      expect(priorities).toEqual([]);
    });
  });

  describe('Study Plan Generation', () => {
    it('should generate a 7-day study plan', () => {
      const patterns = analyzePatterns(sampleErrors);
      const plan = generateStudyPlan(patterns, sampleErrors);

      expect(plan).toHaveProperty('weekStart');
      expect(plan).toHaveProperty('blocks');
      expect(plan.blocks.length).toBeGreaterThan(0);
    });

    it('should schedule blocks across multiple days', () => {
      const patterns = analyzePatterns(sampleErrors);
      const plan = generateStudyPlan(patterns, sampleErrors);

      const days = new Set(plan.blocks.map(b => b.day));
      expect(days.size).toBeGreaterThan(1); // At least 2 different days
    });

    it('should include activity types', () => {
      const patterns = analyzePatterns(sampleErrors);
      const plan = generateStudyPlan(patterns, sampleErrors);

      const activities = plan.blocks.map(b => b.activity);
      activities.forEach(activity => {
        expect(['retrieval', 'review', 'practice']).toContain(activity);
      });
    });

    it('should set reasonable durations', () => {
      const patterns = analyzePatterns(sampleErrors);
      const plan = generateStudyPlan(patterns, sampleErrors);

      plan.blocks.forEach(block => {
        expect(block.duration).toBeGreaterThan(0);
        expect(block.duration).toBeLessThanOrEqual(60); // Max 60 minutes
      });
    });

    it('should handle exam date scheduling', () => {
      const patterns = analyzePatterns(sampleErrors);
      const examDate = new Date();
      examDate.setDate(examDate.getDate() + 14); // 14 days from now

      const plan = generateStudyPlan(patterns, sampleErrors, examDate);

      expect(plan.examDate).toEqual(examDate);
      expect(plan).toHaveProperty('daysUntilExam');
    });
  });

  describe('Input Validation', () => {
    it('should handle malformed error data gracefully', () => {
      const malformedErrors = [
        {
          id: 'error-bad',
          timestamp: new Date(),
          description: '',
          system: 'Cardiovascular',
          topic: 'Test',
          errorType: 'knowledge',
          confidence: 'guessed',
        } as ErrorLog,
      ];

      const patterns = analyzePatterns(malformedErrors);
      expect(patterns).toBeDefined();
    });

    it('should handle invalid dates', () => {
      const patterns = analyzePatterns(sampleErrors);
      const invalidDate = new Date('invalid');

      // Should not throw
      expect(() => {
        generateStudyPlan(patterns, sampleErrors, invalidDate);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large error sets efficiently', () => {
      const largeErrorSet: ErrorLog[] = Array.from({ length: 100 }, (_, i) => ({
        id: `error-${i}`,
        timestamp: new Date(),
        description: `Error ${i}`,
        system: 'Cardiovascular',
        topic: `Topic ${i % 10}`,
        errorType: ['knowledge', 'reasoning', 'process', 'time'][i % 4] as any,
        confidence: 'guessed' as const,
        nextSteps: [],
      }));

      const start = performance.now();
      const patterns = analyzePatterns(largeErrorSet);
      const priorities = getTopPriorities(patterns, largeErrorSet, 10);
      const plan = generateStudyPlan(patterns, largeErrorSet);
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
      expect(patterns.length).toBeGreaterThan(0);
      expect(priorities.length).toBeGreaterThan(0);
      expect(plan.blocks.length).toBeGreaterThan(0);
    });
  });
});
