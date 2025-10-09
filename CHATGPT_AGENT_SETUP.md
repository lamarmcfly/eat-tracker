# ChatGPT Agent Builder Setup Guide

This guide walks you through setting up the E.A.T. Tracker agent in ChatGPT Agent Builder.

## Quick Reference

- **Config File**: `chatgpt-agent-config.json` (reference for all properties)
- **API Base URL**: `https://eat-tracker.vercel.app/api`
- **Agent Type**: Structured JSON Output (no tools in agent node)

---

## Step 1: Create the EAT Agent Node

### 1.1 Open Structured Output
1. Click on your **EAT Agent** node
2. Find **"Output format"** (under "Structured output")
3. Set to **JSON** (not "text")

### 1.2 Add Properties (Required Fields First)

Click **"Add property"** for each field below:

#### ✅ intent (REQUIRED)
- **Type**: `enum` / `string`
- **Enum values**: `log_error`, `explain_priority`, `compose_plan`, `nudge`, `other`
- **Description**: "What the user wants: log_error | explain_priority | compose_plan | nudge | other"
- **Example**: `log_error`
- ✅ Mark as **Required**

#### ✅ system (REQUIRED)
- **Type**: `string`
- **Description**: "NBME-style system/topic (e.g., Cardiovascular, Respiratory)"
- **Example**: `Cardiovascular`
- ✅ Mark as **Required**

#### ✅ error_type (REQUIRED)
- **Type**: `enum` / `string`
- **Enum values**: `knowledge`, `reasoning`, `process`, `time`
- **Description**: "Primary error type"
- **Example**: `knowledge`
- ✅ Mark as **Required**

#### ⚪ cognitive_bias (OPTIONAL)
- **Type**: `string`
- **Allow null**: `true`
- **Description**: "Optional bias (e.g., anchoring, availability) or null"
- **Example**: `anchoring`
- ⚪ Leave as **Optional**

#### ✅ key_concept (REQUIRED)
- **Type**: `string`
- **Description**: "The specific concept missed"
- **Example**: `Preload vs stroke volume`
- ✅ Mark as **Required**

#### ✅ confidence (REQUIRED)
- **Type**: `integer` (or `number` 0–100)
- **Description**: "Self-rated confidence 0–100"
- **Example**: `40`
- ✅ Mark as **Required**

#### ✅ time_pressure (REQUIRED)
- **Type**: `boolean`
- **Description**: "Was the miss under time pressure?"
- **Example**: `true`
- ✅ Mark as **Required**

#### ⚪ notes (OPTIONAL)
- **Type**: `string`
- **Description**: "Short free-text note (optional)"
- **Example**: `""` (empty)
- ⚪ Leave as **Optional**

#### ✅ corrective_action (REQUIRED)
- **Type**: `string`
- **Description**: "One concrete next step"
- **Example**: `Review Frank-Starling curve`
- ✅ Mark as **Required**

### 1.3 Add Example JSON (Optional but Recommended)

If your UI allows pasting a sample output, use this:

```json
{
  "intent": "log_error",
  "system": "Cardiovascular",
  "error_type": "knowledge",
  "cognitive_bias": null,
  "key_concept": "Preload vs stroke volume",
  "confidence": 40,
  "time_pressure": true,
  "notes": "",
  "corrective_action": "Review Frank-Starling curve"
}
```

---

## Step 2: Do I Need Tools in the Agent Node?

**Answer: NO** ❌

Your canvas uses **separate MCP nodes** (POST /errors, GET /priority, POST /plan). The Agent node just outputs JSON. The If/Else + MCP nodes handle the API calls.

---

## Step 3: Wire the If/Else Flow

### 3.1 Main Splitter (after Guardrails or Agent)

**If condition** (top branch):
```
$.intent == "log_error"
```
*Use the field picker if available—select `intent` from the EAT Agent output*

- **Top branch** → `User Approval` node
- **Else branch** → `Second Splitter` node

### 3.2 Second Splitter (on the Else path)

**If condition** (top branch):
```
$.intent == "explain_priority"
```

- **Top branch** → MCP GET `/priority` → Agent Summarize → End
- **Else branch** → Transform → MCP POST `/plan` → Agent Summarize → End

---

## Step 4: Top Branch (Log Error Flow)

### 4.1 User Approval Node

**Template:**
```
System/Topic: {{system}}
Error Type: {{error_type}} {{#if cognitive_bias}}(+ {{cognitive_bias}}){{/if}}
Key Concept: {{key_concept}}
Confidence: {{confidence}}
Time Pressure: {{time_pressure}}
Action: {{corrective_action}}
```

**Button Actions:**
- **Approve** → Transform node
- **Reject** → Back to EAT Agent
- **Cancel** → End

