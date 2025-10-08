# Q-Bank Import Mapping Guide

Complete guide for importing question metadata from UWorld, Amboss, NBME, and other Q-banks into E.A.T. Tracker.

---

## Quick Start

1. Navigate to **Import** page in E.A.T. Tracker
2. Paste your JSON data (single question or array of questions)
3. Click **Validate & Preview**
4. Review the preview
5. Click **Confirm & Import**

---

## Schema Overview

### Required Fields
```json
{
  "questionId": "string",     // Unique question identifier
  "questionBank": "string"    // Source Q-bank name
}
```

### Recommended Fields
```json
{
  "system": "string",         // Organ system (maps to NBME taxonomy)
  "topic": "string",          // Specific topic
  "difficulty": "string|number", // Difficulty level (flexible format)
  "percentCorrect": "number"  // National average (0-100)
}
```

### Optional Fields
```json
{
  "description": "string",
  "learningObjectives": ["string"],
  "tags": ["string"],
  "estimatedTime": "number",  // seconds
  "bloomsLevel": "string",
  "errorType": "knowledge|reasoning|process|time",
  "confidence": "guessed|eliminated|confident|certain"
}
```

---

## Q-Bank Specific Mappings

### UWorld

**Direct Export Format:**
```json
{
  "questionId": "uw-12345",
  "questionBank": "uworld",
  "system": "Cardiovascular",
  "topic": "Acute Coronary Syndrome",
  "difficulty": "medium",
  "percentCorrect": 65,
  "educationalObjectives": [
    "Recognize clinical presentation of ACS",
    "Understand pathophysiology of MI"
  ],
  "tags": ["High-Yield", "Commonly-Missed"],
  "tutorModeTime": 120
}
```

**Field Mappings:**
- `educationalObjectives` → `learningObjectives`
- `tutorModeTime` → `estimatedTime`
- `difficulty`: "easy" → 1, "medium" → 3, "hard" → 5

**System Name Mapping:**
UWorld uses NBME-aligned system names, so direct mapping works:
- "Cardiovascular" → sys-cardiovascular
- "Respiratory" → sys-respiratory
- "Gastrointestinal" → sys-gastrointestinal
- etc.

---

### Amboss

**Direct Export Format:**
```json
{
  "questionId": "amb-qbank-789",
  "questionBank": "amboss",
  "system": "Cardiovascular System",
  "topic": "Myocardial Infarction",
  "difficulty": 3,
  "percentCorrect": 58,
  "learningObjectives": [
    "Pathophysiology of acute myocardial infarction",
    "Indications for fibrinolytic therapy"
  ],
  "hammers": ["High-Yield", "Step 2"],
  "bloomsTaxonomy": "Apply",
  "examRelevance": {
    "step1": 3,
    "step2ck": 5,
    "step3": 4
  }
}
```

**Field Mappings:**
- `hammers` → `tags`
- `bloomsTaxonomy` → `bloomsLevel`
- `difficulty`: 1-5 scale (maps directly)

**System Name Mapping:**
Amboss adds " System" suffix:
- "Cardiovascular System" → sys-cardiovascular
- "Respiratory System" → sys-respiratory
- (Auto-mapped via taxonomy lookup)

---

### NBME Self-Assessments

**Direct Export Format:**
```json
{
  "questionId": "nbme-30-q145",
  "questionBank": "nbme",
  "system": "Cardiovascular",
  "topic": "Heart Failure",
  "difficulty": "medium",
  "percentCorrect": 68,
  "cognitiveLevel": "higher-order",
  "discipline": "Internal Medicine",
  "competency": "Diagnosis"
}
```

**Field Mappings:**
- `cognitiveLevel`: "first-order" or "higher-order" (maps directly)
- `discipline` → stored in `rawMetadata`
- `competency` → stored in `rawMetadata`

---

### Kaplan

**Direct Export Format:**
```json
{
  "questionId": "kaplan-2024-q567",
  "questionBank": "kaplan",
  "subject": "Cardiology",
  "topic": "Arrhythmias",
  "difficulty": 4,
  "percentCorrect": 42
}
```

**Field Mappings:**
- `subject` → `system` (via taxonomy lookup)
- `difficulty`: 1-5 scale (maps directly)

