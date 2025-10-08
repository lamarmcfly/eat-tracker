import { describe, it, expect } from 'vitest';
import {
  ORGAN_SYSTEMS,
  DISCIPLINES,
  COMPETENCIES,
  findOrganSystemByName,
  findDisciplineByName,
  findCompetencyByName,
  getOrganSystemsForExam,
  getDisciplinesForExam,
  migrateOldSystemName,
} from './taxonomy';

describe('Taxonomy - Organ Systems', () => {
  it('should have 20 organ systems', () => {
    expect(ORGAN_SYSTEMS).toHaveLength(20);
  });

  it('should find organ system by official name', () => {
    const system = findOrganSystemByName('Cardiovascular System');
    expect(system).toBeDefined();
    expect(system?.id).toBe('sys-cardiovascular');
  });

  it('should find organ system by alias (case-insensitive)', () => {
    const system = findOrganSystemByName('cardiac');
    expect(system).toBeDefined();
    expect(system?.id).toBe('sys-cardiovascular');
  });

  it('should find organ system by abbreviation', () => {
    const system = findOrganSystemByName('CV');
    expect(system).toBeDefined();
    expect(system?.id).toBe('sys-cardiovascular');
  });

  it('should return undefined for invalid name', () => {
    const system = findOrganSystemByName('NonExistentSystem');
    expect(system).toBeUndefined();
  });

  it('should filter organ systems by exam level (step1)', () => {
    const step1Systems = getOrganSystemsForExam('step1');
    expect(step1Systems.length).toBeGreaterThan(0);
    expect(step1Systems.every(s => s.examLevel === 'step1' || s.examLevel === 'both')).toBe(true);
  });

  it('should filter organ systems by exam level (step2ck)', () => {
    const step2Systems = getOrganSystemsForExam('step2ck');
    expect(step2Systems.length).toBeGreaterThan(0);
    expect(step2Systems.every(s => s.examLevel === 'step2ck' || s.examLevel === 'both')).toBe(true);
  });

  it('should include Step 2 CK specific systems', () => {
    const pregnancy = findOrganSystemByName('Pregnancy');
    expect(pregnancy).toBeDefined();
    expect(pregnancy?.examLevel).toBe('step2ck');
  });
});

describe('Taxonomy - Disciplines', () => {
  it('should have 15 disciplines (10 basic + 5 clinical)', () => {
    expect(DISCIPLINES).toHaveLength(15);
  });

  it('should find discipline by official name', () => {
    const discipline = findDisciplineByName('Pathology');
    expect(discipline).toBeDefined();
    expect(discipline?.id).toBe('disc-pathology');
  });

  it('should find discipline by alias', () => {
    const discipline = findDisciplineByName('pharm');
    expect(discipline).toBeDefined();
    expect(discipline?.id).toBe('disc-pharmacology');
  });

  it('should distinguish basic science from clinical disciplines', () => {
    const pathology = findDisciplineByName('Pathology');
    const medicine = findDisciplineByName('Internal Medicine');

    expect(pathology?.disciplineType).toBe('basic-science');
    expect(medicine?.disciplineType).toBe('clinical');
  });

  it('should filter disciplines by exam level', () => {
    const step1Disciplines = getDisciplinesForExam('step1');
    const step2Disciplines = getDisciplinesForExam('step2ck');

    expect(step1Disciplines.every(d => d.disciplineType === 'basic-science')).toBe(true);
    expect(step2Disciplines.every(d => d.disciplineType === 'clinical')).toBe(true);
  });

  it('should have correct count by discipline type', () => {
    const basicScience = DISCIPLINES.filter(d => d.disciplineType === 'basic-science');
    const clinical = DISCIPLINES.filter(d => d.disciplineType === 'clinical');

    expect(basicScience).toHaveLength(10);
    expect(clinical).toHaveLength(5);
  });
});

describe('Taxonomy - Competencies', () => {
  it('should have 12 physician competencies', () => {
    expect(COMPETENCIES).toHaveLength(12);
  });

  it('should find competency by official name', () => {
    const competency = findCompetencyByName('Medical Knowledge');
    expect(competency).toBeDefined();
    expect(competency?.id).toBe('comp-medical-knowledge');
  });

  it('should find competency by alias', () => {
    const competency = findCompetencyByName('diagnosis');
    expect(competency).toBeDefined();
    expect(competency?.id).toBe('comp-diagnosis');
  });

  it('should include core competencies', () => {
    const medicalKnowledge = findCompetencyByName('Medical Knowledge');
    const diagnosis = findCompetencyByName('Diagnosis');
    const communication = findCompetencyByName('Communication');

    expect(medicalKnowledge).toBeDefined();
    expect(diagnosis).toBeDefined();
    expect(communication).toBeDefined();
  });

  it('should mark competencies for appropriate exam levels', () => {
    const diagnosis = findCompetencyByName('Diagnosis');
    expect(diagnosis?.examLevel).toBe('both');

    const labStudies = findCompetencyByName('Laboratory Studies');
    expect(labStudies?.examLevel).toBe('step2ck');
  });
});

describe('Taxonomy - Migration Utilities', () => {
  it('should migrate all old organ system names', () => {
    const oldSystems = [
      'Cardiovascular',
      'Respiratory',
      'Gastrointestinal',
      'Renal/Urinary',
      'Reproductive',
      'Endocrine',
      'Musculoskeletal',
      'Skin/Connective Tissue',
      'Nervous System/Special Senses',
      'Hematologic/Lymphatic',
      'Immune',
      'Behavioral Science',
      'Multisystem/General Principles',
    ];

    oldSystems.forEach(oldName => {
      const newId = migrateOldSystemName(oldName);
      expect(newId).toBeDefined();
      expect(newId).toMatch(/^sys-/);
    });
  });

  it('should return null for unmapped old system names', () => {
    const result = migrateOldSystemName('Unknown System');
    expect(result).toBeNull();
  });

  it('should migrate to correct taxonomy IDs', () => {
    expect(migrateOldSystemName('Cardiovascular')).toBe('sys-cardiovascular');
    expect(migrateOldSystemName('Respiratory')).toBe('sys-respiratory');
    expect(migrateOldSystemName('Behavioral Science')).toBe('sys-behavioral');
  });
});

describe('Taxonomy - Data Integrity', () => {
  it('should have unique IDs across all organ systems', () => {
    const ids = ORGAN_SYSTEMS.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have unique IDs across all disciplines', () => {
    const ids = DISCIPLINES.map(d => d.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have unique IDs across all competencies', () => {
    const ids = COMPETENCIES.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have at least one alias for each category', () => {
    const allCategories = [...ORGAN_SYSTEMS, ...DISCIPLINES, ...COMPETENCIES];
    allCategories.forEach(cat => {
      expect(cat.aliases.length).toBeGreaterThan(0);
    });
  });

  it('should have valid exam levels', () => {
    const validLevels = ['step1', 'step2ck', 'both'];
    const allCategories = [...ORGAN_SYSTEMS, ...DISCIPLINES, ...COMPETENCIES];

    allCategories.forEach(cat => {
      if (cat.examLevel) {
        expect(validLevels).toContain(cat.examLevel);
      }
    });
  });
});
