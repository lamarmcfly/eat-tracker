// Exam Readiness Assessment
// Research-backed criteria: 2 consecutive practice test scores ≥65% indicates exam readiness

import { PracticeTest, ExamReadiness, ExamTarget } from './types';

/**
 * Calculate exam readiness based on practice test performance
 * Key criterion: 2 consecutive scores ≥65% (research-backed predictor)
 */
export function calculateExamReadiness(
  tests: PracticeTest[],
  examTarget: ExamTarget
): ExamReadiness {
  // Filter tests for this specific exam
  const examTests = tests
    .filter(t => t.examTarget === examTarget)
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort chronologically

  if (examTests.length === 0) {
    return {
      examTarget,
      isReady: false,
      confidence: 'not-ready',
      hasConsecutive65Plus: false,
      consecutiveCount: 0,
      averageScore: 0,
      recentTrend: 'stable',
      message: 'No practice tests taken yet. Take your first practice test to establish a baseline.',
      recommendations: [
        'Take a baseline practice test (NBME or UWSA)',
        'Don\'t worry about the score - this establishes where you are',
        'Review your weak areas after each practice test',
      ],
      totalTests: 0,
      testHistory: [],
    };
  }

  // Calculate consecutive 65%+ streak (most recent)
  let consecutiveCount = 0;
  for (let i = examTests.length - 1; i >= 0; i--) {
    if (examTests[i].percentCorrect >= 65) {
      consecutiveCount++;
    } else {
      break; // Break streak
    }
  }

  const hasConsecutive65Plus = consecutiveCount >= 2;

  // Calculate average score
  const averageScore = examTests.reduce((sum, t) => sum + t.percentCorrect, 0) / examTests.length;

  // Determine trend (last 3 tests if available)
  const recentTests = examTests.slice(-3);
  let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';

  if (recentTests.length >= 2) {
    const firstHalf = recentTests.slice(0, Math.ceil(recentTests.length / 2));
    const secondHalf = recentTests.slice(Math.ceil(recentTests.length / 2));

    const firstAvg = firstHalf.reduce((sum, t) => sum + t.percentCorrect, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.percentCorrect, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 3) recentTrend = 'improving';
    else if (diff < -3) recentTrend = 'declining';
  }

  // NBME predictions
  const nbmeTests = examTests.filter(t => t.predictedScore !== undefined);
  const latestNBME = nbmeTests.length > 0 ? nbmeTests[nbmeTests.length - 1].predictedScore : undefined;
  const averageNBMEPrediction = nbmeTests.length > 0
    ? nbmeTests.reduce((sum, t) => sum + (t.predictedScore || 0), 0) / nbmeTests.length
    : undefined;

  // Determine overall readiness
  let isReady = false;
  let confidence: 'high' | 'moderate' | 'low' | 'not-ready' = 'not-ready';
  let message = '';
  const recommendations: string[] = [];

  if (hasConsecutive65Plus && recentTrend === 'improving') {
    isReady = true;
    confidence = 'high';
    message = `🎯 You're ready! ${consecutiveCount} consecutive scores ≥65% with improving trend.`;
    recommendations.push(
      'Schedule your exam within 2-3 weeks',
      'Continue daily practice questions to maintain momentum',
      'Focus final review on your weakest 2-3 topics'
    );

    if (latestNBME && latestNBME >= 220) {
      recommendations.push(`Your latest NBME predicts ${latestNBME} - excellent position`);
    }
  } else if (hasConsecutive65Plus && recentTrend === 'stable') {
    isReady = true;
    confidence = 'moderate';
    message = `✅ You're ready. ${consecutiveCount} consecutive scores ≥65% (research-backed criterion).`;
    recommendations.push(
      'Consider scheduling your exam within 3-4 weeks',
      'Take one more practice test to confirm stability',
      'Review error patterns to push score higher'
    );
  } else if (hasConsecutive65Plus && recentTrend === 'declining') {
    isReady = false;
    confidence = 'low';
    message = '⚠️ Recent declining trend despite consecutive 65%+ scores. Address burnout first.';
    recommendations.push(
      'Take 2-3 days off to prevent burnout',
      'Review what changed in your study approach',
      'Consider retaking one practice test after rest',
      'Don\'t schedule exam until trend reverses'
    );
  } else if (consecutiveCount === 1) {
    isReady = false;
    confidence = 'low';
    message = `📈 Almost there! 1 test ≥65%. One more consecutive 65%+ confirms readiness.`;
    recommendations.push(
      'Take another practice test in 1-2 weeks',
      'Review errors from your latest test thoroughly',
      'If next test is ≥65%, you meet the readiness criterion'
    );

    if (averageScore >= 60) {
      recommendations.push('Your average is strong - you\'re close to the threshold');
    }
  } else if (averageScore >= 60) {
    isReady = false;
    confidence = 'low';
    message = `📊 Average ${averageScore.toFixed(1)}% is close. Need 2 consecutive 65%+ to confirm readiness.`;
    recommendations.push(
      'You\'re in the "almost ready" zone',
      'Identify your 3-5 weakest topics and focus review there',
      'Take practice tests every 1-2 weeks to track progress',
      'Aim for consistency - avoid cramming before practice tests'
    );
  } else {
    isReady = false;
    confidence = 'not-ready';
    message = `📚 Continue building foundation. Average: ${averageScore.toFixed(1)}%. Target: 2 consecutive 65%+.`;
    recommendations.push(
      `Gap to close: ${Math.ceil(65 - averageScore)}% points`,
      'Focus on high-yield topics and error patterns',
      'Take practice tests every 2-3 weeks (not too frequently)',
      'Quality > quantity - review errors deeply'
    );

    if (examTests.length < 3) {
      recommendations.push('Take more practice tests to establish a reliable trend');
    }
  }

  // Add NBME-specific guidance
  if (latestNBME) {
    if (latestNBME >= 220) {
      recommendations.push(`NBME predicts ${latestNBME} - you're in a strong position`);
    } else if (latestNBME >= 200) {
      recommendations.push(`NBME predicts ${latestNBME} - solid, aim higher with focused review`);
    } else {
      recommendations.push(`NBME predicts ${latestNBME} - delay exam and strengthen fundamentals`);
    }
  }

  return {
    examTarget,
    isReady,
    confidence,
    hasConsecutive65Plus,
    consecutiveCount,
    averageScore,
    recentTrend,
    latestNBMEPrediction: latestNBME,
    averageNBMEPrediction,
    message,
    recommendations,
    totalTests: examTests.length,
    testHistory: examTests,
  };
}

/**
 * Get exam target display name
 */
export function getExamTargetName(examTarget: ExamTarget): string {
  const names: Record<ExamTarget, string> = {
    step1: 'USMLE Step 1',
    step2ck: 'USMLE Step 2 CK',
    step3: 'USMLE Step 3',
    shelf: 'Shelf Exam',
  };
  return names[examTarget];
}

/**
 * Get confidence color for UI
 */
export function getConfidenceColor(confidence: ExamReadiness['confidence']): string {
  return {
    'high': 'green',
    'moderate': 'blue',
    'low': 'yellow',
    'not-ready': 'red',
  }[confidence];
}
