// Shelf Practice Readiness Assessment
// Shelf PRACTICE tests (NBME Q-banks) → Predict Shelf FINAL exam performance

import { PracticeTest } from './types';
import { ShelfFinalReadiness, ShelfFinalsToStep2 } from './practiceTestTypes';

/**
 * Calculate readiness for shelf FINAL exam based on practice test performance
 * During clerkship rotations, students do practice questions to prepare for shelf finals
 */
export function calculateShelfFinalReadiness(
  tests: PracticeTest[],
  clerkshipRotation: string,
  clerkshipEndDate?: Date
): ShelfFinalReadiness {
  // Filter practice tests for this specific clerkship
  const rotationMap: Record<string, string[]> = {
    'Internal Medicine': ['shelf-practice-im'],
    'Surgery': ['shelf-practice-surgery'],
    'Pediatrics': ['shelf-practice-peds'],
    'OB/GYN': ['shelf-practice-obgyn'],
    'Psychiatry': ['shelf-practice-psych'],
    'Neurology': ['shelf-practice-neuro'],
    'Family Medicine': ['shelf-practice-family'],
  };

  const relevantTypes = rotationMap[clerkshipRotation] || [];
  const practiceTests = tests
    .filter(t => relevantTypes.some(type => t.testType.includes(type)))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const now = new Date();
  const daysUntilShelfFinal = clerkshipEndDate
    ? Math.ceil((clerkshipEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : undefined;

  // No practice tests taken yet
  if (practiceTests.length === 0) {
    return {
      clerkshipRotation,
      practiceTestsTaken: 0,
      averagePracticeScore: 0,
      predictedShelfGrade: 'at-risk',
      isReadyForShelfFinal: false,
      confidence: 'not-ready',
      daysUntilShelfFinal,
      clerkshipEndDate,
      message: daysUntilShelfFinal
        ? `No practice tests for ${clerkshipRotation} yet. ${daysUntilShelfFinal} days until shelf final.`
        : `Start doing practice questions for ${clerkshipRotation} shelf.`,
      recommendations: [
        'Start NBME shelf practice questions immediately',
        'Aim for 20-30 practice questions per day during rotation',
        'Take a timed practice test mid-rotation to assess progress',
        'Review incorrect questions thoroughly - they predict shelf topics',
      ],
      practiceHistory: [],
    };
  }

  const averagePracticeScore = practiceTests.reduce((sum, t) => sum + t.percentCorrect, 0) / practiceTests.length;
  const latestScore = practiceTests[practiceTests.length - 1].percentCorrect;

  // Predict shelf final grade based on practice performance
  // Research shows: Practice test scores correlate highly with shelf finals
  let predictedShelfGrade: 'honors' | 'high-pass' | 'pass' | 'at-risk';
  let predictedPercentile: number | undefined;

  if (averagePracticeScore >= 75) {
    predictedShelfGrade = 'honors';
    predictedPercentile = 75 + (averagePracticeScore - 75) * 0.5; // 75-87.5th percentile
  } else if (averagePracticeScore >= 65) {
    predictedShelfGrade = 'high-pass';
    predictedPercentile = 60 + (averagePracticeScore - 65) * 1.5; // 60-75th percentile
  } else if (averagePracticeScore >= 55) {
    predictedShelfGrade = 'pass';
    predictedPercentile = 40 + (averagePracticeScore - 55) * 2; // 40-60th percentile
  } else {
    predictedShelfGrade = 'at-risk';
    predictedPercentile = averagePracticeScore * 0.7; // Below 40th percentile
  }

  // Determine readiness
  let isReadyForShelfFinal = false;
  let confidence: 'high' | 'moderate' | 'low' | 'not-ready' = 'not-ready';
  let message = '';
  const recommendations: string[] = [];

  // HIGH - Honors trajectory
  if (averagePracticeScore >= 75 && latestScore >= 70) {
    isReadyForShelfFinal = true;
    confidence = 'high';
    message = daysUntilShelfFinal
      ? `🏆 Honors trajectory! Average ${averagePracticeScore.toFixed(1)}%. ${daysUntilShelfFinal} days to shelf final.`
      : `🏆 Honors trajectory! Average practice score: ${averagePracticeScore.toFixed(1)}%`;

    recommendations.push(
      'Maintain daily practice questions through end of rotation',
      'Focus remaining time on weak areas to solidify honors',
      `Predicted shelf grade: Honors (${Math.round(predictedPercentile!)}th percentile)`,
      'Light review 2 days before shelf - you\'re well-prepared'
    );
  }
  // MODERATE - High Pass trajectory
  else if (averagePracticeScore >= 65) {
    isReadyForShelfFinal = true;
    confidence = 'moderate';
    message = daysUntilShelfFinal
      ? `✅ High Pass trajectory. Average ${averagePracticeScore.toFixed(1)}%. ${daysUntilShelfFinal} days to shelf final.`
      : `✅ On track for High Pass. Average practice score: ${averagePracticeScore.toFixed(1)}%`;

    recommendations.push(
      'Continue daily practice questions',
      `Predicted shelf grade: High Pass (${Math.round(predictedPercentile!)}th percentile)`,
      'Push for Honors: Focus on weak topics and high-yield material',
      daysUntilShelfFinal && daysUntilShelfFinal < 7 ? 'Final week: Review incorrects and high-yield summaries' : 'Take another practice test mid-rotation'
    );
  }
  // LOW - Pass trajectory but at risk
  else if (averagePracticeScore >= 55) {
    isReadyForShelfFinal = false;
    confidence: 'low';
    message = daysUntilShelfFinal
      ? `⚠️ Pass trajectory but close. Average ${averagePracticeScore.toFixed(1)}%. ${daysUntilShelfFinal} days to shelf final.`
      : `⚠️ Currently on track for Pass. Average practice score: ${averagePracticeScore.toFixed(1)}%`;

    recommendations.push(
      `Predicted shelf grade: Pass (${Math.round(predictedPercentile!)}th percentile)`,
      'Increase practice questions to 40-50/day',
      'Focus heavily on highest-yield topics for this rotation',
      'Review all incorrect practice questions',
      daysUntilShelfFinal && daysUntilShelfFinal < 7 ? '⚠️ Intensive review needed this week' : 'Consider tutoring or study group'
    );
  }
  // AT RISK - Below passing threshold
  else {
    isReadyForShelfFinal = false;
    confidence = 'not-ready';
    message = daysUntilShelfFinal
      ? `🚨 At risk. Average ${averagePracticeScore.toFixed(1)}%. ${daysUntilShelfFinal} days to shelf final.`
      : `🚨 Below passing threshold. Average practice score: ${averagePracticeScore.toFixed(1)}%`;

    recommendations.push(
      '🚨 Current trajectory: At risk of not passing shelf',
      'Speak with clerkship director about remediation resources',
      'Dedicate 3-4 hours/day to practice questions',
      'Focus only on highest-yield topics (use clerkship objectives)',
      'Consider scheduling office hours with attending physicians',
      daysUntilShelfFinal && daysUntilShelfFinal < 7 ? '🚨 Intensive intervention needed NOW' : 'Take practice test weekly to track improvement'
    );
  }

  // Timeline-specific recommendations
  if (daysUntilShelfFinal) {
    if (daysUntilShelfFinal <= 3 && confidence === 'not-ready') {
      recommendations.unshift('🚨 SHELF IN 3 DAYS - Emergency study mode');
    } else if (daysUntilShelfFinal <= 7) {
      recommendations.push('Final week: Review all incorrects + high-yield summaries');
    } else if (daysUntilShelfFinal > 21 && practiceTests.length < 2) {
      recommendations.push('Take timed practice test at mid-rotation to assess progress');
    }
  }

  return {
    clerkshipRotation,
    practiceTestsTaken: practiceTests.length,
    averagePracticeScore,
    predictedShelfGrade,
    predictedPercentile: Math.round(predictedPercentile!),
    isReadyForShelfFinal,
    confidence,
    daysUntilShelfFinal,
    clerkshipEndDate,
    message,
    recommendations,
    practiceHistory: practiceTests as any[],
  };
}

/**
 * Calculate Step 2 CK readiness based on shelf FINAL exam scores
 * Shelf final performance (actual grades) correlates strongly with Step 2 CK
 */
export function calculateShelfFinalsToStep2(
  tests: PracticeTest[]
): ShelfFinalsToStep2 {
  // Filter shelf FINAL exams only (actual clerkship final exam scores)
  const shelfFinals = tests.filter(t =>
    t.testType.includes('shelf-final')
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  if (shelfFinals.length === 0) {
    return {
      shelfFinalsTaken: 0,
      averageShelfPercentile: 0,
      honorsCount: 0,
      highPassCount: 0,
      passCount: 0,
      isReadyForStep2: false,
      step2Confidence: 'not-ready',
      message: 'No shelf final exams recorded yet. Input shelf scores to predict Step 2 readiness.',
      recommendations: [
        'Complete your clerkship rotations and shelf final exams',
        'Input your shelf final scores (grades and percentiles)',
        'Shelf performance is a strong predictor of Step 2 CK score',
      ],
      shelfFinalHistory: [],
    };
  }

  // Calculate stats
  const averageShelfPercentile = shelfFinals.reduce((sum, t) => sum + (t.shelfPercentile || t.percentCorrect), 0) / shelfFinals.length;
  const honorsCount = shelfFinals.filter(t => t.shelfGrade === 'honors' || t.percentCorrect >= 70).length;
  const highPassCount = shelfFinals.filter(t => t.shelfGrade === 'high-pass' || (t.percentCorrect >= 60 && t.percentCorrect < 70)).length;
  const passCount = shelfFinals.filter(t => t.shelfGrade === 'pass' || (t.percentCorrect >= 50 && t.percentCorrect < 60)).length;

  // Predict Step 2 CK score based on shelf finals
  // Research: Strong correlation between shelf percentiles and Step 2 scores
  let predictedStep2Score: number | undefined;
  if (shelfFinals.length >= 4) {
    if (averageShelfPercentile >= 75) {
      predictedStep2Score = 255 + (averageShelfPercentile - 75) * 0.8;
    } else if (averageShelfPercentile >= 70) {
      predictedStep2Score = 250 + (averageShelfPercentile - 70);
    } else if (averageShelfPercentile >= 60) {
      predictedStep2Score = 240 + (averageShelfPercentile - 60);
    } else if (averageShelfPercentile >= 50) {
      predictedStep2Score = 230 + (averageShelfPercentile - 50);
    } else {
      predictedStep2Score = 220 + averageShelfPercentile * 0.5;
    }
    predictedStep2Score = Math.round(predictedStep2Score);
  }

  // Determine Step 2 readiness
  let isReadyForStep2 = false;
  let step2Confidence: 'high' | 'moderate' | 'low' | 'not-ready' = 'not-ready';
  let message = '';
  const recommendations: string[] = [];

  // HIGH - Mostly honors
  if (honorsCount >= shelfFinals.length * 0.67 && shelfFinals.length >= 5) {
    isReadyForStep2 = true;
    step2Confidence = 'high';
    message = `🏆 Excellent shelf record! ${honorsCount}/${shelfFinals.length} honors. Strong Step 2 predictor.`;
    recommendations.push(
      `Predicted Step 2 CK score: ${predictedStep2Score}`,
      'Your shelf performance predicts strong Step 2 CK performance',
      'Schedule Step 2 CK within 4-6 weeks after completing clerkships',
      'Continue your successful study approach for dedicated period'
    );
  }
  // MODERATE - Solid mix
  else if (averageShelfPercentile >= 65 && shelfFinals.length >= 4) {
    isReadyForStep2 = true;
    step2Confidence = 'moderate';
    message = `✅ Solid shelf performance. Average ${averageShelfPercentile.toFixed(1)}th percentile.`;
    recommendations.push(
      predictedStep2Score ? `Predicted Step 2 CK score: ~${predictedStep2Score}` : 'Complete more shelfs for prediction',
      'On track for Step 2 CK after finishing clerkships',
      'Take UWSA1 or UWSA2 after clerkships to confirm readiness',
      'Focus dedicated study on rotations where you scored lower'
    );
  }
  // LOW - Need improvement
  else if (shelfFinals.length >= 3) {
    isReadyForStep2 = false;
    step2Confidence = 'low';
    message = `⚠️ ${shelfFinals.length} shelfs complete. Average ${averageShelfPercentile.toFixed(1)}th percentile.`;
    recommendations.push(
      'Shelf performance below Step 2 readiness threshold',
      'Plan for extended dedicated study period (6-8 weeks)',
      'Take Step 2 practice tests early in dedicated to assess gap',
      'Consider delaying Step 2 CK until practice scores improve'
    );
  }
  // TOO EARLY
  else {
    isReadyForStep2 = false;
    step2Confidence = 'not-ready';
    message = `${shelfFinals.length} shelf final(s) complete. Need more data.`;
    recommendations.push(
      'Complete more core clerkships before assessing Step 2 readiness',
      'Aim for high performance on remaining shelf exams',
      'Check back after completing 4+ core clerkships'
    );
  }

  return {
    shelfFinalsTaken: shelfFinals.length,
    averageShelfPercentile,
    honorsCount,
    highPassCount,
    passCount,
    predictedStep2Score,
    isReadyForStep2,
    step2Confidence,
    message,
    recommendations,
    shelfFinalHistory: shelfFinals as any[],
  };
}
