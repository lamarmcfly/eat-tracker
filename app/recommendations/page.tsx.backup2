'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { generateRecommendations, getStrategyInfo } from '@/lib/recommendationEngine';
import { Recommendation, LearningStrategy } from '@/lib/learningStrategies';
import { ErrorLog } from '@/lib/types';

// Strategy icons and colors
const strategyIcons: Record<LearningStrategy, string> = {
  'active-recall': '🧠',
  'spaced-repetition': '📅',
  'interleaving': '🔀',
  'dual-coding': '🎨',
  'elaboration': '💬',
  'practice-testing': '⏱️',
  'concrete-examples': '📋',
  'metacognitive': '🔍',
};

const strategyColors: Record<LearningStrategy, string> = {
  'active-recall': 'bg-blue-50 border-blue-300 text-blue-800',
  'spaced-repetition': 'bg-green-50 border-green-300 text-green-800',
  'interleaving': 'bg-purple-50 border-purple-300 text-purple-800',
  'dual-coding': 'bg-pink-50 border-pink-300 text-pink-800',
  'elaboration': 'bg-yellow-50 border-yellow-300 text-yellow-800',
  'practice-testing': 'bg-red-50 border-red-300 text-red-800',
  'concrete-examples': 'bg-indigo-50 border-indigo-300 text-indigo-800',
  'metacognitive': 'bg-gray-50 border-gray-300 text-gray-800',
};

const priorityColors = {
  5: 'border-l-4 border-l-red-500',
  4: 'border-l-4 border-l-orange-500',
  3: 'border-l-4 border-l-yellow-500',
  2: 'border-l-4 border-l-blue-500',
  1: 'border-l-4 border-l-gray-500',
};

const timeFrameLabels = {
  'today': 'Today',
  'tomorrow': 'Tomorrow',
  '48h': 'In 48 hours',
  '1-week': 'In 1 week',
  '2-weeks': 'In 2 weeks',
};

