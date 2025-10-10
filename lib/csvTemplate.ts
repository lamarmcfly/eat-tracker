// CSV Template Generator and Parser for Excel-friendly error import/export

import { ErrorLog, ErrorType, Confidence, QuestionBank, ORGAN_SYSTEMS } from './types';

// CSV column headers (order matters for template)
export const CSV_HEADERS = [
  'Date',
  'Description',
  'Organ System',
  'Topic',
  'Error Type',
  'Confidence',
  'Next Steps',
  'Tags',
  'Question Bank',
  'Question ID',
  'National % Correct',
  'Next Q-Bank Review',
] as const;

/**
 * Generate CSV template string for download
 * Includes headers + example row + empty rows
 */
export function generateCSVTemplate(): string {
  const headers = CSV_HEADERS.join(',');

  // Example row with guidance
  const exampleRow = [
    '2025-01-15',
    'Confused aldosterone vs cortisol in adrenal disorder',
    'Endocrine',
    'Adrenal Physiology',
    'knowledge',
    '2',
    'Review aldosterone pathway | Draw comparison chart',
    'high-yield, pathophysiology',
    'uworld',
    'uw-12345',
    '65',
    '2025-02-01',
  ].map(escapeCSV).join(',');

  // Additional empty rows for user to fill
  const emptyRows = Array(20).fill(Array(CSV_HEADERS.length).fill('').join(',')).join('\n');

  return `${headers}\n${exampleRow}\n${emptyRows}`;
}

/**
 * Generate CSV from existing errors for export
 */
export function exportErrorsToCSV(errors: ErrorLog[]): string {
  const headers = CSV_HEADERS.join(',');

  const rows = errors.map(error => {
    const nextSteps = error.nextSteps.join(' | ');
    const tags = error.tags?.join(', ') || '';

    return [
      formatDate(error.timestamp),
      error.description,
      error.system,
      error.topic,
      error.errorType,
      String(error.confidence),
      nextSteps,
      tags,
      error.externalQuestion?.questionBank || '',
      error.externalQuestion?.questionId || '',
      error.externalQuestion?.percentCorrect?.toString() || '',
      error.externalQuestion?.nextQBankReview ? formatDate(error.externalQuestion.nextQBankReview) : '',
    ].map(escapeCSV).join(',');
  });

  return `${headers}\n${rows.join('\n')}`;
}

/**
 * Parse CSV string into ErrorLog array
 * Handles Excel exports, quoted fields, various date formats
 */
export function parseCSVToErrors(csvText: string): { errors: ErrorLog[], warnings: string[] } {
  const lines = csvText.trim().split('\n');
  const warnings: string[] = [];

  if (lines.length < 2) {
    throw new Error('CSV file is empty or missing headers');
  }

  // Validate headers (flexible - allow reordering)
  const headerRow = parseCSVLine(lines[0]);
  const columnMap = mapCSVHeaders(headerRow);

  if (!columnMap.description || !columnMap.system || !columnMap.topic) {
    throw new Error('CSV must include at least: Description, Organ System, and Topic columns');
  }

  const errors: ErrorLog[] = [];

  // Parse data rows (skip header and empty rows)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    try {
      const fields = parseCSVLine(line);

      // Skip if all fields are empty (Excel often adds blank rows)
      if (fields.every(f => !f.trim())) continue;

      const error = parseCSVRow(fields, columnMap, i + 1);
      errors.push(error);
    } catch (err) {
      warnings.push(`Line ${i + 1}: ${err instanceof Error ? err.message : 'Parse error'}`);
    }
  }

  return { errors, warnings };
}

/**
 * Map CSV headers to column indices (case-insensitive, flexible matching)
 */
function mapCSVHeaders(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();

    if (normalized.includes('date')) map.date = index;
    if (normalized.includes('description')) map.description = index;
    if (normalized.includes('organ') || normalized.includes('system')) map.system = index;
    if (normalized.includes('topic')) map.topic = index;
    if (normalized.includes('error') && normalized.includes('type')) map.errorType = index;
    if (normalized.includes('confidence')) map.confidence = index;
    if (normalized.includes('next') && normalized.includes('step')) map.nextSteps = index;
    if (normalized.includes('tag')) map.tags = index;
    if (normalized.includes('question') && normalized.includes('bank')) map.questionBank = index;
    if (normalized.includes('question') && normalized.includes('id')) map.questionId = index;
    if (normalized.includes('percent') || normalized.includes('%')) map.percentCorrect = index;
    if (normalized.includes('review') && normalized.includes('date')) map.nextQBankReview = index;
  });

  return map;
}

/**
 * Parse a single CSV row into ErrorLog
 */
