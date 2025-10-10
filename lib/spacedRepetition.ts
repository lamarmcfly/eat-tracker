// Spaced Repetition Scheduling Engine
// Strategically schedules reviews BEFORE Q-bank shows questions again

import { ErrorLog, SpacedReview } from './types';

/**
 * Calculate target review date based on Q-bank next review
 * Strategy: Review 1-2 days BEFORE Q-bank shows it again for maximum retention
 */
export function calculateTargetReviewDate(
  error: ErrorLog,
  confidenceFactor: number = 1.0
): Date {
  const now = new Date();

  // If Q-bank has a next review date, schedule strategically BEFORE it
  if (error.externalQuestion?.nextQBankReview) {
    const nextQBankReview = new Date(error.externalQuestion.nextQBankReview);
    const daysUntilQBankReview = Math.floor(
      (nextQBankReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Schedule 1-2 days before Q-bank review (adjusted by confidence)
    let daysBefore = 1;
    if (daysUntilQBankReview > 7) {
      daysBefore = 2; // More lead time for distant Q-bank reviews
    }

    // Adjust based on confidence (lower confidence = review sooner)
    const confidenceMultiplier = confidenceFactor < 0.5 ? 0.5 : 1.0;
    daysBefore = Math.floor(daysBefore * confidenceMultiplier);

    const targetDate = new Date(nextQBankReview);
    targetDate.setDate(targetDate.getDate() - daysBefore);

    // Don't schedule in the past
    return targetDate > now ? targetDate : now;
  }

  // Fallback: Standard spaced repetition intervals without Q-bank data
  return calculateStandardSpacedInterval(error, confidenceFactor);
}

/**
 * Standard spaced repetition intervals when Q-bank data is unavailable
 * Uses confidence and error type to determine optimal spacing
 */
function calculateStandardSpacedInterval(
  error: ErrorLog,
  confidenceFactor: number
): Date {
  const now = new Date();
  const errorDate = new Date(error.timestamp);
  const daysSinceError = Math.floor(
    (now.getTime() - errorDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let intervalDays: number;

  // Determine interval based on confidence and time since error
  if (confidenceFactor < 0.3) {
    // Very low confidence: 24 hours
    intervalDays = 1;
  } else if (confidenceFactor < 0.6) {
    // Low-moderate confidence: 48 hours
    intervalDays = 2;
  } else if (confidenceFactor < 0.8) {
    // Moderate-high confidence: 3-4 days
    intervalDays = daysSinceError < 2 ? 3 : 4;
  } else {
    // High confidence: 7 days
    intervalDays = 7;
  }

  // Adjust for error type
  if (error.errorType === 'knowledge') {
    // Knowledge gaps need more frequent review
    intervalDays = Math.max(1, Math.floor(intervalDays * 0.8));
  } else if (error.errorType === 'time') {
    // Time pressure errors can have longer intervals
    intervalDays = Math.ceil(intervalDays * 1.2);
  }

  const targetDate = new Date(errorDate);
  targetDate.setDate(targetDate.getDate() + intervalDays);

  return targetDate > now ? targetDate : now;
}

/**
 * Generate SpacedReview schedule for an error
 */
export function generateSpacedReview(error: ErrorLog): SpacedReview {
  // Calculate confidence factor (0-1)
  const confidenceValue = typeof error.confidence === 'number'
    ? error.confidence
    : { guessed: 1, eliminated: 2, confident: 3, certain: 4 }[error.confidence] || 1;
  const confidenceFactor = (confidenceValue - 1) / 3; // Normalize to 0-1

  const targetDate = calculateTargetReviewDate(error, confidenceFactor);

  // Generate reason
  let reason: string;
  if (error.externalQuestion?.nextQBankReview) {
    const qbankName = error.externalQuestion.questionBank.toUpperCase();
    const nextReview = new Date(error.externalQuestion.nextQBankReview);
    const daysUntil = Math.floor(
      (nextReview.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    reason = `Review before ${qbankName} shows it again (${daysUntil}d)`;
  } else {
    const interval = Math.floor(
      (targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (interval <= 1) {
      reason = 'Urgent review needed (low confidence)';
    } else if (interval <= 2) {
      reason = 'Short-interval review (building retention)';
    } else if (interval <= 4) {
      reason = 'Standard spaced review';
    } else {
      reason = 'Long-interval review (high confidence)';
    }
  }

  return {
    errorId: error.id,
    lastSeenInQBank: error.timestamp,
    nextQBankReview: error.externalQuestion?.nextQBankReview,
    targetReviewDate: targetDate,
    reviewReason: reason,
  };
}

/**
 * Generate spaced reviews for multiple errors, sorted by target date
 */
export function generateSpacedReviews(errors: ErrorLog[]): SpacedReview[] {
  return errors
    .map(generateSpacedReview)
    .sort((a, b) => a.targetReviewDate.getTime() - b.targetReviewDate.getTime());
}

/**
 * Get reviews due today or overdue
 */
export function getDueReviews(reviews: SpacedReview[]): SpacedReview[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today

  return reviews.filter(r => r.targetReviewDate <= now);
}

/**
 * Get reviews due within N days
 */
export function getUpcomingReviews(
  reviews: SpacedReview[],
  daysAhead: number = 7
): SpacedReview[] {
  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + daysAhead);

  return reviews.filter(r =>
    r.targetReviewDate > now && r.targetReviewDate <= future
  );
}

/**
 * Group reviews by date for calendar view
 */
export function groupReviewsByDate(
  reviews: SpacedReview[]
): Map<string, SpacedReview[]> {
  const grouped = new Map<string, SpacedReview[]>();

  reviews.forEach(review => {
    const dateKey = review.targetReviewDate.toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(review);
  });

  return grouped;
}
