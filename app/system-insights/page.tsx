'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { analyzeByOrganSystem, getCognitiveLevelStats, getSystemTrends } from '@/lib/systemAnalytics';
import { ErrorLog } from '@/lib/types';

// Tooltip component
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg -top-2 left-full ml-2 w-64">
          {text}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-800 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export default function SystemInsights() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    setErrors(storage.getErrors());
  }, []);

  const systemBreakdowns = analyzeByOrganSystem(errors);
  const cognitiveStats = getCognitiveLevelStats(errors);
  const trends = getSystemTrends(errors, 30);

  // Group trends by system for visualization
  const trendsBySystem = new Map<string, typeof trends>();
  trends.forEach(trend => {
    if (!trendsBySystem.has(trend.systemId)) {
      trendsBySystem.set(trend.systemId, []);
    }
    trendsBySystem.get(trend.systemId)!.push(trend);
  });

  const trendIcons = {
    improving: '📉',
    worsening: '📈',
    stable: '➡️',
  };

  const trendColors = {
    improving: 'text-green-600',
    worsening: 'text-red-600',
    stable: 'text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">NBME System Insights</h1>
          <Tooltip text="Analysis focused on official NBME organ systems, showing cognitive level distribution and trends over time.">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
              ?
            </div>
          </Tooltip>
        </div>

        {errors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No errors logged yet. Start logging to see system-level insights!</p>
          </div>
        ) : (
          <>
            {/* Overall Cognitive Level Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Cognitive Level Distribution</h2>
                <Tooltip text="First-order questions test recall and basic understanding. Higher-order questions require analysis, synthesis, and clinical reasoning. Medical boards increasingly emphasize higher-order thinking.">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    ?
                  </div>
                </Tooltip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-sm text-blue-700 font-medium mb-1">First-Order (Recall)</div>
                  <div className="text-3xl font-bold text-blue-800">{cognitiveStats.firstOrder}</div>
                  <div className="text-sm text-blue-600 mt-1">
                    {cognitiveStats.firstOrderPercent.toFixed(0)}% of classified
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="text-sm text-purple-700 font-medium mb-1">Higher-Order (Analysis)</div>
                  <div className="text-3xl font-bold text-purple-800">{cognitiveStats.higherOrder}</div>
                  <div className="text-sm text-purple-600 mt-1">
                    {cognitiveStats.higherOrderPercent.toFixed(0)}% of classified
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="text-sm text-gray-700 font-medium mb-1">Unclassified</div>
                  <div className="text-3xl font-bold text-gray-800">{cognitiveStats.unclassified}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {errors.length > 0 ? ((cognitiveStats.unclassified / errors.length) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
              </div>

              {cognitiveStats.firstOrder + cognitiveStats.higherOrder > 0 && (
                <div className="mt-4">
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    <div
                      className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${cognitiveStats.firstOrderPercent}%` }}
                    >
                      {cognitiveStats.firstOrderPercent > 10 ? `${cognitiveStats.firstOrderPercent.toFixed(0)}%` : ''}
                    </div>
                    <div
                      className="bg-purple-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${cognitiveStats.higherOrderPercent}%` }}
                    >
                      {cognitiveStats.higherOrderPercent > 10 ? `${cognitiveStats.higherOrderPercent.toFixed(0)}%` : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* System Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Breakdown by NBME Organ System</h2>
                <Tooltip text="Shows errors organized by official NBME organ systems. Exam Weight indicates the percentage of questions from each system on Step 2 CK. Focus on high-weight systems with many errors.">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    ?
                  </div>
                </Tooltip>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">System</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                        <Tooltip text="Official Step 2 CK exam weight (% of questions)">
                          <span className="border-b border-dashed border-gray-400">Exam Wt</span>
                        </Tooltip>
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Total Errors</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                        <Tooltip text="Recall & basic understanding questions">
                          <span className="border-b border-dashed border-gray-400">1st Order</span>
                        </Tooltip>
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                        <Tooltip text="Analysis, synthesis & clinical reasoning questions">
                          <span className="border-b border-dashed border-gray-400">Higher Order</span>
                        </Tooltip>
                      </th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                        <Tooltip text="Trend comparing last 7 days to previous 7 days">
                          <span className="border-b border-dashed border-gray-400">Trend</span>
                        </Tooltip>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemBreakdowns.map((system, idx) => (
                      <tr key={system.systemId} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                        <td className="py-3 px-2 text-sm font-medium text-gray-800">
                          {system.systemName}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-sm font-semibold ${
                            system.examWeightPercent >= 7 ? 'text-red-600' :
                            system.examWeightPercent >= 5 ? 'text-orange-600' :
                            'text-gray-600'
                          }`}>
                            {system.examWeightPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-lg font-bold text-gray-800">{system.totalErrors}</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="text-sm text-gray-800">
                            {system.firstOrderErrors}
                            {system.firstOrderErrors > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({system.firstOrderPercent.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="text-sm text-gray-800">
                            {system.higherOrderErrors}
                            {system.higherOrderErrors > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({system.higherOrderPercent.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className={`flex items-center justify-center gap-1 ${trendColors[system.trendDirection]}`}>
                            <span className="text-lg">{trendIcons[system.trendDirection]}</span>
                            <span className="text-sm font-medium">
                              {system.trendDirection === 'stable' ? 'Stable' :
                               system.trendDirection === 'improving' ? `${Math.abs(system.trendPercent).toFixed(0)}% ↓` :
                               `${Math.abs(system.trendPercent).toFixed(0)}% ↑`}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System-Specific Trends */}
            {systemBreakdowns.length > 0 && systemBreakdowns.slice(0, 5).map(system => {
              const systemTrends = trendsBySystem.get(system.systemId) || [];
              if (systemTrends.length === 0) return null;

              const maxErrors = Math.max(...systemTrends.map(t => t.errorCount), 1);

              return (
                <div key={system.systemId} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{system.systemName} - Trend (Last 30 Days)</h3>
                    <Tooltip text="Shows daily error count over time. Look for patterns and improvement trends.">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        ?
                      </div>
                    </Tooltip>
                  </div>

                  <div className="space-y-2">
                    {systemTrends.slice(-14).map((trend) => (
                      <div key={trend.date} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600">
                          {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 flex gap-1 items-center">
                          <div className="flex-1 bg-gray-100 rounded h-8 relative overflow-hidden">
                            {trend.firstOrderCount > 0 && (
                              <div
                                className="absolute top-0 left-0 h-full bg-blue-400"
                                style={{ width: `${(trend.firstOrderCount / maxErrors) * 100}%` }}
                              />
                            )}
                            {trend.higherOrderCount > 0 && (
                              <div
                                className="absolute top-0 bg-purple-400 h-full"
                                style={{
                                  left: `${(trend.firstOrderCount / maxErrors) * 100}%`,
                                  width: `${(trend.higherOrderCount / maxErrors) * 100}%`
                                }}
                              />
                            )}
                          </div>
                          <div className="w-12 text-sm font-semibold text-gray-700 text-right">
                            {trend.errorCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-400 rounded"></div>
                      <span className="text-gray-600">First-Order</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-400 rounded"></div>
                      <span className="text-gray-600">Higher-Order</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
