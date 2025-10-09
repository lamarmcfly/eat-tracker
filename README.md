# EAT Tracker - Error Analysis Tool for Medical Students

A comprehensive Next.js application for tracking medical study errors, identifying patterns, and generating evidence-based study plans optimized for USMLE preparation.

## 🎯 Overview

**EAT Tracker** helps medical students:
- 📝 **Log errors** from practice questions with detailed categorization
- 📊 **Analyze patterns** to identify recurring weaknesses
- 🎯 **Prioritize study** based on frequency, recency, and exam weights
- 📅 **Generate plans** using spaced repetition algorithms
- 🤖 **Voice logging** via AI agent integration
- 📥 **Import Q-bank data** from UWorld, Amboss, NBME, and more

## 🚀 Quick Start

### Prerequisites
- **Node.js 18.0.0 or higher**
- **npm, yarn, or pnpm**

### Installation

1. **Clone and install:**
   ```bash
   cd eat-tracker
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Main app: `http://localhost:3000`
   - API docs: See [API section](#-api-endpoints) below

## 📱 Features

### Frontend (Web UI)

#### 📝 Error Logging (`/log`)
- Manual error entry with structured fields
- System categorization (USMLE taxonomy)
- Error type classification (knowledge/reasoning/process/time)
- Confidence levels (guessed/eliminated/confident/certain)
- Cognitive level tagging (first-order vs higher-order thinking)
- Tags and next steps

#### 📊 Insights Dashboard (`/insights`)
- Pattern recognition across organ systems
- Error type distribution
- Confidence level analysis
- Cognitive level breakdown
- Topic-specific trends

#### 📅 Study Planner (`/plan`)
- Auto-generated spaced repetition schedules
- Urgency-based prioritization
- Evidence-based learning strategies
- 7-14 day study blocks
- Detailed session plans

#### 💡 Recommendations (`/recommendations`)
- Smart study suggestions based on error patterns
- Evidence-based learning strategies
- System-specific recommendations
- Actionable next steps

#### 🔬 System Analytics (`/system-insights`)
- Performance breakdown by organ system
- USMLE exam weight integration (Step 1/2 CK)
- High-yield area identification
- Comparative analysis

#### 📥 Q-Bank Import (`/import`)
- CSV import from major Q-banks:
  - **UWorld**
  - **Amboss**
  - **NBME**
  - **Kaplan**
  - **Rx (Kaplan)**
- Automatic mapping to USMLE taxonomy
- Metadata preservation (difficulty, % correct, timing)

#### 📤 Data Export (`/export`)
- JSON export for backup
- Shareable error reports
- Data portability

### Backend (REST API)

Perfect for AI agent integration (Claude, ChatGPT, etc.)

#### Endpoints

##### `POST /api/errors`
Create a new error entry (for agent logging)

**Request:**
```json
{
  "system": "Cardiovascular",
  "error_type": "knowledge",
  "key_concept": "Preload vs stroke volume",
  "corrective_action": "Redo 10 targeted questions",
  "exam_source": "UWorld",
  "question_id": "12345",
  "cognitive_bias": "Anchoring",
  "confidence": 40,
  "time_pressure": true,
  "notes": "Confused afterload with preload"
}
```

**Required Fields:**
- `system` - Medical system (e.g., "Cardiovascular")
- `error_type` - One of: "knowledge", "reasoning", "process", "time"
- `key_concept` - Specific concept missed
- `corrective_action` - Planned action

**Response:**
```json
{
  "ok": true,
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

##### `GET /api/errors`
Retrieve all logged errors

**Response:**
```json
{
  "errors": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-10-08T12:00:00.000Z",
      "system": "Cardiovascular",
      "error_type": "knowledge",
      "key_concept": "Preload vs stroke volume",
      "confidence": 40,
      "time_pressure": true,
      "notes": "Confused afterload with preload",
      "corrective_action": "Redo 10 targeted questions",
      "exam_source": "UWorld",
      "question_id": "12345",
      "cognitive_bias": "Anchoring"
    }
  ]
}
```

##### `GET /api/priority`
Get top 5 priority learning targets

**Response:**
```json
{
  "top": [
    {
      "system": "Cardiovascular",
      "concept": "Preload vs stroke volume",
      "score": 25,
      "reasons": [
        { "label": "Frequency", "value": 3 },
        { "label": "Recency", "value": 0.95 }
      ],
      "last_error_at": "2025-10-08T12:00:00.000Z"
    }
  ]
}
```

**Scoring Algorithm:**
```
score = (frequency × 10) + (recency_factor × 5)
where recency_factor = max(0, (21 - days_since_error) / 21)
```

##### `POST /api/plan`
Generate a spaced repetition study plan

**Request:**
```json
{
  "deficits": [
    {
      "system": "Cardiovascular",
      "concept": "Preload vs stroke volume"
    }
  ],
  "days": 7
}
```

**Response:**
```json
{
  "days": [
    {
      "date": "2025-10-08",
      "sessions": [
        {
          "system": "Cardiovascular",
          "concept": "Preload vs stroke volume",
          "action": "10-Q retrieval block",
          "duration_min": 20
        }
      ]
    },
    {
      "date": "2025-10-09",
      "sessions": [
        {
          "system": "Cardiovascular",
          "concept": "Preload vs stroke volume",
          "action": "5-min teach-back + 5 Qs",
          "duration_min": 10
        }
      ]
    }
  ]
}
```

**Spaced Repetition Schedule:**
- Day 0: Initial 10-Q retrieval block (20 min)
- Day 1: Teach-back + 5 questions (10 min)
- Day 6: Mini-block review (10 min)

## 🤖 AI Agent Integration

### Setup with Claude Agent Builder

1. Open your **Agent Builder** or **Claude Desktop**
2. Configure MCP server or direct API access:
   - **Base URL:** `http://localhost:3000/api`
   - **No authentication required** (development)
