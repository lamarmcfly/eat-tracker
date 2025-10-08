'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { analyzePatterns } from '@/lib/insights';
import { generateStudyPlan } from '@/lib/planner';
import { StudyPlan } from '@/lib/types';

export default function Plan() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedPlan = storage.getPlan();
    if (savedPlan) setPlan(savedPlan);
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    const errors = storage.getErrors();
    const patterns = analyzePatterns(errors);

    if (patterns.length === 0) {
      alert('Log some errors first to generate a personalized study plan!');
      setIsGenerating(false);
      return;
    }

    const newPlan = generateStudyPlan(patterns);
    storage.savePlan(newPlan);
    setPlan(newPlan);
    setIsGenerating(false);
  };

  const activityColors = {
    retrieval: 'bg-blue-500',
    review: 'bg-green-500',
    practice: 'bg-purple-500',
  };

  const activityIcons = {
    retrieval: '🎯',
    review: '📚',
    practice: '✍️',
  };

  const groupedByDay = plan
    ? Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        blocks: plan.blocks.filter(b => b.day === i + 1),
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">7-Day Study Plan</h1>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : plan ? 'Regenerate Plan' : 'Generate Plan'}
          </button>
        </div>

        {!plan ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">
              No study plan generated yet. Click &quot;Generate Plan&quot; to create a personalized 7-day schedule based on your error patterns.
            </p>
            <div className="text-sm text-gray-400 space-y-2">
              <p>✨ Uses spaced repetition (24h, 48h, 1 week)</p>
              <p>🎯 Prioritizes your weakest areas</p>
              <p>🔀 Interleaves topics for better retention</p>
              <p>⏱️ Short, focused study blocks</p>
            </div>
          </div>
        ) : (
          <>
            {/* Plan Info */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="text-sm text-gray-600">
                Generated on {new Date(plan.generatedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })} • {plan.blocks.length} study blocks • {
                  plan.blocks.reduce((sum, b) => sum + b.duration, 0)
                } total minutes
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <span>{activityIcons.retrieval}</span>
                  <span className="font-medium">Retrieval Practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{activityIcons.review}</span>
                  <span className="font-medium">Spaced Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{activityIcons.practice}</span>
                  <span className="font-medium">Active Practice</span>
                </div>
              </div>
            </div>

            {/* Daily Schedule */}
            <div className="space-y-4">
              {groupedByDay.map(({ day, blocks }) => {
                const totalMinutes = blocks.reduce((sum, b) => sum + b.duration, 0);
                const dayDate = new Date(plan.weekStart);
                dayDate.setDate(dayDate.getDate() + day - 1);

                return (
                  <div key={day} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold">Day {day}</h2>
                          <p className="text-sm text-blue-100">
                            {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{totalMinutes}</div>
                          <div className="text-sm text-blue-100">minutes</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {blocks.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">Rest day - no sessions scheduled</p>
                      ) : (
                        blocks.map((block) => (
                          <div
                            key={block.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{activityIcons[block.activity]}</div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-gray-800">{block.topic}</h3>
                                  <span className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                    {block.duration} min
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{block.system}</p>
                                <div className="mt-2">
                                  <span className={`inline-block px-2 py-1 ${activityColors[block.activity]} text-white text-xs font-medium rounded capitalize`}>
                                    {block.activity}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 italic">{block.reasoning}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Principles Reminder */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-gray-800 mb-3">Evidence-Based Principles</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Spaced Repetition:</strong> Revisits at 24h, 48h, and 1 week maximize retention</li>
                <li>• <strong>Active Retrieval:</strong> Testing yourself strengthens memory more than passive review</li>
                <li>• <strong>Interleaving:</strong> Mixing topics improves discrimination and long-term learning</li>
                <li>• <strong>Short Blocks:</strong> Focused 15-30 min sessions prevent cognitive overload</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
