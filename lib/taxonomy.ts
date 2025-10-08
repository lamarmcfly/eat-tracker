// Official NBME/USMLE Taxonomy Reference Data
// Based on USMLE Step 1 & Step 2 CK Content Outlines (2025)

export interface TaxonomyCategory {
  id: string;
  name: string;
  aliases: string[];
  description?: string;
  parentId?: string;
  examLevel?: 'step1' | 'step2ck' | 'both';
}

export interface OrganSystemCategory extends TaxonomyCategory {
  type: 'organ-system';
}

export interface DisciplineCategory extends TaxonomyCategory {
  type: 'discipline';
  disciplineType: 'basic-science' | 'clinical';
}

export interface CompetencyCategory extends TaxonomyCategory {
  type: 'competency';
}

// ============================================================================
// ORGAN SYSTEMS
// ============================================================================

export const ORGAN_SYSTEMS: OrganSystemCategory[] = [
  {
    id: 'sys-human-dev',
    type: 'organ-system',
    name: 'Human Development',
    aliases: ['development', 'growth', 'pediatric development'],
    examLevel: 'both',
    description: 'Growth, development, and aging across the lifespan'
  },
  {
    id: 'sys-cardiovascular',
    type: 'organ-system',
    name: 'Cardiovascular System',
    aliases: ['cardiovascular', 'cardiac', 'heart', 'vascular', 'CV'],
    examLevel: 'both',
    description: 'Heart and blood vessel disorders'
  },
  {
    id: 'sys-respiratory',
    type: 'organ-system',
    name: 'Respiratory System',
    aliases: ['respiratory', 'pulmonary', 'lungs', 'resp'],
    examLevel: 'both',
    description: 'Lung and airway disorders'
  },
  {
    id: 'sys-gastrointestinal',
    type: 'organ-system',
    name: 'Gastrointestinal System',
    aliases: ['gastrointestinal', 'GI', 'digestive', 'GI tract', 'gut'],
    examLevel: 'both',
    description: 'Digestive system disorders'
  },
  {
    id: 'sys-renal-urinary',
    type: 'organ-system',
    name: 'Renal & Urinary System',
    aliases: ['renal', 'urinary', 'kidney', 'nephrology', 'genitourinary'],
    examLevel: 'both',
    description: 'Kidney and urinary tract disorders'
  },
  {
    id: 'sys-reproductive',
    type: 'organ-system',
    name: 'Reproductive System',
    aliases: ['reproductive', 'genital', 'sexual health'],
    examLevel: 'both',
    description: 'Male and female reproductive system disorders'
  },
  {
    id: 'sys-pregnancy',
    type: 'organ-system',
    name: 'Pregnancy, Childbirth & Puerperium',
    aliases: ['pregnancy', 'obstetrics', 'OB', 'childbirth', 'puerperium', 'maternal'],
    examLevel: 'step2ck',
    description: 'Pregnancy-related conditions and childbirth'
  },
  {
    id: 'sys-endocrine',
    type: 'organ-system',
    name: 'Endocrine System',
    aliases: ['endocrine', 'hormonal', 'metabolism', 'diabetes'],
    examLevel: 'both',
    description: 'Hormonal and metabolic disorders'
  },
  {
    id: 'sys-musculoskeletal',
    type: 'organ-system',
    name: 'Musculoskeletal System',
    aliases: ['musculoskeletal', 'MSK', 'orthopedic', 'bone', 'joint', 'muscle'],
    examLevel: 'both',
    description: 'Bone, joint, and muscle disorders'
  },
  {
    id: 'sys-skin',
    type: 'organ-system',
    name: 'Skin & Subcutaneous Tissue',
    aliases: ['skin', 'dermatology', 'derm', 'integumentary', 'subcutaneous'],
    examLevel: 'both',
    description: 'Skin and soft tissue disorders'
  },
  {
    id: 'sys-nervous',
    type: 'organ-system',
    name: 'Nervous System & Special Senses',
    aliases: ['nervous system', 'neurological', 'neuro', 'CNS', 'PNS', 'special senses', 'eyes', 'ears'],
    examLevel: 'both',
    description: 'Neurological disorders and sensory organ conditions'
  },
  {
    id: 'sys-behavioral',
    type: 'organ-system',
    name: 'Behavioral Health',
    aliases: ['behavioral health', 'psychiatry', 'psych', 'mental health', 'psychology'],
    examLevel: 'both',
    description: 'Mental health and behavioral disorders'
  },
  {
    id: 'sys-blood-lymph',
    type: 'organ-system',
    name: 'Blood & Lymphoreticular System',
    aliases: ['hematology', 'blood', 'lymphatic', 'heme', 'lymphoreticular'],
    examLevel: 'both',
    description: 'Blood and lymphatic system disorders'
  },
  {
    id: 'sys-immune',
    type: 'organ-system',
    name: 'Immune System',
    aliases: ['immune system', 'immunology', 'autoimmune', 'allergy'],
    examLevel: 'both',
    description: 'Immune system disorders and immunodeficiency'
  },
  {
    id: 'sys-multisystem',
    type: 'organ-system',
    name: 'Multisystem Processes & Disorders',
    aliases: ['multisystem', 'systemic', 'general principles'],
    examLevel: 'both',
    description: 'Conditions affecting multiple organ systems'
  },
  {
    id: 'sys-biostat-epi',
    type: 'organ-system',
    name: 'Biostatistics & Epidemiology/Population Health',
    aliases: ['biostatistics', 'epidemiology', 'population health', 'public health', 'stats'],
    examLevel: 'both',
    description: 'Study design, statistics, and population-level health'
  },
  {
    id: 'sys-social-sci',
    type: 'organ-system',
    name: 'Social Sciences',
    aliases: ['social sciences', 'communication', 'interpersonal'],
    examLevel: 'both',
    description: 'Communication and social aspects of medicine'
  },
  {
    id: 'sys-legal-ethical',
    type: 'organ-system',
    name: 'Legal & Ethical Issues',
    aliases: ['legal', 'ethical', 'ethics', 'law', 'medical law'],
    examLevel: 'step2ck',
    description: 'Legal and ethical aspects of medical practice'
  },
  {
    id: 'sys-professionalism',
    type: 'organ-system',
    name: 'Professionalism',
    aliases: ['professionalism', 'professional conduct'],
    examLevel: 'step2ck',
    description: 'Professional behavior and conduct'
  },
  {
    id: 'sys-systems-practice',
    type: 'organ-system',
    name: 'Systems-based Practice & Patient Safety',
    aliases: ['systems-based practice', 'patient safety', 'quality improvement', 'QI'],
    examLevel: 'step2ck',
    description: 'Healthcare systems and patient safety'
  },
];

