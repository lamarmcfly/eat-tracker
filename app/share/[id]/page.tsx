'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSnapshot, ShareableSnapshot } from '@/lib/export';

export default function SharedSnapshotPage() {
  const params = useParams();
  const id = params.id as string;
  const [snapshot, setSnapshot] = useState<ShareableSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid snapshot ID');
      setLoading(false);
      return;
    }

    const snap = getSnapshot(id);
    if (!snap) {
      setError('Snapshot not found or expired');
      setLoading(false);
      return;
    }

    setSnapshot(snap);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg text-gray-600">Loading snapshot...</div>
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Snapshot Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This snapshot may have expired or been deleted.'}</p>
        </div>
      </div>
    );
  }

  const { summary, topPatterns, systemBreakdown, studyPlan } = snapshot;
  const isExpired = snapshot.expiresAt && new Date(snapshot.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Read-Only Banner */}
      <div className="bg-yellow-100 border-b-4 border-yellow-400 px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-2xl">👁️</span>
          <div className="flex-1">
            <div className="font-bold text-yellow-900">Read-Only Snapshot for Advising</div>
            <div className="text-sm text-yellow-800">
              This is a shared view. No edits can be made. Privacy-focused: aggregate data only.
            </div>
          </div>
          {snapshot.expiresAt && (
            <div className="text-sm text-yellow-800 text-right">
              <div className="font-semibold">Expires:</div>
              <div>{new Date(snapshot.expiresAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-400">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">E.A.T. Tracker Snapshot</h1>
              <p className="text-gray-600">
                Created: {new Date(snapshot.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">🔒</span>
              <div className="text-sm text-blue-900">
                <div className="font-semibold mb-1">Privacy Notice</div>
                <div>{snapshot._privacy}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary Statistics</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-sm text-blue-700 font-medium">Total Errors</div>
              <div className="text-3xl font-bold text-blue-800">{summary.totalErrors}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-sm text-purple-700 font-medium">Days Covered</div>
              <div className="text-3xl font-bold text-purple-800">{summary.dateRange.daysCovered}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-sm text-green-700 font-medium">Date Range</div>
              <div className="text-sm font-semibold text-green-800">
                {new Date(summary.dateRange.earliest).toLocaleDateString()} - {new Date(summary.dateRange.latest).toLocaleDateString()}
              </div>
            </div>
            {studyPlan?.examDate && (
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-sm text-red-700 font-medium">Exam Date</div>
                <div className="text-sm font-semibold text-red-800">
                  {new Date(studyPlan.examDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  {studyPlan.daysUntilExam} days away
                </div>
              </div>
            )}
          </div>

          {/* Error Type Breakdown */}
          <h3 className="font-bold text-gray-800 mb-3">Error Type Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-red-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-800">{summary.errorsByType.knowledge}</div>
              <div className="text-sm text-red-700">Knowledge</div>
            </div>
            <div className="bg-orange-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-800">{summary.errorsByType.reasoning}</div>
              <div className="text-sm text-orange-700">Reasoning</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-800">{summary.errorsByType.process}</div>
              <div className="text-sm text-yellow-700">Process</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-800">{summary.errorsByType.time}</div>
              <div className="text-sm text-purple-700">Time</div>
            </div>
          </div>

          {/* Cognitive Level */}
          {summary.cognitiveLevel && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 mb-3">Cognitive Level Distribution</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-800">{summary.cognitiveLevel.firstOrder}</div>
                  <div className="text-sm text-blue-700">First-Order</div>
                </div>
                <div className="bg-purple-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-800">{summary.cognitiveLevel.higherOrder}</div>
                  <div className="text-sm text-purple-700">Higher-Order</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">{summary.cognitiveLevel.unclassified}</div>
                  <div className="text-sm text-gray-700">Unclassified</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Patterns */}
        {topPatterns.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Error Patterns</h2>
            <div className="space-y-3">
              {topPatterns.map((pattern, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{pattern.topic}</h3>
                        {pattern.urgency && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            pattern.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                            pattern.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                            pattern.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {pattern.urgency.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{pattern.system}</div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold">{pattern.errorCount}</span> errors
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-700 capitalize">{pattern.dominantErrorType}</span>
                        {pattern.reasonChip && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                              {pattern.reasonChip}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Breakdown */}
        {systemBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">NBME System Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">System</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Total Errors</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Exam Weight</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">1st Order %</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Higher %</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {systemBreakdown.map((system, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="py-3 px-2 text-sm font-medium text-gray-800">{system.systemName}</td>
                      <td className="py-3 px-2 text-center text-lg font-bold text-gray-800">{system.totalErrors}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-sm font-semibold ${
                          system.examWeight >= 7 ? 'text-red-600' :
                          system.examWeight >= 5 ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {system.examWeight.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-sm text-gray-700">
                        {system.firstOrderPercent > 0 ? system.firstOrderPercent.toFixed(0) : '-'}%
                      </td>
                      <td className="py-3 px-2 text-center text-sm text-gray-700">
                        {system.higherOrderPercent > 0 ? system.higherOrderPercent.toFixed(0) : '-'}%
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-sm font-medium ${
                          system.trendDirection === 'improving' ? 'text-green-600' :
                          system.trendDirection === 'worsening' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {system.trendDirection === 'improving' ? '📉 Improving' :
                           system.trendDirection === 'worsening' ? '📈 Worsening' :
                           '➡️ Stable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Study Plan */}
        {studyPlan && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Study Plan</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Generated:</span>{' '}
                  <span className="font-semibold text-gray-800">
                    {new Date(studyPlan.generatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Blocks:</span>{' '}
                  <span className="font-semibold text-gray-800">{studyPlan.totalBlocks}</span>
                </div>
                {studyPlan.examDate && (
                  <div>
                    <span className="text-gray-600">Exam Date:</span>{' '}
                    <span className="font-semibold text-gray-800">
                      {new Date(studyPlan.examDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {studyPlan.blocks.map((block, idx) => {
                const urgencyColors = {
                  urgent: 'border-l-red-500 bg-red-50',
                  high: 'border-l-orange-500 bg-orange-50',
                  moderate: 'border-l-yellow-500 bg-yellow-50',
                  low: 'border-l-blue-500 bg-blue-50',
                };
                return (
                  <div
                    key={idx}
                    className={`border-l-4 rounded-lg p-4 ${block.urgency ? urgencyColors[block.urgency as keyof typeof urgencyColors] : 'border-l-gray-400 bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-700">Day {block.day}</span>
                          <span className="text-gray-500">•</span>
                          <h3 className="font-semibold text-gray-800">{block.topic}</h3>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{block.system}</div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-700 capitalize">{block.activity}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-700">{block.duration} min</span>
                          {block.whyScheduled && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="px-2 py-0.5 bg-white border border-gray-300 rounded text-gray-700">
                                {block.whyScheduled}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 rounded-xl p-6 text-center border border-gray-300">
          <div className="text-sm text-gray-600">
            <div className="mb-2">
              This snapshot was generated by <span className="font-semibold">E.A.T. Tracker</span> - Error Analysis & Targeted Learning
            </div>
            <div className="text-xs text-gray-500">
              Snapshot ID: {snapshot.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
