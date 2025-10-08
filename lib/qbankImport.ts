// Q-Bank Import and Validation Utilities
import { ErrorLog, ExternalQuestionMetadata, QuestionBank, DifficultyLevel, OrganSystem } from './types';
import { findOrganSystemByName } from './taxonomy';

/**
 * Import format from external Q-banks
 * Flexible schema supporting UWorld, Amboss, NBME, etc.
 */
export interface QBankImportFormat {
  // Required fields
  questionId: string;
  questionBank: string;

  // Question content
  description?: string;
  topic?: string;

  // Categorization
  system?: string;
  subject?: string;
  subjects?: Array<{ name: string; percentage?: number }>;

  // Difficulty (flexible formats)
  difficulty?: string | number;
  percentCorrect?: number;

  // Educational content
  learningObjectives?: string[];
  educationalObjectives?: string[]; // UWorld uses this
  objectives?: string[];
  tags?: string[];

  // Timing
  estimatedTime?: number;
  tutorModeTime?: number;
  timedModeTime?: number;
  actualTime?: number;

  // Advanced
  bloomsLevel?: string;
  bloomsTaxonomy?: string;
  cognitiveLevel?: string;
  examRelevance?: {
    step1?: number;
    step2ck?: number;
    step3?: number;
  };

  // Error tracking
  errorType?: string;
  confidence?: string;
  nextSteps?: string[];

  // Preserve everything else
  [key: string]: unknown;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview?: {
    questionId: string;
    questionBank: string;
    system?: string;
    topic?: string;
    difficulty?: number;
  };
}

/**
 * Validate import format
 */
export function validateImport(data: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type check
  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      errors: ['Invalid JSON: must be an object'],
      warnings: [],
    };
  }

  const item = data as Record<string, unknown>;

  // Required fields
  if (!item.questionId || typeof item.questionId !== 'string') {
    errors.push('Missing or invalid "questionId" (required)');
  }

  if (!item.questionBank || typeof item.questionBank !== 'string') {
    errors.push('Missing or invalid "questionBank" (required)');
  }

  // Optional field type checks
  if (item.percentCorrect !== undefined) {
    const pc = Number(item.percentCorrect);
    if (isNaN(pc) || pc < 0 || pc > 100) {
      warnings.push('percentCorrect should be 0-100');
    }
  }

  if (item.learningObjectives !== undefined && !Array.isArray(item.learningObjectives)) {
    warnings.push('learningObjectives should be an array');
  }

  if (item.tags !== undefined && !Array.isArray(item.tags)) {
    warnings.push('tags should be an array');
  }

  // Generate preview
  const preview = errors.length === 0 ? {
    questionId: String(item.questionId),
    questionBank: String(item.questionBank),
    system: item.system ? String(item.system) : undefined,
    topic: item.topic ? String(item.topic) : undefined,
    difficulty: item.difficulty ? normalizeDifficulty(item.difficulty) : undefined,
  } : undefined;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    preview,
  };
}

/**
 * Normalize difficulty from various formats to 1-5 scale
 */
export function normalizeDifficulty(difficulty: unknown): DifficultyLevel | undefined {
  if (typeof difficulty === 'number') {
    if (difficulty >= 1 && difficulty <= 5) {
      return Math.round(difficulty) as DifficultyLevel;
    }
    // Assume percentage
    if (difficulty >= 0 && difficulty <= 100) {
      if (difficulty >= 80) return 1; // Easy
      if (difficulty >= 60) return 2;
      if (difficulty >= 40) return 3; // Medium
      if (difficulty >= 20) return 4;
      return 5; // Hard
    }
  }

  if (typeof difficulty === 'string') {
    const lower = difficulty.toLowerCase();
    if (lower.includes('easy') || lower === '1') return 1;
    if (lower.includes('medium') || lower === '2' || lower === '3') return 3;
    if (lower.includes('hard') || lower === '4' || lower === '5') return 5;
  }

  return undefined;
}

/**
 * Normalize question bank name
 */
export function normalizeQuestionBank(bank: string): QuestionBank {
  const lower = bank.toLowerCase().trim();
  if (lower.includes('uworld') || lower === 'uw') return 'uworld';
  if (lower.includes('amboss')) return 'amboss';
  if (lower.includes('nbme') || lower.includes('self-assessment')) return 'nbme';
  if (lower.includes('kaplan')) return 'kaplan';
  if (lower.includes('rx') || lower.includes('usmle-rx')) return 'rx';
  return 'other';
}

/**
 * Map external system name to our NBME taxonomy
 */
