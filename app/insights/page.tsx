'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { analyzePatterns, getPriorityList, getErrorTrends } from '@/lib/insights';
import { ErrorLog, TopicPattern } from '@/lib/types';

export default function Insights() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [patterns, setPatterns] = useState<TopicPattern[]>([]);

  useEffect(() => {
    const loadedErrors = storage.getErrors();
    setErrors(loadedErrors);
    setPatterns(analyzePatterns(loadedErrors));
  }, []);

  const priorities = getPriorityList(patterns);
  const trends = getErrorTrends(errors);

  const errorTypeColors = {
    knowledge: 'bg-red-500',
    reasoning: 'bg-orange-500',
    process: 'bg-yellow-500',
    time: 'bg-purple-500',
  };

  const totalErrors = errors.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Insights</h1>

        {totalErrors === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No errors logged yet. Start by logging your first error!</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl font-bold text-blue-600">{totalErrors}</div>
                <div className="text-sm text-gray-600">Total Errors</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl font-bold text-indigo-600">{patterns.length}</div>
                <div className="text-sm text-gray-600">Topics</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...patterns.map(p => p.errorCount), 0)}
                </div>
                <div className="text-sm text-gray-600">Max/Topic</div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl font-bold text-pink-600">{trends.length}</div>
                <div className="text-sm text-gray-600">Active Days</div>
              </div>
            </div>

            {/* Priority List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Priority List</h2>
              <div className="space-y-3">
                {priorities.length === 0 ? (
                  <p className="text-gray-500">Not enough data for priorities yet.</p>
                ) : (
                  priorities.map((item) => (
                    <div
                      key={`${item.system}-${item.topic}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {item.priority}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.topic}</h3>
                          <p className="text-sm text-gray-500">{item.system}</p>
                          <p className="text-sm text-gray-700 mt-1">{item.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Error Type Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Types</h2>
              <div className="space-y-3">
                {(['knowledge', 'reasoning', 'process', 'time'] as const).map(type => {
                  const count = errors.filter(e => e.errorType === type).length;
                  const percentage = totalErrors > 0 ? (count / totalErrors) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                        <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${errorTypeColors[type]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Topics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Topics by Error Count</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Topic</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">System</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patterns.slice(0, 8).map((pattern, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm text-gray-800">{pattern.topic}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{pattern.system}</td>
                        <td className="py-3 px-2 text-sm text-gray-800 text-center font-semibold">
                          {pattern.errorCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trend Over Time */}
            {trends.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-2">
                  {trends.slice(-7).reverse().map((day) => {
                    const total = day.knowledge + day.reasoning + day.process + day.time;
                    return (
                      <div key={day.date} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="flex-1 flex gap-1 h-8 bg-gray-100 rounded overflow-hidden">
                          {total > 0 && (
                            <>
                              <div className={`${errorTypeColors.knowledge}`} style={{ width: `${(day.knowledge / total) * 100}%` }} />
                              <div className={`${errorTypeColors.reasoning}`} style={{ width: `${(day.reasoning / total) * 100}%` }} />
                              <div className={`${errorTypeColors.process}`} style={{ width: `${(day.process / total) * 100}%` }} />
                              <div className={`${errorTypeColors.time}`} style={{ width: `${(day.time / total) * 100}%` }} />
                            </>
                          )}
                        </div>
                        <div className="w-12 text-sm font-semibold text-gray-700 text-right">{total}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
