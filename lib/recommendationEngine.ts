// Intelligent recommendation engine for personalized learning strategies
import { ErrorLog, ErrorType, CognitiveLevel } from './types';
import { analyzePatterns } from './insights';
import { analyzeByOrganSystem } from './systemAnalytics';
import { getExamWeight } from './examWeights';
import {
  LearningStrategy,
  Recommendation,
  LEARNING_STRATEGIES,
  getTimeUrgency,
  hasConfidenceMismatch,
  getRepeatedErrors,
} from './learningStrategies';

interface RecommendationContext {
  errors: ErrorLog[];
  examDate?: Date;
  daysUntilExam?: number;
  maxRecommendations?: number;
}

interface ScoredRecommendation extends Recommendation {
  score: number; // Internal scoring for prioritization
}

/**
 * Generate personalized learning recommendations based on error patterns
 */
export function generateRecommendations(context: RecommendationContext): Recommendation[] {
  const { errors, examDate, maxRecommendations = 8 } = context;

  if (errors.length === 0) {
    return [];
  }

  const recommendations: ScoredRecommendation[] = [];
  const patterns = analyzePatterns(errors);
  const systemBreakdowns = analyzeByOrganSystem(errors);
  const timeUrgency = getTimeUrgency(examDate);
  const repeatedErrors = getRepeatedErrors(errors, 7);
  const confidenceMismatch = hasConfidenceMismatch(errors);

  // 1. HIGH PRIORITY: Recent repeated errors (struggling topics)
  repeatedErrors.forEach((topicErrors, key) => {
    const [system, topic] = key.split(':');
    const recentCount = topicErrors.length;
    const firstError = topicErrors[0];

    // Determine dominant error type
    const errorTypeCounts = new Map<ErrorType, number>();
    topicErrors.forEach(e => {
      errorTypeCounts.set(e.errorType, (errorTypeCounts.get(e.errorType) || 0) + 1);
    });
    const dominantErrorType = Array.from(errorTypeCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    // Determine cognitive level
    const cognitiveLevel = topicErrors.find(e => e.cognitiveLevel)?.cognitiveLevel;

    // Select strategy based on error pattern
    let strategy: LearningStrategy;
    if (dominantErrorType === 'knowledge' && cognitiveLevel === 'first-order') {
      strategy = 'active-recall'; // Retrieval practice for knowledge gaps
    } else if (dominantErrorType === 'reasoning') {
      strategy = cognitiveLevel === 'higher-order' ? 'elaboration' : 'concrete-examples';
    } else if (dominantErrorType === 'time' || dominantErrorType === 'process') {
      strategy = 'practice-testing'; // Timed practice
    } else {
      strategy = 'active-recall';
    }

    const strategyProfile = LEARNING_STRATEGIES[strategy];
    const template = strategyProfile.templates[0];

    recommendations.push({
      id: `repeat-${key}-${Date.now()}`,
      strategy,
      priority: 5, // Highest - repeated errors
      systemId: firstError.systemId,
      systemName: system,
      topic,
      action: `${template.action} - ${topic}`,
      timeFrame: timeUrgency === 'urgent' ? 'today' : template.timeFrame,
      duration: template.duration,
      rationale: `${recentCount} errors in last 7 days (${dominantErrorType})`,
      errorCount: topicErrors.length,
      recentErrors: recentCount,
      cognitiveLevel,
      score: recentCount * 10 + (timeUrgency === 'urgent' ? 20 : 0),
    });
  });

  // 2. HIGH PRIORITY: High-volume + high-exam-weight systems
  systemBreakdowns.slice(0, 3).forEach(system => {
    if (system.totalErrors < 2) return;

    const examWeight = system.examWeightPercent;
    const isHighYield = examWeight >= 7;

    // Determine strategy based on error distribution
    let strategy: LearningStrategy;
    let dominantErrorType: ErrorType;

    if (system.knowledgeErrors > system.reasoningErrors) {
      dominantErrorType = 'knowledge';
      strategy = 'spaced-repetition';
    } else if (system.reasoningErrors > system.knowledgeErrors) {
      dominantErrorType = 'reasoning';
      strategy = system.higherOrderErrors > system.firstOrderErrors ? 'interleaving' : 'concrete-examples';
    } else {
      dominantErrorType = 'process';
      strategy = 'practice-testing';
    }

    const strategyProfile = LEARNING_STRATEGIES[strategy];
    const template = strategyProfile.templates[Math.min(1, strategyProfile.templates.length - 1)];

    recommendations.push({
      id: `system-${system.systemId}-${Date.now()}`,
      strategy,
      priority: isHighYield ? 4 : 3,
      systemId: system.systemId,
      systemName: system.systemName,
      topic: 'General review',
      action: `${template.action} - ${system.systemName}`,
      timeFrame: template.timeFrame,
      duration: template.duration,
      rationale: `${system.totalErrors} errors, ${examWeight.toFixed(0)}% exam weight${isHighYield ? ' (high-yield)' : ''}`,
      errorCount: system.totalErrors,
      recentErrors: system.recentErrorCount,
      score: system.totalErrors + (isHighYield ? 15 : 0) + (system.trendDirection === 'worsening' ? 10 : 0),
    });
  });

  // 3. MEDIUM PRIORITY: Confidence mismatch corrections
  if (confidenceMismatch.overconfident >= 3) {
    const overconfidentErrors = errors.filter(
      e => (e.confidence === 'confident' || e.confidence === 'certain') &&
           (e.errorType === 'knowledge' || e.errorType === 'reasoning')
    ).slice(0, 5);

    if (overconfidentErrors.length > 0) {
      const template = LEARNING_STRATEGIES['metacognitive'].templates[0];
      const systems = [...new Set(overconfidentErrors.map(e => e.system))];

      recommendations.push({
        id: `metacog-overconfident-${Date.now()}`,
        strategy: 'metacognitive',
        priority: 3,
        systemName: systems.length === 1 ? systems[0] : 'Multiple systems',
        topic: 'Confidence calibration',
        action: template.action,
        timeFrame: 'today',
        duration: template.duration,
        rationale: `${confidenceMismatch.overconfident} overconfident errors (felt sure but wrong)`,
        errorCount: confidenceMismatch.overconfident,
        recentErrors: overconfidentErrors.length,
        score: confidenceMismatch.overconfident * 2,
      });
    }
  }

  // 4. TIME-BASED: Exam urgency strategies
  if (timeUrgency === 'urgent' && examDate) {
    const daysUntil = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // High-yield systems only
    const highYieldSystems = systemBreakdowns.filter(
      s => s.examWeightPercent >= 7 && s.totalErrors > 0
    ).slice(0, 2);

    highYieldSystems.forEach(system => {
      const template = LEARNING_STRATEGIES['practice-testing'].templates[0];

      recommendations.push({
        id: `urgent-${system.systemId}-${Date.now()}`,
        strategy: 'practice-testing',
        priority: 5,
        systemId: system.systemId,
        systemName: system.systemName,
        topic: 'High-yield review',
        action: `${template.action} - ${system.systemName}`,
        timeFrame: daysUntil <= 3 ? 'today' : 'tomorrow',
        duration: template.duration,
        rationale: `Exam in ${daysUntil} days - ${system.examWeightPercent.toFixed(0)}% of exam`,
        errorCount: system.totalErrors,
        recentErrors: system.recentErrorCount,
        score: 100 - daysUntil + system.totalErrors,
      });
    });
  }

  // 5. COGNITIVE LEVEL: Promote higher-order thinking
  const firstOrderErrors = errors.filter(e => e.cognitiveLevel === 'first-order');
  const higherOrderErrors = errors.filter(e => e.cognitiveLevel === 'higher-order');

  if (firstOrderErrors.length > higherOrderErrors.length * 2 && higherOrderErrors.length > 0) {
    // Too many first-order errors - need to shift to higher-order practice
    const pattern = patterns.find(p =>
      errors.filter(e => e.topic === p.topic && e.cognitiveLevel === 'first-order').length >= 2
    );

    if (pattern) {
      const template = LEARNING_STRATEGIES['elaboration'].templates[0];

      recommendations.push({
        id: `cognitive-shift-${Date.now()}`,
        strategy: 'elaboration',
        priority: 3,
        systemName: pattern.system,
        topic: pattern.topic,
        action: `${template.action} - ${pattern.topic}`,
        timeFrame: template.timeFrame,
        duration: template.duration,
        rationale: 'Shift from recall to application/synthesis',
        errorCount: pattern.errorCount,
        recentErrors: pattern.errorCount,
        cognitiveLevel: 'higher-order',
        score: firstOrderErrors.length - higherOrderErrors.length,
      });
    }
  }

  // 6. INTERLEAVING: For topics with similar features
  if (patterns.length >= 3 && timeUrgency !== 'urgent') {
    const template = LEARNING_STRATEGIES['interleaving'].templates[0];
    const topSystems = [...new Set(patterns.slice(0, 3).map(p => p.system))];

    if (topSystems.length >= 2) {
      recommendations.push({
        id: `interleave-${Date.now()}`,
        strategy: 'interleaving',
        priority: 2,
        systemName: topSystems.join(' + '),
        topic: 'Mixed topics',
        action: template.action,
        timeFrame: template.timeFrame,
        duration: template.duration,
        rationale: 'Improve discrimination between similar concepts',
        errorCount: patterns.slice(0, 3).reduce((sum, p) => sum + p.errorCount, 0),
        recentErrors: 0,
        score: topSystems.length * 3,
      });
    }
  }

  // 7. DUAL CODING: For anatomy/physiology heavy systems
  const visualSystems = ['sys-cardiovascular', 'sys-nervous', 'sys-musculoskeletal', 'sys-respiratory'];
  const visualHeavyErrors = systemBreakdowns.filter(
    s => visualSystems.includes(s.systemId) && s.totalErrors >= 3
  );

  if (visualHeavyErrors.length > 0) {
    const system = visualHeavyErrors[0];
    const template = LEARNING_STRATEGIES['dual-coding'].templates[0];

    recommendations.push({
      id: `visual-${system.systemId}-${Date.now()}`,
      strategy: 'dual-coding',
      priority: 2,
      systemId: system.systemId,
      systemName: system.systemName,
      topic: 'Visual learning',
      action: `${template.action} - ${system.systemName}`,
      timeFrame: template.timeFrame,
      duration: template.duration,
      rationale: 'Visual-spatial system benefits from diagrams',
      errorCount: system.totalErrors,
      recentErrors: system.recentErrorCount,
      score: system.totalErrors * 1.5,
    });
  }

  // Sort by priority (desc) then score (desc), and take top N
  const sorted = recommendations
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.score - a.score;
    })
    .slice(0, maxRecommendations);

  // Remove internal scoring before returning
  return sorted.map(({ score, ...rec }) => rec);
}

/**
 * Get strategy description and evidence strength
 */
export function getStrategyInfo(strategy: LearningStrategy): {
  name: string;
  description: string;
  evidenceStrength: string;
} {
  const profile = LEARNING_STRATEGIES[strategy];
  return {
    name: profile.name,
    description: profile.description,
    evidenceStrength: profile.evidenceStrength,
  };
}