function parseCSVRow(fields: string[], columnMap: Record<string, number>, lineNumber: number): ErrorLog {
  // Required fields
  const description = getField(fields, columnMap.description).trim();
  const system = getField(fields, columnMap.system).trim();
  const topic = getField(fields, columnMap.topic).trim();

  if (!description) throw new Error('Description is required');
  if (!topic) throw new Error('Topic is required');

  // Validate organ system
  const validSystem = ORGAN_SYSTEMS.find(
    s => s.toLowerCase() === system.toLowerCase()
  );
  if (!validSystem) {
    throw new Error(`Invalid organ system: "${system}". Must be one of: ${ORGAN_SYSTEMS.join(', ')}`);
  }

  // Optional fields with defaults
  const errorType = parseErrorType(getField(fields, columnMap.errorType));
  const confidence = parseConfidence(getField(fields, columnMap.confidence));
  const timestamp = parseDate(getField(fields, columnMap.date));

  // Parse next steps (pipe-separated or comma-separated)
  const nextStepsText = getField(fields, columnMap.nextSteps);
  const nextSteps = nextStepsText
    ? nextStepsText.split(/\||,/).map(s => s.trim()).filter(Boolean)
    : ['Review this topic'];

  // Parse tags (comma-separated)
  const tagsText = getField(fields, columnMap.tags);
  const tags = tagsText
    ? tagsText.split(',').map(t => t.trim()).filter(Boolean)
    : undefined;

  // Parse Q-Bank metadata
  const questionBank = getField(fields, columnMap.questionBank).trim() as QuestionBank;
  const questionId = getField(fields, columnMap.questionId).trim();
  const percentCorrect = parseNumber(getField(fields, columnMap.percentCorrect));
  const nextQBankReview = parseDate(getField(fields, columnMap.nextQBankReview));

  const externalQuestion = (questionBank || questionId || percentCorrect !== undefined) ? {
    questionId: questionId || 'unknown',
    questionBank: (['uworld', 'amboss', 'nbme', 'kaplan', 'rx'].includes(questionBank) ? questionBank : 'other') as QuestionBank,
    percentCorrect,
    nextQBankReview,
  } : undefined;

  return {
    id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    description,
    system: validSystem,
    topic,
    errorType,
    confidence,
    nextSteps,
    tags,
    externalQuestion,
  };
}

/**
 * Parse CSV line handling quoted fields and commas within quotes
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim()); // Add last field
  return fields;
}

/**
 * Helper: Get field value by index (safe)
 */
function getField(fields: string[], index: number | undefined): string {
  if (index === undefined || index >= fields.length) return '';
  return fields[index].trim();
}

/**
 * Parse error type with fallback
 */
function parseErrorType(value: string): ErrorType {
  const normalized = value.toLowerCase().trim();
  if (['knowledge', 'reasoning', 'process', 'time'].includes(normalized)) {
    return normalized as ErrorType;
  }
  return 'knowledge'; // Default
}

/**
 * Parse confidence (handles both numeric 1-4 and string formats)
 */
function parseConfidence(value: string): Confidence {
  const normalized = value.toLowerCase().trim();

  // Numeric format
  if (/^[1-4]$/.test(normalized)) {
    return parseInt(normalized) as Confidence;
  }

  // String format
  if (normalized.includes('guess')) return 1;
  if (normalized.includes('elim')) return 2;
  if (normalized.includes('confid')) return 3;
  if (normalized.includes('cert')) return 4;

  return 2; // Default: eliminated
}

/**
 * Parse date (handles multiple formats: YYYY-MM-DD, MM/DD/YYYY, Excel serial)
 */
function parseDate(value: string): Date {
  if (!value) return new Date(); // Default to now

  // Try ISO format (YYYY-MM-DD)
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(value);
  }

  // Try US format (MM/DD/YYYY)
  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }

  // Try Excel serial number (days since 1900-01-01)
  const excelSerial = parseFloat(value);
  if (!isNaN(excelSerial) && excelSerial > 40000) { // Reasonable range for modern dates
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch
    return new Date(excelEpoch.getTime() + excelSerial * 24 * 60 * 60 * 1000);
  }

  return new Date(); // Fallback to now if unparseable
}

/**
 * Parse number (handles percentages, decimals, empty)
 */
function parseNumber(value: string): number | undefined {
  if (!value) return undefined;

  const cleaned = value.replace(/[%,]/g, '').trim();
  const num = parseFloat(cleaned);

  return isNaN(num) ? undefined : num;
}

/**
 * Escape CSV field (add quotes if contains comma, quote, or newline)
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format date for CSV export (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Download CSV file in browser
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
