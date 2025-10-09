import { NextRequest, NextResponse } from 'next/server';
import { ORGAN_SYSTEMS } from '@/lib/taxonomy';

// NLP-like keyword matching for intent detection
function detectIntent(text: string): 'log_error' | 'explain_priority' | 'compose_plan' | 'nudge' | 'other' {
  const lower = text.toLowerCase();

  // Log error patterns
  if (lower.match(/missed|got wrong|incorrect|confused|didn't know|forgot|messed up|error on/)) {
    return 'log_error';
  }

  // Explain priority patterns
  if (lower.match(/explain|why|priority|priorities|top|focus|what should i/)) {
    return 'explain_priority';
  }

  // Compose plan patterns
  if (lower.match(/plan|schedule|study|micro-plan|7-day|spaced|when should/)) {
    return 'compose_plan';
  }

  // Nudge patterns
  if (lower.match(/remind|nudge|notification|alert/)) {
    return 'nudge';
  }

  return 'other';
}

// Extract system/topic from text
function extractSystem(text: string): string | null {
  const lower = text.toLowerCase();

  for (const system of ORGAN_SYSTEMS) {
    const systemLower = system.name.toLowerCase();
    const keywords = [
      systemLower,
      ...system.aliases.map(a => a.toLowerCase())
    ];

    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return system.name;
      }
    }
  }

  return null;
}

// Extract error type from text
function extractErrorType(text: string): 'knowledge' | 'reasoning' | 'process' | 'time' {
  const lower = text.toLowerCase();

  if (lower.match(/didn't know|forgot|never learned|unfamiliar|knowledge gap/)) {
    return 'knowledge';
  }
  if (lower.match(/misapplied|wrong interpretation|confused|reasoning/)) {
    return 'reasoning';
  }
  if (lower.match(/misread|careless|silly|didn't notice|process/)) {
    return 'process';
  }
  if (lower.match(/rushed|time|too slow|ran out|pressure/)) {
    return 'time';
  }

  return 'knowledge'; // default
}

// Extract confidence from text
function extractConfidence(text: string): number {
  const lower = text.toLowerCase();

  // Look for explicit numbers
  const match = lower.match(/confidence\s*(\d+)|(\d+)\s*confidence/);
  if (match) {
    return parseInt(match[1] || match[2]);
  }

  // Infer from keywords
  if (lower.match(/certain|sure|confident/)) return 75;
  if (lower.match(/eliminated|narrowed down/)) return 60;
  if (lower.match(/guessed|no idea|random/)) return 25;

  return 50; // default
}

// Extract time pressure from text
function extractTimePressure(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.match(/rushed|hurried|time|quick|fast|pressure/) !== null;
}

// Extract key concept from text
function extractKeyConcept(text: string): string {
  // Try to find the main concept - look for quoted text or capitalized phrases
  const quotedMatch = text.match(/"([^"]+)"/);
  if (quotedMatch) return quotedMatch[1];

  // Look for "missed X" or "confused about X"
  const conceptMatch = text.match(/(?:missed|confused about|got wrong|incorrect on)\s+([^;,.]+)/i);
  if (conceptMatch) return conceptMatch[1].trim();

  // Fallback: take first meaningful phrase
  const words = text.split(/\s+/);
  const meaningfulWords = words.filter(w => w.length > 3 && !/^(the|and|for|with|that|this)$/i.test(w));
  return meaningfulWords.slice(0, 3).join(' ') || 'General concept';
}

// Generate corrective action
function generateCorrectiveAction(keyConcept: string, system: string | null, errorType: string): string {
  const actions = {
    knowledge: [
      `Review ${keyConcept} in detail`,
      `Create flashcards for ${keyConcept}`,
      `Watch video on ${keyConcept}`,
      `Read First Aid section on ${keyConcept}`
    ],
    reasoning: [
      `Practice similar questions on ${keyConcept}`,
      `Create a decision tree for ${keyConcept}`,
      `Identify key differentiating features for ${keyConcept}`,
      `Review common pitfalls with ${keyConcept}`
    ],
    process: [
      `Slow down and re-read questions about ${keyConcept}`,
      `Highlight key words when ${keyConcept} appears`,
      `Create a checklist for ${keyConcept} questions`
    ],
    time: [
      `Practice timed questions on ${keyConcept}`,
      `Develop quick recall triggers for ${keyConcept}`,
      `Focus on high-yield facts about ${keyConcept}`
    ]
  };

  const typeActions = actions[errorType as keyof typeof actions] || actions.knowledge;
  return typeActions[0];
}

// Extract cognitive bias if mentioned
function extractCognitiveBias(text: string): string | null {
  const lower = text.toLowerCase();
  const biases = ['anchoring', 'availability', 'confirmation', 'premature closure', 'framing'];

  for (const bias of biases) {
    if (lower.includes(bias)) {
      return bias;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Detect intent
    const intent = detectIntent(message);

    // For log_error intent, extract all information
    if (intent === 'log_error') {
      const system = extractSystem(message);
      const errorType = extractErrorType(message);
      const confidence = extractConfidence(message);
      const timePressure = extractTimePressure(message);
      const keyConcept = extractKeyConcept(message);
      const cognitiveBias = extractCognitiveBias(message);
      const correctiveAction = generateCorrectiveAction(keyConcept, system, errorType);

      return NextResponse.json({
        intent: 'log_error',
        system: system || 'General',
        error_type: errorType,
        cognitive_bias: cognitiveBias,
        key_concept: keyConcept,
        confidence,
        time_pressure: timePressure,
        notes: message,
        corrective_action: correctiveAction,
        response: `I detected an error about **${keyConcept}**${system ? ` in ${system}` : ''}.

**Type**: ${errorType} gap
**Confidence**: ${confidence}%
**Time pressure**: ${timePressure ? 'Yes' : 'No'}
${cognitiveBias ? `**Cognitive bias**: ${cognitiveBias}` : ''}

**Suggested action**: ${correctiveAction}

Would you like me to log this error?`
      });
    }

    // For explain_priority intent
    if (intent === 'explain_priority') {
      return NextResponse.json({
        intent: 'explain_priority',
        response: `Let me fetch your top priorities and explain why they matter...`,
        action: 'fetch_priorities'
      });
    }

    // For compose_plan intent
    if (intent === 'compose_plan') {
      return NextResponse.json({
        intent: 'compose_plan',
        response: `I'll create a 7-day study plan based on your error patterns with spaced repetition built in...`,
        action: 'generate_plan'
      });
    }

    // For nudge intent
    if (intent === 'nudge') {
      return NextResponse.json({
        intent: 'nudge',
        response: `I can set up spaced reminders for your weak areas. These won't block your studying - just gentle nudges at optimal intervals.`,
        action: 'setup_nudges'
      });
    }

    // For other/unclear intent
    return NextResponse.json({
      intent: 'other',
      response: `I can help you:
- 📝 **Log errors**: Tell me what you got wrong (e.g., "Missed preload vs stroke volume")
- 📊 **Explain priorities**: Ask "What should I focus on?"
- 🎯 **Create plans**: Say "Build me a 7-day study plan"
- 🔔 **Set reminders**: Ask about spaced repetition nudges

What would you like to do?`
    });

  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
