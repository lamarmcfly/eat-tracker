// Shelf Exam to Step 2 CK Correlation Analysis
// Research shows strong correlation between shelf exam performance and Step 2 CK scores

import { PracticeTest, ShelfToStep2Correlation } from './types';

/**
 * Calculate Step 2 CK readiness based on shelf exam performance
 *
 * Research-backed correlations:
 * - Average shelf percentile 70+ → Step 2 score 250+
 * - Average shelf percentile 60-69 → Step 2 score 240-249
 * - Average shelf percentile 50-59 → Step 2 score 230-239
 * - Consistent honors on shelfs → Strong Step 2 predictor
 */
export function calculateShelfToStep2Correlation(
  shelfTests: PracticeTest[]
): ShelfToStep2Correlation {
  // Filter only shelf exams
  const shelfs = shelfTests.filter(t =>
    t.examTarget === 'shelf' && t.testType.includes('shelf')
  );

  if (shelfs.length === 0) {
    return {
      averageShelfPercentile: 0,
      shelfExamsTaken: 0,
      honorsCount: 0,
      highPassCount: 0,
      passCount: 0,
      isReadyForStep2: false,
      step2Confidence: 'not-ready',
      recommendations: [
        'Take shelf exams during your clerkship rotations',
        'Shelf exams are excellent predictors of Step 2 CK performance',
        'Input your shelf scores to get Step 2 readiness assessment',
      ],
    };
  }

  // Calculate average percentile (using percentCorrect as proxy)
  const averageShelfPercentile = shelfs.reduce((sum, t) => sum + t.percentCorrect, 0) / shelfs.length;

  // Count performance tiers (using percentCorrect thresholds)
  // Honors: typically ≥70%, High Pass: 60-69%, Pass: 50-59%
  const honorsCount = shelfs.filter(t => t.percentCorrect >= 70).length;
  const highPassCount = shelfs.filter(t => t.percentCorrect >= 60 && t.percentCorrect < 70).length;
  const passCount = shelfs.filter(t => t.percentCorrect >= 50 && t.percentCorrect < 60).length;

  // Predict Step 2 CK score based on shelf performance
  // Research-backed correlation: shelf percentile → Step 2 score
  let predictedStep2Score: number | undefined;
  if (shelfs.length >= 3) { // Need at least 3 shelf exams for reliable prediction
    if (averageShelfPercentile >= 75) {
      predictedStep2Score = 255 + (averageShelfPercentile - 75); // 255-280 range
    } else if (averageShelfPercentile >= 70) {
      predictedStep2Score = 250 + (averageShelfPercentile - 70); // 250-255 range
    } else if (averageShelfPercentile >= 60) {
      predictedStep2Score = 240 + (averageShelfPercentile - 60); // 240-250 range
    } else if (averageShelfPercentile >= 50) {
      predictedStep2Score = 230 + (averageShelfPercentile - 50); // 230-240 range
    } else {
      predictedStep2Score = 220 + averageShelfPercentile * 0.2; // Below 230
    }
    predictedStep2Score = Math.round(predictedStep2Score);
  }

  // Determine Step 2 readiness
  let isReadyForStep2 = false;
  let step2Confidence: 'high' | 'moderate' | 'low' | 'not-ready' = 'not-ready';
  const recommendations: string[] = [];

  // Strong performer - mostly honors
  if (honorsCount >= shelfs.length * 0.67 && shelfs.length >= 5) {
    isReadyForStep2 = true;
    step2Confidence = 'high';
    recommendations.push(
      `Excellent shelf performance! ${honorsCount}/${shelfs.length} honors grades`,
      'Your shelf performance predicts strong Step 2 CK score',
      'Schedule Step 2 CK after completing remaining clerkships',
      'Continue your current study approach - it\'s working'
    );
    if (predictedStep2Score) {
      recommendations.push(`Predicted Step 2 CK score: ${predictedStep2Score}`);
    }
  }
  // Solid performer - mix of honors and high pass
  else if (averageShelfPercentile >= 65 && shelfs.length >= 4) {
    isReadyForStep2 = true;
    step2Confidence = 'moderate';
    recommendations.push(
      'Solid shelf performance - on track for Step 2 CK',
      'Aim for honors on remaining shelf exams to boost Step 2 prediction',
      'Take Step 2 practice test after 5-6 clerkships complete',
      'Focus dedicated study on your lower-performing rotations'
    );
    if (predictedStep2Score) {
      recommendations.push(`Predicted Step 2 CK score: ~${predictedStep2Score}`);
    }
  }
  // Inconsistent or early
  else if (shelfs.length >= 3 && averageShelfPercentile >= 60) {
    isReadyForStep2 = false;
    step2Confidence = 'low';
    recommendations.push(
      'Complete more clerkships before scheduling Step 2 CK',
      'Identify patterns in your lower-performing shelfs',
      'Consider UWorld Step 2 CK during clerkships (not just before rotations)',
      'Aim to improve on upcoming shelf exams'
    );
  }
  // Need improvement
  else if (shelfs.length >= 3) {
    isReadyForStep2 = false;
    step2Confidence = 'not-ready';
    recommendations.push(
      `Current shelf average (${averageShelfPercentile.toFixed(1)}%) below Step 2 readiness threshold`,
      'Focus on fundamentals during each clerkship',
      'Start UWorld Step 2 CK questions daily during rotations',
      'Seek study strategies from honors students',
      'Delay Step 2 CK until shelf performance improves'
    );
  }
  // Too early - not enough data
  else {
    isReadyForStep2 = false;
    step2Confidence = 'not-ready';
    recommendations.push(
      `${shelfs.length} shelf exam${shelfs.length === 1 ? '' : 's'} completed - need more data`,
      'Take shelf exams seriously - they predict Step 2 performance',
      'Aim for honors (≥70%) on each shelf',
      'Check back after completing 3+ clerkships'
    );
  }

  // Add specific recommendations based on exam count
  if (shelfs.length < 6 && step2Confidence !== 'not-ready') {
    recommendations.push('Complete all core clerkships before taking Step 2 CK');
  }

  return {
    averageShelfPercentile,
    predictedStep2Score,
    shelfExamsTaken: shelfs.length,
    honorsCount,
    highPassCount,
    passCount,
    isReadyForStep2,
    step2Confidence,
    recommendations,
  };
}

/**
 * Get shelf exam name from test type
 */
export function getShelfExamName(testType: string): string {
  const names: Record<string, string> = {
    'nbme-shelf-im': 'Internal Medicine',
    'nbme-shelf-surgery': 'Surgery',
    'nbme-shelf-peds': 'Pediatrics',
    'nbme-shelf-obgyn': 'OB/GYN',
    'nbme-shelf-psych': 'Psychiatry',
    'nbme-shelf-neuro': 'Neurology',
    'nbme-shelf-family': 'Family Medicine',
    'nbme-shelf-other': 'Other Shelf',
  };
  return names[testType] || testType;
}

/**
 * Get performance tier label
 */
export function getPerformanceTier(percentCorrect: number): {
  label: string;
  color: string;
} {
  if (percentCorrect >= 70) {
    return { label: 'Honors', color: 'green' };
  } else if (percentCorrect >= 60) {
    return { label: 'High Pass', color: 'blue' };
  } else if (percentCorrect >= 50) {
    return { label: 'Pass', color: 'yellow' };
  } else {
    return { label: 'Below Pass', color: 'red' };
  }
}
