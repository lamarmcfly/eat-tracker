import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  migrateErrorLog,
  migrateAllErrors,
  needsMigration,
  getCurrentMigrationVersion,
  setMigrationVersion,
  resetMigrations,
} from './migrations';

describe('Migrations - Error Log Migration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    resetMigrations();
  });

  it('should migrate old system name to new taxonomy ID', () => {
    const oldError = {
      id: 'test-1',
      timestamp: new Date(),
      description: 'Test error',
      system: 'Cardiovascular',
      topic: 'Heart failure',
      errorType: 'knowledge',
      confidence: 'guessed',
      nextSteps: ['Review pathophysiology'],
    };

    const { log, warnings } = migrateErrorLog(oldError);

    expect(log.systemId).toBe('sys-cardiovascular');
    expect(log._oldSystem).toBe('Cardiovascular');
    expect(warnings.length).toBe(0);
  });

  it('should warn when system cannot be mapped', () => {
    const oldError = {
      id: 'test-2',
      timestamp: new Date(),
      description: 'Test error',
      system: 'UnknownSystem',
      topic: 'Some topic',
      errorType: 'knowledge',
      confidence: 'guessed',
      nextSteps: ['Review'],
    };

    const { warnings } = migrateErrorLog(oldError);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('Could not map');
  });

  it('should generate ID if missing', () => {
    const oldError = {
      timestamp: new Date(),
      description: 'Test error',
      system: 'Respiratory',
      topic: 'Pneumonia',
      errorType: 'reasoning',
      confidence: 'eliminated',
      nextSteps: ['Practice'],
    };

    const { log, warnings } = migrateErrorLog(oldError);

    expect(log.id).toBeDefined();
    expect(log.id).toMatch(/^error-/);
    expect(warnings.some(w => w.includes('Missing error ID'))).toBe(true);
  });

  it('should convert timestamp strings to Date objects', () => {
    const oldError = {
      id: 'test-3',
      timestamp: '2025-01-01T00:00:00.000Z',
      description: 'Test error',
      system: 'Gastrointestinal',
      topic: 'IBD',
      errorType: 'process',
      confidence: 'confident',
      nextSteps: ['Review'],
    };

    const { log } = migrateErrorLog(oldError);

    expect(log.timestamp).toBeInstanceOf(Date);
  });

  it('should preserve all existing fields', () => {
    const oldError = {
      id: 'test-4',
      timestamp: new Date(),
      description: 'Detailed description',
      system: 'Endocrine',
      topic: 'Diabetes',
      errorType: 'time',
      confidence: 'certain',
      nextSteps: ['Step 1', 'Step 2'],
      tags: ['urgent', 'high-yield'],
    };

    const { log } = migrateErrorLog(oldError);

    expect(log.description).toBe('Detailed description');
    expect(log.topic).toBe('Diabetes');
    expect(log.errorType).toBe('time');
    expect(log.confidence).toBe('certain');
    expect(log.nextSteps).toEqual(['Step 1', 'Step 2']);
    expect(log.tags).toEqual(['urgent', 'high-yield']);
  });
});

describe('Migrations - Batch Migration', () => {
  it('should migrate multiple errors successfully', () => {
    const oldErrors = [
      {
        id: 'e1',
        timestamp: new Date(),
        description: 'Error 1',
        system: 'Cardiovascular',
        topic: 'MI',
        errorType: 'knowledge',
        confidence: 'guessed',
        nextSteps: ['Review'],
      },
      {
        id: 'e2',
        timestamp: new Date(),
        description: 'Error 2',
        system: 'Respiratory',
        topic: 'COPD',
        errorType: 'reasoning',
        confidence: 'eliminated',
        nextSteps: ['Practice'],
      },
    ];

    const result = migrateAllErrors(oldErrors);

    expect(result.success).toBe(true);
    expect(result.migrated).toBe(2);
    expect(result.failed).toBe(0);
  });

  it('should handle migration failures gracefully', () => {
    const oldErrors = [
      {
        id: 'e1',
        timestamp: new Date(),
        description: 'Error 1',
        system: 'Cardiovascular',
        topic: 'MI',
        errorType: 'knowledge',
        confidence: 'guessed',
        nextSteps: ['Review'],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      null as any, // This will cause an error
    ];

    const result = migrateAllErrors(oldErrors);

    expect(result.migrated).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should collect all warnings', () => {
    const oldErrors = [
      {
        id: 'e1',
        timestamp: new Date(),
        description: 'Error 1',
        system: 'UnknownSystem1',
        topic: 'Topic',
        errorType: 'knowledge',
        confidence: 'guessed',
        nextSteps: ['Review'],
      },
      {
        id: 'e2',
        timestamp: new Date(),
        description: 'Error 2',
        system: 'UnknownSystem2',
        topic: 'Topic',
        errorType: 'reasoning',
        confidence: 'eliminated',
        nextSteps: ['Practice'],
      },
    ];

    const result = migrateAllErrors(oldErrors);

    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

describe('Migrations - Version Tracking', () => {
  beforeEach(() => {
    resetMigrations();
  });

  it('should start with version 0', () => {
    const version = getCurrentMigrationVersion();
    expect(version).toBe(0);
  });

  it('should set migration version', () => {
    setMigrationVersion(1);
    const version = getCurrentMigrationVersion();
    expect(version).toBe(1);
  });

  it('should detect when migration is needed', () => {
    resetMigrations();
    expect(needsMigration()).toBe(true);

    setMigrationVersion(1);
    expect(needsMigration()).toBe(false);
  });

  it('should reset migrations', () => {
    setMigrationVersion(5);
    resetMigrations();
    expect(getCurrentMigrationVersion()).toBe(0);
  });
});

describe('Migrations - All System Names', () => {
  it('should successfully migrate all legacy organ systems', () => {
    const legacySystems = [
      'Cardiovascular',
      'Respiratory',
      'Gastrointestinal',
      'Renal/Urinary',
      'Reproductive',
      'Endocrine',
      'Musculoskeletal',
      'Skin/Connective Tissue',
      'Nervous System/Special Senses',
      'Hematologic/Lymphatic',
      'Immune',
      'Behavioral Science',
      'Multisystem/General Principles',
    ];

    const oldErrors = legacySystems.map((system, index) => ({
      id: `e${index}`,
      timestamp: new Date(),
      description: `Error ${index}`,
      system,
      topic: 'Test topic',
      errorType: 'knowledge' as const,
      confidence: 'guessed' as const,
      nextSteps: ['Review'],
    }));

    const result = migrateAllErrors(oldErrors);

    expect(result.success).toBe(true);
    expect(result.migrated).toBe(legacySystems.length);
    expect(result.failed).toBe(0);
  });
});
