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

export default function QuickLog() {
  const router = useRouter();
  const [system, setSystem] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('knowledge');
  const [confidence, setConfidence] = useState<Confidence>(1);
  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel | ''>('');
  const [nextSteps, setNextSteps] = useState(['']);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [processingAgent, setProcessingAgent] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(isSpeechRecognitionSupported());
  }, []);

  const processWithAgent = async (text: string) => {
    setProcessingAgent(true);
    setAiStatus('🤖 Processing...');

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      console.log('AI Response:', data);

      let fieldsApplied = 0;

      if (data.system) {
        setSystem(data.system);
        fieldsApplied++;
      }
      if (data.key_concept) {
        setTopic(data.key_concept);
        fieldsApplied++;
      }
      if (data.error_type) {
        setErrorType(data.error_type);
        fieldsApplied++;
      }
      if (data.confidence !== undefined) {
        setConfidence(agentConfidenceToScale(data.confidence));
        fieldsApplied++;
      }
      if (data.corrective_action) {
        setNextSteps([data.corrective_action]);
        fieldsApplied++;
      }

      if (fieldsApplied > 0) {
        setAiStatus(`✅ Auto-filled ${fieldsApplied} field${fieldsApplied > 1 ? 's' : ''}!`);
        setTimeout(() => setAiStatus(''), 3000);
      } else {
        setAiStatus('⚠️ Could not detect fields. Fill manually.');
        setTimeout(() => setAiStatus(''), 4000);
      }
    } catch (error) {
      console.error('Agent error:', error);
      setAiStatus('❌ AI unavailable. Fill manually.');
      setTimeout(() => setAiStatus(''), 4000);
    } finally {
      setProcessingAgent(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      alert('Voice not supported. Try Chrome or Edge.');
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
      if (finalTranscript.trim()) {
        processWithAgent(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setIsRecording(false);
      setAiStatus('❌ Voice failed. Try again.');
      setTimeout(() => setAiStatus(''), 3000);
    };

    recognition.start();
    setIsRecording(true);
    recognitionRef.current = recognition;
  };

  const stopVoiceInput = () => {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Log Error</h1>
          <p className="text-gray-600 mb-6">Click 🎤 to speak or fill manually</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <h3 className="font-bold text-gray-800 mb-2">🎤 Voice Input</h3>
              <p className="text-sm text-gray-600 mb-4">
                Say: &ldquo;Missed <strong>preload</strong>; <strong>cardiovascular</strong>; confidence <strong>2</strong>&rdquo;
              </p>

              <button
                type="button"
                onClick={isRecording ? stopVoiceInput : startVoiceInput}
                disabled={!voiceSupported || processingAgent}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
              >
                {isRecording ? '⏹ Stop' : processingAgent ? '⏳ Wait...' : '🎤 Speak'}
              </button>

              {aiStatus && (
                <div className={`mt-4 p-3 rounded-lg ${
                  aiStatus.includes('✅') ? 'bg-green-100 text-green-800' :
                  aiStatus.includes('🤖') ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {aiStatus}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 space-y-1 text-left">
                <p className="font-semibold">What to say:</p>
                <p>&bull; <strong>Topic</strong> + <strong>System</strong> + <strong>Confidence 1-4</strong></p>
                <p>&bull; Example: &quot;Missed preload; cardio; confidence 2&quot;</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  System *
                </label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select...</option>
                  {ORGAN_SYSTEMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Preload"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Error Type *
                </label>
                <select
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value as ErrorType)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
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
                  Confidence *
                </label>
                <select
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value) as Confidence)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value={1}>1 - Guess (0-25%)</option>
                  <option value={2}>2 - Narrowed (25-50%)</option>
                  <option value={3}>3 - Fairly sure (50-75%)</option>
                  <option value={4}>4 - Confident (75-100%)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cognitive Level (Optional)
              </label>
              <select
                value={cognitiveLevel}
                onChange={(e) => setCognitiveLevel(e.target.value as CognitiveLevel | '')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              >
                <option value="">Not specified</option>
                <option value="first-order">First-Order (Recall)</option>
                <option value="higher-order">Higher-Order (Analysis)</option>
              </select>
            </div>

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
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder={`Step ${index + 1}`}
                  />
                  {nextSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNextStep(index)}
                      className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
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
                + Add Step
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              📝 Log Error
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
