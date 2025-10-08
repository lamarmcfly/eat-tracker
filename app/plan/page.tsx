'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { analyzePatterns } from '@/lib/insights';
import { generateStudyPlan } from '@/lib/planner';
import { StudyPlan } from '@/lib/types';

export default function Plan() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [examDate, setExamDate] = useState<string>('');
  const [showExamInput, setShowExamInput] = useState(false);

  useEffect(() => {
    const savedPlan = storage.getPlan();
    if (savedPlan) {
      setPlan(savedPlan);
      if (savedPlan.examDate) {
        setExamDate(savedPlan.examDate.toISOString().split('T')[0]);
      }
    }
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

    // Parse exam date if provided
    const examDateObj = examDate ? new Date(examDate) : undefined;

    // Pass errors and exam date to use enhanced priority-driven scheduler
    const newPlan = generateStudyPlan(patterns, errors, examDateObj);
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

  // Support up to 14 days for urgent topics
  const maxDay = plan ? Math.max(...plan.blocks.map(b => b.day), 7) : 7;
  const groupedByDay = plan
    ? Array.from({ length: maxDay }, (_, i) => ({
        day: i + 1,
        blocks: plan.blocks.filter(b => b.day === i + 1),
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Study Plan</h1>
            {plan?.daysUntilExam && (
              <p className="text-sm text-gray-600 mt-1">
                📅 Exam in {plan.daysUntilExam} days
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowExamInput(!showExamInput)}
              className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              {examDate ? '📅 Update Exam Date' : '📅 Set Exam Date'}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : plan ? 'Regenerate Plan' : 'Generate Plan'}
            </button>
          </div>
        </div>

        {/* Exam Date Input */}
        {showExamInput && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Set Your Exam Date</h3>
            <p className="text-sm text-gray-600 mb-4">
              Setting an exam date helps optimize your study schedule based on time remaining.
            </p>
            <div className="flex gap-3">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  setShowExamInput(false);
                  if (plan) handleGenerate(); // Regenerate if plan exists
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              {examDate && (
                <button
                  onClick={() => {
                    setExamDate('');
                    setShowExamInput(false);
                    if (plan) handleGenerate();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

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
                        blocks.map((block) => {
                          const urgencyColors = {
                            urgent: 'text-red-600 border-red-200 bg-red-50',
                            high: 'text-orange-600 border-orange-200 bg-orange-50',
                            moderate: 'text-yellow-600 border-yellow-200 bg-yellow-50',
                            low: 'text-blue-600 border-blue-200 bg-blue-50',
                          };
                          const urgencyIcons = {
                            urgent: '🔴',
                            high: '🟠',
                            moderate: '🟡',
                            low: '🔵',
                          };

                          return (
                            <div
                              key={block.id}
                              className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                                block.urgency ? urgencyColors[block.urgency] : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">
                                  {block.urgency ? urgencyIcons[block.urgency] : activityIcons[block.activity]}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        {block.urgency && (
                                          <span className="text-xs font-bold uppercase">
                                            {block.urgency}
                                          </span>
                                        )}
                                        <h3 className="font-semibold text-gray-800">{block.topic}</h3>
                                      </div>
                                    </div>
                                    <span className="flex-shrink-0 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                      {block.duration} min
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{block.system}</p>

                                  {/* Why Scheduled Chip */}
                                  {block.whyScheduled && (
                                    <div className="mt-2">
                                      <span className="inline-block px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded">
                                        {block.whyScheduled}
                                      </span>
                                    </div>
                                  )}

                                  {/* Activity Badge */}
                                  <div className="mt-2 flex gap-2">
                                    <span className={`inline-block px-2 py-1 ${activityColors[block.activity]} text-white text-xs font-medium rounded capitalize`}>
                                      {activityIcons[block.activity]} {block.activity}
                                    </span>
                                  </div>

                                  {/* Reasoning */}
                                  <p className="text-sm text-gray-600 mt-2 italic">{block.reasoning}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
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
