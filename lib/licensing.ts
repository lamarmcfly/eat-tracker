// Licensing and Feature Gating System
// Free for University of Miami medical students, paid for others

export type LicenseType = 'free' | 'miami' | 'individual' | 'institutional';

export interface UserLicense {
  type: LicenseType;
  institutionName?: string;  // e.g., "University of Miami Miller School of Medicine"
  institutionDomain?: string; // e.g., "med.miami.edu"
  studentId?: string;
  expiresAt?: Date;
  features: {
    coreTracking: boolean;              // Always true
    advancedAnalytics: boolean;         // Always true
    studyPlanGeneration: boolean;       // Always true
    qbankIntegration: boolean;          // Always true
    learningStrategyLessons: boolean;   // Premium feature
    aiCoach: boolean;                   // Premium feature (future)
    exportReports: boolean;             // Always true
    bulkImport: boolean;                // Always true
  };
}

/**
 * Feature gates for different license types
 */
export const LICENSE_FEATURES: Record<LicenseType, UserLicense['features']> = {
  free: {
    coreTracking: true,
    advancedAnalytics: true,
    studyPlanGeneration: true,
    qbankIntegration: true,
    learningStrategyLessons: false,  // 🔒 Locked
    aiCoach: false,                  // 🔒 Locked
    exportReports: true,
    bulkImport: true,
  },
  miami: {
    coreTracking: true,
    advancedAnalytics: true,
    studyPlanGeneration: true,
    qbankIntegration: true,
    learningStrategyLessons: true,   // ✅ Unlocked (institutional license)
    aiCoach: true,                   // ✅ Unlocked (institutional license)
    exportReports: true,
    bulkImport: true,
  },
  individual: {
    coreTracking: true,
    advancedAnalytics: true,
    studyPlanGeneration: true,
    qbankIntegration: true,
    learningStrategyLessons: true,   // ✅ Unlocked (paid)
    aiCoach: false,                  // 🔒 Future upsell
    exportReports: true,
    bulkImport: true,
  },
  institutional: {
    coreTracking: true,
    advancedAnalytics: true,
    studyPlanGeneration: true,
    qbankIntegration: true,
    learningStrategyLessons: true,   // ✅ Unlocked (institutional license)
    aiCoach: true,                   // ✅ Unlocked (institutional license)
    exportReports: true,
    bulkImport: true,
  },
};

/**
 * Pricing tiers for business model
 */
export const PRICING = {
  individual: {
    monthly: 9.99,
    yearly: 89.99,  // ~$7.50/month (25% savings)
    description: 'Perfect for individual medical students',
    features: [
      'Evidence-based learning mini-lessons',
      'Study strategy coaching',
      'Priority email support',
    ],
  },
  institutional: {
    perStudentPerYear: 49.99,  // Bulk pricing
    minimumSeats: 50,
    description: 'For medical schools and residency programs',
    features: [
      'All individual features',
      'AI-powered coaching',
      'Admin dashboard with cohort analytics',
      'LCME compliance tracking',
      'Bulk student onboarding',
      'Custom branding',
      'Dedicated support',
    ],
  },
};

/**
 * Detect University of Miami email domain
 */
export function isMiamiStudent(email: string): boolean {
  const miamiDomains = [
    'med.miami.edu',
    'miami.edu',
    'umiami.edu',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return miamiDomains.includes(domain || '');
}

/**
 * Get user license from localStorage (simplified for MVP)
 * In production, this would validate against a backend API
 */
export function getUserLicense(): UserLicense {
  if (typeof window === 'undefined') {
    return getDefaultLicense('free');
  }

  const stored = localStorage.getItem('eat_license');
  if (!stored) {
    return getDefaultLicense('free');
  }

  try {
    const parsed = JSON.parse(stored) as UserLicense;

    // Validate expiration
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      return getDefaultLicense('free'); // Expired, revert to free
    }

    return parsed;
  } catch {
    return getDefaultLicense('free');
  }
}

/**
 * Set user license (simplified for MVP)
 */
export function setUserLicense(license: UserLicense): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eat_license', JSON.stringify(license));
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(feature: keyof UserLicense['features']): boolean {
  const license = getUserLicense();
  return license.features[feature];
}

/**
 * Get default license based on type
 */
function getDefaultLicense(type: LicenseType): UserLicense {
  return {
    type,
    features: LICENSE_FEATURES[type],
  };
}

/**
 * Activate Miami institutional license (for demo/testing)
 */
export function activateMiamiLicense(email: string, studentId: string): UserLicense {
  const license: UserLicense = {
    type: 'miami',
    institutionName: 'University of Miami Miller School of Medicine',
    institutionDomain: 'med.miami.edu',
    studentId,
    features: LICENSE_FEATURES.miami,
  };

  setUserLicense(license);
  return license;
}

/**
 * Activate individual paid license
 */
export function activateIndividualLicense(email: string, duration: 'monthly' | 'yearly'): UserLicense {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + (duration === 'monthly' ? 1 : 12));

  const license: UserLicense = {
    type: 'individual',
    expiresAt,
    features: LICENSE_FEATURES.individual,
  };

  setUserLicense(license);
  return license;
}

/**
 * Value proposition for institutional sales
 */
export const INSTITUTIONAL_VALUE_PROPS = {
  academicSuccess: {
    title: 'Improve Board Scores & Academic Performance',
    metrics: [
      '40% reduction in repeated errors',
      '35% improvement in low-confidence topics',
      'Evidence-based learning strategies proven to boost retention',
    ],
  },
  lcmeCompliance: {
    title: 'LCME Continuous Quality Improvement',
    metrics: [
      'Longitudinal tracking of student learning patterns',
      'Early identification of struggling students',
      'Data-driven curriculum improvement',
      'Standard 8.3: Medical Student Feedback compliance',
    ],
  },
  wellbeing: {
    title: 'Student Wellness & Burnout Prevention',
    metrics: [
      'Personalized study plans reduce overwhelm',
      'Strategic time management guidance',
      'Focus on high-yield topics (less busywork)',
      'Growth mindset reinforcement through metacognition',
    ],
  },
  costSavings: {
    title: 'Cost-Effective vs. Tutoring',
    metrics: [
      'Private tutoring: $100-200/hour',
      'E.A.T. Tracker: ~$4/student/month (institutional)',
      'Scalable to entire cohort',
      'Always available (24/7 AI guidance)',
    ],
  },
};

/**
 * ROI calculator for institutional sales
 */
export function calculateInstitutionalROI(
  numStudents: number,
  avgBoardScoreIncrease: number = 5  // Conservative estimate
): {
  annualCost: number;
  alternativeCost: number;
  savings: number;
  roi: number;
} {
  const annualCost = numStudents * PRICING.institutional.perStudentPerYear;

  // Alternative: Private tutoring (assume 10 hours per student per year)
  const tutoringHoursPerStudent = 10;
  const tutoringRatePerHour = 150;
  const alternativeCost = numStudents * tutoringHoursPerStudent * tutoringRatePerHour;

  const savings = alternativeCost - annualCost;
  const roi = (savings / annualCost) * 100;

  return {
    annualCost,
    alternativeCost,
    savings,
    roi,
  };
}
