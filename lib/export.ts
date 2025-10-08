// Export and sharing utilities for E.A.T. Tracker
import { ErrorLog, StudyPlan } from './types';
import { analyzePatterns } from './insights';
import { analyzeByOrganSystem, getCognitiveLevelStats } from './systemAnalytics';
import { getTopPriorities } from './priority';

/**
 * Shareable snapshot for advising
 * Privacy-focused: no personal info, just aggregate data
 */
export interface ShareableSnapshot {
  id: string;
  createdAt: Date;
  expiresAt?: Date;

  // Summary statistics
  summary: {
    totalErrors: number;
    dateRange: {
      earliest: Date;
      latest: Date;
      daysCovered: number;
    };
    errorsByType: {
      knowledge: number;
      reasoning: number;
      process: number;
      time: number;
    };
    cognitiveLevel?: {
      firstOrder: number;
      higherOrder: number;
      unclassified: number;
    };
  };

  // Top patterns (anonymized)
  topPatterns: Array<{
    system: string;
    topic: string;
    errorCount: number;
    dominantErrorType: string;
    urgency?: string;
    reasonChip?: string;
  }>;

  // System breakdown
  systemBreakdown: Array<{
    systemName: string;
    totalErrors: number;
    examWeight: number;
    firstOrderPercent: number;
    higherOrderPercent: number;
    trendDirection: string;
  }>;

  // Current study plan (if exists)
  studyPlan?: {
    generatedAt: Date;
    examDate?: Date;
    daysUntilExam?: number;
    totalBlocks: number;
    blocks: Array<{
      day: number;
      topic: string;
      system: string;
      activity: string;
      duration: number;
      urgency?: string;
      whyScheduled?: string;
    }>;
  };

  // No personal info or detailed error descriptions
  _privacy: 'This snapshot contains aggregate data only. No personal information or detailed error descriptions are included.';
}

/**
 * Export format for full data backup
 */
export interface ExportData {
  version: string;
  exportedAt: Date;
  totalErrors: number;
  errors: ErrorLog[];
  studyPlan?: StudyPlan;
}

/**
 * Generate shareable snapshot ID
 */
export function generateSnapshotId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `snapshot-${timestamp}-${random}`;
}

/**
 * Create shareable snapshot from error logs and plan
 */
export function createShareableSnapshot(
  errors: ErrorLog[],
  plan?: StudyPlan,
  expiresInDays?: number
): ShareableSnapshot {
  const now = new Date();
  const patterns = analyzePatterns(errors);
  const systemBreakdowns = analyzeByOrganSystem(errors);
  const priorities = errors.length > 0 ? getTopPriorities(patterns, errors, 10) : [];
  const cognitiveStats = getCognitiveLevelStats(errors);

  // Calculate date range
  const timestamps = errors.map(e => new Date(e.timestamp).getTime());
  const earliest = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : now;
  const latest = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : now;
  const daysCovered = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));

  // Error type counts
  const errorsByType = {
    knowledge: errors.filter(e => e.errorType === 'knowledge').length,
    reasoning: errors.filter(e => e.errorType === 'reasoning').length,
    process: errors.filter(e => e.errorType === 'process').length,
    time: errors.filter(e => e.errorType === 'time').length,
  };

  // Top patterns (anonymized - no descriptions)
  const topPatterns = priorities.slice(0, 8).map(p => {
    // Find matching pattern to get error details
    const matchingPattern = patterns.find(pat => pat.topic === p.topic && pat.system === p.system);
    const errorCount = matchingPattern?.errorCount || 0;
    const dominantErrorType = matchingPattern?.errorTypes ?
      Object.entries(matchingPattern.errorTypes).reduce((a, b) => b[1] > a[1] ? b : a)[0] : 'unknown';

    return {
      system: p.system,
      topic: p.topic,
      errorCount,
      dominantErrorType,
      urgency: p.urgency,
      reasonChip: p.reasonChip,
    };
  });

  // System breakdown
  const systemBreakdown = systemBreakdowns.slice(0, 10).map(s => ({
    systemName: s.systemName,
    totalErrors: s.totalErrors,
    examWeight: s.examWeightPercent,
    firstOrderPercent: s.firstOrderPercent,
    higherOrderPercent: s.higherOrderPercent,
    trendDirection: s.trendDirection,
  }));

  // Study plan (if exists)
  const studyPlan = plan ? {
    generatedAt: new Date(plan.generatedAt),
    examDate: plan.examDate ? new Date(plan.examDate) : undefined,
    daysUntilExam: plan.daysUntilExam,
    totalBlocks: plan.blocks.length,
    blocks: plan.blocks.slice(0, 20).map(b => ({ // Limit to 20 blocks
      day: b.day,
      topic: b.topic,
      system: b.system,
      activity: b.activity,
      duration: b.duration,
      urgency: b.urgency,
      whyScheduled: b.whyScheduled,
    })),
  } : undefined;

  const snapshot: ShareableSnapshot = {
    id: generateSnapshotId(),
    createdAt: now,
    expiresAt: expiresInDays ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000) : undefined,
    summary: {
      totalErrors: errors.length,
      dateRange: {
        earliest,
        latest,
        daysCovered,
      },
      errorsByType,
      cognitiveLevel: cognitiveStats.firstOrder + cognitiveStats.higherOrder > 0 ? {
        firstOrder: cognitiveStats.firstOrder,
        higherOrder: cognitiveStats.higherOrder,
        unclassified: cognitiveStats.unclassified,
      } : undefined,
    },
    topPatterns,
    systemBreakdown,
    studyPlan,
    _privacy: 'This snapshot contains aggregate data only. No personal information or detailed error descriptions are included.',
  };

  return snapshot;
}

