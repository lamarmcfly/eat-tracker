'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorLog, ORGAN_SYSTEMS, ErrorType, Confidence, CognitiveLevel } from '@/lib/types';
import { storage } from '@/lib/storage';
import {
  processVoiceTranscript,
  isSpeechRecognitionSupported,
  getSpeechRecognition,
  type AutoTagSuggestions
} from '@/lib/voiceProcessing';

export default function QuickLog() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('knowledge');
  const [confidence, setConfidence] = useState<Confidence>('guessed');
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel | ''>('');
  const [nextSteps, setNextSteps] = useState(['']);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState<AutoTagSuggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported());
  }, []);

  const startVoiceRecording = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setDescription(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        // Process voice transcript for auto-tagging
        const suggestions = processVoiceTranscript(finalTranscript);
        setAutoSuggestions(suggestions);
        setShowSuggestions(true);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
    recognitionRef.current = recognition;
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const applySuggestion = (field: string, value: string) => {
    switch (field) {
      case 'system':
        setSystem(value);
        break;
      case 'topic':
        setTopic(value);
        break;
      case 'errorType':
        setErrorType(value as ErrorType);
        break;
      case 'confidence':
        setConfidence(value as Confidence);
        break;
      case 'cognitiveLevel':
        setCognitiveLevel(value as CognitiveLevel);
        break;
    }
  };

  const applyAllSuggestions = () => {
    if (!autoSuggestions) return;

    if (autoSuggestions.system) setSystem(autoSuggestions.system);
    if (autoSuggestions.topic) setTopic(autoSuggestions.topic);
    if (autoSuggestions.errorType) setErrorType(autoSuggestions.errorType);
    if (autoSuggestions.confidence) setConfidence(autoSuggestions.confidence);
    if (autoSuggestions.cognitiveLevel) setCognitiveLevel(autoSuggestions.cognitiveLevel);
    if (autoSuggestions.nextSteps && autoSuggestions.nextSteps.length > 0) {
      setNextSteps(autoSuggestions.nextSteps);
    }

    setShowSuggestions(false);
  };

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

          {/* Auto-Suggestions Panel */}
          {showSuggestions && autoSuggestions && autoSuggestions.suggestions.length > 0 && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-bold text-green-900">Auto-Tagged from Voice</h3>
                    <p className="text-sm text-green-700">
                      Detected {autoSuggestions.detectedKeywords.length} keywords
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-green-700 hover:text-green-900"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 mb-3">
                {autoSuggestions.suggestions.map((sug, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 capitalize">{sug.field}</div>
                      <div className="text-sm text-gray-600">{sug.value}</div>
                      <div className="text-xs text-gray-500">{sug.reason}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => applySuggestion(sug.field, sug.value)}
                      className="px-3 py-1 bg-green-600 text-white rounded font-medium hover:bg-green-700 text-sm"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={applyAllSuggestions}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Apply All Suggestions
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description with Voice Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  What went wrong?
                </label>
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg font-medium transition-all ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <span className="text-lg">{isRecording ? '⏸️' : '🎤'}</span>
                    <span className="text-sm">{isRecording ? 'Stop' : 'Voice'}</span>
                  </button>
                )}
              </div>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Describe the error or mistake... (or use voice input)"
              />
              {isRecording && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  Recording... speak now
                </div>
              )}
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
