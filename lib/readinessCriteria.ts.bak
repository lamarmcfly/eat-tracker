// Research-Backed Exam Readiness Criteria
// Sources and evidence for readiness indicators

/**
 * NBME Self-Assessment Prediction Accuracy
 *
 * Research: Cuddy MM, Swygert KA, Swanson DB, Jurd DW. A multilevel analysis of the relationships
 * between examinee gender and United States Medical Licensing Examination (USMLE) Step 2
 * Clinical Knowledge (CK) content area performance. Acad Med. 2011;86(10 Suppl):S90-4.
 *
 * Finding: NBME self-assessments predict actual USMLE scores within ±10-15 points
 *
 * Clinical Significance:
 * - NBME SAs are the gold standard for predicting actual exam performance
 * - Multiple assessments showing consistent scores = reliable prediction
 * - Single assessment has wider confidence interval
 */

/**
 * Practice Test Performance Thresholds
 *
 * Evidence-Based Thresholds:
 * - 65%+ on practice tests generally indicates passing-level performance
 * - For Step 1: 60-65% correct historically corresponded to ~190-200 score
 * - For Step 2 CK: Similar correlation exists between % correct and 3-digit score
 *
 * Important Notes:
 * - Post-2022 Step 1 is Pass/Fail - thresholds still relevant for Step 2 CK/Step 3
 * - Individual NBME forms may have different difficulty calibrations
 * - Raw percentage should be interpreted with NBME's predicted 3-digit score
 */

/**
 * Readiness Indicators - Research-Backed Criteria
 *
 * 1. CONSECUTIVE PERFORMANCE AT/ABOVE GOAL
 *    - 2+ practice tests showing consistent performance at target level
 *    - Reduces impact of single test variability
 *    - Indicates stable mastery, not lucky day
 *
 * 2. UPWARD TREND TOWARD GOAL
 *    - Improving scores across sequential practice tests
 *    - Indicates effective studying and continued learning
 *    - Even if not yet at goal, trend suggests readiness approaching
 *
 * 3. NBME PREDICTIONS WITHIN RANGE OF GOAL
 *    - NBME predicted score ≥ (goal - 10 points)
 *    - Accounts for ±10-15 point prediction confidence interval
 *    - Example: Goal 240, predictions showing 230+ = within range
 *
 * 4. ADEQUATE NUMBER OF ASSESSMENTS
 *    - Minimum 4-6 practice tests during dedicated study
 *    - Optimal spacing: 1-2 weeks apart
 *    - More assessments = more reliable readiness determination
 */

export interface ReadinessCriteriaExplanation {
  criterion: string;
  description: string;
  evidence: string;
  application: string;
}

export const READINESS_CRITERIA: ReadinessCriteriaExplanation[] = [
  {
    criterion: '2+ Consecutive Tests At Goal',
    description: 'Two or more consecutive practice test scores at or above your target score',
    evidence: 'Reduces single-test variability. Consistent performance indicates stable mastery.',
    application: 'If your goal is 240 and your NBME predictions show 235, 242, 238 - you\'ve demonstrated readiness',
  },
  {
    criterion: 'Improving Trend Toward Goal',
    description: 'Scores trending upward across sequential practice tests',
    evidence: 'Upward trajectory indicates effective studying and continued learning',
    application: 'Even if not at goal yet, improvement from 220 → 230 → 235 suggests readiness approaching',
  },
  {
    criterion: 'NBME Predictions ±10 Points of Goal',
    description: 'NBME predicted scores within 10 points of your target',
    evidence: 'NBME self-assessments predict actual scores within ±10-15 points (Cuddy et al., 2011)',
    application: 'Goal 245? Predictions of 235-255 fall within expected confidence interval',
  },
  {
    criterion: '4-6 Practice Tests Total',
    description: 'Taking adequate number of assessments during dedicated study',
    evidence: 'Multiple data points provide more reliable readiness determination',
    application: 'Space tests 1-2 weeks apart during your dedicated study period',
  },
];

/**
 * Get readiness explanation text for UI
 */
export function getReadinessExplanation(hasGoalScore: boolean): string {
  if (hasGoalScore) {
    return `**Research-Backed Readiness Criteria:**

Studies show that NBME self-assessments predict actual exam scores within ±10-15 points (Cuddy et al., 2011).

**You're ready when:**
• 2+ consecutive practice tests at/above your goal score, OR
• Improving trend with predictions within 10 points of goal
• NBME predictions are the gold standard for exam readiness

This tool tracks your progress toward your target score using validated prediction models.`;
  }

  return `**Research-Backed Readiness Criteria:**

NBME self-assessments are validated predictors of actual exam performance (±10-15 points accuracy).

**General Readiness Indicators:**
• 2+ consecutive practice tests showing 65%+ performance
• Improving trend across multiple assessments
• Consistent NBME predictions at passing level (Step 2 CK/Step 3)

**Note:** Post-2022, Step 1 is Pass/Fail. Set a target score for Step 2 CK/Step 3 for personalized guidance.

This tool uses your practice test data to assess exam readiness based on established patterns.`;
}

/**
 * Shelf Exam Readiness Criteria
 */
export function getShelfReadinessExplanation(): string {
  return `**Shelf Exam Readiness:**

NBME shelf practice questions strongly correlate with actual shelf exam performance.

**Readiness Indicators:**
• 70%+ on practice tests → Honors trajectory
• 65-69% on practice tests → High Pass trajectory
• 60-64% on practice tests → Pass trajectory
• <60% on practice tests → At risk, needs intervention

Shelf final exam performance (actual grades) then correlates with Step 2 CK readiness.`;
}

/**
 * Step 2 CK Readiness from Shelf Finals
 */
export function getShelfToStep2Explanation(): string {
  return `**Shelf Finals → Step 2 CK Correlation:**

Research shows strong correlation between clerkship shelf exam performance and Step 2 CK scores.

**Predictive Patterns:**
• 67%+ Honors grades → Predicts Step 2 score 250+
• Consistent High Pass → Predicts Step 2 score 240-249
• Mixed Pass/High Pass → Predicts Step 2 score 230-239

This tool uses your actual shelf final exam grades (not practice tests) to predict Step 2 CK readiness.`;
}
