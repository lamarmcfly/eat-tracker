// Core data models for E.A.T. Tracker

export type ErrorType = 'knowledge' | 'reasoning' | 'process' | 'time';
export type Confidence = 1 | 2 | 3 | 4 | 'guessed' | 'eliminated' | 'confident' | 'certain'; // Hybrid: support both old and new
export type CognitiveLevel = 'first-order' | 'higher-order';

// Cognitive Level Definitions:
// - first-order: Recall, recognition, basic understanding (Bloom's: Remember, Understand)
// - higher-order: Application, analysis, synthesis, evaluation (Bloom's: Apply, Analyze, Evaluate, Create)

// External Q-Bank Integration
export type QuestionBank = 'uworld' | 'amboss' | 'nbme' | 'kaplan' | 'rx' | 'other';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5; // 1=Easy, 3=Medium, 5=Hard

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
  cognitiveLevel?: CognitiveLevel; // first-order (recall) vs higher-order (analysis/synthesis)
  nextSteps: string[]; // actionable items
  tags?: string[];

  // Optional enhanced categorization (future)
  disciplineId?: string;   // e.g., "disc-pathology"
  competencyId?: string;   // e.g., "comp-diagnosis"

  // External Q-Bank metadata (optional)
  externalQuestion?: ExternalQuestionMetadata;

  // Migration metadata
  _oldSystem?: string;  // Preserved during migration for debugging
}

/**
 * External Q-Bank Question Metadata
 * Optional extension for importing data from UWorld, Amboss, NBME, etc.
 */
export interface ExternalQuestionMetadata {
  // Source identification
  questionId: string;           // Original Q-bank question ID (e.g., "uw-12345")
  questionBank: QuestionBank;   // Source Q-bank

  // Difficulty and performance
  difficulty?: DifficultyLevel; // Normalized 1-5 scale
  percentCorrect?: number;      // National average: 0-100

  // Educational content
  learningObjectives?: string[]; // Educational goals from Q-bank
  externalTags?: string[];       // Original Q-bank tags (High-Yield, Commonly-Missed, etc.)

  // Timing
  estimatedTime?: number;        // Expected time in seconds
  actualTime?: number;           // Your actual completion time in seconds

  // Advanced categorization
  bloomsLevel?: string;          // Bloom's taxonomy level if provided
  examRelevance?: {              // Exam-specific relevance scores
    step1?: number;              // 1-5 scale
    step2ck?: number;
    step3?: number;
  };

  // Multi-subject questions
  subjects?: Array<{
    name: string;
    percentage?: number;         // Weighting for cross-disciplinary questions
  }>;

  // Raw metadata for future use
  rawMetadata?: Record<string, unknown>; // Preserve original data

  // Spaced repetition timing (UWorld/AMBOSS show next review date)
  nextQBankReview?: Date;        // When Q-bank will show this again (from Q-bank's algorithm)
}

/**
 * Spaced Repetition Review Scheduling
 * Strategically schedules reviews BEFORE seeing question again in Q-bank
 * to maximize retention when it matters most
 */
export interface SpacedReview {
  errorId: string;               // Reference to the original error
  lastSeenInQBank: Date;         // When you encountered this Q-bank question
  nextQBankReview?: Date;        // When Q-bank will show it again (if provided)
  targetReviewDate: Date;        // Strategic review date (1-2 days BEFORE next Q-bank review)
  reviewReason: string;          // Plain-language explanation (e.g., "Review before UWorld shows it again")
}

export interface TopicPattern {
  topic: string;
  system: OrganSystem;
  systemId?: string;   // New: taxonomy ID for exam weight lookup
  errorCount: number;
  errorTypes: Record<ErrorType, number>;
  averageConfidence: number;
  lastSeen: Date;
}

export type UrgencyLevel = 'urgent' | 'high' | 'moderate' | 'low';
export type ActivityType = 'retrieval' | 'review' | 'practice';
export type ErrorTypeStrategy = 'knowledge-review' | 'practice-problems' | 'strategy-coaching';

export interface StudyBlock {
  id: string;
  day: number; // 1-14 (extended from 7 for urgent topics)
  topic: string;
  system: OrganSystem;
  systemId?: string;
  activity: ActivityType;
  duration: number; // minutes
  priority: number; // 1-based rank
  reasoning: string; // human-readable explanation

  // Enhanced scheduling fields
  urgency?: UrgencyLevel;
  scheduledDate?: Date;
  errorTypeStrategy?: ErrorTypeStrategy;
  whyScheduled?: string; // "recent + frequent + high-yield"
  nextReview?: Date;
  priorityScore?: number; // 0-100 composite score (hidden from user)
}

