// Voice input processing and auto-tagging
import { OrganSystem, ErrorType, Confidence, CognitiveLevel } from './types';
import { findOrganSystemByName } from './taxonomy';

export interface VoiceTranscript {
  text: string;
  confidence: number;
  timestamp: Date;
}

export interface AutoTagSuggestions {
  system?: OrganSystem;
  systemId?: string;
  topic?: string;
  errorType?: ErrorType;
  confidence?: Confidence;
  cognitiveLevel?: CognitiveLevel;
  nextSteps?: string[];
  detectedKeywords: string[];
  suggestions: {
    field: string;
    value: string;
    confidence: number;
    reason: string;
  }[];
}

/**
 * Medical education keywords for auto-tagging
 */
const MEDICAL_KEYWORDS = {
  // Organ systems with synonyms
  systems: {
    cardiovascular: ['heart', 'cardiac', 'cardiovascular', 'cv', 'coronary', 'myocardial', 'atrial', 'ventricular', 'ecg', 'ekg'],
    respiratory: ['lung', 'respiratory', 'pulmonary', 'breathing', 'asthma', 'copd', 'pneumonia', 'bronchi'],
    gastrointestinal: ['gi', 'stomach', 'intestine', 'liver', 'pancreas', 'bowel', 'colon', 'crohn', 'ibd'],
    renal: ['kidney', 'renal', 'urinary', 'nephro', 'bladder', 'ckd', 'dialysis'],
    nervous: ['neuro', 'brain', 'cns', 'stroke', 'seizure', 'ms', 'parkinsons', 'alzheimer'],
    musculoskeletal: ['bone', 'joint', 'muscle', 'fracture', 'arthritis', 'msk', 'orthopedic'],
    endocrine: ['diabetes', 'thyroid', 'hormone', 'insulin', 'glucose', 'endocrine'],
  },

  // Error types
  errorTypes: {
    knowledge: ['didnt know', 'forgot', 'never learned', 'unfamiliar', 'dont remember', 'cant recall', 'missed fact'],
    reasoning: ['misapplied', 'wrong interpretation', 'confused with', 'thought it was', 'mixed up', 'reasoning error'],
    process: ['misread', 'careless', 'silly mistake', 'didnt notice', 'overlooked', 'test taking error'],
    time: ['ran out of time', 'rushed', 'too slow', 'time pressure', 'hurried', 'didnt finish'],
  },

  // Confidence levels
  confidenceLevels: {
    guessed: ['guessed', 'no idea', 'random', 'complete guess', 'blind guess'],
    eliminated: ['eliminated', 'narrowed down', 'process of elimination', 'ruled out'],
    confident: ['thought i knew', 'was confident', 'felt sure', 'pretty sure'],
    certain: ['absolutely sure', 'certain', 'positive', 'definitely knew', 'no doubt'],
  },

  // Cognitive levels
  cognitiveLevels: {
    'first-order': ['memorize', 'recall', 'remember', 'fact', 'definition', 'basic concept'],
    'higher-order': ['apply', 'diagnose', 'analyze', 'clinical reasoning', 'case', 'vignette', 'next step'],
  },

  // Common medical topics (for topic extraction)
  commonTopics: [
    'acute mi', 'myocardial infarction', 'heart failure', 'chf', 'afib', 'atrial fibrillation',
    'copd', 'asthma', 'pneumonia', 'pulmonary embolism', 'pe',
    'diabetes', 'dm', 'dka', 'diabetic ketoacidosis', 'hypoglycemia',
    'stroke', 'cva', 'seizure', 'meningitis', 'encephalitis',
    'sepsis', 'shock', 'anaphylaxis',
    'aki', 'acute kidney injury', 'ckd', 'chronic kidney disease',
    'cirrhosis', 'hepatitis', 'pancreatitis', 'cholecystitis',
  ],

  // Next step indicators
  nextStepIndicators: [
    'need to', 'should', 'will', 'plan to', 'going to', 'must', 'have to',
    'review', 'study', 'practice', 'learn', 'memorize', 'understand',
  ],
};

/**
 * Process voice transcript and extract auto-tag suggestions
 */
