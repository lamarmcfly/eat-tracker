// Confidence rating migration utilities
// Migrates from old string-based confidence to new numeric 1-4 scale

import type { Confidence } from './types';

// Old string confidence values
type OldConfidence = 'guessed' | 'eliminated' | 'confident' | 'certain';
type NewConfidence = 1 | 2 | 3 | 4;

/**
 * Convert old string confidence to new numeric scale
 */
export function migrateConfidence(old: Confidence): NewConfidence {
  if (typeof old === 'number') {
    // Already migrated
    return old as NewConfidence;
  }

  // Map old strings to new numbers
  const mapping: Record<OldConfidence, NewConfidence> = {
    'guessed': 1,
    'eliminated': 2,
    'confident': 3,
    'certain': 4,
  };

  return mapping[old as OldConfidence] || 1;
}

/**
 * Convert new numeric confidence to old string (for backward compat)
 */
export function confidenceToLegacy(conf: Confidence): OldConfidence {
  if (typeof conf === 'string') {
    return conf as OldConfidence;
  }

  const mapping: Record<NewConfidence, OldConfidence> = {
    1: 'guessed',
    2: 'eliminated',
    3: 'confident',
    4: 'certain',
  };

  return mapping[conf as NewConfidence] || 'guessed';
}

/**
 * Get human-readable label for confidence level
 */
export function getConfidenceLabel(conf: Confidence): string {
  const numeric = migrateConfidence(conf);

  const labels: Record<NewConfidence, string> = {
    1: '1 - Complete guess (0-25%)',
    2: '2 - Narrowed down (25-50%)',
    3: '3 - Fairly sure (50-75%)',
    4: '4 - Very confident (75-100%)',
  };

  return labels[numeric];
}

/**
 * Get short description for confidence level
 */
export function getConfidenceDescription(conf: Confidence): string {
  const numeric = migrateConfidence(conf);

  const descriptions: Record<NewConfidence, string> = {
    1: 'Random pick or no idea',
    2: 'Eliminated some options',
    3: 'Had reasoning but uncertain',
    4: 'Felt certain, but still wrong',
  };

  return descriptions[numeric];
}

/**
 * Convert confidence to numeric percentage for calculations
 */
export function confidenceToPercent(conf: Confidence): number {
  const numeric = migrateConfidence(conf);

  // Map to midpoint of range
  const percentages: Record<NewConfidence, number> = {
    1: 12.5,  // 0-25% → 12.5%
    2: 37.5,  // 25-50% → 37.5%
    3: 62.5,  // 50-75% → 62.5%
    4: 87.5,  // 75-100% → 87.5%
  };

  return percentages[numeric];
}

/**
 * Map agent API confidence (0-100) to new 1-4 scale
 */
export function agentConfidenceToScale(apiConfidence: number): NewConfidence {
  if (apiConfidence < 25) return 1;
  if (apiConfidence < 50) return 2;
  if (apiConfidence < 75) return 3;
  return 4;
}