**Subject to System Mapping:**
- "Cardiology" → sys-cardiovascular
- "Pulmonology" → sys-respiratory
- "Gastroenterology" → sys-gastrointestinal

---

### USMLE-Rx

**Direct Export Format:**
```json
{
  "questionId": "rx-step2-q890",
  "questionBank": "rx",
  "system": "Respiratory",
  "topic": "Pneumonia",
  "difficulty": "easy",
  "percentCorrect": 78,
  "objectives": [
    "Recognize typical vs atypical pneumonia"
  ]
}
```

**Field Mappings:**
- `objectives` → `learningObjectives`
- `difficulty`: "easy" → 1, "medium" → 3, "hard" → 5

---

## Difficulty Normalization

E.A.T. Tracker normalizes all difficulty scales to 1-5:

### Supported Input Formats

**String Format:**
- "easy", "Easy", "EASY" → 1
- "medium", "Medium", "med" → 3
- "hard", "Hard", "HARD" → 5

**Numeric 1-5 Scale:**
- 1 → 1 (Easy)
- 2 → 2
- 3 → 3 (Medium)
- 4 → 4
- 5 → 5 (Hard)

**Percentage-Based (% Correct):**
- 80-100% → 1 (Easy)
- 60-79% → 2
- 40-59% → 3 (Medium)
- 20-39% → 4
- 0-19% → 5 (Hard)

---

## System Name Mapping

E.A.T. Tracker uses official NBME organ system taxonomy. The import engine automatically maps common variations:

### Supported Aliases

**Cardiovascular:**
- "Cardiovascular", "Cardiac", "Heart", "CV", "Cardiology"

**Respiratory:**
- "Respiratory", "Pulmonary", "Lungs", "Resp", "Pulmonology"

**Gastrointestinal:**
- "Gastrointestinal", "GI", "Digestive", "GI Tract", "Gastroenterology"

**Renal/Urinary:**
- "Renal", "Urinary", "Kidney", "Nephrology", "Genitourinary"

**Nervous System:**
- "Nervous", "Neuro", "CNS", "Neurology", "Special Senses"

**Musculoskeletal:**
- "Musculoskeletal", "MSK", "Orthopedic", "Bone", "Joint"

**Endocrine:**
- "Endocrine", "Hormonal", "Metabolism", "Diabetes"

(See full taxonomy in `lib/taxonomy.ts`)

---

## Batch Import

Import multiple questions at once by providing an array:

```json
[
  {
    "questionId": "uw-100",
    "questionBank": "uworld",
    "system": "Respiratory",
    "topic": "Pneumonia",
    "difficulty": 2,
    "percentCorrect": 72
  },
  {
    "questionId": "uw-101",
    "questionBank": "uworld",
    "system": "Cardiovascular",
    "topic": "Heart Failure",
    "difficulty": 4,
    "percentCorrect": 45
  }
]
```

The import preview will show validation results for each item, and only valid items will be imported.

---

## Advanced Features

### Multi-Subject Questions

For questions that span multiple systems:

```json
{
  "questionId": "amb-cross-100",
  "questionBank": "amboss",
  "system": "Cardiovascular",
  "subjects": [
    { "name": "Cardiovascular", "percentage": 70 },
    { "name": "Pharmacology", "percentage": 30 }
  ],
  "topic": "Antiarrhythmic Drugs"
}
```

### Exam Relevance Scoring

Specify exam-specific relevance (1-5 scale):

```json
{
  "questionId": "amb-200",
  "questionBank": "amboss",
  "examRelevance": {
    "step1": 3,
    "step2ck": 5,
    "step3": 4
  }
}
```

### Timing Data

Track actual vs estimated completion time:

```json
{
  "questionId": "uw-300",
  "questionBank": "uworld",
  "estimatedTime": 90,
  "actualTime": 135
}
```

### Bloom's Taxonomy

Include cognitive level classification:

```json
{
  "questionId": "amb-400",
  "questionBank": "amboss",
  "bloomsLevel": "Apply",
  "cognitiveLevel": "higher-order"
}
```

---

## Validation and Error Handling

### Validation Checks

The import engine performs:
1. **JSON syntax validation**
2. **Required field checking** (questionId, questionBank)
3. **Type validation** (numbers, arrays, etc.)
4. **Range validation** (percentCorrect 0-100, difficulty 1-5)
5. **System name mapping** (warns if unmapped)