### 4.2 Transform Node (for /errors)

**Body template:**
```json
{
  "exam_source": "other",
  "question_id": null,
  "system": "{{system}}",
  "error_type": "{{error_type}}",
  "cognitive_bias": "{{cognitive_bias}}",
  "key_concept": "{{key_concept}}",
  "confidence": {{confidence}},
  "time_pressure": {{time_pressure}},
  "notes": "{{notes}}",
  "corrective_action": "{{corrective_action}}"
}
```

### 4.3 MCP (HTTP POST) Node

- **Server URL**: `https://eat-tracker.vercel.app/api`
- **Path**: `/errors`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**: Output from Transform node
- **On success** → End (or confirmation message)
- **On error** → Error handler or retry loop

---

## Step 5: Bottom Branch (Explain & Compose)

### 5.1 Explain Priority Path (top of second split)

#### MCP (HTTP GET) Node
- **Server URL**: `https://eat-tracker.vercel.app/api`
- **Path**: `/priority`
- **Method**: `GET`

#### Agent Summarize Node (Optional)
- **Prompt**: "Convert this priority JSON into a brief explanation of why these are the top priorities (focus on frequency + recency)"

→ End

### 5.2 Compose Plan Path (else of second split)

#### Transform Node (for /plan)
```json
{
  "deficits": [
    {
      "system": "{{system}}",
      "concept": "{{key_concept}}",
      "score": 75
    }
  ],
  "days": 7
}
```

#### MCP (HTTP POST) Node
- **Server URL**: `https://eat-tracker.vercel.app/api`
- **Path**: `/plan`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**: Output from Transform node

#### Agent Summarize Node (Optional)
- **Prompt**: "Summarize this study plan showing day-0, ~24-48h, and ~1-week revisits"

→ End

---

## Step 6: Test Prompts

Use these in the **Preview** panel:

### Test 1: Log Error
**Prompt:**
```
Missed preload vs stroke volume; confidence 40; rushed.
```

**Expected:**
- Approval card appears
- Shows system, error type, key concept, etc.
- Approve → POST `/errors` → Success message

### Test 2: Explain Priority
**Prompt:**
```
Explain my top priorities.
```

**Expected:**
- GET `/priority` → JSON response
- Agent summarizes why (frequency + recency)

### Test 3: Compose Plan
**Prompt:**
```
Build me a 7-day micro-plan from my top issues.
```

**Expected:**
- POST `/plan` → Study schedule JSON
- Agent summarizes: day-0, ~24-48h, ~1-week revisits

---

## Step 7: Troubleshooting

### ❌ "needs a property" error
**Fix:** Add at least one property under Structured JSON output. Start with `intent` and mark it **Required**.

### ❌ If/Else can't see fields
**Fix:** Use the **output/variable picker** instead of typing. Your builder may require `$.output.intent` instead of `$.intent`.

### ❌ 405 error on /plan
**Fix:** You're using GET in a browser. The endpoint requires **POST**. Your MCP node should be configured for POST.

### ❌ Network errors
**Fix:** Confirm your Server URL is:
```
https://eat-tracker.vercel.app/api
```
*NOT* `http://localhost:3000/api`

---

## Node Diagram Reference

```
Start
  ↓
Guardrails
  ↓
EAT Agent (Structured JSON)
  ↓
Main Splitter
  ├─ If $.intent == "log_error"
  │    ↓
  │  User Approval
  │    ├─ Approve → Transform → MCP POST /errors → End
  │    ├─ Reject → Back to EAT Agent
  │    └─ Cancel → End
  │
  └─ Else → Second Splitter
       ├─ If $.intent == "explain_priority"
       │    ↓
       │  MCP GET /priority → Agent Summarize → End
       │
       └─ Else (compose_plan)
            ↓
          Transform → MCP POST /plan → Agent Summarize → End
```

---

## Summary Checklist

- [ ] EAT Agent node has Structured JSON output with 9 properties
- [ ] Required fields: `intent`, `system`, `error_type`, `key_concept`, `confidence`, `time_pressure`, `corrective_action`
- [ ] Main If/Else checks `$.intent == "log_error"`
- [ ] Second If/Else checks `$.intent == "explain_priority"`
- [ ] All MCP nodes point to `https://eat-tracker.vercel.app/api`
- [ ] POST requests have `Content-Type: application/json` header
- [ ] Transform nodes use correct field syntax `{{field_name}}`
- [ ] Test prompts work in Preview panel

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/errors` | POST | Log a new error |
| `/priority` | GET | Get top priority topics |
| `/plan` | POST | Generate study schedule |

---

**Need help?** Check `chatgpt-agent-config.json` for the complete configuration reference.
