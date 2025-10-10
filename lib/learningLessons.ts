// Evidence-Based Learning Strategy Mini-Lessons
// Premium educational content for individual and institutional licenses

export interface LearningLesson {
  id: string;
  title: string;
  importance: 'HIGH' | 'MODERATE';
  icon: string;
  tagline: string;

  // Mini-lesson content
  whatItIs: string;
  whyItWorks: string;
  researchBasis: string[];

  // Practical application
  howToApply: string[];
  exampleScenario: string;
  commonMistakes: string[];

  // Medical school specific
  usmleApplication: string;
  timeInvestment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const LEARNING_LESSONS: Record<string, LearningLesson> = {
  activeRecall: {
    id: 'active-recall',
    title: 'Active Recall',
    importance: 'HIGH',
    icon: '🧠',
    tagline: 'Retrieval practice without looking at notes',

    whatItIs: 'Active recall is the practice of retrieving information from memory without looking at your notes or textbooks. Instead of passively re-reading material, you actively challenge yourself to remember concepts, facts, and relationships.',

    whyItWorks: 'Active recall strengthens neural pathways through the "testing effect." Every time you successfully retrieve information from memory, you make that memory more accessible in the future. This creates durable, long-term retention rather than short-term recognition.',

    researchBasis: [
      'Roediger & Karpicke (2006): Students who used retrieval practice performed 50% better on long-term retention tests compared to repeated studying',
      'Karpicke & Blunt (2011): Retrieval practice was more effective than concept mapping for complex learning',
      'Dunlosky et al. (2013): Rated practice testing as having "high utility" for learning across domains',
    ],

    howToApply: [
      'Close your notes and write down everything you remember about a topic',
      'Use blank paper to draw pathways, diagrams, or concept maps from memory',
      'Create flashcards with questions, not just definitions (e.g., "What happens when aldosterone is elevated?" vs "Define aldosterone")',
      'After reading a textbook section, close the book and summarize the key points aloud',
      'Use the E.A.T. Tracker\'s study plan blocks to quiz yourself before reviewing notes',
    ],

    exampleScenario: 'You\'re studying renal physiology. Instead of re-reading the nephron chapter, close your notes and draw the entire nephron from memory, labeling each segment and its key transporters. Then check your drawing against your notes to identify gaps.',

    commonMistakes: [
      '❌ Giving up too quickly: Struggling to recall is GOOD—that\'s when learning happens',
      '❌ Using recognition instead of recall: Multiple-choice is easier than free recall, but less effective for deep learning',
      '❌ Only using active recall once: Schedule multiple retrieval sessions over time (see Spaced Repetition)',
      '❌ Not checking your answers: Always verify your recall against trusted sources to correct errors',
    ],

    usmleApplication: 'The USMLE tests your ability to apply knowledge in clinical scenarios—not just recognize facts. Active recall trains your brain for the effortful retrieval required on Step exams. Practice free recall of differential diagnoses, drug mechanisms, and disease pathways.',

    timeInvestment: '10-15 minutes per topic (more efficient than 30+ minutes of passive re-reading)',
    difficulty: 'Beginner',
  },

  spacedRepetition: {
    id: 'spaced-repetition',
    title: 'Spaced Repetition',
    importance: 'HIGH',
    icon: '📅',
    tagline: 'Review at increasing intervals',

    whatItIs: 'Spaced repetition is the practice of reviewing material at strategically increasing time intervals (e.g., 1 day, 3 days, 1 week, 2 weeks). This leverages the "spacing effect" to combat the natural forgetting curve.',

    whyItWorks: 'Your brain consolidates memories during sleep and over time. By reviewing just before you\'re about to forget, you strengthen memory traces without wasting time on over-studying. Each successful retrieval extends the time until the next review is needed.',

    researchBasis: [
      'Ebbinghaus (1885): Demonstrated the exponential forgetting curve—we forget 50% of new information within 24 hours',
      'Cepeda et al. (2006): Meta-analysis of 317 studies confirmed spaced practice is more effective than massed practice',
      'Kornell & Bjork (2008): Spacing creates "desirable difficulties" that enhance long-term retention',
    ],

    howToApply: [
      'Use E.A.T. Tracker\'s spaced repetition scheduling: Review errors 1-2 days before your Q-bank shows them again',
      'For new topics: Review after 1 day, 3 days, 1 week, 2 weeks, 1 month',
      'For weak topics: Shorten intervals (1 day, 2 days, 4 days)',
      'For strong topics: Extend intervals (1 week, 2 weeks, 1 month, 3 months)',
      'Track your confidence level—low confidence = shorter intervals',
    ],

    exampleScenario: 'You got a UWorld question wrong on diabetic ketoacidosis (DKA) pathophysiology. Review it today, then schedule reviews for 2 days later, 1 week later, and 2 weeks later. Each time, actively recall the DKA mechanism before checking your notes.',

    commonMistakes: [
      '❌ Cramming: Massed practice feels productive but creates weak, short-term memories',
      '❌ Reviewing too frequently: Over-studying wastes time—space out your reviews',
      '❌ Never reviewing again: One-and-done studying leads to rapid forgetting',
      '❌ Using the same interval for everything: Adjust based on topic difficulty and your confidence',
    ],

    usmleApplication: 'Step 1 and Step 2 CK cover vast amounts of material. Spaced repetition ensures you retain foundational topics (e.g., biochemistry) throughout dedicated study while also learning new content. Use E.A.T. Tracker to schedule reviews BEFORE Q-bank shows questions again.',

    timeInvestment: '5-10 minutes per review session (short, frequent sessions are key)',
    difficulty: 'Beginner',
  },

  interleaving: {
    id: 'interleaving',
    title: 'Interleaving',
    importance: 'HIGH',
    icon: '🔀',
    tagline: 'Mix different topics in practice',

    whatItIs: 'Interleaving is the practice of mixing different topics or types of problems during study sessions, rather than blocking by topic (e.g., studying renal + cardio + respiratory together instead of 3 hours of renal only).',

    whyItWorks: 'Interleaving forces your brain to actively discriminate between concepts and retrieve the appropriate strategy for each problem. This builds stronger, more flexible knowledge compared to blocked practice, which creates "illusions of competence."',

    researchBasis: [
      'Rohrer & Taylor (2007): Interleaved practice improved problem-solving by 43% compared to blocked practice',
      'Kornell & Bjork (2008): Interleaving improved categorization and discrimination skills',
      'Taylor & Rohrer (2010): Benefits of interleaving persist for months, especially for complex material',
    ],

    howToApply: [
      'Mix organ systems in your Q-bank practice: Don\'t do 50 cardio questions in a row',
      'Use E.A.T. Tracker\'s study plan blocks: Notice how we schedule different systems on the same day',
      'Create custom quizzes that span multiple topics (e.g., 5 renal + 5 endocrine + 5 neuro)',
      'When reviewing flashcards, shuffle decks instead of going through one topic at a time',
      'Study a new topic, then switch to reviewing an old topic, then back to the new topic',
    ],

    exampleScenario: 'Instead of doing 2 hours of pulmonology, do 30 minutes of pulm, 30 minutes of GI, 30 minutes of cardiology, then 30 minutes of pulm again. This forces your brain to switch gears and strengthens your ability to identify which system is being tested.',

    commonMistakes: [
      '❌ Blocked practice: Studying one topic for hours feels easier, but creates false confidence',
      '❌ Too much interleaving: Don\'t switch every 5 minutes—allow for some depth (20-30 min blocks)',
      '❌ Random practice without purpose: Interleaving works best when topics are related (e.g., cardiac drugs vs unrelated topics)',
      '❌ Avoiding interleaving because it feels harder: The difficulty is the point—it\'s building real mastery',
    ],

    usmleApplication: 'The USMLE mixes topics unpredictably. Interleaving trains you for this exam format and prevents "context-dependent" learning (where you only recognize renal physiology when you know you\'re in a renal block). Interleaving builds the pattern recognition needed for Step exams.',

    timeInvestment: '20-30 minute blocks per topic, cycling through 3-4 topics per session',
    difficulty: 'Intermediate',
  },

  dualCoding: {
    id: 'dual-coding',
    title: 'Dual Coding',
    importance: 'MODERATE',
    icon: '🎨',
    tagline: 'Combine visual and verbal learning',

    whatItIs: 'Dual coding is the practice of learning using both visual (diagrams, images, videos) and verbal (text, spoken explanations) information. This leverages two separate memory channels in your brain.',

    whyItWorks: 'Paivio\'s Dual Coding Theory suggests that visual and verbal information are processed in separate channels. When you encode information using both channels, you create multiple retrieval pathways, making recall easier and more robust.',

    researchBasis: [
      'Paivio (1986): Dual Coding Theory—images and words are processed differently and stored in separate memory systems',
      'Mayer (2009): Multimedia learning is more effective when combining words and pictures',
      'Carney & Levin (2002): Graphic organizers improved retention by 12-18 percentile points',
    ],

    howToApply: [
      'Draw diagrams while reading text: Convert written descriptions into flowcharts or concept maps',
      'Use mnemonics with visual imagery: "MUDPILES" for metabolic acidosis + picture a muddy pile',
      'Watch videos (Pathoma, Sketchy) AND read (First Aid)—don\'t rely on just one',
      'Create visual associations: Picture the heart when learning cardiac drugs',
      'Annotate images: Print pathway diagrams and label them in your own words',
    ],

    exampleScenario: 'You\'re learning the clotting cascade. Read the text description, then draw the cascade from memory using shapes (squares for factors, circles for cofactors, arrows for activation). Color-code intrinsic vs extrinsic pathways. This creates both verbal and visual memory traces.',

    commonMistakes: [
      '❌ Copying diagrams without thinking: Drawing is only effective if you create it from understanding',
      '❌ Using only visuals: Videos are engaging but must be paired with retrieval practice',
      '❌ Ignoring text: Visuals alone can oversimplify complex concepts',
      '❌ Making visuals too complex: Simple, clear diagrams are more effective than elaborate artwork',
    ],

    usmleApplication: 'Step exams include images (histology, radiology, gross pathology). Dual coding prepares you to integrate visual and verbal information. Practice describing images aloud (What do I see? What does this suggest?) and drawing pathways from memory.',

    timeInvestment: '10-15 minutes per topic to create visual summaries',
    difficulty: 'Beginner',
  },

  elaboration: {
    id: 'elaboration',
    title: 'Elaboration',
    importance: 'MODERATE',
    icon: '💬',
    tagline: 'Explain concepts in your own words',

    whatItIs: 'Elaboration is the process of explaining concepts in your own words, connecting new information to existing knowledge, and asking "why" and "how" questions. This creates deeper, more meaningful understanding.',

    whyItWorks: 'Elaboration forces you to process information at a deeper level (Craik & Lockhart\'s Levels of Processing). By generating explanations and connections, you build a rich network of associations that makes retrieval easier and more flexible.',

    researchBasis: [
      'Craik & Tulving (1975): Deeper processing (elaboration) leads to better retention than shallow processing',
      'Chi et al. (1994): Self-explanation improved learning in physics by 2x compared to passive studying',
      'Pressley et al. (1992): Elaborative interrogation (asking "why") improved comprehension',
    ],

    howToApply: [
      'Use the Feynman Technique: Explain a topic as if teaching a 10-year-old',
      'Ask "why" and "how" questions: Why does hypokalemia cause arrhythmias? How does insulin work at the molecular level?',
      'Connect to prior knowledge: "This is like [previous topic] because..."',
      'Create analogies and stories: "The nephron is like a water filtration plant..."',
      'Discuss with study partners: Teaching others is the ultimate elaboration',
    ],

    exampleScenario: 'You\'re learning thyroid physiology. Instead of memorizing "TSH stimulates T3/T4 production," elaborate: "The hypothalamus senses low thyroid hormone, releases TRH, which travels to the pituitary. The pituitary responds by releasing TSH, which acts on the thyroid like a growth signal. This negative feedback loop is like a thermostat—when it\'s cold (low thyroid), turn on the heat (TSH)."',

    commonMistakes: [
      '❌ Parroting textbook language: Elaboration requires YOUR words, not memorized definitions',
      '❌ Elaborating without checking accuracy: Verify your explanations against trusted sources',
      '❌ Skipping the "why" questions: Surface-level elaboration isn\'t enough—dig deeper',
      '❌ Elaborating in your head: Write it down or say it aloud for maximum benefit',
    ],

    usmleApplication: 'The USMLE tests conceptual understanding, not rote memorization. Elaboration prepares you for "second-order" questions that require you to apply mechanisms in novel scenarios. Practice explaining WHY a patient has certain symptoms, not just WHAT the diagnosis is.',

    timeInvestment: '15-20 minutes per major topic to create detailed explanations',
    difficulty: 'Intermediate',
  },

  practiceTesting: {
    id: 'practice-testing',
    title: 'Practice Testing',
    importance: 'HIGH',
    icon: '⏱️',
    tagline: 'Timed questions under exam conditions',

    whatItIs: 'Practice testing involves taking timed practice exams or question sets under realistic test conditions. This combines active recall with time pressure and exam-like stress.',

    whyItWorks: 'Practice testing provides retrieval practice (the testing effect), builds test-taking skills, identifies knowledge gaps, and reduces test anxiety through exposure. It\'s the most direct preparation for the actual exam experience.',

    researchBasis: [
      'Roediger & Karpicke (2006): Testing is more effective than repeated studying for long-term retention',
      'Agarwal et al. (2014): Frequent low-stakes testing improved exam scores by 10-15%',
      'Larsen et al. (2009): Testing enhanced retention even when initial test performance was poor',
    ],

    howToApply: [
      'Use Q-banks (UWorld, Amboss) in timed, tutor mode initially, then random timed blocks',
      'Simulate exam conditions: No phone, timed strictly, take breaks at scheduled intervals',
      'Review incorrect answers immediately: Don\'t just move on—understand WHY you were wrong',
      'Use E.A.T. Tracker to log your errors and track patterns',
      'Take full-length practice exams (NBME, UWSA) periodically to assess progress',
    ],

    exampleScenario: 'Schedule a 40-question, timed UWorld block. Set a timer for 60 minutes. Turn off all distractions. After completing, review each question (correct AND incorrect) and log errors in E.A.T. Tracker. Focus on understanding the reasoning, not just memorizing the answer.',

    commonMistakes: [
      '❌ Only reviewing incorrect answers: Review correct answers too—you might have guessed right',
      '❌ Untimed practice only: You must train for the time pressure of the real exam',
      '❌ Not analyzing errors: Practice without reflection is wasted opportunity',
      '❌ Waiting too long to start Q-banks: Start early (even if you haven\'t finished content) to identify gaps',
    ],

    usmleApplication: 'Q-banks are the gold standard for Step prep. Practice testing is the closest simulation to the actual exam. Use E.A.T. Tracker to log errors by organ system, topic, and error type (knowledge vs reasoning) to guide your focused review.',

    timeInvestment: '1-2 hours per timed block + 1-2 hours for review',
    difficulty: 'Beginner',
  },

  concreteExamples: {
    id: 'concrete-examples',
    title: 'Concrete Examples',
    importance: 'MODERATE',
    icon: '📋',
    tagline: 'Case-based learning with real scenarios',

    whatItIs: 'Concrete examples involve learning through specific, real-world cases and clinical scenarios rather than abstract principles alone. This grounds theoretical knowledge in practical application.',

    whyItWorks: 'Concrete examples provide context and meaning, making abstract concepts more memorable. They also build your ability to recognize patterns and apply knowledge in clinical settings—the core skill tested on the USMLE.',

    researchBasis: [
      'Schank (1999): Story-based learning improves retention because the brain is wired for narratives',
      'Schwartz & Bransford (1998): Concrete examples before abstract principles improved transfer',
      'Koedinger et al. (2012): Interleaving abstract principles with concrete examples optimized learning',
    ],

    howToApply: [
      'For every disease, create a "prototype patient" with classic presentation',
      'Use clinical vignettes from Q-banks as your primary learning tool',
      'Read case reports and ask: What was the key diagnostic clue?',
      'Practice presenting cases aloud: "This is a 55-year-old male with chest pain..."',
      'Connect pathophysiology to clinical scenarios: "Hypokalemia causes arrhythmias because..."',
    ],

    exampleScenario: 'Instead of memorizing "Addison\'s disease = low cortisol," create a concrete example: "A 32-year-old woman presents with fatigue, weight loss, and hyperpigmentation. She has hypotension and hyperkalemia. This is Addison\'s disease because loss of cortisol causes hypotension, and loss of aldosterone causes hyperkalemia and hyperpigmentation (elevated ACTH)."',

    commonMistakes: [
      '❌ Only learning from cases without understanding mechanisms: Cases without pathophysiology = shallow learning',
      '❌ Memorizing one case per disease: The USMLE tests atypical presentations too',
      '❌ Passive case reading: Actively predict diagnoses and management before reading the answer',
      '❌ Ignoring "boring" cases: Classic presentations are tested frequently—master them first',
    ],

    usmleApplication: 'The USMLE is entirely case-based. Concrete examples train your pattern recognition and clinical reasoning. Practice translating abstract knowledge (e.g., physiology) into clinical scenarios (e.g., symptoms and signs).',

    timeInvestment: '5-10 minutes per case to deeply analyze and connect to pathophysiology',
    difficulty: 'Intermediate',
  },

  metacognitiveReflection: {
    id: 'metacognitive-reflection',
    title: 'Metacognitive Reflection',
    importance: 'MODERATE',
    icon: '🔍',
    tagline: 'Analyze errors and identify patterns',

    whatItIs: 'Metacognitive reflection is the practice of thinking about your thinking—analyzing your errors, identifying patterns in your mistakes, and adjusting your study strategies accordingly. This is the core purpose of E.A.T. Tracker!',

    whyItWorks: 'Metacognition improves self-regulated learning. By identifying WHY you made an error (knowledge gap vs reasoning mistake), you can target your review more effectively and avoid repeating the same mistakes.',

    researchBasis: [
      'Flavell (1979): Metacognition is essential for self-regulated learning and academic success',
      'Pintrich (2002): Self-regulated learners outperform passive learners across domains',
      'Schraw & Dennison (1994): Metacognitive awareness predicts academic performance',
    ],

    howToApply: [
      'Use E.A.T. Tracker to log every Q-bank error with error type and confidence level',
      'Review your E.A.T. Tracker insights weekly: What patterns emerge?',
      'Ask: "Why did I get this wrong? Knowledge gap? Misread the question? Overthought it?"',
      'Adjust your study plan based on patterns: If you struggle with low-confidence reasoning errors, practice more timed questions',
      'Reflect on your study strategies: "Is this method working? Should I try something different?"',
    ],

    exampleScenario: 'After logging 50 errors in E.A.T. Tracker, you notice a pattern: 70% of your errors are in renal physiology, and most are "knowledge" errors with low confidence. This insight tells you to: (1) Schedule more renal review, (2) Use active recall to strengthen weak areas, (3) Build your confidence through repeated retrieval practice.',

    commonMistakes: [
      '❌ Not tracking errors: You can\'t improve what you don\'t measure',
      '❌ Blaming "silly mistakes": Even careless errors reveal patterns (e.g., reading too quickly)',
      '❌ Reviewing errors once and moving on: Metacognition requires repeated reflection',
      '❌ Not adjusting strategies: Identifying patterns is useless without action',
    ],

    usmleApplication: 'The USMLE is a test of adaptive expertise—the ability to recognize gaps and adjust. Metacognitive reflection using E.A.T. Tracker helps you study smarter, not just harder. Focus on high-yield areas and address recurring error patterns.',

    timeInvestment: '10-15 minutes per week to review E.A.T. Tracker insights and adjust your plan',
    difficulty: 'Advanced',
  },
};

/**
 * Get all lessons
 */
export function getAllLessons(): LearningLesson[] {
  return Object.values(LEARNING_LESSONS);
}

/**
 * Get lesson by ID
 */
export function getLesson(id: string): LearningLesson | undefined {
  return LEARNING_LESSONS[id];
}

/**
 * Get high-importance lessons
 */
export function getHighImportanceLessons(): LearningLesson[] {
  return getAllLessons().filter(lesson => lesson.importance === 'HIGH');
}