// ============================================================================
// DISCIPLINES
// ============================================================================

export const DISCIPLINES: DisciplineCategory[] = [
  // Basic Science Disciplines (Step 1)
  {
    id: 'disc-pathology',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Pathology',
    aliases: ['pathology', 'path'],
    examLevel: 'step1',
    description: 'Study of disease processes'
  },
  {
    id: 'disc-physiology',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Physiology',
    aliases: ['physiology', 'physio'],
    examLevel: 'step1',
    description: 'Normal function of organ systems'
  },
  {
    id: 'disc-pharmacology',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Pharmacology',
    aliases: ['pharmacology', 'pharm', 'drugs', 'medications'],
    examLevel: 'step1',
    description: 'Drug mechanisms and therapeutics'
  },
  {
    id: 'disc-biochemistry',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Biochemistry & Nutrition',
    aliases: ['biochemistry', 'biochem', 'nutrition', 'metabolism'],
    examLevel: 'step1',
    description: 'Molecular biology and nutritional science'
  },
  {
    id: 'disc-microbiology',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Microbiology',
    aliases: ['microbiology', 'micro', 'bacteria', 'viruses', 'fungi', 'parasites'],
    examLevel: 'step1',
    description: 'Study of microorganisms and infectious diseases'
  },
  {
    id: 'disc-immunology',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Immunology',
    aliases: ['immunology', 'immune'],
    examLevel: 'step1',
    description: 'Immune system function and disorders'
  },
  {
    id: 'disc-anatomy',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Gross Anatomy & Embryology',
    aliases: ['anatomy', 'embryology', 'gross anatomy'],
    examLevel: 'step1',
    description: 'Macroscopic structure and development'
  },
  {
    id: 'disc-histology',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Histology & Cell Biology',
    aliases: ['histology', 'cell biology', 'microscopic anatomy'],
    examLevel: 'step1',
    description: 'Microscopic structure and cellular function'
  },
  {
    id: 'disc-behavioral-sci',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Behavioral Sciences',
    aliases: ['behavioral sciences', 'psychology', 'psychiatry basics'],
    examLevel: 'step1',
    description: 'Human behavior and psychological principles'
  },
  {
    id: 'disc-genetics',
    type: 'discipline',
    disciplineType: 'basic-science',
    name: 'Genetics',
    aliases: ['genetics', 'genomics', 'heredity'],
    examLevel: 'step1',
    description: 'Heredity and genetic disorders'
  },

  // Clinical Disciplines (Step 2 CK)
  {
    id: 'disc-medicine',
    type: 'discipline',
    disciplineType: 'clinical',
    name: 'Internal Medicine',
    aliases: ['medicine', 'internal medicine', 'IM'],
    examLevel: 'step2ck',
    description: 'Adult general medical care'
  },
  {
    id: 'disc-surgery',
    type: 'discipline',
    disciplineType: 'clinical',
    name: 'Surgery',
    aliases: ['surgery', 'surgical'],
    examLevel: 'step2ck',
    description: 'Surgical conditions and interventions'
  },
  {
    id: 'disc-pediatrics',
    type: 'discipline',
    disciplineType: 'clinical',
    name: 'Pediatrics',
    aliases: ['pediatrics', 'peds', 'children'],
    examLevel: 'step2ck',
    description: 'Medical care of infants, children, and adolescents'
  },
  {
    id: 'disc-obgyn',
    type: 'discipline',
    disciplineType: 'clinical',
    name: 'Obstetrics & Gynecology',
    aliases: ['obstetrics', 'gynecology', 'OB/GYN', 'OB-GYN', 'womens health'],
    examLevel: 'step2ck',
    description: 'Womens reproductive health and pregnancy care'
  },
  {
    id: 'disc-psychiatry',
    type: 'discipline',
    disciplineType: 'clinical',
    name: 'Psychiatry',
    aliases: ['psychiatry', 'psych', 'mental health'],
    examLevel: 'step2ck',
    description: 'Mental health and psychiatric disorders'
  },
];