const evidenceStrengthBadges = {
  high: 'bg-green-600 text-white',
  moderate: 'bg-yellow-600 text-white',
  low: 'bg-gray-600 text-white',
};

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
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg bottom-full left-1/2 -translate-x-1/2 mb-2 w-64">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-800 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export default function Recommendations() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [examDate, setExamDate] = useState<Date | undefined>();
  const [groupByStrategy, setGroupByStrategy] = useState(false);

  useEffect(() => {
    const loadedErrors = storage.getErrors();
    setErrors(loadedErrors);

    // Try to get exam date from study plan
    const plan = storage.getPlan();
    if (plan?.examDate) {
      setExamDate(new Date(plan.examDate));
    }

    // Generate recommendations
    const recs = generateRecommendations({
      errors: loadedErrors,
      examDate: plan?.examDate ? new Date(plan.examDate) : undefined,
      maxRecommendations: 10,
    });
    setRecommendations(recs);
  }, []);

  // Group recommendations by strategy if enabled
  const groupedByStrategy = new Map<LearningStrategy, Recommendation[]>();
  if (groupByStrategy) {
    recommendations.forEach(rec => {
      if (!groupedByStrategy.has(rec.strategy)) {
        groupedByStrategy.set(rec.strategy, []);
      }
      groupedByStrategy.get(rec.strategy)!.push(rec);
    });
  }

  const daysUntilExam = examDate
    ? Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Learning Recommendations</h1>
            <Tooltip text="Personalized study strategies based on your error patterns, exam timeline, and evidence-based learning research.">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                ?
              </div>
            </Tooltip>
          </div>

          <button
            onClick={() => setGroupByStrategy(!groupByStrategy)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {groupByStrategy ? 'Group by Priority' : 'Group by Strategy'}
          </button>
        </div>

        {/* Exam Timeline */}
        {examDate && daysUntilExam !== undefined && (
          <div className={`rounded-xl p-4 border-2 ${
            daysUntilExam <= 7 ? 'bg-red-50 border-red-300' :
            daysUntilExam <= 30 ? 'bg-orange-50 border-orange-300' :
            'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{daysUntilExam <= 7 ? '⚠️' : daysUntilExam <= 30 ? '📅' : '🎯'}</span>
              <div>
                <div className="font-bold text-gray-800">
                  Exam in {daysUntilExam} days
                </div>
                <div className="text-sm text-gray-600">
                  {daysUntilExam <= 7 ? 'Final review mode - focus on high-yield practice' :
                   daysUntilExam <= 30 ? 'Intensifying phase - timed practice + spaced review' :
                   'Building phase - deep learning with spaced repetition'}
                </div>
              </div>
            </div>
          </div>
        )}

        {errors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No errors logged yet. Start logging to get personalized recommendations!</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Not enough data yet. Keep logging errors to unlock recommendations!</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{recommendations.length}</span> personalized recommendations
                </div>
                <div className="text-sm text-gray-600">
                  Based on <span className="font-semibold text-gray-800">{errors.length}</span> logged errors
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            {!groupByStrategy ? (
              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const strategyInfo = getStrategyInfo(rec.strategy);
                  return (
                    <div
                      key={rec.id}
                      className={`bg-white rounded-xl shadow-md p-5 ${priorityColors[rec.priority as keyof typeof priorityColors]}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Strategy Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl ${strategyColors[rec.strategy]}`}>
                            {strategyIcons[rec.strategy]}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Action */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">
                              {rec.action}
                            </h3>
                            <div className="flex-shrink-0 flex items-center gap-2">
                              {/* Priority badge */}
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                rec.priority === 5 ? 'bg-red-100 text-red-700' :
                                rec.priority === 4 ? 'bg-orange-100 text-orange-700' :
                                rec.priority === 3 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                P{rec.priority}
                              </span>
                            </div>
                          </div>

                          {/* System & Topic */}
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {rec.systemName} {rec.topic !== 'General review' && rec.topic !== 'Mixed topics' && rec.topic !== 'Visual learning' && rec.topic !== 'Confidence calibration' && `• ${rec.topic}`}
                          </div>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              ⏱️ {rec.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              📅 {timeFrameLabels[rec.timeFrame]}
                            </span>
                            {rec.errorCount > 0 && (
                              <span className="flex items-center gap-1">
                                ❌ {rec.errorCount} error{rec.errorCount !== 1 ? 's' : ''}
                              </span>
                            )}
                            {rec.cognitiveLevel && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {rec.cognitiveLevel === 'first-order' ? '1st Order' : 'Higher Order'}
                              </span>
                            )}
                          </div>

                          {/* Rationale */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <div className="text-sm text-gray-700">
                              <span className="font-semibold">Why: </span>
                              {rec.rationale}
                            </div>
                          </div>

                          {/* Strategy info */}
                          <div className="flex items-center gap-3">
                            <Tooltip text={strategyInfo.description}>
                              <span className="text-sm font-medium text-gray-600 border-b border-dashed border-gray-400 cursor-help">
                                {strategyInfo.name}
                              </span>
                            </Tooltip>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${evidenceStrengthBadges[strategyInfo.evidenceStrength as keyof typeof evidenceStrengthBadges]}`}>
                              {strategyInfo.evidenceStrength.toUpperCase()} EVIDENCE
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Grouped by strategy
              <div className="space-y-6">
                {Array.from(groupedByStrategy.entries()).map(([strategy, recs]) => {
                  const strategyInfo = getStrategyInfo(strategy);
                  return (
                    <div key={strategy} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl ${strategyColors[strategy]}`}>
                          {strategyIcons[strategy]}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-800">{strategyInfo.name}</h2>
                          <p className="text-sm text-gray-600">{strategyInfo.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${evidenceStrengthBadges[strategyInfo.evidenceStrength as keyof typeof evidenceStrengthBadges]}`}>
                          {strategyInfo.evidenceStrength.toUpperCase()} EVIDENCE
                        </span>
                      </div>

                      <div className="space-y-3">
                        {recs.map(rec => (
                          <div
                            key={rec.id}
                            className={`border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${priorityColors[rec.priority as keyof typeof priorityColors]}`}
                          >
                            <div className="font-bold text-gray-800 mb-1">{rec.action}</div>
                            <div className="text-sm text-gray-600 mb-2">
                              {rec.systemName} {rec.topic !== 'General review' && `• ${rec.topic}`}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>⏱️ {rec.duration} min</span>
                              <span>📅 {timeFrameLabels[rec.timeFrame]}</span>
                              <span className="text-gray-500">• {rec.rationale}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Evidence-Based Learning Guide */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Evidence-Based Learning Strategies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(LEARNING_STRATEGIES).map(([key, strategy]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{strategyIcons[key as LearningStrategy]}</span>
                      <h3 className="font-semibold text-gray-800">{strategy.name}</h3>
                      <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${evidenceStrengthBadges[strategy.evidenceStrength]}`}>
                        {strategy.evidenceStrength.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Import LEARNING_STRATEGIES for the guide section
import { LEARNING_STRATEGIES } from '@/lib/learningStrategies';
