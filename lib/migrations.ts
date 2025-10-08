// Data migration utilities for taxonomy integration
import { ErrorLog } from './types';
import { migrateOldSystemName } from './taxonomy';

const MIGRATION_VERSION_KEY = 'eat-tracker-migration-version';
const CURRENT_MIGRATION_VERSION = 1;

export interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: number;
  version: number;
  errors?: string[];
}

/**
 * Get the current migration version from localStorage
 */
export function getCurrentMigrationVersion(): number {
  if (typeof window === 'undefined') return 0;
  const version = localStorage.getItem(MIGRATION_VERSION_KEY);
  return version ? parseInt(version, 10) : 0;
}

/**
 * Set the migration version in localStorage
 */
export function setMigrationVersion(version: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MIGRATION_VERSION_KEY, version.toString());
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  return getCurrentMigrationVersion() < CURRENT_MIGRATION_VERSION;
}

/**
 * Migrate a single error log from old format to new taxonomy-based format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateErrorLog(error: any): { log: ErrorLog; warnings: string[] } {
  const warnings: string[] = [];

  // Handle old OrganSystem string type
  if (error.system && typeof error.system === 'string') {
    const newSystemId = migrateOldSystemName(error.system);

    if (newSystemId) {
      error.systemId = newSystemId;
      // Keep old system name for backward compat during transition
      error._oldSystem = error.system;
    } else {
      warnings.push(`Could not map old system "${error.system}" to new taxonomy. Using as-is.`);
      error.systemId = error.system; // Fallback to original value
    }
  }

  // Ensure all required fields exist
  if (!error.id) {
    warnings.push('Missing error ID, generating new one');
    error.id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  if (!error.timestamp) {
    warnings.push('Missing timestamp, using current time');
    error.timestamp = new Date();
  } else if (typeof error.timestamp === 'string') {
    error.timestamp = new Date(error.timestamp);
  }

  // Ensure arrays exist
  if (!error.nextSteps) {
    error.nextSteps = [];
  }

  return { log: error as ErrorLog, warnings };
}

/**
 * Migrate all error logs in localStorage from old to new format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateAllErrors(errors: any[]): MigrationResult {
  let migrated = 0;
  let failed = 0;
  const allWarnings: string[] = [];

  errors.map(error => {
    try {
      const { log, warnings } = migrateErrorLog(error);
      migrated++;

      if (warnings.length > 0) {
        allWarnings.push(`Error ${error?.id || 'unknown'}: ${warnings.join(', ')}`);
      }

      return log;
    } catch (err) {
      failed++;
      allWarnings.push(`Failed to migrate error ${error?.id || 'unknown'}: ${err}`);
      return error; // Return original on failure
    }
  });

  return {
    success: failed === 0,
    migrated,
    failed,
    version: CURRENT_MIGRATION_VERSION,
    errors: allWarnings.length > 0 ? allWarnings : undefined,
  };
}

/**
 * Run all pending migrations
 * This is the main entry point called by the storage layer
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function runMigrations(errors: any[]): { errors: ErrorLog[]; result: MigrationResult } {
  const currentVersion = getCurrentMigrationVersion();

  if (currentVersion >= CURRENT_MIGRATION_VERSION) {
    return {
      errors,
      result: {
        success: true,
        migrated: 0,
        failed: 0,
        version: currentVersion,
      },
    };
  }

  console.log(`Running migrations from version ${currentVersion} to ${CURRENT_MIGRATION_VERSION}`);

  let migratedErrors = errors;
  let finalResult: MigrationResult = {
    success: true,
    migrated: 0,
    failed: 0,
    version: CURRENT_MIGRATION_VERSION,
  };

  // Version 0 -> 1: Add taxonomy support
  if (currentVersion < 1) {
    const result = migrateAllErrors(migratedErrors);
    migratedErrors = migratedErrors; // Already modified in place
    finalResult = result;

    if (result.success) {
      setMigrationVersion(1);
      console.log(`Migration to v1 complete: ${result.migrated} errors migrated`);
    } else {
      console.error(`Migration to v1 had errors: ${result.failed} failed`, result.errors);
    }
  }

  return {
    errors: migratedErrors,
    result: finalResult,
  };
}

/**
 * Helper to seed initial taxonomy data (for testing or demo purposes)
 */
export function seedTaxonomyData(): void {
  console.log('Taxonomy is imported statically from lib/taxonomy.ts');
  console.log('No seeding required - all reference data is in code');
}

/**
 * Reset all migrations (for testing purposes)
 */
export function resetMigrations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MIGRATION_VERSION_KEY);
  console.log('Migration version reset to 0');
}
