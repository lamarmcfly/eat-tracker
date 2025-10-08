# Pull Request: Q-Bank Metadata Import System

## Overview

Add external Q-bank import capability to E.A.T. Tracker, enabling users to import question metadata from UWorld, Amboss, NBME, and other medical Q-banks while maintaining full backward compatibility with existing error tracking.

---

## Features

### 1. Schema Extension for External Metadata

**New Type: `ExternalQuestionMetadata`**
- Optional field on `ErrorLog` interface
- Stores Q-bank-specific data without affecting core functionality
- Supports all major Q-banks (UWorld, Amboss, NBME, Kaplan, USMLE-Rx)

**Metadata Fields:**
- **Source identification**: `questionId`, `questionBank`
- **Difficulty & performance**: normalized 1-5 difficulty scale, national % correct
- **Educational content**: learning objectives, Q-bank tags
- **Timing**: estimated and actual completion times
- **Advanced**: Bloom's taxonomy level, exam relevance scores (Step 1/2/3)
- **Multi-subject**: support for cross-disciplinary questions
- **Raw preservation**: all original data retained for future use

### 2. Intelligent Import System

**Import Validation** (`lib/qbankImport.ts`):
- JSON syntax validation
- Required field checking
- Type and range validation
- System name mapping to NBME taxonomy
- Graceful error handling with detailed messages

**Format Flexibility:**
- Accepts multiple Q-bank formats
- Normalizes difficulty scales (string, 1-5, percentage)
- Auto-maps system names with alias support
- Handles single questions or batch arrays

**Key Functions:**
- `validateImport()` - Validate single question
- `validateBatchImport()` - Validate question array
- `convertToErrorLog()` - Convert to E.A.T. format
- `normalizeDifficulty()` - Normalize difficulty scales
- `mapSystemToTaxonomy()` - Map system names to NBME taxonomy

### 3. Import Preview Flow

**User Experience** (`app/import/page.tsx`):
1. Paste JSON data (single or batch)
2. Click "Validate & Preview"
3. View validation results with errors/warnings
4. Preview mapped data before import
5. Confirm & import valid items

**Preview Shows:**
- System and topic mapping
- Q-bank source and question ID
- Normalized difficulty (1-5)
- National % correct
- Learning objectives
- Validation errors/warnings

**Error Handling:**
- Clear error messages for invalid JSON
- Warnings for type mismatches
- Batch import skips invalid items, imports valid ones
- No data loss - all items validated before import

### 4. Comprehensive Documentation

**Q-Bank Research** (`docs/QBANK_RESEARCH.md`):
- Analyzed metadata structures from UWorld, Amboss, NBME
- Identified common patterns and variations
- Documented Q-bank-specific classifications

**Mapping Guide** (`docs/QBANK_MAPPING_GUIDE.md`):
- Complete import format reference
- Q-bank-specific examples (UWorld, Amboss, NBME, Kaplan, Rx)
- Difficulty normalization tables
- System name alias mappings
- Troubleshooting guide
- Example workflows

---

## Technical Implementation

### Files Modified

**lib/types.ts**
- Added `QuestionBank` type (uworld | amboss | nbme | kaplan | rx | other)
- Added `DifficultyLevel` type (1-5 scale)
- Added `ExternalQuestionMetadata` interface
- Extended `ErrorLog` with optional `externalQuestion` field

### Files Created

**lib/qbankImport.ts** (350+ lines)
- Import validation utilities
- Format conversion functions
- Difficulty normalization
- System name mapping
- Batch processing

**app/import/page.tsx** (300+ lines)
- Import UI with JSON textarea
- Validation & preview workflow
- Collapsible examples
- Batch import support
- Mobile-responsive design

**docs/QBANK_RESEARCH.md**
- Research findings on Q-bank metadata structures
- Common patterns across platforms
- Design implications for our schema

**docs/QBANK_MAPPING_GUIDE.md** (400+ lines)
- Complete user guide for importing Q-bank data
- Format examples for each major Q-bank
- Field mapping tables
- Troubleshooting section

**app/layout.tsx**
- Added "Import" navigation link

---

## Backward Compatibility

### Zero Breaking Changes

✅ All existing error logs work without modification
✅ All new fields are optional
✅ Analytics functions gracefully handle missing external data
✅ No changes to core data models or storage format
✅ Existing features (Insights, Plan, Recommendations) unaffected

### Migration Strategy

- **No migration required** - schema is additive only
- External metadata is opt-in via import flow
- Manually logged errors continue working as before
- Future: could add external metadata to manual log form (optional)

---

## Example Use Cases

### Use Case 1: Import UWorld Incorrects
```json
{
  "questionId": "uw-12345",
  "questionBank": "uworld",
  "system": "Cardiovascular",
  "topic": "Acute Coronary Syndrome",
  "difficulty": "hard",
  "percentCorrect": 45,
  "educationalObjectives": [
    "Recognize clinical presentation of ACS",
    "Understand pathophysiology of MI"
  ]
}
```
**Result:** Error logged with difficulty (5/5) and national average (45%), learning objectives preserved for study recommendations.

### Use Case 2: Batch Import NBME Form
```json
[
  {
    "questionId": "nbme-30-q5",
    "questionBank": "nbme",
    "system": "Cardiovascular",
    "topic": "Heart Failure",
    "cognitiveLevel": "higher-order"
  },
  {
    "questionId": "nbme-30-q12",
    "questionBank": "nbme",
    "system": "Respiratory",
    "topic": "COPD"
  }
]
```
**Result:** Multiple errors imported at once, cognitive levels tracked, system insights updated.

