'use client';

import { useState, useEffect } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const steps = [
    {
      title: 'Welcome to E.A.T. Tracker',
      icon: '🧠',
      content: (
        <>
          <p className="text-lg mb-4"><strong>Error Analysis & Targeted Learning</strong></p>
          <p className="mb-3">Transform your mistakes into exam success using evidence-based learning strategies.</p>
          <p className="text-sm text-gray-600">This 60-second tour shows you how.</p>
        </>
      ),
    },
    {
      title: 'The E.A.T. Loop',
      icon: '🔄',
      content: (
        <>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-semibold text-blue-900">LOG</p>
                <p className="text-sm text-gray-700">Track errors from UWorld, NBME, or any practice question</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-semibold text-green-900">INSIGHTS</p>
                <p className="text-sm text-gray-700">AI identifies your weak patterns and high-yield topics</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-semibold text-yellow-900">PRIORITY</p>
                <p className="text-sm text-gray-700">See what to study next based on exam weights + your patterns</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">4️⃣</span>
              <div>
                <p className="font-semibold text-purple-900">PLAN</p>
                <p className="text-sm text-gray-700">Get a 7-day study schedule with spaced repetition built-in</p>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Exam Readiness Tracking',
      icon: '📈',
      content: (
        <>
          <p className="mb-4">Track your practice test performance and get readiness assessments:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>NBME Practice Tests</strong> → Track progress toward actual exam</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Shelf Practice</strong> → Predict clerkship final exam grades</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Research-Backed</strong> → Criteria specific to Step 1/2/3/Shelf</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Exam Day Countdown</strong> → Timeline-based recommendations</span>
            </li>
          </ul>
        </>
      ),
    },
    {
      title: 'Privacy & Data',
      icon: '🔒',
      content: (
        <>
          <p className="mb-4"><strong>Your data stays on your device.</strong></p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">🔐</span>
              <span><strong>No PHI collected:</strong> We don't store your name, email, or identifying information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">💾</span>
              <span><strong>Local storage:</strong> All error logs stored in your browser (not our servers)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">📤</span>
              <span><strong>Easy export:</strong> Download your data as CSV/JSON anytime</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">🗑️</span>
              <span><strong>Full control:</strong> Clear all data instantly from settings</span>
            </li>
          </ul>
          <p className="text-xs text-gray-600 mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <strong>Note:</strong> Data stored locally. If you clear browser data or switch devices, your logs won't transfer unless you export them first.
          </p>
        </>
      ),
    },
    {
      title: 'Accessibility Features',
      icon: '♿',
      content: (
        <>
          <p className="mb-4">Built for all learners:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">⌨️</span>
              <span><strong>Keyboard navigation:</strong> Tab through forms, Esc to close modals, Arrow keys to navigate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">🔤</span>
              <span><strong>Screen reader support:</strong> ARIA labels on all interactive elements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">🎨</span>
              <span><strong>High contrast:</strong> WCAG AA compliant color contrast ratios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">📱</span>
              <span><strong>Mobile-first:</strong> Responsive design works on phone, tablet, desktop</span>
            </li>
          </ul>
        </>
      ),
    },
    {
      title: 'Ready to Start?',
      icon: '🚀',
      content: (
        <>
          <p className="text-lg mb-4">Let's turn your errors into exam success!</p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">Quick Start:</p>
            <ol className="text-sm space-y-1 text-gray-700">
              <li>1. Log your first error (from UWorld, NBME, etc.)</li>
              <li>2. Check Insights to see your patterns</li>
              <li>3. View Priority to see what to study next</li>
              <li>4. Generate a Plan for structured review</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600">
            💡 <strong>Pro tip:</strong> Log errors consistently to get the most accurate insights and recommendations.
          </p>
        </>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl" role="img" aria-label={currentStep.title}>
                {currentStep.icon}
              </span>
              <h2 id="onboarding-title" className="text-2xl font-bold">
                {currentStep.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              aria-label="Close onboarding"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-gray-800">{currentStep.content}</div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex items-center justify-between border-t border-gray-200">
          <div className="flex gap-2" role="group" aria-label="Step indicators">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === step
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${idx + 1}`}
                aria-current={idx === step ? 'step' : undefined}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                aria-label="Previous step"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              aria-label={step < steps.length - 1 ? 'Next step' : 'Get started'}
            >
              {step < steps.length - 1 ? 'Next →' : 'Get Started 🚀'}
            </button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="px-6 pb-4 text-xs text-gray-500 text-center">
          Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-200 rounded">←</kbd>{' '}
          <kbd className="px-2 py-1 bg-gray-200 rounded">→</kbd> to navigate,{' '}
          <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
