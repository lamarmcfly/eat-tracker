# Q-Bank Metadata Research

## Overview
Research into how major medical Q-banks structure question metadata to inform our external metadata schema design.

---

## UWorld Question Metadata Structure

### Core Metadata Fields
Based on UWorld's interface and API patterns:

```json
{
  "question_id": "uw-12345",
  "question_bank": "uworld-step2ck",
  "difficulty": "medium",
  "percent_correct": 65,

  "subject": {
    "primary": "Cardiovascular",
    "secondary": ["Pharmacology"]
  },

  "system": "Cardiovascular",

  "educational_objectives": [
    "Recognize clinical presentation of acute coronary syndrome",
    "Understand pathophysiology of myocardial infarction"
  ],

  "tags": [
    "ACS",
    "STEMI",
    "High-Yield",
    "Commonly-Missed"
  ],

  "clinical_vignette": true,
  "question_type": "single-best-answer",
  "media_type": ["image", "ecg"],

  "tutor_mode_time": 120,
  "timed_mode_time": 90
}
```

### UWorld-Specific Classifications
- **Difficulty**: Easy, Medium, Hard (derived from % correct)
- **Percent Correct**: National average performance (0-100%)
- **Tags**: Free-form, includes: High-Yield, Commonly-Missed, Clinical, Basic Science
- **Educational Objectives**: 1-3 learning points per question
- **Systems**: Aligned with NBME organ systems

---

## Amboss Question Metadata Structure

### Core Metadata Fields
Amboss uses a more granular classification:

```json
{
  "question_id": "amb-qbank-789",
  "question_bank": "amboss",
  "difficulty": 2,
  "difficulty_label": "Medium (Shelf Level)",

  "subjects": [
    {
      "name": "Cardiology",
      "percentage": 70
    },
    {
      "name": "Pharmacology",
      "percentage": 30
    }
  ],

  "organ_system": "Cardiovascular System",

  "learning_objectives": [
    "Pathophysiology of acute myocardial infarction",
    "Indications for fibrinolytic therapy"
  ],

  "session_mode": "tutor",
  "hammers": ["High-Yield", "Step 2"],

  "blooms_taxonomy": "Apply",
  "exam_relevance": {
    "step1": 3,
    "step2ck": 5,
    "step3": 4
  }
}
```

### Amboss-Specific Features
- **Difficulty Scale**: 1-5 (1=Basic, 5=Expert)
- **Hammers**: Curated tags (High-Yield, Commonly-Missed, Clinical Vignette, etc.)
- **Bloom's Taxonomy**: Remember, Understand, Apply, Analyze, Evaluate, Create
- **Exam Relevance**: 1-5 score per exam level
- **Multi-subject weighting**: Percentages for cross-disciplinary questions

---

## NBME/USMLE Self-Assessments

### Metadata Structure
Official practice exams include:

```json
{
  "question_number": 145,
  "form": "NBME-30",
  "exam_level": "step2ck",

  "content_outline": {
    "organ_system": "Cardiovascular System",
    "discipline": "Internal Medicine",
    "competency": "Diagnosis"
  },

  "question_difficulty": "medium",
  "national_mean": 0.68,

  "item_type": "single-best-answer",
  "cognitive_level": "higher-order"
}
```

### NBME-Specific Classifications
- **Content Outline**: Maps to official USMLE content categories
- **Disciplines**: Internal Medicine, Surgery, Pediatrics, OB/GYN, Psychiatry, etc.
- **Competencies**: Diagnosis, Treatment, Prevention, Mechanism, etc.
- **Cognitive Level**: First-order (recall) vs Higher-order (application/analysis)

---

## Common Patterns Across Q-Banks

### Universal Fields
1. **Question ID**: Unique identifier
2. **Subject/System**: Organ system or discipline
3. **Difficulty**: Easy/Medium/Hard or 1-5 scale
4. **Performance Data**: % correct or national average
5. **Tags/Labels**: Free-form categorization
6. **Learning Objectives**: Educational goals

### Variable Implementations
- **Difficulty scales**: Binary (easy/hard), ternary (easy/med/hard), 1-5, or percentage-based
- **Subject granularity**: Single vs multiple subjects with weights
- **Cognitive frameworks**: Some use Bloom's taxonomy, others don't
- **Time tracking**: Tutor mode vs timed mode

---

## Design Implications for E.A.T. Tracker

### Requirements
1. **Flexible schema**: Support multiple Q-bank formats
2. **Backward compatibility**: Optional fields, graceful degradation
3. **NBME alignment**: Map external systems to our taxonomy
4. **Difficulty normalization**: Convert various scales to common format
5. **Performance benchmarking**: Enable comparison to national averages

### Proposed Schema Extensions
- `externalQuestionId`: Original Q-bank question ID
- `questionBank`: Source (uworld, amboss, nbme, etc.)
- `difficulty`: Normalized 1-5 scale
- `percentCorrect`: National average (0-100)
- `learningObjectives`: Array of educational goals
- `externalTags`: Original Q-bank tags
- `bloomsLevel`: Cognitive level classification
- `estimatedTime`: Expected completion time

### Migration Strategy
- All new fields optional
- Existing error logs unaffected
- Import validation with clear error messages
- Mapping guide for common Q-banks
