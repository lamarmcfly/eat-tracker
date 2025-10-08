// Core data models for E.A.T. Tracker

export type ErrorType = 'knowledge' | 'reasoning' | 'process' | 'time';
export type Confidence = 'guessed' | 'eliminated' | 'confident' | 'certain';

// LEGACY: Old organ systems (kept for backward compatibility during migration)
// @deprecated Use taxonomy IDs from lib/taxonomy.ts instead
export const ORGAN_SYSTEMS = [
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
] as const;

export type OrganSystem = typeof ORGAN_SYSTEMS[number];

export interface ErrorLog {
  id: string;
  timestamp: Date;
  description: string;

  // System categorization (supports both old and new formats)
  system: OrganSystem;  // Legacy format - still used by UI during migration
  systemId?: string;    // New format - taxonomy ID (e.g., "sys-cardiovascular")

  topic: string; // specific topic within the system
  errorType: ErrorType;
  confidence: Confidence;
  nextSteps: string[]; // actionable items
  tags?: string[];

  // Optional enhanced categorization (future)
  disciplineId?: string;   // e.g., "disc-pathology"
  competencyId?: string;   // e.g., "comp-diagnosis"

  // Migration metadata
  _oldSystem?: string;  // Preserved during migration for debugging
}

export interface TopicPattern {
  topic: string;
  system: OrganSystem;
  errorCount: number;
  errorTypes: Record<ErrorType, number>;
  averageConfidence: number;
  lastSeen: Date;
}

export interface StudyBlock {
  id: string;
  day: number; // 1-7
  topic: string;
  system: OrganSystem;
  activity: 'retrieval' | 'review' | 'practice';
  duration: number; // minutes
  priority: number;
  reasoning: string; // human-readable explanation
}

export interface StudyPlan {
  generatedAt: Date;
  weekStart: Date;
  blocks: StudyBlock[];
}
