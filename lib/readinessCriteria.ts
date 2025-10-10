// Research-Backed Exam Readiness Criteria
// Exam-specific criteria for Step 1, Step 2 CK, Step 3, and Shelf exams

/**
 * Get exam-specific readiness explanation text for UI
 */
export function getReadinessExplanation(
  examType: 'step1' | 'step2ck' | 'step3' | 'shelf',
  hasGoalScore: boolean
): string {
  // Step 1 - Pass/Fail (post-2022)
  if (examType === 'step1') {
    return `**Step 1 Readiness Criteria (Pass/Fail Format):**

Since 2022, Step 1 is Pass/Fail. NBME practice exams no longer provide 3-digit predictions.

**You're ready when:**
• 2+ consecutive practice tests showing 60%+ correct (passing threshold)
• Improving or stable trend across assessments
• Consistently answering 120+/200 questions correctly on NBME forms

**Key Research:**
• NBME forms calibrated to ~60% correct = passing performance
• Free 120: 72+/120 correct (60%) suggests passing likelihood
• Multiple assessments reduce single-test variability

**Recommendation:** Take 4-6 practice tests during dedicated study. Focus on passing threshold, not score chasing.`;
  }

  // Step 2 CK - Scored exam
  if (examType === 'step2ck') {
    if (hasGoalScore) {
      return `**Step 2 CK Readiness Criteria (Scored Exam):**

NBME self-assessments predict actual Step 2 CK scores within ±10-15 points (Cuddy et al., 2011).

**You're ready when:**
• 2+ consecutive NBME predictions at/above your goal score, OR
• Improving trend with predictions within 10 points of goal
• Average NBME prediction matches target (±10 points)

**Score Benchmarks:**
• 240+ = Competitive for most residencies
• 250+ = Strong applicant for competitive specialties
• 260+ = Top tier performance

**Recommendation:** Take UWSA1, UWSA2, and 2-3 NBME forms. Space tests 1-2 weeks apart during dedicated period.`;
    }

    return `**Step 2 CK Readiness Criteria (Scored Exam):**

NBME self-assessments are validated predictors (±10-15 points accuracy).

**General Readiness Indicators:**
• 2+ consecutive scores showing 65%+ correct (~230-240 range)
• Improving trend across multiple assessments
• NBME predictions consistently above 220 (passing threshold)

**Set a target score for personalized guidance:**
• Competitive residency programs emphasize Step 2 CK scores
• Your goal determines readiness beyond just "passing"
• Typical targets: 240+ (most specialties), 250+ (competitive fields)

**Recommendation:** Take UWSA1, UWSA2, and 2-3 NBME forms during dedicated study.`;
  }

  // Step 3 - Scored exam
  if (examType === 'step3') {
    if (hasGoalScore) {
      return `**Step 3 Readiness Criteria (Scored Exam):**

NBME practice exams predict Step 3 performance. Step 3 tests clinical management and is typically easier than Step 2 CK.

**You're ready when:**
• 2+ consecutive practice tests at/above your goal score
• Consistent performance on both MCQ and CCS (case simulations)
• Predictions within 10 points of target

**Score Context:**
• 220+ = Passing threshold
• 230+ = Solid performance
• Step 3 less emphasized in residency applications (you're already matched)

**Recommendation:** Take 2-4 practice tests. Focus on CCS practice as it's unique to Step 3.`;
    }

    return `**Step 3 Readiness Criteria (Scored Exam):**

Step 3 tests clinical management during PGY-1 year. Typically easier than Step 2 CK.

**Readiness Indicators:**
• 2+ consecutive practice tests showing 60%+ correct (passing level)
• Comfortable with CCS (computer-based case simulations)
• Consistent performance across MCQ and CCS components

**Important Notes:**
• Step 3 required for medical licensure but less emphasized in applications
• Most residents take during PGY-1 year
• CCS practice is essential - unique to Step 3

**Recommendation:** Take 2-4 practice tests including CCS practice. Focus on clinical management concepts.`;
  }

  // Shelf exams
  return getShelfReadinessExplanation();
}

/**
 * Shelf Exam Readiness Criteria
 */
export function getShelfReadinessExplanation(): string {
  return `**Shelf Exam Readiness (Clerkship Finals):**

NBME shelf practice questions strongly correlate with actual shelf exam performance during clerkships.

**Practice Test → Shelf Final Predictions:**
• 75%+ on practice tests → Honors trajectory (top ~30%)
• 70-74% on practice tests → High Honors/Honors borderline
• 65-69% on practice tests → High Pass trajectory
• 60-64% on practice tests → Pass trajectory
• <60% on practice tests → At risk, intervention needed

**Important Distinctions:**
• Shelf PRACTICE tests predict your clerkship FINAL exam grade
• Shelf FINAL exam grades (actual results) then correlate with Step 2 CK readiness
• Strong shelf finals (multiple honors) predict Step 2 CK scores 245+

**Recommendation:** Do 30-50 practice questions daily during rotation. Take timed practice test at mid-rotation to assess trajectory.`;
}

/**
 * Step 2 CK Readiness from Shelf Finals
 */
export function getShelfToStep2Explanation(): string {
  return `**Shelf Finals → Step 2 CK Correlation:**

Research shows strong correlation between clerkship shelf FINAL exam performance and Step 2 CK scores.

**Predictive Patterns (based on actual shelf final grades):**
• 70%+ Honors grades (5+/7) → Predicts Step 2 score 250+
• Consistent High Pass/Honors mix → Predicts Step 2 score 240-249
• Mixed Pass/High Pass → Predicts Step 2 score 230-239
• Multiple Pass grades only → Suggests extended Step 2 prep needed

**Key Insight:**
This correlation uses your actual shelf FINAL exam results, not practice test scores.

**Recommendation:** After completing 4+ core clerkships, use your actual shelf grades to predict Step 2 readiness and set realistic score goals.`;
}