export interface StudyPlan {
  generatedAt: Date;
  weekStart: Date;
  examDate?: Date; // Optional user-provided exam date
  daysUntilExam?: number;
  blocks: StudyBlock[];
}

// Practice Test Tracking & Exam Readiness Assessment
export type ExamTarget = 'step1' | 'step2ck' | 'step3' | 'shelf';

export type PracticeTestType =
  // Step 1
  | 'nbme-step1'
  | 'uwsa1-step1'
  | 'uwsa2-step1'
  | 'free120-step1'
  | 'amboss-sa-step1'
  // Step 2 CK
  | 'nbme-step2'
  | 'uwsa1-step2'
  | 'uwsa2-step2'
  | 'free120-step2'
  | 'amboss-sa-step2'
  // Shelf Exams
  | 'nbme-shelf-im'        // Internal Medicine
  | 'nbme-shelf-surgery'
  | 'nbme-shelf-peds'
  | 'nbme-shelf-obgyn'
  | 'nbme-shelf-psych'
  | 'nbme-shelf-neuro'
  | 'nbme-shelf-family'
  | 'nbme-shelf-other'
  // Other
  | 'kaplan-sim'
  | 'other';

export interface PracticeTest {
  id: string;
  examTarget: ExamTarget;        // Which exam this prepares for
  testType: PracticeTestType;
  testName: string;              // "NBME 25", "UWSA1", "IM Shelf", etc.
  date: Date;
  score: number;                 // Actual score (0-300 for NBME, 0-100% for others)
  percentCorrect: number;        // Always normalized to 0-100%
  totalQuestions: number;
  correctAnswers: number;

  // NBME Prediction (if applicable)
  predictedScore?: number;       // Predicted Step/Shelf score
  // For shelf FINAL exams - actual grade received
  shelfGrade?: 'honors' | 'high-pass' | 'pass' | 'fail';
  shelfPercentile?: number;      // National percentile on shelf final

  // System breakdown (optional)
  systemBreakdown?: Array<{
    system: OrganSystem;
    correct: number;
    total: number;
    percentCorrect: number;
  }>;

  notes?: string;
}

export interface ExamReadiness {
  examTarget: ExamTarget;        // Which exam readiness is for
  isReady: boolean;              // Overall readiness flag
  confidence: 'high' | 'moderate' | 'low' | 'not-ready';

  // Core readiness criteria (Research-backed: 2 consecutive 65%+ indicates readiness)
  hasConsecutive65Plus: boolean; // 2 consecutive scores ≥65%
  consecutiveCount: number;      // How many consecutive 65%+ scores
  averageScore: number;          // Average across all practice tests
  recentTrend: 'improving' | 'stable' | 'declining';

  // NBME predictions
  latestNBMEPrediction?: number; // Most recent NBME predicted score
  averageNBMEPrediction?: number;

  // Readiness messages
  message: string;               // Primary readiness message
  recommendations: string[];     // Actionable recommendations

  // Supporting data
  totalTests: number;
  testHistory: PracticeTest[];
}

// Student Goal Settings
export interface StudentGoals {
  // Step exam goals
  step1Target?: number;          // Target score (e.g., 240)
  step2ckTarget?: number;        // Target score (e.g., 250)
  step3Target?: number;          // Target score (e.g., 230)
  
  // Shelf exam goals (percentile or honor threshold)
  shelfTarget?: number;          // Target percentile (e.g., 70 for Honors)
  shelfHonorsThreshold?: number; // School-specific honors cutoff
  
  // Exam dates
  step1Date?: Date;
  step2ckDate?: Date;
  step3Date?: Date;
  
  // Current year/phase
  medSchoolYear?: 'MS1' | 'MS2' | 'MS3' | 'MS4';
}

// Shelf Exam to Step 2 CK Correlation
export interface ShelfToStep2Correlation {
  averageShelfPercentile: number;      // Average across all shelf exams
  predictedStep2Score?: number;        // Predicted Step 2 CK score based on shelf performance
  shelfExamsTaken: number;             // Number of shelf exams completed
  honorsCount: number;                 // Number of honors grades
  highPassCount: number;               // Number of high pass grades
  passCount: number;                   // Number of pass grades
  
  // Readiness indicator
  isReadyForStep2: boolean;
  step2Confidence: 'high' | 'moderate' | 'low' | 'not-ready';
  recommendations: string[];
}
