# Task Tracker

All tasks for the EAT Tracker project. Add new tasks with date and brief description.

## Format
`- [ ] Task description (YYYY-MM-DD) [Status]`

---

## Tasks

### Phase 1: Initial Setup & Core Features (October 2025)

#### Frontend Development
- [x] Create Next.js project structure (2025-10-08) [Completed]
- [x] Set up TypeScript configuration (2025-10-08) [Completed]
- [x] Implement error logging page (/log) (2025-10-08) [Completed]
- [x] Implement insights page (/insights) (2025-10-08) [Completed]
- [x] Implement study plan page (/plan) (2025-10-08) [Completed]
- [x] Implement recommendations page (/recommendations) (2025-10-08) [Completed]
- [x] Implement system insights page (/system-insights) (2025-10-08) [Completed]
- [x] Create export functionality (/export) (2025-10-08) [Completed]
- [x] Create Q-bank import feature (/import) (2025-10-08) [Completed]

#### Backend/API Development
- [x] Implement POST /api/errors endpoint (2025-10-08) [Completed]
- [x] Implement GET /api/errors endpoint (2025-10-08) [Completed]
- [x] Implement GET /api/priority endpoint (2025-10-08) [Completed]
- [x] Implement POST /api/plan endpoint (2025-10-08) [Completed]

#### Library & Core Logic
- [x] Create storage utilities (lib/storage.ts) (2025-10-08) [Completed]
- [x] Create type definitions (lib/types.ts) (2025-10-08) [Completed]
- [x] Implement priority algorithm (lib/priority.ts) (2025-10-08) [Completed]
- [x] Implement study planner (lib/planner.ts) (2025-10-08) [Completed]
- [x] Implement spaced repetition scheduler (lib/scheduler.ts) (2025-10-08) [Completed]
- [x] Create USMLE taxonomy mapping (lib/taxonomy.ts) (2025-10-08) [Completed]
- [x] Implement exam weights (lib/examWeights.ts) (2025-10-08) [Completed]
- [x] Create recommendation engine (lib/recommendationEngine.ts) (2025-10-08) [Completed]
- [x] Implement system analytics (lib/systemAnalytics.ts) (2025-10-08) [Completed]
- [x] Create Q-bank import utilities (lib/qbankImport.ts) (2025-10-08) [Completed]
- [x] Implement migration helpers (lib/migrations.ts) (2025-10-08) [Completed]

#### Documentation
- [x] Create PLANNING.md (2025-10-08) [Completed]
- [x] Create TASK.md (2025-10-08) [Completed]
- [x] Create TAXONOMY_SUMMARY.md (2025-10-08) [Completed]
- [x] Create MIGRATION_PLAN.md (2025-10-08) [Completed]
- [x] Create Q-bank import documentation (2025-10-08) [Completed]
- [ ] Update README.md with comprehensive setup guide (2025-10-08) [In Progress]

#### Testing
- [x] Set up Vitest configuration (2025-10-08) [Completed]
- [x] Write tests for taxonomy (lib/taxonomy.test.ts) (2025-10-08) [Completed]
- [x] Write tests for priority algorithm (lib/priority.test.ts) (2025-10-08) [Completed]
- [x] Write tests for scheduler (lib/scheduler.test.ts) (2025-10-08) [Completed]
- [x] Write tests for migrations (lib/migrations.test.ts) (2025-10-08) [Completed]
- [ ] Write tests for API endpoints (2025-10-08) [Pending]
- [ ] Write tests for planner (2025-10-08) [Pending]
- [ ] Write tests for recommendation engine (2025-10-08) [Pending]

#### Integration & Deployment
- [ ] Test all API endpoints manually (2025-10-08) [Pending]
- [ ] Configure agent in Agent Builder (2025-10-08) [Pending]
- [ ] Test voice input processing (2025-10-08) [Pending]
- [ ] Test Q-bank CSV import with real data (2025-10-08) [Pending]

### Phase 2: Enhancement & Validation (Planned)

#### Testing & Quality
- [ ] Achieve 80%+ test coverage for lib/
- [ ] Add E2E tests for critical user flows
- [ ] Add input validation with Zod
- [ ] Add error handling middleware
- [ ] Test with actual agent integration
- [ ] Performance profiling and optimization

