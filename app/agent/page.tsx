'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';

interface Message {
  role: 'user' | 'agent';
  content: string;
  suggestion?: {
    system: string;
    error_type: string;
    cognitive_bias: string | null;
    key_concept: string;
    confidence: number;
    time_pressure: boolean;
    notes: string;
    corrective_action: string;
  };
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: `👋 Hi! I'm your E.A.T. study assistant.

I can help you:
- 📝 **Log errors** from your practice questions
- 📊 **Explain priorities** based on your patterns
- 🎯 **Create study plans** with spaced repetition
- 🔔 **Set reminders** for optimal review timing

Just talk to me naturally! For example:
"Missed preload vs stroke volume; confidence 40; rushed."

What would you like to do?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (data.intent === 'log_error' && data.system) {
        // Save suggestion for approval
        setPendingSuggestion({
          system: data.system,
          error_type: data.error_type,
          cognitive_bias: data.cognitive_bias,
          key_concept: data.key_concept,
          confidence: data.confidence,
          time_pressure: data.time_pressure,
          notes: data.notes,
          corrective_action: data.corrective_action
        });

        setMessages(prev => [
          ...prev,
          {
            role: 'agent',
            content: data.response,
            suggestion: pendingSuggestion
          }
        ]);
      } else if (data.intent === 'explain_priority') {
        // Fetch priorities
        const priorityResponse = await fetch('/api/priority');
        const priorities = await priorityResponse.json();

        let explanation = '📊 **Your Top Priorities:**\n\n';
        priorities.slice(0, 5).forEach((p: any, i: number) => {
          explanation += `${i + 1}. **${p.system}**: ${p.topic}\n`;
          explanation += `   - Score: ${Math.round(p.priorityScore)}\n`;
          explanation += `   - Errors: ${p.errorCount} (last: ${new Date(p.lastError).toLocaleDateString()})\n\n`;
        });

        explanation += '\n💡 These appear frequently and recently, making them high-yield review targets.';

        setMessages(prev => [...prev, { role: 'agent', content: explanation }]);
      } else if (data.intent === 'compose_plan') {
        // Generate plan
        const errors = storage.getErrors();
        const recentErrors = errors.slice(-10);

        let planText = '🎯 **Your 7-Day Micro-Plan:**\n\n';
        planText += '**Day 0 (Today)**: Active recall on fresh errors\n';
        recentErrors.slice(0, 3).forEach(e => {
          planText += `  - ${e.topic} (${e.system})\n`;
        });

        planText += '\n**~24-48h**: First spaced review\n';
        recentErrors.slice(3, 6).forEach(e => {
          planText += `  - ${e.topic}\n`;
        });

        planText += '\n**~1 week**: Consolidation review\n';
        recentErrors.slice(0, 3).forEach(e => {
          planText += `  - ${e.topic}\n`;
        });

        planText += '\n\n📚 View full plan details on the [Plan page](/plan).';

        setMessages(prev => [...prev, { role: 'agent', content: planText }]);
      } else {
        setMessages(prev => [...prev, { role: 'agent', content: data.response }]);
      }
    } catch (error) {
      console.error('Agent error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          content: '⚠️ Sorry, I encountered an error. Please try again or log your error manually on the [Log page](/log).'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!pendingSuggestion) return;

    try {
      // Log the error
      const newError = {
        id: Date.now().toString(),
        timestamp: new Date(),
        examSource: 'other',
        questionId: null,
        system: pendingSuggestion.system,
        topic: pendingSuggestion.key_concept,
        errorType: pendingSuggestion.error_type,
        cognitiveBias: pendingSuggestion.cognitive_bias,
        confidence: 'guessed' as const,
        timePressure: pendingSuggestion.time_pressure,
        correctAnswer: '',
        yourAnswer: '',
        description: pendingSuggestion.notes,
        nextSteps: [pendingSuggestion.corrective_action],
        cognitiveLevel: 'first-order' as const
      };

      storage.saveError(newError);
      const errors = storage.getErrors();

      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          content: `✅ **Error logged successfully!**

You now have ${errors.length} total errors tracked.

Would you like me to:
- Explain your updated priorities?
- Create a new study plan?
- Log another error?`
        }
      ]);

      setPendingSuggestion(null);
    } catch (error) {
      console.error('Log error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          content: '⚠️ Failed to log error. Please try manually on the [Log page](/log).'
        }
      ]);
    }
  };

  const handleReject = () => {
    setPendingSuggestion(null);
    setMessages(prev => [
      ...prev,
      {
        role: 'agent',
        content: 'No problem! Tell me more details about the error, or try rephrasing.'
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🤖 E.A.T. Agent</h1>
              <p className="text-gray-600 mt-1">Your AI study assistant</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white shadow-lg p-6 h-[600px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Approval buttons for suggestions */}
                  {msg.role === 'agent' && pendingSuggestion && idx === messages.length - 1 && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ✓ Log It
                      </button>
                      <button
                        onClick={handleReject}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ✗ Not Quite
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message... (e.g., 'Missed preload vs stroke volume')"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setInput('Missed preload vs stroke volume; confidence 40; rushed.')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              💡 Example: Log error
            </button>
            <button
              onClick={() => setInput('Explain my top priorities')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              💡 Example: Priorities
            </button>
            <button
              onClick={() => setInput('Build me a 7-day plan')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              💡 Example: Study plan
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{storage.getErrors().length}</div>
              <div className="text-sm text-gray-600">Errors Tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(storage.getErrors().map(e => e.topic)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Topics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(storage.getErrors().map(e => e.system)).size}
              </div>
              <div className="text-sm text-gray-600">Systems Covered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
