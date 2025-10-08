// Evidence-based study plan generation
import { TopicPattern, StudyBlock, StudyPlan } from './types';

export function generateStudyPlan(patterns: TopicPattern[]): StudyPlan {
  const blocks: StudyBlock[] = [];
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);

  // Sort by priority (error count and recency)
  const prioritized = [...patterns].sort((a, b) => {
    const scoreA = a.errorCount * 2 + (Date.now() - a.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
    const scoreB = b.errorCount * 2 + (Date.now() - b.lastSeen.getTime()) / (1000 * 60 * 60 * 24);
    return scoreB - scoreA;
  });

  const topTopics = prioritized.slice(0, 5); // Focus on top 5 weakest areas

  let blockId = 0;

  topTopics.forEach((pattern, patternIndex) => {
    const priority = patternIndex + 1;

    // Day 1: Initial retrieval practice
    blocks.push({
      id: `block-${blockId++}`,
      day: 1,
      topic: pattern.topic,
      system: pattern.system,
      activity: 'retrieval',
      duration: 30,
      priority,
      reasoning: 'Active retrieval on first exposure - most effective for encoding',
    });

    // Day 2: Spaced review (~24h later)
    blocks.push({
      id: `block-${blockId++}`,
      day: 2,
      topic: pattern.topic,
      system: pattern.system,
      activity: 'review',
      duration: 20,
      priority,
      reasoning: 'Spaced repetition at 24h strengthens memory consolidation',
    });

    // Day 4: Second spaced review (~48h from last)
    blocks.push({
      id: `block-${blockId++}`,
      day: 4,
      topic: pattern.topic,
      system: pattern.system,
      activity: 'practice',
      duration: 25,
      priority,
      reasoning: 'Practice problems to test application and identify gaps',
    });

    // Day 7: Final review (~1 week for long-term retention)
    blocks.push({
      id: `block-${blockId++}`,
      day: 7,
      topic: pattern.topic,
      system: pattern.system,
      activity: 'retrieval',
      duration: 15,
      priority,
      reasoning: 'Weekly review for long-term retention and transfer',
    });
  });

  // Interleave topics - shuffle blocks by day while maintaining spacing
  const byDay: Record<number, StudyBlock[]> = {};
  blocks.forEach(block => {
    if (!byDay[block.day]) byDay[block.day] = [];
    byDay[block.day].push(block);
  });

  // Interleave within each day
  Object.values(byDay).forEach(dayBlocks => {
    dayBlocks.sort(() => Math.random() - 0.5);
  });

  const interleavedBlocks = Object.values(byDay).flat();

  return {
    generatedAt: new Date(),
    weekStart,
    blocks: interleavedBlocks,
  };
}