3. Save configuration

### Example Agent Prompts

**Log an error:**
```
Missed preload vs stroke volume on a UWorld question. 
Confidence: 40. Time pressure: yes. 
Cognitive bias: anchoring.
Corrective action: redo 10 targeted questions on hemodynamics.
```

**Get priorities:**
```
What should I focus on studying?
```

**Generate study plan:**
```
Create a 7-day study plan for my weak areas.
```

## 📚 Project Structure

```
eat-tracker/
├── app/
│   ├── api/              # REST API endpoints
│   │   ├── errors/       # Error CRUD
│   │   ├── priority/     # Priority analysis
│   │   └── plan/         # Study plan generation
│   ├── log/              # Error logging UI
│   ├── insights/         # Pattern analysis
│   ├── plan/             # Study planner
│   ├── recommendations/  # Smart recommendations
│   ├── system-insights/  # System analytics
│   ├── import/           # Q-bank import
│   ├── export/           # Data export
│   └── page.tsx          # Landing page
├── lib/
│   ├── types.ts          # TypeScript types
│   ├── storage.ts        # localStorage utilities
│   ├── priority.ts       # Priority scoring
│   ├── planner.ts        # Study plan generation
│   ├── scheduler.ts      # Spaced repetition
│   ├── taxonomy.ts       # USMLE taxonomy
│   ├── examWeights.ts    # Exam system weights
│   ├── insights.ts       # Pattern analysis
│   ├── recommendationEngine.ts
│   ├── systemAnalytics.ts
│   ├── qbankImport.ts    # Q-bank import
│   └── voiceProcessing.ts
├── docs/                 # Feature documentation
├── PLANNING.md           # Architecture & design
├── TASK.md               # Task tracker
└── README.md             # This file
```

## 🧪 Development

### Available Scripts

```bash
# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run typecheck

# Run tests
npm test

# Run tests with UI
npm test:ui

# Run tests once (CI mode)
npm run test:run
```

### Testing

Current test coverage:
- ✅ `lib/taxonomy.test.ts` - USMLE taxonomy mapping
- ✅ `lib/priority.test.ts` - Priority scoring algorithm
- ✅ `lib/scheduler.test.ts` - Spaced repetition scheduling
- ✅ `lib/migrations.test.ts` - Data migrations

**Run tests:**
```bash
npm test          # Watch mode
npm test:ui       # Interactive UI
npm run test:run  # CI mode
```

## 💾 Data Storage

### Current: Client-Side (Privacy-First)

All data stored in **browser localStorage**:
- ✅ **Privacy-first:** No server storage
- ✅ **Offline-first:** Works without internet
- ✅ **Fast:** Instant access
- ⚠️ **Single-device:** No sync across devices

**Storage Keys:**
- `eat-tracker-errors` - Error log entries
- `eat-tracker-plan` - Current study plan

### API: In-Memory Store (Development)

API endpoints use **in-memory storage**:
- ⚠️ **Temporary:** Data lost on server restart
- ⚠️ **Development only:** Not for production
- ✅ **Fast:** No database overhead

### Future: Cloud Sync (Planned)