/**
 * Create full data export for backup
 */
export function createExport(errors: ErrorLog[], plan?: StudyPlan): ExportData {
  return {
    version: '1.0',
    exportedAt: new Date(),
    totalErrors: errors.length,
    errors,
    studyPlan: plan,
  };
}

/**
 * Download JSON file
 */
export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Snapshot storage in localStorage (temporary)
 * In production, would use backend API
 */
const SNAPSHOT_STORAGE_KEY = 'eat-tracker-snapshots';

export function saveSnapshot(snapshot: ShareableSnapshot): void {
  const snapshots = getStoredSnapshots();
  snapshots.set(snapshot.id, snapshot);

  // Store as array for localStorage
  const snapshotsArray = Array.from(snapshots.values());
  localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshotsArray));
}

export function getSnapshot(id: string): ShareableSnapshot | null {
  const snapshots = getStoredSnapshots();
  const snapshot = snapshots.get(id);

  if (!snapshot) return null;

  // Check if expired
  if (snapshot.expiresAt && new Date(snapshot.expiresAt) < new Date()) {
    deleteSnapshot(id);
    return null;
  }

  return snapshot;
}

export function getStoredSnapshots(): Map<string, ShareableSnapshot> {
  try {
    const stored = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!stored) return new Map();

    const parsed = JSON.parse(stored) as ShareableSnapshot[];
    const map = new Map<string, ShareableSnapshot>();

    parsed.forEach(snapshot => {
      // Parse dates
      snapshot.createdAt = new Date(snapshot.createdAt);
      if (snapshot.expiresAt) snapshot.expiresAt = new Date(snapshot.expiresAt);
      if (snapshot.summary?.dateRange) {
        snapshot.summary.dateRange.earliest = new Date(snapshot.summary.dateRange.earliest);
        snapshot.summary.dateRange.latest = new Date(snapshot.summary.dateRange.latest);
      }
      if (snapshot.studyPlan) {
        snapshot.studyPlan.generatedAt = new Date(snapshot.studyPlan.generatedAt);
        if (snapshot.studyPlan.examDate) {
          snapshot.studyPlan.examDate = new Date(snapshot.studyPlan.examDate);
        }
      }

      map.set(snapshot.id, snapshot as ShareableSnapshot);
    });

    return map;
  } catch {
    return new Map();
  }
}

export function deleteSnapshot(id: string): void {
  const snapshots = getStoredSnapshots();
  snapshots.delete(id);

  const snapshotsArray = Array.from(snapshots.values());
  localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshotsArray));
}

/**
 * Clean up expired snapshots
 */
export function cleanupExpiredSnapshots(): number {
  const snapshots = getStoredSnapshots();
  const now = new Date();
  let cleaned = 0;

  snapshots.forEach((snapshot, id) => {
    if (snapshot.expiresAt && new Date(snapshot.expiresAt) < now) {
      snapshots.delete(id);
      cleaned++;
    }
  });

  if (cleaned > 0) {
    const snapshotsArray = Array.from(snapshots.values());
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshotsArray));
  }

  return cleaned;
}