#### Features
- [ ] Implement shareable error reports (/share/[id])
- [ ] Add advanced filtering to insights page
- [ ] Implement data visualization (charts/graphs)
- [ ] Add batch error import
- [ ] Create undo/redo functionality
- [ ] Add keyboard shortcuts

#### Developer Experience
- [ ] Set up pre-commit hooks
- [ ] Add automated changelog generation
- [ ] Create contributing guide
- [ ] Set up Storybook for component docs

### Phase 3: Database & Cloud Integration (Planned)

#### Database
- [ ] Set up Prisma ORM
- [ ] Create database schema
- [ ] Implement migrations
- [ ] Add database seeding
- [ ] Migrate from localStorage to DB
- [ ] Add data persistence layer

#### Cloud Features
- [ ] Implement user authentication (NextAuth.js)
- [ ] Add multi-device sync
- [ ] Create cloud backup/restore
- [ ] Implement real-time updates (WebSocket)
- [ ] Add collaborative features

#### API Enhancement
- [ ] Add authentication/API keys
- [ ] Implement rate limiting
- [ ] Add request/response caching
- [ ] Create OpenAPI/Swagger docs
- [ ] Add API versioning (/api/v1, /api/v2)

### Phase 4: Advanced Features (Planned)

#### Machine Learning
- [ ] Implement ML-based difficulty prediction
- [ ] Add performance trend forecasting
- [ ] Create smart study recommendations
- [ ] Implement adaptive spaced repetition (SM-2+)
- [ ] Add exam readiness prediction

#### Integrations
- [ ] Anki deck export
- [ ] UWorld API integration (if available)
- [ ] NBME score correlation
- [ ] Calendar app sync (Google/Outlook)
- [ ] Notion/Obsidian export

#### Analytics
- [ ] Advanced performance dashboards
- [ ] Comparative analytics (vs. peers)
- [ ] Study efficiency metrics
- [ ] Retention curve visualization
- [ ] Predicted weakness areas

### Phase 5: Production & Scale (Planned)

#### Deployment
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure production deployment (Vercel)
- [ ] Add monitoring (Sentry)
- [ ] Set up analytics (Google Analytics/Plausible)
- [ ] Configure CDN for static assets
- [ ] Add logging (Winston/Pino)

#### Security & Compliance
- [ ] Security audit
- [ ] HIPAA compliance review (if storing PHI)
- [ ] Add data encryption
- [ ] Implement GDPR features (data export/deletion)
- [ ] Penetration testing

#### Performance
- [ ] Load testing
- [ ] Database query optimization
- [ ] Implement caching strategy (Redis)
- [ ] Add service workers (PWA)
- [ ] Optimize bundle size

#### Mobile
- [ ] Create React Native app
- [ ] Implement native voice recording
- [ ] Add offline-first sync
- [ ] Push notifications for study reminders

---

## Current Sprint (October 8, 2025)

**Focus:** Consolidate project structure and merge API backend

- [x] Merge API routes from Agent EAT project
- [x] Update documentation (PLANNING.md, TASK.md)
- [ ] Update README with combined feature set
- [ ] Test merged functionality
- [ ] Clean up duplicate files

---

## Notes

### Server Configuration
- Frontend runs on port 3000 (default Next.js)
- API accessible at `/api/*` routes
- Agent Builder URL: `http://localhost:3000/api`

### Storage
- Currently using localStorage (client-side)
- API uses in-memory store (data lost on restart)
- Migration to PostgreSQL planned for Phase 3

### Testing
- Run tests: `npm run test`
- Run tests with UI: `npm run test:ui`
- Current coverage: ~60% (lib functions)

### Q-Bank Import Status
- ✅ UWorld mapping complete
- ✅ Amboss mapping complete
- ✅ NBME mapping complete
- ⏳ Kaplan mapping in progress
- ⏳ Rx mapping in progress

### Known Issues
- None currently

### Migration Status
- ✅ Taxonomy migration utilities complete
- ✅ Old system format → new systemId format
- ⏳ Need to add UI migration prompt

