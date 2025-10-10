'use client';

import { LearningLesson } from '@/lib/learningLessons';

interface LearningLessonModalProps {
  lesson: LearningLesson;
  isOpen: boolean;
  onClose: () => void;
}

export default function LearningLessonModal({ lesson, isOpen, onClose }: LearningLessonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{lesson.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                <p className="text-blue-100 text-sm">{lesson.tagline}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              lesson.importance === 'HIGH' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
            }`}>
              {lesson.importance} IMPORTANCE
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white bg-opacity-20 text-white">
              {lesson.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white bg-opacity-20 text-white">
              ⏱️ {lesson.timeInvestment}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What It Is */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-blue-600">📖</span> What It Is
            </h3>
            <p className="text-gray-700 leading-relaxed">{lesson.whatItIs}</p>
          </section>

          {/* Why It Works */}
          <section className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-blue-600">🔬</span> Why It Works
            </h3>
            <p className="text-gray-700 leading-relaxed">{lesson.whyItWorks}</p>
          </section>

          {/* Research Basis */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-green-600">📊</span> Research Evidence
            </h3>
            <ul className="space-y-2">
              {lesson.researchBasis.map((research, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">•</span>
                  <span className="text-gray-700 text-sm">{research}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* How to Apply */}
          <section className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-green-600">✅</span> How to Apply
            </h3>
            <ul className="space-y-2">
              {lesson.howToApply.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-green-600 font-bold flex-shrink-0">{idx + 1}.</span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Example Scenario */}
          <section className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-yellow-600">💡</span> Example Scenario
            </h3>
            <p className="text-gray-700 leading-relaxed italic">{lesson.exampleScenario}</p>
          </section>

          {/* Common Mistakes */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-red-600">⚠️</span> Common Mistakes
            </h3>
            <ul className="space-y-2">
              {lesson.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="text-gray-700 text-sm">
                  {mistake}
                </li>
              ))}
            </ul>
          </section>

          {/* USMLE Application */}
          <section className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-purple-600">🎓</span> USMLE Application
            </h3>
            <p className="text-gray-700 leading-relaxed">{lesson.usmleApplication}</p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-between items-center">
          <div className="text-sm text-gray-600">
            🧠 <strong>Pro Tip:</strong> Combine multiple strategies for maximum effectiveness!
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
