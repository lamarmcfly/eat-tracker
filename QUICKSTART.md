# Quick Start Guide - EAT Tracker

## 🚀 Get Running in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
```

### Step 3: Test It Works

Open your browser to `http://localhost:3000` - you should see the EAT Tracker landing page.

Or test the API with cURL:
```bash
curl http://localhost:3000/api/errors
```

Expected response:
```json
{"errors":[]}
```

## 🎯 Using the Web UI

### Log Your First Error

1. Navigate to `http://localhost:3000/log`
2. Fill in the error details:
   - **System:** Select from dropdown (e.g., "Cardiovascular")
   - **Topic:** Specific topic (e.g., "Preload vs stroke volume")
   - **Error Type:** knowledge/reasoning/process/time
   - **Confidence:** guessed/eliminated/confident/certain
   - **Description:** What happened
   - **Next Steps:** What you'll do to fix it
3. Click "Save Error"

### View Your Insights

1. Navigate to `http://localhost:3000/insights`
2. See patterns in your errors:
   - Which systems you struggle with most
   - Types of errors you make
   - Confidence levels
   - Topics to review

### Generate a Study Plan

1. Navigate to `http://localhost:3000/plan`
2. Review your prioritized weak areas
3. Click "Generate Study Plan"
4. Get a 7-14 day spaced repetition schedule

### Get Smart Recommendations

1. Navigate to `http://localhost:3000/recommendations`
2. See evidence-based study strategies tailored to your error patterns

## 🤖 AI Agent Integration

### Configure Your Agent (Claude, ChatGPT, etc.)

1. Open Agent Builder or Claude Desktop
2. Go to **Tools → MCP Server** (or similar)
3. Set:
   - **Server URL:** `http://localhost:3000/api`
   - **Access Token:** (leave blank for development)
4. Save

### Test Your Agent

Try this prompt:
```
I missed a question on preload vs stroke volume in the cardiovascular system. 
I was only 40% confident and felt rushed. Can you log this error?
```

The agent should:
1. Extract the error details
2. Ask for confirmation
3. Call POST /api/errors
4. Confirm the error was logged

Then try:
```
What should I focus on studying?
```

The agent should call GET /api/priority and show you your top weak areas.

Finally:
```
Create a 7-day study plan for my weaknesses.
```

The agent should call /api/priority then POST /api/plan and show you a structured schedule.

## 📝 Example Full Workflow

### Method 1: Web UI (Recommended for beginners)

1. Open `http://localhost:3000/log`
2. Log 3-5 errors from your recent study session
3. Go to `http://localhost:3000/insights` to see patterns
4. Visit `http://localhost:3000/plan` to generate study schedule
5. Check `http://localhost:3000/recommendations` for strategies

### Method 2: API + cURL (Advanced)

**1. Log some errors:**
```bash
# Error 1
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "system": "Cardiovascular",
    "error_type": "knowledge",
    "key_concept": "Preload vs stroke volume",
    "corrective_action": "Review Frank-Starling curve",
    "confidence": 40,
    "time_pressure": true
  }'

# Error 2
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "system": "Respiratory",
    "error_type": "reasoning",
    "key_concept": "V/Q mismatch interpretation",
    "corrective_action": "Practice 10 V/Q scenarios",
    "confidence": 50,
    "time_pressure": false
  }'

# Error 3 (same as Error 1 - creates frequency)
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "system": "Cardiovascular",
    "error_type": "knowledge",
    "key_concept": "Preload vs stroke volume",
    "corrective_action": "Review Frank-Starling curve",
    "confidence": 45,
    "time_pressure": false
  }'
```

**2. Check priorities:**
```bash
curl http://localhost:3000/api/priority
```

You should see "Preload vs stroke volume" ranked higher due to frequency (2 occurrences).

