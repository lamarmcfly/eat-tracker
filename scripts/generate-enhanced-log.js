const fs = require('fs');
const path = require('path');

const enhancedLogContent = `'use client';

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

// Script templates for efficient logging
const SCRIPT_TEMPLATES = [
  {
    name: 'Quick Format',
    template: 'Missed [topic]; [system]; confidence [0-100]; [rushed/not rushed]',
    example: 'Missed preload vs stroke volume; cardiovascular; confidence 40; rushed'
  },
  {
    name: 'Detailed Format',
    template: 'Got wrong [topic] on [system]. Error type: [knowledge/reasoning/process/time]. Confidence: [0-100]. Next: [action]',
    example: 'Got wrong Frank-Starling curve on cardiovascular. Error type: knowledge. Confidence: 40. Next: review cardiac physiology'
  },
  {
    name: 'Natural Speech',
    template: 'Just say what happened naturally',
    example: 'I confused preload and afterload again, probably because I was rushing. Need to review'
  }
];

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
  const [showTemplates, setShowTemplates] = useState(true);
  const [processingAgent, setProcessingAgent] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported());
  }, []);

  // Process with agent API for intelligent auto-fill
  const processWithAgent = async (text: string) => {
    setProcessingAgent(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      if (data.intent === 'log_error' && data.system) {
        // Auto-populate fields from agent
        if (data.system && !system) setSystem(data.system);
        if (data.key_concept && !topic) setTopic(data.key_concept);
        if (data.error_type) setErrorType(data.error_type);

        // Map numeric confidence to categories
        if (data.confidence) {
          const conf = data.confidence;
          if (conf < 25) setConfidence('guessed');
          else if (conf < 50) setConfidence('eliminated');
          else if (conf < 75) setConfidence('confident');
          else setConfidence('certain');
        }

        if (data.corrective_action && (!nextSteps[0] || nextSteps[0] === '')) {
          setNextSteps([data.corrective_action]);
        }

        // Show success message
        setAutoSuggestions({
          system: data.system,
          topic: data.key_concept,
          errorType: data.error_type,
          confidence: data.confidence < 25 ? 'guessed' : data.confidence < 50 ? 'eliminated' : data.confidence < 75 ? 'confident' : 'certain',
          cognitiveLevel: 'first-order',
          nextSteps: [data.corrective_action],
          detectedKeywords: [data.system, data.error_type, data.key_concept],
          suggestions: [
            { field: 'system', value: data.system, confidence: 90, reason: 'Detected from medical keywords' },
            { field: 'topic', value: data.key_concept, confidence: 85, reason: 'Extracted key concept' },
            { field: 'errorType', value: data.error_type, confidence: 80, reason: \`$\{data.error_type} pattern detected\` }
          ]
        });
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Agent processing error:', error);
      // Fallback to voice processing
      const suggestions = processVoiceTranscript(text);
      if (suggestions.suggestions.length > 0) {
        setAutoSuggestions(suggestions);
        setShowSuggestions(true);
      }
    } finally {
      setProcessingAgent(false);
    }
  };

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
        processWithAgent(finalTranscript);
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
      setIsRecording(false);
    }
  };

  const applySuggestion = (field: string, value: any) => {
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

  const useTemplate = (template: string) => {
    setDescription(template);
    setShowTemplates(false);
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

  const handleSmartProcess = async () => {
    if (!description.trim()) return;
    await processWithAgent(description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const error: ErrorLog = {
      id: \`error-$\{Date.now()}-$\{Math.random().toString(36).substr(2, 9)}\`,
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 Smart Error Log</h1>
          <p className="text-gray-600 mb-6">Speak or type naturally - AI will auto-fill the details</p>

          {/* Script Templates */}
          {showTemplates && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-blue-900">📝 Quick Templates</h3>
                  <p className="text-sm text-blue-700">Choose a format or speak naturally</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplates(false)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {SCRIPT_TEMPLATES.map((t, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-semibold text-gray-800 mb-1">{t.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{t.template}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm text-gray-700 italic">&ldquo;{t.example}&rdquo;</div>
                      <button
                        type="button"
                        onClick={() => useTemplate(t.example)}
                        className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-sm whitespace-nowrap"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-Suggestions Panel */}
          {showSuggestions && autoSuggestions && autoSuggestions.suggestions.length > 0 && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-bold text-green-900">AI Detected</h3>
                    <p className="text-sm text-green-700">
                      Found {autoSuggestions.detectedKeywords.length} keywords
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
                ✓ Apply All Suggestions
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description with Voice + AI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What happened? (Voice or Type)
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="E.g., 'Missed preload vs stroke volume; cardiovascular; confidence 40; rushed'"
                  required
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={\`p-2 rounded-lg transition-all $\{
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }\`}
                      title={isRecording ? 'Stop recording' : 'Start voice input'}
                    >
                      {isRecording ? '⏹' : '🎤'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSmartProcess}
                    disabled={!description.trim() || processingAgent}
                    className="p-2 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="AI auto-fill"
                  >
                    {processingAgent ? '⏳' : '🤖'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Use 🎤 to speak or 🤖 to auto-fill fields from your text
              </p>
            </div>

            {/* System/Topic Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  System/Category
                </label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select system...</option>
                  {ORGAN_SYSTEMS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specific Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="e.g., Preload vs Stroke Volume"
                  required
                />
              </div>
            </div>

            {/* Error Type and Confidence Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Error Type
                </label>
                <select
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value as ErrorType)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="knowledge">Knowledge Gap</option>
                  <option value="reasoning">Reasoning Error</option>
                  <option value="process">Process/Careless</option>
                  <option value="time">Time Pressure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confidence Level
                </label>
                <select
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value as Confidence)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="guessed">Guessed (0-25%)</option>
                  <option value="eliminated">Eliminated Options (25-50%)</option>
                  <option value="confident">Fairly Confident (50-75%)</option>
                  <option value="certain">Very Confident (75-100%)</option>
                </select>
              </div>
            </div>

            {/* Cognitive Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cognitive Level (Optional)
              </label>
              <select
                value={cognitiveLevel}
                onChange={(e) => setCognitiveLevel(e.target.value as CognitiveLevel | '')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Not specified</option>
                <option value="first-order">First-Order (Recall/Understanding)</option>
                <option value="higher-order">Higher-Order (Application/Analysis)</option>
              </select>
            </div>

            {/* Next Steps */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Next Steps
              </label>
              {nextSteps.map((step, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateNextStep(index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder={\`Action step $\{index + 1}\`}
                  />
                  {nextSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNextStep(index)}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addNextStep}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                + Add Another Step
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              📝 Log Error
            </button>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>🎤 <strong>Voice:</strong> Click microphone, speak naturally, AI fills fields</li>
            <li>⌨️ <strong>Type:</strong> Use templates or write freely, click 🤖 to auto-fill</li>
            <li>⚡ <strong>Fast:</strong> Just say topic + confidence + system = done in 5 seconds</li>
            <li>📊 <strong>Smart:</strong> AI learns your patterns and gets better over time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
`;

const targetPath = path.join(__dirname, '..', 'app', 'log', 'page.tsx');
fs.writeFileSync(targetPath, enhancedLogContent, 'utf8');

console.log('✅ Enhanced log page created successfully!');
console.log('📝 File:', targetPath);
console.log('📏 Lines:', enhancedLogContent.split('\n').length);
console.log('📦 Size:', (enhancedLogContent.length / 1024).toFixed(2), 'KB');
