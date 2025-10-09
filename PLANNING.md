# EAT Tracker - Planning Document

## Project Overview

**Project Name:** Error Analysis Tool (EAT) Tracker  
**Description:** Full-stack Next.js application for medical study error tracking, analysis, and personalized study planning  
**Architecture:** Next.js 15 App Router with TypeScript, Client-side storage, REST API backend  
**Purpose:** Help medical students track errors, identify patterns, and optimize study plans using evidence-based spaced repetition

## Goals

1. **Primary Goal:** Enable students to log and analyze medical study errors with actionable insights
2. **Secondary Goal:** Generate data-driven study recommendations based on error patterns, exam weights, and spaced repetition
3. **Third Goal:** Provide AI agent integration for voice/text-based error logging via REST API
4. **Future Goal:** Multi-device sync with cloud storage and advanced ML-based predictions

## Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js 18+
- **Storage:** localStorage (client-side) + in-memory API store (development)
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + jsdom
- **Deployment:** Vercel (frontend on port 3000, API accessible via /api)

### Project Structure
```
eat-tracker/
├── app/
│   ├── api/                    # REST API endpoints
│   │   ├── errors/
│   │   │   └── route.ts        # GET & POST error entries (agent integration)
│   │   ├── priority/
│   │   │   └── route.ts        # GET priority learning targets
│   │   └── plan/
│   │       └── route.ts        # POST generate study plan
│   ├── export/
│   │   └── page.tsx            # Export data page
│   ├── import/
│   │   └── page.tsx            # Q-bank import page
│   ├── insights/
│   │   └── page.tsx            # Error pattern insights
│   ├── log/
│   │   └── page.tsx            # Manual error logging
│   ├── plan/
│   │   └── page.tsx            # Study plan view
│   ├── recommendations/
│   │   └── page.tsx            # Smart recommendations
│   ├── share/
│   │   └── [id]/page.tsx       # Shareable error reports
│   ├── system-insights/
│   │   └── page.tsx            # System-level analytics
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   └── favicon.ico
├── lib/
│   ├── examWeights.ts          # USMLE exam system weights
│   ├── export.ts               # Data export utilities
│   ├── insights.ts             # Pattern analysis
│   ├── learningStrategies.ts   # Evidence-based strategies
│   ├── migrations.ts           # Data migration helpers
│   ├── planner.ts              # Study plan generation
│   ├── priority.ts             # Priority scoring algorithm
│   ├── qbankImport.ts          # Q-bank CSV import
│   ├── recommendationEngine.ts # Smart recommendations
│   ├── scheduler.ts            # Spaced repetition scheduling
│   ├── storage.ts              # localStorage abstraction
│   ├── systemAnalytics.ts      # System-level stats
│   ├── taxonomy.ts             # USMLE taxonomy mapping
│   ├── types.ts                # TypeScript types
│   └── voiceProcessing.ts      # Voice input processing
├── docs/
│   ├── PR_QBANK_IMPORT.md      # Q-bank import feature docs
│   ├── QBANK_MAPPING_GUIDE.md  # Mapping guide
│   └── QBANK_RESEARCH.md       # Research notes
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
├── PLANNING.md                 # This file
├── TASK.md                     # Task tracker
├── MIGRATION_PLAN.md           # Migration docs
├── TAXONOMY_SUMMARY.md         # Taxonomy docs
└── README.md                   # User documentation
```

## API Endpoints (Agent Integration)

### POST /api/errors
Create new error entry (for AI agent)
- **Required fields:** system, error_type, key_concept, corrective_action
- **Optional fields:** exam_source, question_id, cognitive_bias, confidence, time_pressure, notes
- **Returns:** `{ ok: true, id: string }`

### GET /api/errors
Retrieve all error entries
- **Returns:** `{ errors: ErrorEntry[] }`

### GET /api/priority
Get top 5 priority learning targets based on frequency + recency
- **Returns:** `{ top: Array<{ system, concept, score, reasons, last_error_at }> }`

### POST /api/plan
Generate spaced repetition study plan
- **Body:** `{ deficits: Array<{system, concept}>, days?: number }`
- **Returns:** `{ days: Array<{ date, sessions }> }`

## Data Models

### ErrorLog (Frontend - localStorage)
```typescript
{
  id: string;
  timestamp: Date;
  description: string;
  system: OrganSystem;      // "Cardiovascular", etc.
  systemId?: string;        // "sys-cardiovascular" (new taxonomy)
  topic: string;
  errorType: ErrorType;     // "knowledge" | "reasoning" | "process" | "time"
  confidence: Confidence;   // "guessed" | "eliminated" | "confident" | "certain"
  cognitiveLevel?: CognitiveLevel; // "first-order" | "higher-order"
  nextSteps: string[];
  tags?: string[];
  externalQuestion?: ExternalQuestionMetadata; // Q-bank import data
}
```

### ErrorEntry (API - in-memory store)
```typescript
{
  id: string;
  created_at: string;
  exam_source?: string | null;
  question_id?: string | null;
  system: string;
  error_type: "knowledge" | "reasoning" | "process" | "time";
  cognitive_bias?: string | null;
  key_concept: string;
  confidence: number;       // 0-100
  time_pressure: boolean;
  notes?: string;
  corrective_action: string;
}
```

## Naming Conventions