export function processVoiceTranscript(transcript: string): AutoTagSuggestions {
  const textLower = transcript.toLowerCase();
  const words = textLower.split(/\s+/);
  const detectedKeywords: string[] = [];
  const suggestions: AutoTagSuggestions['suggestions'] = [];

  // Detect organ system
  let detectedSystem: OrganSystem | undefined;
  let detectedSystemId: string | undefined;
  let systemConfidence = 0;

  for (const [systemKey, keywords] of Object.entries(MEDICAL_KEYWORDS.systems)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        detectedKeywords.push(keyword);
        // Map to actual system name
        const taxonomySystem = findOrganSystemByName(keyword);
        if (taxonomySystem && systemConfidence < 0.8) {
          detectedSystemId = taxonomySystem.id;
          // Map to legacy system name
          const legacyMapping: Record<string, OrganSystem> = {
            'sys-cardiovascular': 'Cardiovascular',
            'sys-respiratory': 'Respiratory',
            'sys-gastrointestinal': 'Gastrointestinal',
            'sys-renal-urinary': 'Renal/Urinary',
            'sys-reproductive': 'Reproductive',
            'sys-endocrine': 'Endocrine',
            'sys-musculoskeletal': 'Musculoskeletal',
            'sys-skin': 'Skin/Connective Tissue',
            'sys-nervous': 'Nervous System/Special Senses',
            'sys-blood-lymph': 'Hematologic/Lymphatic',
            'sys-immune': 'Immune',
            'sys-behavioral': 'Behavioral Science',
            'sys-multisystem': 'Multisystem/General Principles',
          };
          detectedSystem = legacyMapping[taxonomySystem.id];
          systemConfidence = 0.8;
        }
      }
    }
  }

  if (detectedSystem) {
    suggestions.push({
      field: 'system',
      value: detectedSystem,
      confidence: systemConfidence,
      reason: `Detected from medical keywords in description`,
    });
  }

  // Detect error type
  let detectedErrorType: ErrorType | undefined;
  let errorTypeConfidence = 0;

  for (const [errorType, phrases] of Object.entries(MEDICAL_KEYWORDS.errorTypes)) {
    for (const phrase of phrases) {
      if (textLower.includes(phrase)) {
        detectedKeywords.push(phrase);
        detectedErrorType = errorType as ErrorType;
        errorTypeConfidence = 0.9;
        break;
      }
    }
    if (detectedErrorType) break;
  }

  if (detectedErrorType) {
    suggestions.push({
      field: 'errorType',
      value: detectedErrorType,
      confidence: errorTypeConfidence,
      reason: `Detected from phrase patterns`,
    });
  }

  // Detect confidence level
  let detectedConfidence: Confidence | undefined;
  let confidenceScore = 0;

  for (const [confLevel, phrases] of Object.entries(MEDICAL_KEYWORDS.confidenceLevels)) {
    for (const phrase of phrases) {
      if (textLower.includes(phrase)) {
        detectedKeywords.push(phrase);
        detectedConfidence = confLevel as Confidence;
        confidenceScore = 0.85;
        break;
      }
    }
    if (detectedConfidence) break;
  }

  if (detectedConfidence) {
    suggestions.push({
      field: 'confidence',
      value: detectedConfidence,
      confidence: confidenceScore,
      reason: `Detected from confidence indicators`,
    });
  }

  // Detect cognitive level
  let detectedCognitiveLevel: CognitiveLevel | undefined;
  let cognitiveConfidence = 0;

  for (const [cogLevel, keywords] of Object.entries(MEDICAL_KEYWORDS.cognitiveLevels)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        detectedKeywords.push(keyword);
        detectedCognitiveLevel = cogLevel as CognitiveLevel;
        cognitiveConfidence = 0.7;
      }
    }
  }

  if (detectedCognitiveLevel) {
    suggestions.push({
      field: 'cognitiveLevel',
      value: detectedCognitiveLevel,
      confidence: cognitiveConfidence,
      reason: `Detected from cognitive indicators`,
    });
  }

  // Extract topic from common medical topics
  let detectedTopic: string | undefined;
  for (const topic of MEDICAL_KEYWORDS.commonTopics) {
    if (textLower.includes(topic)) {
      detectedKeywords.push(topic);
      detectedTopic = topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      suggestions.push({
        field: 'topic',
        value: detectedTopic,
        confidence: 0.75,
        reason: `Matched common medical topic`,
      });
      break;
    }
  }

  // Extract next steps (sentences containing action indicators)
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
  const nextSteps: string[] = [];

  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    for (const indicator of MEDICAL_KEYWORDS.nextStepIndicators) {
      if (sentenceLower.includes(indicator)) {
        const cleaned = sentence.trim();
        if (cleaned.length > 10 && cleaned.length < 200) {
          nextSteps.push(cleaned);
        }
        break;
      }
    }
  });

  return {
    system: detectedSystem,
    systemId: detectedSystemId,
    topic: detectedTopic,
    errorType: detectedErrorType,
    confidence: detectedConfidence,
    cognitiveLevel: detectedCognitiveLevel,
    nextSteps: nextSteps.length > 0 ? nextSteps : undefined,
    detectedKeywords: [...new Set(detectedKeywords)],
    suggestions,
  };
}

/**
 * Check if browser supports speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
         ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Get speech recognition constructor
 */
export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}
