// NBME Organ System-focused analytics
import { ErrorLog } from './types';
import { getExamWeight, EXAM_WEIGHTS } from './examWeights';
import { ORGAN_SYSTEMS as TAXONOMY_SYSTEMS } from './taxonomy';

export interface SystemBreakdown {
  systemId: string;
  systemName: string;
  totalErrors: number;
  examWeight: number;
  examWeightPercent: number;

  // Cognitive level breakdown
  firstOrderErrors: number;
  higherOrderErrors: number;
  firstOrderPercent: number;
  higherOrderPercent: number;

  // Error type breakdown
  knowledgeErrors: number;
  reasoningErrors: number;
  processErrors: number;
  timeErrors: number;

  // Recent trend (last 7 days vs previous 7 days)
  recentErrorCount: number;
  previousErrorCount: number;
  trendDirection: 'improving' | 'worsening' | 'stable';
  trendPercent: number;
}

export interface SystemTrend {
  systemId: string;
  systemName: string;
  date: string;
  errorCount: number;
  firstOrderCount: number;
  higherOrderCount: number;
}

/**
 * Analyze errors by NBME organ system
 */
export function analyzeByOrganSystem(errors: ErrorLog[]): SystemBreakdown[] {
  const systemMap = new Map<string, SystemBreakdown>();

  // Get current date for trend calculation
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Initialize all systems from taxonomy
  TAXONOMY_SYSTEMS.forEach(sys => {
    const weight = getExamWeight(sys.id);
    const examWeightData = EXAM_WEIGHTS[sys.id];

    systemMap.set(sys.id, {
      systemId: sys.id,
      systemName: sys.name,
      totalErrors: 0,
      examWeight: weight,
      examWeightPercent: examWeightData?.midpointPercent || 0,
      firstOrderErrors: 0,
      higherOrderErrors: 0,
      firstOrderPercent: 0,
      higherOrderPercent: 0,
      knowledgeErrors: 0,
      reasoningErrors: 0,
      processErrors: 0,
      timeErrors: 0,
      recentErrorCount: 0,
      previousErrorCount: 0,
      trendDirection: 'stable',
      trendPercent: 0,
    });
  });

  // Process each error
  errors.forEach(error => {
    const systemId = error.systemId;
    if (!systemId || !systemMap.has(systemId)) return;

    const breakdown = systemMap.get(systemId)!;
    breakdown.totalErrors++;

    // Cognitive level
    if (error.cognitiveLevel === 'first-order') {
      breakdown.firstOrderErrors++;
    } else if (error.cognitiveLevel === 'higher-order') {
      breakdown.higherOrderErrors++;
    }

    // Error type
    switch (error.errorType) {
      case 'knowledge': breakdown.knowledgeErrors++; break;
      case 'reasoning': breakdown.reasoningErrors++; break;
      case 'process': breakdown.processErrors++; break;
      case 'time': breakdown.timeErrors++; break;
    }

    // Trend calculation
    const errorDate = new Date(error.timestamp);
    if (errorDate >= sevenDaysAgo) {
      breakdown.recentErrorCount++;
    } else if (errorDate >= fourteenDaysAgo) {
      breakdown.previousErrorCount++;
    }
  });

  // Calculate percentages and trends
  systemMap.forEach(breakdown => {
    const total = breakdown.totalErrors;
    if (total > 0) {
      breakdown.firstOrderPercent = (breakdown.firstOrderErrors / total) * 100;
      breakdown.higherOrderPercent = (breakdown.higherOrderErrors / total) * 100;

      // Calculate trend
      if (breakdown.previousErrorCount > 0) {
        const change = breakdown.recentErrorCount - breakdown.previousErrorCount;
        breakdown.trendPercent = (change / breakdown.previousErrorCount) * 100;

        if (breakdown.trendPercent < -10) {
          breakdown.trendDirection = 'improving';
        } else if (breakdown.trendPercent > 10) {
          breakdown.trendDirection = 'worsening';
        } else {
          breakdown.trendDirection = 'stable';
        }
      } else if (breakdown.recentErrorCount > 0) {
        breakdown.trendDirection = 'worsening';
        breakdown.trendPercent = 100;
      }
    }
  });

  // Return sorted by total errors (highest first), excluding systems with 0 errors
  return Array.from(systemMap.values())
    .filter(s => s.totalErrors > 0)
    .sort((a, b) => b.totalErrors - a.totalErrors);
}

/**
 * Get system-specific trends over time
 */
export function getSystemTrends(errors: ErrorLog[], days: number = 30): SystemTrend[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const filtered = errors.filter(e => new Date(e.timestamp) >= cutoff);

  const trendMap = new Map<string, SystemTrend>();

  filtered.forEach(error => {
    const systemId = error.systemId;
    if (!systemId) return;

    const date = new Date(error.timestamp).toISOString().split('T')[0];
    const key = `${systemId}:${date}`;

    if (!trendMap.has(key)) {
      const system = TAXONOMY_SYSTEMS.find(s => s.id === systemId);
      trendMap.set(key, {
        systemId,
        systemName: system?.name || systemId,
        date,
        errorCount: 0,
        firstOrderCount: 0,
        higherOrderCount: 0,
      });
    }

    const trend = trendMap.get(key)!;
    trend.errorCount++;

    if (error.cognitiveLevel === 'first-order') {
      trend.firstOrderCount++;
    } else if (error.cognitiveLevel === 'higher-order') {
      trend.higherOrderCount++;
    }
  });

  return Array.from(trendMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get overall cognitive level distribution
 */
export function getCognitiveLevelStats(errors: ErrorLog[]): {
  firstOrder: number;
  higherOrder: number;
  unclassified: number;
  firstOrderPercent: number;
  higherOrderPercent: number;
} {
  let firstOrder = 0;
  let higherOrder = 0;
  let unclassified = 0;

  errors.forEach(error => {
    if (error.cognitiveLevel === 'first-order') {
      firstOrder++;
    } else if (error.cognitiveLevel === 'higher-order') {
      higherOrder++;
    } else {
      unclassified++;
    }
  });

  const total = errors.length;
  const classified = firstOrder + higherOrder;

  return {
    firstOrder,
    higherOrder,
    unclassified,
    firstOrderPercent: classified > 0 ? (firstOrder / classified) * 100 : 0,
    higherOrderPercent: classified > 0 ? (higherOrder / classified) * 100 : 0,
  };
}