// ============================================================================
// PHYSICIAN COMPETENCIES
// ============================================================================

export const COMPETENCIES: CompetencyCategory[] = [
  {
    id: 'comp-medical-knowledge',
    type: 'competency',
    name: 'Medical Knowledge',
    aliases: ['medical knowledge', 'foundational science'],
    examLevel: 'both',
    description: 'Applying basic and clinical science concepts'
  },
  {
    id: 'comp-diagnosis',
    type: 'competency',
    name: 'Patient Care: Diagnosis',
    aliases: ['diagnosis', 'diagnostic reasoning', 'history', 'physical exam'],
    examLevel: 'both',
    description: 'Gathering information and formulating diagnoses'
  },
  {
    id: 'comp-lab-studies',
    type: 'competency',
    name: 'Laboratory & Diagnostic Studies',
    aliases: ['laboratory studies', 'diagnostic studies', 'labs', 'imaging'],
    examLevel: 'step2ck',
    description: 'Ordering and interpreting diagnostic tests'
  },
  {
    id: 'comp-prognosis',
    type: 'competency',
    name: 'Prognosis & Outcome',
    aliases: ['prognosis', 'outcome', 'disease course'],
    examLevel: 'step2ck',
    description: 'Predicting disease course and outcomes'
  },
  {
    id: 'comp-prevention',
    type: 'competency',
    name: 'Health Maintenance & Disease Prevention',
    aliases: ['prevention', 'health maintenance', 'screening', 'prophylaxis'],
    examLevel: 'step2ck',
    description: 'Preventive care and health promotion'
  },
  {
    id: 'comp-pharmacotherapy',
    type: 'competency',
    name: 'Pharmacotherapy',
    aliases: ['pharmacotherapy', 'medication management', 'prescribing'],
    examLevel: 'step2ck',
    description: 'Selecting and managing drug therapy'
  },
  {
    id: 'comp-interventions',
    type: 'competency',
    name: 'Clinical Interventions',
    aliases: ['clinical interventions', 'procedures', 'treatments'],
    examLevel: 'step2ck',
    description: 'Performing clinical procedures and interventions'
  },
  {
    id: 'comp-management',
    type: 'competency',
    name: 'Mixed Management',
    aliases: ['management', 'patient management', 'clinical management'],
    examLevel: 'step2ck',
    description: 'Comprehensive patient care and management'
  },
  {
    id: 'comp-communication',
    type: 'competency',
    name: 'Communication & Interpersonal Skills',
    aliases: ['communication', 'interpersonal skills', 'patient counseling'],
    examLevel: 'both',
    description: 'Effective communication with patients and teams'
  },
  {
    id: 'comp-pbli',
    type: 'competency',
    name: 'Practice-based Learning & Improvement',
    aliases: ['PBLI', 'practice-based learning', 'self-improvement', 'continuous learning'],
    examLevel: 'both',
    description: 'Self-assessment and continuous improvement'
  },
  {
    id: 'comp-professionalism',
    type: 'competency',
    name: 'Professionalism',
    aliases: ['professionalism', 'professional conduct', 'ethics'],
    examLevel: 'both',
    description: 'Professional and ethical behavior'
  },
  {
    id: 'comp-systems-practice',
    type: 'competency',
    name: 'Systems-based Practice & Patient Safety',
    aliases: ['systems-based practice', 'patient safety', 'healthcare systems'],
    examLevel: 'both',
    description: 'Understanding healthcare systems and ensuring safety'
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function findOrganSystemByName(name: string): OrganSystemCategory | undefined {
  const normalized = name.toLowerCase().trim();
  return ORGAN_SYSTEMS.find(
    sys =>
      sys.name.toLowerCase() === normalized ||
      sys.aliases.some(alias => alias.toLowerCase() === normalized)
  );
}

export function findDisciplineByName(name: string): DisciplineCategory | undefined {
  const normalized = name.toLowerCase().trim();
  return DISCIPLINES.find(
    disc =>
      disc.name.toLowerCase() === normalized ||
      disc.aliases.some(alias => alias.toLowerCase() === normalized)
  );
}

export function findCompetencyByName(name: string): CompetencyCategory | undefined {
  const normalized = name.toLowerCase().trim();
  return COMPETENCIES.find(
    comp =>
      comp.name.toLowerCase() === normalized ||
      comp.aliases.some(alias => alias.toLowerCase() === normalized)
  );
}

export function getOrganSystemsForExam(examLevel: 'step1' | 'step2ck' | 'both'): OrganSystemCategory[] {
  return ORGAN_SYSTEMS.filter(sys => sys.examLevel === examLevel || sys.examLevel === 'both');
}

export function getDisciplinesForExam(examLevel: 'step1' | 'step2ck'): DisciplineCategory[] {
  return DISCIPLINES.filter(disc => disc.examLevel === examLevel);
}

// Backward compatibility: map old system names to new taxonomy
export function migrateOldSystemName(oldName: string): string | null {
  const mapping: Record<string, string> = {
    'Cardiovascular': 'sys-cardiovascular',
    'Respiratory': 'sys-respiratory',
    'Gastrointestinal': 'sys-gastrointestinal',
    'Renal/Urinary': 'sys-renal-urinary',
    'Reproductive': 'sys-reproductive',
    'Endocrine': 'sys-endocrine',
    'Musculoskeletal': 'sys-musculoskeletal',
    'Skin/Connective Tissue': 'sys-skin',
    'Nervous System/Special Senses': 'sys-nervous',
    'Hematologic/Lymphatic': 'sys-blood-lymph',
    'Immune': 'sys-immune',
    'Behavioral Science': 'sys-behavioral',
    'Multisystem/General Principles': 'sys-multisystem',
  };

  return mapping[oldName] || null;
}
