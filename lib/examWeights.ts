// Official USMLE Step 2 CK exam weight mappings
// Source: USMLE Content Outline 2025
// https://www.usmle.org/exam-resources/step-2-ck-materials/step-2-ck-content-outline-specifications

export interface ExamWeight {
  systemId: string;
  minPercent: number;
  maxPercent: number;
  midpointPercent: number;
  weight: number; // Normalized 0-1 score for priority calculations
}

// Official USMLE Step 2 CK organ system weights
export const EXAM_WEIGHTS: Record<string, ExamWeight> = {
  // Highest weight: Social Sciences combined (10-15%)
  'sys-social-sci': {
    systemId: 'sys-social-sci',
    minPercent: 10,
    maxPercent: 15,
    midpointPercent: 12.5,
    weight: 1.0, // Baseline multiplier
  },
  'sys-legal-ethical': {
    systemId: 'sys-legal-ethical',
    minPercent: 10,
    maxPercent: 15,
    midpointPercent: 12.5,
    weight: 1.0,
  },
  'sys-professionalism': {
    systemId: 'sys-professionalism',
    minPercent: 10,
    maxPercent: 15,
    midpointPercent: 12.5,
    weight: 1.0,
  },
  'sys-systems-practice': {
    systemId: 'sys-systems-practice',
    minPercent: 10,
    maxPercent: 15,
    midpointPercent: 12.5,
    weight: 1.0,
  },

  // High weight systems (7-13%)
  'sys-renal-urinary': {
    systemId: 'sys-renal-urinary',
    minPercent: 7,
    maxPercent: 13,
    midpointPercent: 10,
    weight: 0.8,
  },
  'sys-reproductive': {
    systemId: 'sys-reproductive',
    minPercent: 7,
    maxPercent: 13,
    midpointPercent: 10,
    weight: 0.8,
  },

  // Major systems (6-12%)
  'sys-cardiovascular': {
    systemId: 'sys-cardiovascular',
    minPercent: 6,
    maxPercent: 12,
    midpointPercent: 9,
    weight: 0.72,
  },
  'sys-musculoskeletal': {
    systemId: 'sys-musculoskeletal',
    minPercent: 6,
    maxPercent: 12,
    midpointPercent: 9,
    weight: 0.72,
  },
  'sys-skin': {
    systemId: 'sys-skin',
    minPercent: 6,
    maxPercent: 12,
    midpointPercent: 9,
    weight: 0.72,
  },

  // Moderate weight systems (5-10%)
  'sys-behavioral': {
    systemId: 'sys-behavioral',
    minPercent: 5,
    maxPercent: 10,
    midpointPercent: 7.5,
    weight: 0.6,
  },
  'sys-nervous': {
    systemId: 'sys-nervous',
    minPercent: 5,
    maxPercent: 10,
    midpointPercent: 7.5,
    weight: 0.6,
  },
  'sys-respiratory': {
    systemId: 'sys-respiratory',
    minPercent: 5,
    maxPercent: 10,
    midpointPercent: 7.5,
    weight: 0.6,
  },
  'sys-gastrointestinal': {
    systemId: 'sys-gastrointestinal',
    minPercent: 5,
    maxPercent: 10,
    midpointPercent: 7.5,
    weight: 0.6,
  },

  // Mid-range systems (4-8%, 3-7%)
  'sys-multisystem': {
    systemId: 'sys-multisystem',
    minPercent: 4,
    maxPercent: 8,
    midpointPercent: 6,
    weight: 0.48,
  },
  'sys-pregnancy': {
    systemId: 'sys-pregnancy',
    minPercent: 3,
    maxPercent: 7,
    midpointPercent: 5,
    weight: 0.4,
  },
  'sys-endocrine': {
    systemId: 'sys-endocrine',
    minPercent: 3,
    maxPercent: 7,
    midpointPercent: 5,
    weight: 0.4,
  },

  // Lower weight systems (3-6%, 3-5%)
  'sys-blood-lymph': {
    systemId: 'sys-blood-lymph',
    minPercent: 3,
    maxPercent: 6,
    midpointPercent: 4.5,
    weight: 0.36,
  },
  'sys-immune': {
    systemId: 'sys-immune',
    minPercent: 3,
    maxPercent: 5,
    midpointPercent: 4,
    weight: 0.32,
  },
  'sys-biostat-epi': {
    systemId: 'sys-biostat-epi',
    minPercent: 3,
    maxPercent: 5,
    midpointPercent: 4,
    weight: 0.32,
  },

  // Lowest weight
  'sys-human-dev': {
    systemId: 'sys-human-dev',
    minPercent: 2,
    maxPercent: 4,
    midpointPercent: 3,
    weight: 0.24,
  },
};

/**
 * Get exam weight for a given system ID
 * Returns default weight of 0.5 for unmapped systems
 */
export function getExamWeight(systemId?: string): number {
  if (!systemId) return 0.5;
  const weight = EXAM_WEIGHTS[systemId];
  return weight ? weight.weight : 0.5;
}

/**
 * Get exam weight from legacy organ system name
 * Maps old names to taxonomy IDs, then looks up weight
 */
export function getExamWeightFromLegacySystem(system: string): number {
  // Map legacy names to taxonomy IDs
  const legacyMapping: Record<string, string> = {
    'Cardiovascular': 'sys-cardiovascular',
    'Respiratory': 'sys-respiratory',
    'Gastrointestinal': 'sys-gastrointestinal',
    'Renal/Urinary': 'sys-renal-urinary',
    'Reproductive': 'sys-reproductive',
    'Endocrine': 'sys-endocrine',
    'Musculoskeletal': 'sys-musculoskeletal',
    'Skin/Connective Tissue': 'sys-skin',
    'Nervous System/Special Senses': 'sys-nervous',
    'Hematologic/Lymphatic': 'sys-blood-lymph',
    'Immune': 'sys-immune',
    'Behavioral Science': 'sys-behavioral',
    'Multisystem/General Principles': 'sys-multisystem',
  };

  const systemId = legacyMapping[system];
  return getExamWeight(systemId);
}

/**
 * Check if a system is high-yield (> 7% exam weight)
 */
export function isHighYield(systemId?: string): boolean {
  const weight = EXAM_WEIGHTS[systemId || ''];
  return weight ? weight.midpointPercent >= 7 : false;
}

/**
 * Get all systems sorted by exam weight (highest first)
 */
export function getSystemsByWeight(): ExamWeight[] {
  return Object.values(EXAM_WEIGHTS).sort((a, b) => b.weight - a.weight);
}
