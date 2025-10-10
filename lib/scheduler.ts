// Evidence-based spaced-repetition scheduler
import { TopicPattern, StudyBlock, StudyPlan, ErrorLog, UrgencyLevel, ErrorType, ActivityType, ErrorTypeStrategy } from './types';
import { PriorityScore, calculateAllPriorities } from './priority';
import { generateSpacedReviews, groupReviewsByDate } from './spacedRepetition';

interface ScheduleInterval {
  day: number;
  activity: ActivityType;
  duration: number;
  reasoning: string;
}

/**
 * Get spacing intervals based on urgency level
 * Based on research: optimal intervals are 24h, 3d, 7d, 14d
 */
function getIntervalsForUrgency(urgency: UrgencyLevel): ScheduleInterval[] {
  switch (urgency) {
    case 'urgent':
      // 7 exposures over 2 weeks: Day 1, 2, 3, 5, 7, 10, 14
      return [
        { day: 1, activity: 'retrieval', duration: 30, reasoning: 'Initial encoding - active retrieval' },
        { day: 2, activity: 'review', duration: 25, reasoning: '24h reinforcement - critical for consolidation' },
        { day: 3, activity: 'practice', duration: 25, reasoning: '48h spaced practice - apply concepts' },
        { day: 5, activity: 'retrieval', duration: 20, reasoning: 'Extended retrieval - strengthen recall' },
        { day: 7, activity: 'practice', duration: 20, reasoning: '1-week review - long-term retention' },
        { day: 10, activity: 'review', duration: 15, reasoning: 'Maintenance review - prevent decay' },
        { day: 14, activity: 'retrieval', duration: 15, reasoning: '2-week consolidation - transfer to long-term memory' },
      ];

    case 'high':
      // 4 exposures: Day 1, 3, 7, 14
      return [
        { day: 1, activity: 'retrieval', duration: 25, reasoning: 'Initial encoding' },
        { day: 3, activity: 'practice', duration: 20, reasoning: '3-day spaced practice' },
        { day: 7, activity: 'review', duration: 15, reasoning: '1-week review for retention' },
        { day: 14, activity: 'retrieval', duration: 15, reasoning: '2-week consolidation' },
      ];

    case 'moderate':
      // 3 exposures: Day 1, 4, 10
      return [
        { day: 1, activity: 'retrieval', duration: 20, reasoning: 'Initial encoding' },
        { day: 4, activity: 'practice', duration: 20, reasoning: 'Spaced practice' },
        { day: 10, activity: 'review', duration: 15, reasoning: 'Long-term retention' },
      ];

    case 'low':
      // 2 exposures: Day 1, 7
      return [
        { day: 1, activity: 'retrieval', duration: 15, reasoning: 'Initial encoding' },
        { day: 7, activity: 'review', duration: 15, reasoning: '1-week review' },
      ];
  }
}

/**
 * Adjust intervals based on error type
 * Knowledge gaps need more frequent review initially
 */
function adjustIntervalsForErrorType(
  intervals: ScheduleInterval[],
  errorType: ErrorType,
  errorTypeProportion: number
): ScheduleInterval[] {
  // Only adjust if error type is dominant (>60%)
  if (errorTypeProportion < 0.6) return intervals;

  switch (errorType) {
    case 'knowledge':
      // Shorter intervals, more content review
      return intervals.map((interval, index) => ({
        ...interval,
        activity: index === 0 || index === 1 ? 'review' : interval.activity,
        reasoning: index === 0
          ? 'Content review - fill knowledge gap'
          : index === 1
          ? '24h review - reinforce new content'
          : interval.reasoning,
      }));

    case 'reasoning':
      // Standard intervals, more practice
      return intervals.map(interval => ({
        ...interval,
        activity: interval.activity === 'review' ? 'practice' : interval.activity,
        reasoning: interval.reasoning.includes('practice')
          ? 'Application practice - strengthen reasoning'
          : interval.reasoning,
      }));

    case 'process':
    case 'time':
      // Wider intervals, strategy focus
      return intervals.filter((_, index) => index % 2 === 0).map(interval => ({
        ...interval,
        duration: interval.duration + 5, // Slightly longer for strategy work
        reasoning: 'Strategy coaching + timed practice',
      }));

    default:
      return intervals;
  }
}

/**
 * Determine error type strategy based on dominant error type
 */
function getErrorTypeStrategy(errorTypes: Record<ErrorType, number>): {
  strategy: ErrorTypeStrategy;
  dominantType: ErrorType;
  proportion: number;
} {
  const entries = Object.entries(errorTypes) as [ErrorType, number][];
  const total = entries.reduce((sum, [_, count]) => sum + count, 0);

  if (total === 0) {
    return { strategy: 'practice-problems', dominantType: 'knowledge', proportion: 0 };
  }

  const dominant = entries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  );

  const proportion = dominant[1] / total;

  const strategy: ErrorTypeStrategy =
    dominant[0] === 'knowledge' ? 'knowledge-review' :
    dominant[0] === 'process' || dominant[0] === 'time' ? 'strategy-coaching' :
    'practice-problems';

  return { strategy, dominantType: dominant[0], proportion };
}

/**
 * Create study blocks for a single topic based on priority
 * Enhanced with Q-Bank review timing when available
 */
