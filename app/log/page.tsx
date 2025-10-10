'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorLog, ORGAN_SYSTEMS, ErrorType, Confidence, CognitiveLevel } from '@/lib/types';
import { agentConfidenceToScale } from '@/lib/confidenceMigration';
import { storage } from '@/lib/storage';
import {
  isSpeechRecognitionSupported,
  getSpeechRecognition,
} from '@/lib/voiceProcessing';

// Script templates with integrated voice input
const SCRIPT_TEMPLATES = [
  {
    name: 'Quick Format',
    template: 'Missed [topic]; [system]; confidence [1-4]; [rushed/not rushed]',
    example: 'Missed preload vs stroke volume; cardiovascular; confidence 2; rushed'
  },
  {
    name: 'Detailed Format',
    template: 'Got wrong [topic] on [system]. Error type: [knowledge/reasoning/process/time]. Confidence: [1-4]. Next: [action]',
    example: 'Got wrong Frank-Starling curve on cardiovascular. Error type: knowledge. Confidence: 2. Next: review cardiac physiology'
  },
  {
    name: 'Natural Speech',
    template: 'Just say what happened naturally',
    example: 'I confused preload and afterload again, probably because I was rushing. Need to review'
  }
];

export default function QuickLog() {
  const router = useRouter();
  const [system, setSystem] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('knowledge');
  const [confidence, setConfidence] = useState<Confidence>(1);
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel | ''>('');
  const [nextSteps, setNextSteps] = useState(['']);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTemplate, setRecordingTemplate] = useState<number | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingAgent, setProcessingAgent] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported());
  }, []);

  // Process with agent API and auto-apply all fields
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
        // Auto-apply ALL fields immediately
        if (data.system) setSystem(data.system);
        if (data.key_concept) setTopic(data.key_concept);
        if (data.error_type) setErrorType(data.error_type);
        if (data.confidence !== undefined) {
          setConfidence(agentConfidenceToScale(data.confidence));
        }
        if (data.corrective_action) {
          setNextSteps([data.corrective_action]);
        }

        // Show success message briefly
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Agent processing error:', error);
      alert('Could not process with AI. Please fill fields manually.');
    } finally {
      setProcessingAgent(false);
    }
  };

  const startVoiceForTemplate = (templateIndex: number) => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingTemplate(null);
      if (finalTranscript.trim()) {
        processWithAgent(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsRecording(false);
      setRecordingTemplate(null);
    };

    recognition.start();
    setIsRecording(true);
    setRecordingTemplate(templateIndex);
    recognitionRef.current = recognition;
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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
      description: `${topic} - ${system}`,
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
          <p className="text-gray-600 mb-6">Click 🎤 on any template to speak - AI auto-fills everything</p>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6 text-center">
              <span className="text-2xl">✨</span>
              <p className="font-bold text-green-900 mt-2">AI Auto-Applied! All fields filled.</p>
            </div>
          )}

          {/* Script Templates with Voice Buttons */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="mb-3">
              <h3 className="font-bold text-blue-900">📝 Quick Templates</h3>
              <p className="text-sm text-blue-700">Click microphone to start speaking</p>
            </div>

            <div className="space-y-3">
              {SCRIPT_TEMPLATES.map((t, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="font-semibold text-gray-800 mb-1">{t.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{t.template}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-sm text-gray-700 italic">&ldquo;{t.example}&rdquo;</div>
                    <button
                      type="button"
                      onClick={() => isRecording && recordingTemplate === idx ? stopVoiceRecording() : startVoiceForTemplate(idx)}
                      disabled={!voiceSupported || processingAgent}
                      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        isRecording && recordingTemplate === idx
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isRecording && recordingTemplate === idx ? '⏹ Stop' : processingAgent ? '⏳' : '🎤 Speak'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) => setConfidence(Number(e.target.value) as Confidence)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  required
                >
                  <option value={1}>1 - Complete guess (0-25%)</option>
                  <option value={2}>2 - Narrowed down (25-50%)</option>
                  <option value={3}>3 - Fairly sure (50-75%)</option>
                  <option value={4}>4 - Very confident (75-100%)</option>
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
                    placeholder={`Action step ${index + 1}`}
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
            <li>🎤 <strong>Voice:</strong> Click microphone on any template and speak naturally</li>
            <li>✨ <strong>Auto-Fill:</strong> AI detects and fills all fields automatically</li>
            <li>✏️ <strong>Edit:</strong> Review and adjust any field before submitting</li>
            <li>⚡ <strong>Fast:</strong> Speak for 5 seconds = fully logged error</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
