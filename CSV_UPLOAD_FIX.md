# CSV Upload Fix

## Issue
CSV upload isn't working - page refreshes and file never loads.

## Root Causes

1. **Accepting Excel files** - The input accepts `.xlsx` and `.xls`, but `file.text()` only works with text files (CSV)
2. **No file type validation** - Trying to parse binary Excel files as text fails silently
3. **Missing preventDefault** - Form submission might be causing page refresh

## Solution

### 1. Update file input to ONLY accept CSV
```tsx
<input
  type="file"
  accept=".csv"  // Remove .xlsx, .xls
  onChange={handleCSVUpload}
  className="hidden"
/>
```

### 2. Add file type validation
```tsx
const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  e.preventDefault();
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate CSV only
  if (!file.name.toLowerCase().endsWith('.csv')) {
    setValidationResults([{
      valid: false,
      errors: ['Please upload a CSV file. If you have Excel, save as CSV first.'],
      warnings: ['In Excel: File → Save As → Choose "CSV (Comma delimited)"'],
    }]);
    e.target.value = ''; // Reset input
    return;
  }

  // ... rest of logic
};
```

### 3. Update UI text to be clear
```tsx
<div className="text-xs text-gray-500 mt-1">
  CSV files only. Save Excel files as CSV first.
</div>
```

## User Instructions

Tell users to:
1. Download the template
2. Fill it in Excel
3. **File → Save As → CSV (Comma delimited)**
4. Upload the .csv file

## Why Excel Support is Hard

Excel files (.xlsx, .xls) are binary formats that require:
- `xlsx` npm package (~600KB)
- Complex parsing logic
- Different error handling

For MVP, CSV-only is simpler and works perfectly.
