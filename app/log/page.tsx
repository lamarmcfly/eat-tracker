'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorLog, ORGAN_SYSTEMS, ErrorType, Confidence, CognitiveLevel } from '@/lib/types';
import { storage } from '@/lib/storage';

export default function QuickLog() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('knowledge');
  const [confidence, setConfidence] = useState<Confidence>('guessed');
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel | ''>('');
  const [nextSteps, setNextSteps] = useState(['']);

  const addNextStep = () => setNextSteps([...nextSteps, '']);
  const updateNextStep = (index: number, value: string) => {
    const updated = [...nextSteps];
    updated[index] = value;
    setNextSteps(updated);
  };
  const removeNextStep = (index: number) => {
    setNextSteps(nextSteps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const error: ErrorLog = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      description,
      system: system as ErrorLog['system'],
      topic,
      errorType,
      confidence,
      cognitiveLevel: cognitiveLevel || undefined,
      nextSteps: nextSteps.filter(s => s.trim()),
    };

    storage.saveError(error);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quick Log</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What went wrong?
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Describe the error or mistake..."
              />
            </div>

            {/* System & Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organ System
                </label>
                <select
                  required
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select system...</option>
                  {ORGAN_SYSTEMS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Topic
                </label>
                <input
                  required
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Heart failure, Pneumonia..."
                />
              </div>
            </div>

            {/* Error Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why did it happen?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['knowledge', 'reasoning', 'process', 'time'] as ErrorType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setErrorType(type)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      errorType === type
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Confidence Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['guessed', 'eliminated', 'confident', 'certain'] as Confidence[]).map(conf => (
                  <button
                    key={conf}
                    type="button"
                    onClick={() => setConfidence(conf)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      confidence === conf
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {conf.charAt(0).toUpperCase() + conf.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Cognitive Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                First-order: recall & understanding • Higher-order: analysis & synthesis
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['first-order', 'higher-order'] as CognitiveLevel[]).map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCognitiveLevel(cognitiveLevel === level ? '' : level)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      cognitiveLevel === level
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'first-order' ? 'First-Order' : 'Higher-Order'}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps (at least one)
              </label>
              <div className="space-y-2">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      required={index === 0}
                      type="text"
                      value={step}
                      onChange={(e) => updateNextStep(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What will you do about this?"
                    />
                    {nextSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNextStep(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addNextStep}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add another step
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Log Error
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