function createBlocksForTopic(
  priority: PriorityScore,
  pattern: TopicPattern,
  weekStart: Date,
  blockIdOffset: number,
  allErrors: ErrorLog[]
): StudyBlock[] {
  // Get base intervals for urgency level
  let intervals = getIntervalsForUrgency(priority.urgency);

  // Adjust for error type
  const { strategy, dominantType, proportion } = getErrorTypeStrategy(pattern.errorTypes);
  intervals = adjustIntervalsForErrorType(intervals, dominantType, proportion);

  // Check if any errors for this topic have Q-Bank next review dates
  const topicErrors = allErrors.filter(
    e => e.system === pattern.system && e.topic === pattern.topic
  );

  const qbankReviewDates = topicErrors
    .map(e => e.externalQuestion?.nextQBankReview)
    .filter((d): d is Date => d !== undefined)
    .map(d => new Date(d));

  // Create blocks
  return intervals.map((interval, index) => {
    const scheduledDate = new Date(weekStart);
    scheduledDate.setDate(scheduledDate.getDate() + interval.day - 1);

    let reasoning = interval.reasoning;
    let qbankTiming = '';

    // If Q-Bank review exists, adjust reasoning to highlight strategic timing
    if (qbankReviewDates.length > 0) {
      const closestQBankReview = qbankReviewDates.reduce((closest, current) => {
        const diffCurrent = Math.abs(current.getTime() - scheduledDate.getTime());
        const diffClosest = Math.abs(closest.getTime() - scheduledDate.getTime());
        return diffCurrent < diffClosest ? current : closest;
      });

      const daysUntilQBank = Math.floor(
        (closestQBankReview.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If this review is 1-2 days before Q-Bank, highlight it
      if (daysUntilQBank > 0 && daysUntilQBank <= 2) {
        qbankTiming = ` • Q-Bank review in ${daysUntilQBank}d`;
        reasoning = `Strategic: Review ${daysUntilQBank}d before Q-Bank shows it again`;
      } else if (daysUntilQBank === 0) {
        qbankTiming = ' • Q-Bank review TODAY';
        reasoning = 'URGENT: Q-Bank shows this question today - review now!';
      } else if (daysUntilQBank < 0 && daysUntilQBank >= -1) {
        qbankTiming = ' • Just saw in Q-Bank';
        reasoning = 'Post-Q-Bank reinforcement - consolidate while fresh';
      }
    }

    return {
      id: `block-${blockIdOffset + index}`,
      day: interval.day,
      topic: pattern.topic,
      system: pattern.system,
      systemId: pattern.systemId,
      activity: interval.activity,
      duration: interval.duration,
      priority: priority.rank,
      reasoning: reasoning + qbankTiming,

      // Enhanced fields
      urgency: priority.urgency,
      scheduledDate,
      errorTypeStrategy: strategy,
      whyScheduled: priority.reasonChip,
      priorityScore: priority.score,
    };
  });
}

/**
 * Generate study plan using priority-driven spaced repetition
 */
export function generateEnhancedStudyPlan(
  patterns: TopicPattern[],
  allErrors: ErrorLog[],
  examDate?: Date
): StudyPlan {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);

  // Calculate priority scores for all patterns
  const priorities = calculateAllPriorities(patterns, allErrors);

  // Determine how many topics to include based on exam proximity
  const daysUntilExam = examDate
    ? Math.ceil((examDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
    : undefined;

  const topicLimit =
    !daysUntilExam || daysUntilExam > 90 ? 8 :  // Long-term: 8 topics
    daysUntilExam > 30 ? 10 :                    // Mid-term: 10 topics
    daysUntilExam > 7 ? 12 :                     // Near-term: 12 topics
    15;                                          // Cram: 15 topics

  const topPriorities = priorities.slice(0, topicLimit);

  // Generate blocks for each priority topic
  let blockIdOffset = 0;
  const allBlocks: StudyBlock[] = [];

  topPriorities.forEach(priority => {
    const pattern = patterns.find(
      p => p.system === priority.system && p.topic === priority.topic
    );

    if (!pattern) return;

    const blocks = createBlocksForTopic(priority, pattern, weekStart, blockIdOffset, allErrors);
    allBlocks.push(...blocks);
    blockIdOffset += blocks.length;
  });

  // Interleave blocks by day to mix topics
  const byDay: Record<number, StudyBlock[]> = {};
  allBlocks.forEach(block => {
    if (!byDay[block.day]) byDay[block.day] = [];
    byDay[block.day].push(block);
  });

  // Sort each day's blocks by priority (highest first), then shuffle within same priority
  Object.values(byDay).forEach(dayBlocks => {
    dayBlocks.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return Math.random() - 0.5; // Shuffle same-priority blocks
    });
  });

  const interleavedBlocks = Object.values(byDay).flat();

  return {
    generatedAt: new Date(),
    weekStart,
    examDate,
    daysUntilExam,
    blocks: interleavedBlocks,
  };
}

/**
 * Get urgency level description for UI
 */
export function getUrgencyDescription(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'urgent':
      return 'Needs immediate attention - frequent review';
    case 'high':
      return 'High priority - consistent practice';
    case 'moderate':
      return 'Moderate priority - regular review';
    case 'low':
      return 'Lower priority - periodic review';
  }
}

/**
 * Get urgency color for UI
 */
export function getUrgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
  }
}

/**
 * Get urgency icon/emoji
 */
export function getUrgencyIcon(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'urgent':
      return '🔴';
    case 'high':
      return '🟠';
    case 'moderate':
      return '🟡';
    case 'low':
      return '🔵';
  }
}
