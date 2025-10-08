# Taxonomy Migration Plan

## Overview

Migrate from hardcoded organ systems to a comprehensive, official NBME/USMLE-aligned reference taxonomy supporting organ systems, disciplines, and competencies.

## Rationale

### Current Limitations
1. **Hardcoded organ systems** - Not extensible or maintainable
2. **No official alignment** - Simplified categories don't match NBME/USMLE structure
3. **Missing dimensions** - No support for disciplines or competencies
4. **No aliases** - Users must remember exact category names
5. **No exam differentiation** - Can't distinguish Step 1 vs Step 2 CK content

### Benefits of New Taxonomy
1. **Official NBME/USMLE alignment** - Based on 2025 content outlines
2. **Future-proof** - Structured for easy updates when content outlines change
3. **Multi-dimensional** - Supports organ systems, disciplines, AND competencies
4. **Flexible input** - Aliases allow natural language categorization
5. **Exam-aware** - Can filter by Step 1, Step 2 CK, or both
6. **Backward compatible** - Migration utilities preserve existing data

## Taxonomy Structure

### Three Core Dimensions

1. **Organ Systems** (20 categories)
   - Matches official USMLE organ system framework
   - Includes special categories (biostatistics, legal/ethical, etc.)
   - Each with multiple aliases for flexible matching

2. **Disciplines** (15 total)
   - **Basic Sciences** (10): Pathology, Physiology, Pharmacology, etc.
   - **Clinical** (5): Medicine, Surgery, Pediatrics, OB/GYN, Psychiatry

3. **Physician Competencies** (12 categories)
   - Medical Knowledge
   - Diagnosis, Prognosis, Treatment
   - Communication, Professionalism
   - Systems-based Practice, etc.

### Data Model

```typescript
interface TaxonomyCategory {
  id: string;                    // Stable identifier (e.g., "sys-cardiovascular")
  name: string;                  // Official name
  aliases: string[];             // Alternative names for flexible matching
  description?: string;          // Human-readable description
  examLevel?: 'step1' | 'step2ck' | 'both';  // Exam applicability
}
```

## Migration Strategy

### Phase 1: Taxonomy Foundation (Current)
- ✅ Research official NBME/USMLE content outlines
- ✅ Design taxonomy structure with IDs, names, aliases
- ✅ Create `lib/taxonomy.ts` with reference data
- ✅ Add lookup utilities and backward compatibility helpers

### Phase 2: Storage Layer Migration (Next)
- Add migration version tracking to localStorage
- Create migration utility to convert old `OrganSystem` strings to taxonomy IDs
- Update `storage.ts` to handle both old and new formats
- Preserve all existing error logs with converted system IDs

### Phase 3: UI & Type Updates (After)
- Update `types.ts` to use taxonomy IDs instead of hardcoded strings
- Modify Quick Log UI to use new taxonomy with autocomplete/search
- Add optional discipline and competency fields
- Update Insights to analyze by multiple dimensions

### Phase 4: Testing & Validation
- Unit tests for taxonomy lookup functions
- Migration tests ensuring data preservation
- Integration tests for UI components
- Manual testing of complete flow

## Backward Compatibility

### Existing Data Migration

All existing error logs use old organ system names. Migration function will:

```typescript
// Old format
{ system: "Cardiovascular" }

// New format
{ systemId: "sys-cardiovascular" }
```

The migration utility `migrateOldSystemName()` maps old names to new taxonomy IDs:

```typescript
'Cardiovascular' → 'sys-cardiovascular'
'Respiratory' → 'sys-respiratory'
// etc.
```

### Graceful Degradation

- Storage layer will detect unmigrated data and convert on-the-fly
- UI will continue to work with both old and new formats during transition
- No data loss - all existing logs preserved with accurate categorization

## Implementation Tasks

### Completed ✅
- [x] Research official NBME/USMLE taxonomies
- [x] Design taxonomy structure
- [x] Create `lib/taxonomy.ts` with full reference data

### In Progress 🚧
- [ ] Create migration utilities in `lib/migrations.ts`
- [ ] Update storage layer for backward compatibility
- [ ] Add migration version tracking

### Pending 📋
- [ ] Update type definitions in `lib/types.ts`
- [ ] Modify UI components to use new taxonomy
- [ ] Add unit tests for taxonomy functions
- [ ] Add migration tests
- [ ] Update documentation

## Testing Strategy

### Unit Tests
```typescript
describe('Taxonomy Lookups', () => {
  it('finds organ system by official name')
  it('finds organ system by alias')
  it('returns undefined for invalid name')
  it('filters by exam level correctly')
});

describe('Migration', () => {
  it('converts all old organ system names')
  it('preserves unmapped systems as-is with warning')
  it('migrates complete error log correctly')
});
```

### Integration Tests
- Test Quick Log with new taxonomy selectors
- Verify Insights calculates patterns correctly with new IDs
- Confirm Study Plan generation works with migrated data

## Rollout Plan

1. **Merge taxonomy foundation** (this PR)
   - Adds reference data without breaking changes
   - Introduces lookup utilities
   - Establishes migration strategy

2. **Storage migration** (follow-up PR)
   - Implements data migration
   - Updates storage layer
   - Adds tests

3. **UI updates** (follow-up PR)
   - New Quick Log with enhanced categorization
   - Multi-dimensional Insights views
   - Optional discipline/competency tracking

4. **Documentation** (ongoing)
   - Update README with new features
   - Add taxonomy usage guide
   - Document migration process

## Success Criteria

- ✅ All existing error logs migrate without data loss
- ✅ Taxonomy lookups work with official names and aliases
- ✅ UI accepts new categorization seamlessly
- ✅ Tests pass with >90% coverage
- ✅ Zero breaking changes for existing users
- ✅ Foundation ready for future enhancements (topics, subtopics, etc.)

## Future Enhancements

After taxonomy foundation is stable:

1. **Topic hierarchies** - Structured topics within each system
2. **Cross-references** - Link related topics across systems
3. **Learning resources** - Attach recommended resources to taxonomy nodes
4. **Custom taxonomies** - Allow users to add personal categories
5. **Analytics** - Multi-dimensional pattern analysis (system × discipline × competency)