export function mapSystemToTaxonomy(systemName?: string): {
  system: OrganSystem;
  systemId?: string;
} {
  if (!systemName) {
    return { system: 'Multisystem/General Principles' };
  }

  // Try taxonomy lookup first
  const taxonomySystem = findOrganSystemByName(systemName);
  if (taxonomySystem) {
    // Map taxonomy ID to legacy name
    const legacyMapping: Record<string, OrganSystem> = {
      'sys-cardiovascular': 'Cardiovascular',
      'sys-respiratory': 'Respiratory',
      'sys-gastrointestinal': 'Gastrointestinal',
      'sys-renal-urinary': 'Renal/Urinary',
      'sys-reproductive': 'Reproductive',
      'sys-endocrine': 'Endocrine',
      'sys-musculoskeletal': 'Musculoskeletal',
      'sys-skin': 'Skin/Connective Tissue',
      'sys-nervous': 'Nervous System/Special Senses',
      'sys-blood-lymph': 'Hematologic/Lymphatic',
      'sys-immune': 'Immune',
      'sys-behavioral': 'Behavioral Science',
      'sys-multisystem': 'Multisystem/General Principles',
    };

    return {
      system: legacyMapping[taxonomySystem.id] || 'Multisystem/General Principles',
      systemId: taxonomySystem.id,
    };
  }

  // Fallback to exact match
  const legacySystems: OrganSystem[] = [
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

  const match = legacySystems.find(
    s => s.toLowerCase() === systemName.toLowerCase()
  );

  return { system: match || 'Multisystem/General Principles' };
}

/**
 * Convert Q-bank import format to ExternalQuestionMetadata
 */
export function convertToExternalMetadata(data: QBankImportFormat): ExternalQuestionMetadata {
  const metadata: ExternalQuestionMetadata = {
    questionId: data.questionId,
    questionBank: normalizeQuestionBank(data.questionBank),
  };

  // Difficulty
  if (data.difficulty !== undefined) {
    metadata.difficulty = normalizeDifficulty(data.difficulty);
  }

  // Performance
  if (data.percentCorrect !== undefined) {
    metadata.percentCorrect = Number(data.percentCorrect);
  }

  // Learning objectives (multiple possible field names)
  const objectives = data.learningObjectives || data.educationalObjectives || data.objectives;
  if (objectives && Array.isArray(objectives)) {
    metadata.learningObjectives = objectives.filter(o => typeof o === 'string');
  }

  // Tags
  if (data.tags && Array.isArray(data.tags)) {
    metadata.externalTags = data.tags.filter(t => typeof t === 'string');
  }

  // Timing (prefer actualTime, then estimatedTime, then tutorModeTime)
  if (data.actualTime !== undefined) {
    metadata.actualTime = Number(data.actualTime);
  }
  if (data.estimatedTime !== undefined) {
    metadata.estimatedTime = Number(data.estimatedTime);
  } else if (data.tutorModeTime !== undefined) {
    metadata.estimatedTime = Number(data.tutorModeTime);
  }

  // Bloom's taxonomy
  const blooms = data.bloomsLevel || data.bloomsTaxonomy;
  if (blooms && typeof blooms === 'string') {
    metadata.bloomsLevel = blooms;
  }

  // Exam relevance
  if (data.examRelevance) {
    metadata.examRelevance = {
      step1: data.examRelevance.step1,
      step2ck: data.examRelevance.step2ck,
      step3: data.examRelevance.step3,
    };
  }

  // Multi-subject
  if (data.subjects && Array.isArray(data.subjects)) {
    metadata.subjects = data.subjects;
  }

  // Raw metadata (preserve everything)
  metadata.rawMetadata = { ...data };

  return metadata;
}

/**
 * Convert Q-bank import to full ErrorLog
 */
export function convertToErrorLog(data: QBankImportFormat): Partial<ErrorLog> {
  const systemMapping = mapSystemToTaxonomy(data.system || data.subject);
  const externalMetadata = convertToExternalMetadata(data);

  const errorLog: Partial<ErrorLog> = {
    id: `import-${data.questionBank}-${data.questionId}-${Date.now()}`,
    timestamp: new Date(),
    description: data.description || `Question ${data.questionId} from ${data.questionBank}`,
    system: systemMapping.system,
    systemId: systemMapping.systemId,
    topic: data.topic || 'Imported question',
    externalQuestion: externalMetadata,
  };

  // Map error type if provided
  if (data.errorType) {
    const errorTypeMap: Record<string, ErrorLog['errorType']> = {
      'knowledge': 'knowledge',
      'reasoning': 'reasoning',
      'process': 'process',
      'time': 'time',
    };
    errorLog.errorType = errorTypeMap[data.errorType.toLowerCase()] || 'knowledge';
  }

  // Map confidence if provided
  if (data.confidence) {
    const confMap: Record<string, ErrorLog['confidence']> = {
      'guessed': 'guessed',
      'eliminated': 'eliminated',
      'confident': 'confident',
      'certain': 'certain',
    };
    errorLog.confidence = confMap[data.confidence.toLowerCase()] || 'guessed';
  }

  // Map cognitive level
  if (data.cognitiveLevel) {
    const lower = data.cognitiveLevel.toLowerCase();
    if (lower.includes('first') || lower.includes('recall') || lower.includes('remember')) {
      errorLog.cognitiveLevel = 'first-order';
    } else if (lower.includes('higher') || lower.includes('apply') || lower.includes('analyze')) {
      errorLog.cognitiveLevel = 'higher-order';
    }
  }

  // Next steps
  if (data.nextSteps && Array.isArray(data.nextSteps)) {
    errorLog.nextSteps = data.nextSteps.filter(s => typeof s === 'string');
  }

  return errorLog;
}

/**
 * Batch validate multiple imports
 */
export function validateBatchImport(items: unknown[]): {
  validCount: number;
  invalidCount: number;
  results: ImportValidationResult[];
} {
  const results = items.map(validateImport);
  const validCount = results.filter(r => r.valid).length;

  return {
    validCount,
    invalidCount: items.length - validCount,
    results,
  };
}
