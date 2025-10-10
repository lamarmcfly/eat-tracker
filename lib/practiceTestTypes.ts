// CORRECTED Practice Test Types and Correlation Logic
//
// KEY DISTINCTIONS:
// 1. NBME Practice Exams (NBME Step 1/2, UWSA, Free 120) → Predict ACTUAL Step exam readiness
// 2. Shelf Practice Exams (NBME shelf Q-banks) → Predict Clerkship Shelf FINAL exam readiness
// 3. Shelf FINAL Exam Scores → Correlate to Step 2 CK readiness

import { OrganSystem } from './types';

export type ExamTarget = 'step1' | 'step2ck' | 'step3' | 'shelf-practice' | 'shelf-final';

// Practice test types - CORRECTED to distinguish practice vs. final exams
export type PracticeTestType =
  // Step 1 PRACTICE exams (predict actual Step 1 performance)
  | 'nbme-step1-practice'     // NBME practice exam for Step 1
  | 'uwsa1-step1'             // UWorld Self-Assessment 1
  | 'uwsa2-step1'             // UWorld Self-Assessment 2
  | 'free120-step1'           // NBME Free 120
  | 'amboss-sa-step1'         // AMBOSS Self-Assessment

  // Step 2 CK PRACTICE exams (predict actual Step 2 CK performance)
  | 'nbme-step2-practice'     // NBME practice exam for Step 2 CK
  | 'uwsa1-step2'             // UWorld Self-Assessment 1
  | 'uwsa2-step2'             // UWorld Self-Assessment 2
  | 'free120-step2'           // NBME Free 120
  | 'amboss-sa-step2'         // AMBOSS Self-Assessment

  // Shelf PRACTICE exams (predict clerkship shelf FINAL exam performance)
  | 'shelf-practice-im'        // IM shelf practice questions
  | 'shelf-practice-surgery'
  | 'shelf-practice-peds'
  | 'shelf-practice-obgyn'
  | 'shelf-practice-psych'
  | 'shelf-practice-neuro'
  | 'shelf-practice-family'

  // Shelf FINAL exams (actual clerkship final - these correlate to Step 2 CK)
  | 'shelf-final-im'           // Actual IM shelf final exam score
  | 'shelf-final-surgery'
  | 'shelf-final-peds'
  | 'shelf-final-obgyn'
  | 'shelf-final-psych'
  | 'shelf-final-neuro'
  | 'shelf-final-family'

  // Other
  | 'other';

export interface PracticeTestCorrected {
  id: string;
  examTarget: ExamTarget;
  testType: PracticeTestType;
  testName: string;
  date: Date;

  // Raw scores
  percentCorrect: number;
  totalQuestions: number;
  correctAnswers: number;

  // For NBME practice exams → predicts actual exam score
  predictedScore?: number;       // e.g., "NBME predicts 235 for Step 1"

  // For shelf FINAL exams only
  shelfGrade?: 'honors' | 'high-pass' | 'pass' | 'fail';
  shelfPercentile?: number;      // National percentile on shelf final

  // Progress tracking
  daysBeforeExam?: number;       // How many days before actual exam was this taken

  systemBreakdown?: Array<{
    system: OrganSystem;
    correct: number;
    total: number;
    percentCorrect: number;
  }>;

  notes?: string;
}

// Readiness for ACTUAL Step exams (based on NBME practice exams)
export interface StepExamReadiness {
  examTarget: 'step1' | 'step2ck' | 'step3';
  isReady: boolean;
  confidence: 'high' | 'moderate' | 'low' | 'not-ready';

  // Core readiness (2 consecutive 65%+)
  hasConsecutive65Plus: boolean;
  consecutiveCount: number;
  averageScore: number;
  recentTrend: 'improving' | 'stable' | 'declining';

  // NBME predictions
  latestNBMEPrediction?: number;
  averageNBMEPrediction?: number;

  // Timeline to exam day
  daysUntilExam?: number;
  examDate?: Date;
  practiceTestsTaken: number;
  practiceTestsRecommended: number;  // Should have 4-6 practice tests
  weeksOfPreparation: number;

  message: string;
  recommendations: string[];
  testHistory: PracticeTestCorrected[];
}

// Readiness for Shelf FINAL exam (based on shelf practice questions)
export interface ShelfFinalReadiness {
  clerkshipRotation: string;     // e.g., "Internal Medicine"
  practiceTestsTaken: number;
  averagePracticeScore: number;

  // Prediction for shelf final exam
  predictedShelfGrade: 'honors' | 'high-pass' | 'pass' | 'at-risk';
  predictedPercentile?: number;

  isReadyForShelfFinal: boolean;
  confidence: 'high' | 'moderate' | 'low' | 'not-ready';
  daysUntilShelfFinal?: number;
  clerkshipEndDate?: Date;

  message: string;
  recommendations: string[];
  practiceHistory: PracticeTestCorrected[];
}

// Shelf FINALS → Step 2 CK Correlation (based on actual shelf final scores)
export interface ShelfFinalsToStep2 {
  shelfFinalsTaken: number;
  averageShelfPercentile: number;
  honorsCount: number;
  highPassCount: number;
  passCount: number;

  // Prediction for Step 2 CK based on shelf FINAL performance
  predictedStep2Score?: number;
  isReadyForStep2: boolean;
  step2Confidence: 'high' | 'moderate' | 'low' | 'not-ready';

  message: string;
  recommendations: string[];
  shelfFinalHistory: PracticeTestCorrected[];
}
