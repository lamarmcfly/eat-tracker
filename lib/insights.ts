// Analytics and pattern detection
import { ErrorLog, TopicPattern, ErrorType } from './types';

export function analyzePatterns(errors: ErrorLog[]): TopicPattern[] {
  const topicMap = new Map<string, TopicPattern>();

  errors.forEach(error => {
    const key = `${error.system}:${error.topic}`;

    if (!topicMap.has(key)) {
      topicMap.set(key, {
        topic: error.topic,
        system: error.system,
        errorCount: 0,
        errorTypes: {
          knowledge: 0,
          reasoning: 0,
          process: 0,
          time: 0,
        },
        averageConfidence: 0,
        lastSeen: error.timestamp,
      });
    }

    const pattern = topicMap.get(key)!;
    pattern.errorCount++;
    pattern.errorTypes[error.errorType]++;
    if (error.timestamp > pattern.lastSeen) {
      pattern.lastSeen = error.timestamp;
    }
  });

  // Calculate average confidence
  const confidenceValue = { guessed: 0, eliminated: 1, confident: 2, certain: 3 };
  topicMap.forEach((pattern, key) => {
    const topicErrors = errors.filter(e => `${e.system}:${e.topic}` === key);
    const sum = topicErrors.reduce((acc, e) => acc + confidenceValue[e.confidence], 0);
    pattern.averageConfidence = sum / topicErrors.length;
  });

  return Array.from(topicMap.values()).sort((a, b) => b.errorCount - a.errorCount);
}

export function getPriorityList(patterns: TopicPattern[]): Array<{
  topic: string;
  system: string;
  priority: number;
  reasoning: string;
}> {
  return patterns
    .slice(0, 10) // Top 10
    .map((p, index) => {
      const dominantError = Object.entries(p.errorTypes).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0] as ErrorType;

      const reasons: Record<ErrorType, string> = {
        knowledge: 'Missing foundational knowledge - needs content review',
        reasoning: 'Struggles with application - practice problem-solving',
        process: 'Test-taking errors - focus on strategy & technique',
        time: 'Time pressure issues - practice under timed conditions',
      };

      return {
        topic: p.topic,
        system: p.system,
        priority: index + 1,
        reasoning: `${p.errorCount} errors, mostly ${dominantError}. ${reasons[dominantError]}`,
      };
    });
}

export function getErrorTrends(errors: ErrorLog[], days: number = 30) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const filtered = errors.filter(e => e.timestamp >= cutoff);

  const dayMap = new Map<string, { knowledge: number; reasoning: number; process: number; time: number }>();

  filtered.forEach(error => {
    const date = error.timestamp.toISOString().split('T')[0];
    if (!dayMap.has(date)) {
      dayMap.set(date, { knowledge: 0, reasoning: 0, process: 0, time: 0 });
    }
    dayMap.get(date)![error.errorType]++;
  });

  return Array.from(dayMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