PostgreSQL + Prisma ORM:
- ✅ Multi-device sync
- ✅ Persistent storage
- ✅ Collaborative features
- ✅ Advanced analytics

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + jsdom
- **Storage:** localStorage (client) + in-memory (API)
- **Deployment:** Vercel-ready

## 🔐 Security & Privacy

### Current (Development)
- ✅ **No authentication required**
- ✅ **Client-side only storage**
- ✅ **No data transmission to servers**
- ✅ **CORS enabled for localhost**

### Production (Planned)
- 🔒 API key authentication
- 🔒 CORS restricted to trusted domains
- 🔒 Rate limiting (10 req/min per IP)
- 🔒 Input validation with Zod
- 🔒 Error monitoring (Sentry)

## 📈 Algorithms

### Priority Scoring

```typescript
score = (frequency × 10) + (recency_factor × 5) + (exam_weight × 2)

where:
  recency_factor = max(0, (21 - days_since_error) / 21)
  exam_weight = USMLE system weight (0-1 scale)
```

**Urgency Levels:**
- **Urgent:** Recent (≤3 days) + high frequency (≥3) + high exam weight
- **High:** Recent (≤7 days) + frequency ≥2
- **Moderate:** Frequency ≥2 OR recent (≤14 days)
- **Low:** Single occurrence, >14 days old

### Spaced Repetition

Based on evidence-based learning research:
- **Day 0:** Initial retrieval practice (20 min)
- **Day 1:** Active recall (teach-back, 10 min)
- **Day 6-7:** Consolidation review (10 min)

Optimized for medical education and USMLE preparation.

## 🗺️ Roadmap

### ✅ Phase 1 (Current)
- Frontend error logging & insights
- API endpoints for agent integration
- Priority algorithm
- Study plan generation
- Q-bank import (CSV)
- USMLE taxonomy integration

### ⏳ Phase 2 (Next)
- Comprehensive API tests
- Input validation (Zod)
- Advanced analytics dashboard
- Enhanced error handling
- ML-based recommendations

### 📋 Phase 3 (Future)
- PostgreSQL + Prisma
- Multi-device cloud sync
- User authentication
- Real-time updates (WebSocket)
- Mobile app (React Native)

### 🚀 Phase 4 (Future)
- Advanced predictive analytics
- Anki deck export
- UWorld/Amboss API integration
- Collaborative study groups
- Exam readiness prediction

## 🐛 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear localStorage
Open browser console:
```javascript
localStorage.clear()
location.reload()
```

## 🧪 Manual API Testing

### Using cURL

**Create error:**
```bash
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "system": "Cardiovascular",
    "error_type": "knowledge",
    "key_concept": "Preload vs stroke volume",
    "corrective_action": "Redo 10 targeted questions",
    "confidence": 40,
    "time_pressure": true
  }'
```

**Get errors:**
```bash
curl http://localhost:3000/api/errors
```

**Get priorities:**
```bash
curl http://localhost:3000/api/priority
```

**Generate plan:**
```bash
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "deficits": [
      {"system": "Cardiovascular", "concept": "Preload vs stroke volume"}
    ],
    "days": 7
  }'
```

### Using Browser

Visit:
- `http://localhost:3000/api/errors`
- `http://localhost:3000/api/priority`

## 📖 Documentation

- **[PLANNING.md](PLANNING.md)** - Architecture, design decisions, algorithms
- **[TASK.md](TASK.md)** - Development tasks and progress
- **[TAXONOMY_SUMMARY.md](TAXONOMY_SUMMARY.md)** - USMLE taxonomy mapping
- **[MIGRATION_PLAN.md](MIGRATION_PLAN.md)** - Data migration guide
- **[docs/](docs/)** - Feature-specific documentation

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit: `git commit -m "feat: your feature"`
4. Push and create pull request
5. Update `TASK.md` with completed tasks

## 📝 License

See LICENSE file in project root.

## 🆘 Support

### Resources
- **USMLE Content Outline:** https://www.usmle.org/step-exams
- **Spaced Repetition Research:** Ebbinghaus forgetting curve, SM-2 algorithm
- **Bloom's Taxonomy:** Cognitive level classification

### Help
1. Check [Troubleshooting](#-troubleshooting) section
2. Review [PLANNING.md](PLANNING.md) for architecture details
3. Check [TASK.md](TASK.md) for known issues

---

**Version:** 0.1.0  
**Last Updated:** October 8, 2025  
**Port:** 3000 (frontend + API)

Built with ❤️ for medical students preparing for USMLE