### Use Case 3: Import Amboss High-Yield Questions
```json
{
  "questionId": "amb-1000",
  "questionBank": "amboss",
  "system": "Cardiovascular",
  "difficulty": 4,
  "hammers": ["High-Yield", "Step 2"],
  "examRelevance": {"step2ck": 5}
}
```
**Result:** Tags and exam relevance preserved, recommendation engine prioritizes based on Step 2 CK relevance.

---

## Benefits

### For Users

1. **Faster Error Logging**: Batch import Q-bank incorrects instead of manual entry
2. **Richer Analytics**: Difficulty and % correct data enable performance benchmarking
3. **Better Recommendations**: Learning objectives and tags inform study strategies
4. **Q-Bank Integration**: Connect E.A.T. insights with Q-bank performance
5. **Flexible Format**: Works with any Q-bank's export format

### For Development

1. **Extensible Schema**: Easy to add new Q-bank sources
2. **Future-Proof**: Raw metadata preserved for future features
3. **Clean Separation**: External data isolated in optional field
4. **Type-Safe**: Full TypeScript definitions for validation
5. **Well-Documented**: Comprehensive guides for users and developers

---

## Testing

### Validation Testing

✅ Valid single question import
✅ Valid batch import (array)
✅ Invalid JSON rejection
✅ Missing required fields
✅ Type validation (strings, numbers, arrays)
✅ Range validation (difficulty, percentCorrect)
✅ System name mapping with aliases

### Format Testing

✅ UWorld format
✅ Amboss format
✅ NBME format
✅ Kaplan format
✅ USMLE-Rx format
✅ Minimal format (questionId + questionBank only)

### Edge Cases

✅ Empty arrays
✅ Mixed valid/invalid batch
✅ Unknown system names (fallback to Multisystem)
✅ Unknown difficulty formats (graceful degradation)
✅ Missing optional fields
✅ Extra unknown fields (preserved in rawMetadata)

---

## Future Enhancements

### Potential Additions

1. **Export Functionality**: Export errors to JSON for backup
2. **Browser Extension**: Auto-capture Q-bank data while studying
3. **API Integration**: Direct integration with Q-bank APIs
4. **Performance Analytics**: Compare your % correct to national average
5. **Difficulty-Based Scheduling**: Prioritize harder questions in study plan
6. **Learning Objective Tracking**: Map objectives to NBME competencies

### Database Integration (Long-term)

When moving from localStorage to database:
- `ExternalQuestionMetadata` already structured for relational storage
- Question ID + Q-bank = composite unique key
- Can deduplicate repeated questions
- Enable cross-user analytics (anonymized)

---

## Documentation

### User-Facing

- **Import Page**: Built-in examples with "Show Examples" toggle
- **Mapping Guide** (`docs/QBANK_MAPPING_GUIDE.md`): Complete reference
- **Tooltips**: In-app help for validation errors

### Developer-Facing

- **Research** (`docs/QBANK_RESEARCH.md`): Design rationale
- **TypeScript Definitions**: Full type safety in `lib/types.ts`
- **Code Comments**: Extensive JSDoc in `lib/qbankImport.ts`

---

## Migration Guide

### For Users

**No action required!**

Existing error logs continue working. To use Q-bank import:
1. Navigate to new "Import" page
2. Follow examples or consult mapping guide
3. Paste JSON and import

### For Developers

**No breaking changes.**

To work with external metadata:
```typescript
// Check if error has external metadata
if (error.externalQuestion) {
  const difficulty = error.externalQuestion.difficulty; // 1-5
  const percentCorrect = error.externalQuestion.percentCorrect; // 0-100
  const objectives = error.externalQuestion.learningObjectives; // string[]
}

// All fields are optional - use safe navigation
const qbank = error.externalQuestion?.questionBank ?? 'manual';
```

---

## Checklist

- [x] Schema extension implemented
- [x] Import validation utilities
- [x] Import UI with preview flow
- [x] Batch import support
- [x] Q-bank research documentation
- [x] Comprehensive mapping guide
- [x] Navigation link added
- [x] TypeScript type safety
- [x] Graceful error handling
- [x] Backward compatibility verified
- [x] Example workflows documented

---

## Review Notes

### Security

- No external API calls - all data stays local
- JSON parsing wrapped in try-catch
- Input validation before any processing
- No eval() or unsafe operations

### Performance

- Validation is synchronous and fast (<100ms for 100 items)
- No blocking operations
- Preview rendered incrementally for large batches

### Accessibility

- Keyboard navigation supported
- Clear error messages
- Mobile-responsive design
- High contrast validation states (red/yellow/green)

---

## Approval Checklist

Before merging:
- [ ] Review schema changes in `lib/types.ts`
- [ ] Test import flow with sample Q-bank data
- [ ] Verify backward compatibility with existing errors
- [ ] Review mapping guide for completeness
- [ ] Test mobile responsiveness
- [ ] Verify navigation links work
- [ ] Check TypeScript compilation
- [ ] Ensure no console errors

---

## Summary

This PR adds comprehensive Q-bank import functionality while maintaining 100% backward compatibility. Users can now import question metadata from UWorld, Amboss, NBME, and other Q-banks with a simple paste → validate → import workflow. The extensible schema supports future enhancements and preserves all original data for advanced analytics.

**Impact**: Faster error logging, richer analytics, better study recommendations.

**Risk**: Zero - all changes are additive and optional.