- **Files:** kebab-case (`route.ts`, `error-types.ts`)
- **Components:** PascalCase (React components)
- **Functions:** camelCase (`getUserErrors()`)
- **Types:** PascalCase (`ErrorEntry`, `PriorityItem`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_ERRORS`, `STORAGE_KEYS`)

## Style Guide

- **Language:** TypeScript with strict mode
- **Formatting:** Prettier (2-space indentation)
- **Linting:** ESLint (Next.js 15 recommended config)
- **CSS:** Tailwind CSS 4 utility classes
- **Documentation:** TSDoc comments for public functions

## Development Workflow

1. **Branching Strategy:** Gitflow
   - `main` - production-ready code
   - `feature/<name>` - new features
   - `bugfix/<name>` - bug fixes

2. **Commit Convention:** Conventional Commits
   - `feat:` new features
   - `fix:` bug fixes
   - `docs:` documentation
   - `refactor:` code refactoring
   - `test:` tests

3. **Pull Requests:** Required for all changes
   - At least one review before merge
   - All tests must pass
   - Update TASK.md and CHANGELOG

## Testing Strategy

- **Unit Tests:** Vitest for lib functions
- **Integration Tests:** Test full API flows
- **Manual Testing:** Test with browser and AI agent
- **Test Coverage:** Aim for >80% coverage on core lib functions

**Current test files:**
- `lib/migrations.test.ts`
- `lib/priority.test.ts`
- `lib/scheduler.test.ts`
- `lib/taxonomy.test.ts`

## Security

- **Client-side Storage:** All data in localStorage (privacy-first, no backend)
- **Input Validation:** Validate all user inputs and API requests
- **CORS:** Configured for production domains
- **Rate Limiting:** Add for production API (10 req/min per IP)
- **Auth:** Add API key validation for production agent access

## Deployment

- **Development:** `npm run dev` (default port 3000)
- **Production:** Deploy to Vercel
- **Environment Variables:** Store in `.env.local`
- **API Access:** Available at `/api/*` routes

## Features

### Core Features
1. **Error Logging** - Manual UI and voice input
2. **Pattern Analysis** - Identify recurring weaknesses
3. **Study Planning** - Spaced repetition schedules
4. **Priority Scoring** - Frequency + recency + exam weight algorithm
5. **Recommendations** - Evidence-based study strategies
6. **System Analytics** - Performance by organ system
7. **Q-Bank Import** - Import from UWorld, Amboss, NBME, etc.
8. **Data Export** - JSON export for backup/sharing

### Agent Integration
- REST API for AI agent error logging
- Compatible with Claude Agent Builder
- Simple prompt-based error entry

## Migration Path

### Phase 1 (Current)
- ✅ Client-side localStorage
- ✅ Basic error logging UI
- ✅ Priority algorithm (freq + recency)
- ✅ API endpoints for agent
- ✅ Study plan generation
- ✅ Q-bank import (CSV)
- ✅ Taxonomy migration

### Phase 2 (Next)
- Add comprehensive API tests
- Input validation with Zod
- Enhanced error handling
- Advanced analytics dashboard
- ML-based recommendations

### Phase 3 (Future)
- PostgreSQL + Prisma integration
- Multi-device cloud sync
- Real-time collaboration
- Mobile app (React Native)
- Advanced predictive analytics

## Constraints

- Keep files under 500 lines
- Maintain backward compatibility during migrations
- Fast response times (<100ms for GET, <200ms for POST)
- Privacy-first: no mandatory cloud storage
- Work offline-first

## Dependencies

### Production
- `next` - Framework (v15.5.4)
- `react` - UI library (v19.1.0)
- `react-dom` - React DOM (v19.1.0)

### Development
- `typescript` - Type checking (v5)
- `@types/node`, `@types/react`, `@types/react-dom` - Type definitions
- `vitest` - Testing framework (v3.2.4)
- `@vitest/ui` - Test UI
- `jsdom` - DOM testing environment
- `eslint` - Linting (v9)
- `tailwindcss` - Styling (v4)

## Algorithms

### Priority Scoring
```
score = (frequency × 10) + (recency_factor × 5) + (exam_weight × 2)
where:
  recency_factor = max(0, (21 - days_since_error) / 21)
  exam_weight = USMLE system weight (0-1 scale)
```

### Spaced Repetition Schedule
- Day 0: Initial 10-Q retrieval block (20 min)
- Day 1: Teach-back + 5 questions (10 min)
- Day 6: Mini-block review (10 min)

### Urgency Classification
- **Urgent:** Recent errors (≤3 days) + high frequency (≥3) + high exam weight
- **High:** Recent (≤7 days) + frequency ≥2
- **Moderate:** Frequency ≥2 OR recent (≤14 days)
- **Low:** Single occurrence, >14 days old

## Future Enhancements

1. PostgreSQL + Prisma ORM for cloud sync
2. WebSocket for real-time updates
3. ML-based difficulty prediction
4. Spaced repetition optimization (SM-2 algorithm)
5. Anki deck export
6. Mobile app
7. Collaborative study groups
8. Integration with existing USMLE prep platforms
9. Advanced analytics (performance trends, predicted exam readiness)
10. AI-powered concept explanations

## Resources

- **USMLE Content Outline:** https://www.usmle.org/step-exams/step-1/step-1-content-outline
- **Spaced Repetition Research:** Ebbinghaus forgetting curve, SM-2 algorithm
- **Bloom's Taxonomy:** Cognitive levels for question classification