**3. Generate study plan:**
```bash
curl -X POST http://localhost:3000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "deficits": [
      {"system": "Cardiovascular", "concept": "Preload vs stroke volume"},
      {"system": "Respiratory", "concept": "V/Q mismatch interpretation"}
    ],
    "days": 7
  }'
```

You'll get a 7-day plan with spaced repetition:
- Day 0: Initial intensive study (20 min blocks)
- Day 1: Quick review (10 min)
- Day 6: Final reinforcement (10 min)

## 📥 Import Q-Bank Data

### Import from UWorld, Amboss, NBME, etc.

1. Export your incorrect questions from your Q-bank as CSV
2. Navigate to `http://localhost:3000/import`
3. Select your Q-bank from dropdown
4. Upload CSV file
5. Review mapped data
6. Confirm import

Supported Q-banks:
- ✅ UWorld
- ✅ Amboss
- ✅ NBME
- ⏳ Kaplan (partial)
- ⏳ Rx (partial)

## 🔍 Troubleshooting

**Problem:** Port 3000 already in use

**Solution (Windows):**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution (Mac/Linux):**
```bash
lsof -ti:3000 | xargs kill
```

---

**Problem:** "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Problem:** Data disappeared after restart

**Solution:**
- This is expected! Data is stored in browser localStorage
- To persist data:
  1. Go to `http://localhost:3000/export`
  2. Download JSON backup
  3. Keep backups safe
- Cloud sync coming in future release

---

**Problem:** Agent can't connect

**Solution:**
- Make sure server is running (`npm run dev`)
- Check URL is exactly `http://localhost:3000/api`
- Try the endpoints in your browser first
- Check agent logs for error messages

## 💾 Data Storage

All your data is stored **locally in your browser** (localStorage):
- ✅ **Privacy-first:** Nothing sent to servers
- ✅ **Offline-first:** Works without internet
- ⚠️ **Per-browser:** Data doesn't sync across devices/browsers
- ⚠️ **Can be lost:** Clear browser data = lose errors

**Best Practice:**
- Export your data regularly (`/export` page)
- Keep JSON backups safe
- Consider setting calendar reminders to export weekly

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm test:ui

# Run once (CI mode)
npm run test:run

# Type checking
npm run typecheck
```

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [PLANNING.md](./PLANNING.md) for architecture details
- Review [TASK.md](./TASK.md) for project roadmap
- Explore [docs/](./docs/) for feature-specific guides

## 💡 Tips

1. **Log errors immediately:** Don't wait until end of day - log them right after each question/block for better recall

2. **Be specific:** Instead of "metabolism," write "glycolysis vs gluconeogenesis regulation"

3. **Use all features:**
   - `/log` - Daily error logging
   - `/insights` - Weekly pattern review
   - `/plan` - Generate new plan every Sunday
   - `/recommendations` - Check before study sessions
   - `/export` - Backup every week

4. **Agent vs UI:** Use agent for quick voice logging during study sessions, use UI for detailed review and planning

5. **Q-Bank import:** Import missed questions weekly to maintain comprehensive error log

6. **Study plans:** Follow the spaced repetition schedule - don't skip day 1 or day 6 reviews!

7. **Privacy:** All data stays on your device. Share exports carefully (they contain your full error history)

## 🎯 Optimal Workflow

**During Study Session:**
- Use AI agent to quickly log errors via voice/text
- OR use `/log` page if you prefer manual entry

**Weekly Review (e.g., Sunday):**
1. Visit `/insights` - identify patterns
2. Visit `/system-insights` - check system-level performance
3. Visit `/plan` - generate next week's study schedule
4. Visit `/recommendations` - get tailored strategies
5. Visit `/export` - backup your data

**Before Each Study Block:**
- Check today's study plan
- Review recommended strategies for the topic

**End of Month:**
- Export full data
- Review long-term trends
- Adjust study approach based on insights

---

**Ready to start tracking your errors systematically!** 🎯

For detailed API documentation, troubleshooting, and advanced features, see [README.md](./README.md)

