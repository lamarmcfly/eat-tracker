// Step Exam Readiness Assessment (Step 1, Step 2 CK, Step 3)
// Based on NBME Practice Exams with progression tracking toward exam day

import { PracticeTest } from './types';
import { StepExamReadiness, ExamTarget as CorrectedExamTarget } from './practiceTestTypes';

/**
 * Calculate Step exam readiness based on NBME practice exam performance
 * Tracks progress and trend toward exam day
 *
 * Research-backed criteria:
 * - 2 consecutive scores ≥65% indicates readiness
 * - NBME predictions within 10-15 points of actual score
 * - Should take 4-6 practice tests during dedicated study
 * - Optimal: Take tests every 1-2 weeks leading up to exam
 */
export function calculateStepExamReadiness(
  tests: PracticeTest[],
  examTarget: 'step1' | 'step2ck' | 'step3',
  examDate?: Date
): StepExamReadiness {
  // Filter only practice exams for this Step exam
  const practiceTests = tests
    .filter(t => t.examTarget === examTarget)
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Chronological order

  const now = new Date();
  const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
  const weeksOfPreparation = practiceTests.length > 0
    ? Math.ceil((now.getTime() - practiceTests[0].date.getTime()) / (1000 * 60 * 60 * 24 * 7))
    : 0;

  // No tests taken yet
  if (practiceTests.length === 0) {
    return {
      examTarget,
      isReady: false,
      confidence: 'not-ready',
      hasConsecutive65Plus: false,
      consecutiveCount: 0,
      averageScore: 0,
      recentTrend: 'stable',
      daysUntilExam,
      examDate,
      practiceTestsTaken: 0,
      practiceTestsRecommended: daysUntilExam && daysUntilExam < 42 ? Math.floor(daysUntilExam / 7) : 4,
      weeksOfPreparation: 0,
      message: examDate
        ? `No practice tests taken yet. ${daysUntilExam} days until exam.`
        : 'Take a baseline practice test to assess your starting point.',
      recommendations: [
        'Take your first NBME practice exam to establish a baseline',
        'Don\'t worry about the first score - it shows where you are',
        'Plan to take 4-6 practice tests total during dedicated study',
        examDate ? `With ${daysUntilExam} days left, take a practice test every 1-2 weeks` : 'Set your exam date to track progress',
      ],
      testHistory: [],
    };
  }

  // Calculate consecutive 65%+ streak (most recent)
  let consecutiveCount = 0;
  for (let i = practiceTests.length - 1; i >= 0; i--) {
    if (practiceTests[i].percentCorrect >= 65) {
      consecutiveCount++;
    } else {
      break;
    }
  }

  const hasConsecutive65Plus = consecutiveCount >= 2;
  const averageScore = practiceTests.reduce((sum, t) => sum + t.percentCorrect, 0) / practiceTests.length;

  // Determine trend (last 3 tests)
  const recentTests = practiceTests.slice(-3);
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
  const nbmeTests = practiceTests.filter(t => t.predictedScore !== undefined);
  const latestNBMEPrediction = nbmeTests.length > 0 ? nbmeTests[nbmeTests.length - 1].predictedScore : undefined;
  const averageNBMEPrediction = nbmeTests.length > 0
    ? Math.round(nbmeTests.reduce((sum, t) => sum + (t.predictedScore || 0), 0) / nbmeTests.length)
    : undefined;

  // Calculate recommended number of practice tests
  const practiceTestsRecommended = daysUntilExam && daysUntilExam > 0
    ? Math.min(6, Math.max(4, Math.floor(daysUntilExam / 7)))  // 1 test per week, 4-6 total
    : Math.max(4, practiceTests.length + 1);

  // Determine readiness
  let isReady = false;
  let confidence: 'high' | 'moderate' | 'low' | 'not-ready' = 'not-ready';
  let message = '';
  const recommendations: string[] = [];

  // READY - High Confidence
  if (hasConsecutive65Plus && recentTrend === 'improving' && practiceTests.length >= 4) {
    isReady = true;
    confidence = 'high';
    message = daysUntilExam
      ? `🎯 Ready for exam day! ${consecutiveCount} consecutive 65%+ with improving trend. ${daysUntilExam} days to go.`
      : `🎯 You're ready! ${consecutiveCount} consecutive 65%+ with improving trend.`;

    recommendations.push(
      daysUntilExam && daysUntilExam > 21 ? 'Consider scheduling exam in 2-3 weeks' : 'Maintain daily practice questions',
      'Focus final review on weakest 2-3 topics',
      'Trust your preparation - you\'re trending upward'
    );

    if (latestNBMEPrediction && latestNBMEPrediction >= 220) {
      recommendations.push(`Latest NBME predicts ${latestNBMEPrediction} - excellent trajectory`);
    }
  }
  // READY - Moderate Confidence
  else if (hasConsecutive65Plus && practiceTests.length >= 3) {
    isReady = true;
    confidence = 'moderate';
    message = daysUntilExam
      ? `✅ On track. ${consecutiveCount} consecutive 65%+. ${daysUntilExam} days until exam.`
      : `✅ You're ready. ${consecutiveCount} consecutive 65%+ (research-backed criterion).`;

    if (recentTrend === 'declining') {
      recommendations.push(
        '⚠️ Recent decline detected - take 2-3 days rest to avoid burnout',
        'Review what changed in your study approach',
        'Don\'t panic - small dips are normal'
      );
    } else {
      recommendations.push(
        practiceTests.length < practiceTestsRecommended ? 'Take one more practice test to confirm stability' : 'Maintain current study routine',
        'Review error log patterns to push score higher',
        daysUntilExam && daysUntilExam > 14 ? 'Take final practice test 1 week before exam' : 'Final week: light review only'
      );
    }

    if (averageNBMEPrediction) {
      recommendations.push(`Average NBME prediction: ${averageNBMEPrediction}`);
    }
  }
  // ALMOST READY - Need one more 65%+
  else if (consecutiveCount === 1 && practiceTests.length >= 2) {
    isReady = false;
    confidence = 'low';
    message = daysUntilExam
      ? `📈 Almost there! 1 test at 65%+. One more 65%+ confirms readiness. ${daysUntilExam} days left.`
      : '📈 Almost ready! One more consecutive 65%+ score confirms readiness.';

    if (daysUntilExam && daysUntilExam < 14) {
      recommendations.push(
        '⚠️ Exam is in 2 weeks - take practice test ASAP to confirm readiness',
        'If next test is <65%, consider postponing exam',
        'Focus heavily on your weak areas before next practice test'
      );
    } else {
      recommendations.push(
        'Take next practice test in 1 week',
        'Deep review of errors from last test',
        'If next test ≥65%, you meet the readiness criterion',
        averageScore >= 60 ? 'Your average is strong - you\'re very close' : 'Focus on bringing average above 60%'
      );
    }
  }
  // NOT READY - Inconsistent or insufficient data
  else if (practiceTests.length < 3) {
    isReady = false;
    confidence = 'not-ready';
    message = daysUntilExam
      ? `📚 ${practiceTests.length} test(s) taken. Need ${practiceTestsRecommended - practiceTests.length} more. ${daysUntilExam} days until exam.`
      : `📚 ${practiceTests.length} test(s) taken. Take more practice tests to establish trend.`;

    if (daysUntilExam && daysUntilExam < 28) {
      recommendations.push(
        `⚠️ Only ${daysUntilExam} days left - you need more practice test data`,
        'Take practice tests every 5-7 days from now on',
        averageScore < 60 ? '⚠️ Consider postponing exam if scores don\'t improve' : 'Aim for 65%+ on next 2 tests'
      );
    } else {
      recommendations.push(
        `Take practice test every 1-2 weeks (${practiceTestsRecommended} total recommended)`,
        'Review errors thoroughly between tests',
        'Track your weakest systems and focus study there'
      );
    }
  }
  // NOT READY - Below threshold
  else {
    isReady = false;
    confidence = 'not-ready';
    message = daysUntilExam
      ? `📚 Average ${averageScore.toFixed(1)}% (target: 65%+). ${daysUntilExam} days until exam.`
      : `📚 Average ${averageScore.toFixed(1)}%. Need 2 consecutive 65%+ for readiness.`;

    const gap = Math.ceil(65 - averageScore);

    if (daysUntilExam && daysUntilExam < 28) {
      recommendations.push(
        `⚠️ ${gap}% gap to close in ${daysUntilExam} days - strongly consider postponing`,
        'Speak with mentor about delaying exam 4-6 weeks',
        'Focus on highest-yield topics only',
        'Take practice test weekly to track improvement'
      );
    } else {
      recommendations.push(
        `Gap to close: ${gap} percentage points`,
        'Analyze error patterns across all practice tests',
        'Focus 80% of study time on your weakest 3-4 systems',
        'Take practice test every 2 weeks to track progress',
        daysUntilExam ? 'You have time - use it strategically' : 'Don\'t schedule exam until reaching 65%+ twice'
      );
    }
  }

  // Add timeline-specific recommendations
  if (daysUntilExam) {
    if (daysUntilExam <= 7 && !isReady) {
      recommendations.unshift('🚨 EXAM IN 1 WEEK - If not ready, postpone immediately');
    } else if (daysUntilExam <= 14 && confidence === 'not-ready') {
      recommendations.unshift('⚠️ EXAM IN 2 WEEKS - Scores suggest postponing is wise');
    } else if (daysUntilExam > 42 && practiceTests.length < 2) {
      recommendations.push(`${daysUntilExam} days left - take first practice test to establish baseline`);
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
    latestNBMEPrediction,
    averageNBMEPrediction,
    daysUntilExam,
    examDate,
    practiceTestsTaken: practiceTests.length,
    practiceTestsRecommended,
    weeksOfPreparation,
    message,
    recommendations,
    testHistory: practiceTests as any[],
  };
}

/**
 * Get exam name for display
 */
export function getStepExamName(examTarget: 'step1' | 'step2ck' | 'step3'): string {
  return {
    step1: 'USMLE Step 1',
    step2ck: 'USMLE Step 2 CK',
    step3: 'USMLE Step 3',
  }[examTarget];
}