### Error Messages

**Common Errors:**
- `"Invalid JSON: must be an object"` → Check JSON syntax
- `"Missing or invalid questionId"` → Add questionId field
- `"Missing or invalid questionBank"` → Add questionBank field

**Common Warnings:**
- `"percentCorrect should be 0-100"` → Check value range
- `"learningObjectives should be an array"` → Use array format
- `"System name not found in taxonomy"` → Check system name spelling

### Graceful Failure

- Invalid items in batch import are skipped
- Valid items are still imported
- Validation summary shows counts and specific errors
- No data loss - original metadata preserved in `rawMetadata`

---

## Migration Strategy

### Backward Compatibility

All external metadata fields are **optional**:
- Existing error logs without external metadata continue working
- Import adds metadata without modifying core fields
- Analytics gracefully handle missing external data

### Data Preservation

All imported data is preserved:
- Core E.A.T. fields: system, topic, errorType, confidence
- External metadata: stored in `externalQuestion` object
- Raw import data: preserved in `rawMetadata` for future use

---

## Example Workflows

### Workflow 1: Import UWorld Incorrects

1. Export your incorrects from UWorld (manual copy)
2. Format as JSON:
```json
{
  "questionId": "uw-12345",
  "questionBank": "uworld",
  "system": "Cardiovascular",
  "topic": "Heart Failure",
  "difficulty": "hard",
  "percentCorrect": 45,
  "errorType": "reasoning",
  "confidence": "eliminated"
}
```
3. Import → View in System Insights with difficulty and % correct data

### Workflow 2: Batch Import NBME Form

1. After completing NBME form, list all incorrect questions
2. Create JSON array with minimal data:
```json
[
  {"questionId": "nbme-30-q5", "questionBank": "nbme", "system": "Cardio", "topic": "CHF"},
  {"questionId": "nbme-30-q12", "questionBank": "nbme", "system": "Resp", "topic": "COPD"},
  {"questionId": "nbme-30-q18", "questionBank": "nbme", "system": "GI", "topic": "IBD"}
]
```
3. Import → Get personalized study recommendations

### Workflow 3: Import Amboss Hammers

1. Export high-yield questions you missed
2. Include full metadata:
```json
{
  "questionId": "amb-1000",
  "questionBank": "amboss",
  "system": "Cardiovascular",
  "topic": "Acute MI",
  "difficulty": 4,
  "hammers": ["High-Yield", "Step 2", "Commonly-Missed"],
  "learningObjectives": ["ECG interpretation", "Treatment timeline"],
  "examRelevance": {"step2ck": 5}
}
```
3. Import → Difficulty, tags, and objectives integrated into recommendations

---

## Troubleshooting

### Q: Import fails with "Invalid JSON"
**A:** Validate your JSON using a JSON validator (jsonlint.com). Common issues:
- Missing quotes around strings
- Trailing commas
- Unescaped special characters

### Q: System name not recognized
**A:** Check spelling and use supported aliases. Examples:
- ❌ "Heart" → ✅ "Cardiovascular"
- ❌ "Lungs" → ✅ "Respiratory"
- ❌ "GI Tract" → ✅ "Gastrointestinal"

### Q: Difficulty not showing correctly
**A:** Use supported formats:
- String: "easy", "medium", "hard"
- Number: 1, 2, 3, 4, 5
- Avoid: 0, negative numbers, decimals

### Q: Learning objectives not imported
**A:** Ensure array format:
- ✅ `"learningObjectives": ["item1", "item2"]`
- ❌ `"learningObjectives": "item1, item2"`

---

## API Reference

For developers building import scripts, see `lib/qbankImport.ts`:

```typescript
// Validate single import
validateImport(data: unknown): ImportValidationResult

// Validate batch import
validateBatchImport(items: unknown[]): BatchValidationResult

// Convert to ErrorLog
convertToErrorLog(data: QBankImportFormat): Partial<ErrorLog>

// Normalize difficulty
normalizeDifficulty(difficulty: unknown): DifficultyLevel

// Map system names
mapSystemToTaxonomy(systemName: string): { system, systemId }
```

---

## Support

For questions or issues:
1. Check examples in Import page ("Show Examples")
2. Review validation errors carefully
3. Consult this mapping guide
4. Open issue on GitHub with sample data
