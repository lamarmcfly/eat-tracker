# How to Import Errors from CSV

## Step-by-Step Instructions

### 1. Download the Template
1. Go to Import page
2. Click **📥 Download Excel Template**
3. Save the CSV file to your computer

### 2. Fill Out the Template
1. Open the CSV in Excel, Google Sheets, or Numbers
2. You'll see an example row - use it as reference
3. Delete the example row when done
4. Fill in your errors (one per row)

**Required Fields:**
- **Description**: What went wrong
- **Organ System**: Cardiovascular, Respiratory, Endocrine, etc.
- **Topic**: Specific concept (e.g., "Diabetic Ketoacidosis")

**Optional Fields:**
- Date, Error Type, Confidence, Next Steps, Tags, Q-Bank info

### 3. Save as CSV
**IMPORTANT**: Excel files (.xlsx) won't work!

**In Excel (Windows/Mac)**:
1. File → Save As
2. Choose **CSV (Comma delimited) (*.csv)**
3. Click Save
4. If Excel asks about features, click "Yes" or "OK"

**In Google Sheets**:
1. File → Download → Comma Separated Values (.csv)

**In Numbers (Mac)**:
1. File → Export To → CSV
2. Choose UTF-8 encoding

### 4. Upload the CSV
1. Go to Import page
2. Choose **Excel/CSV Upload** mode
3. Click the upload box or drag your CSV file
4. Wait for preview to load
5. Review the preview
6. Click **✅ Confirm & Import**

## Troubleshooting

### "Please upload a CSV file"
- You uploaded an Excel file (.xlsx)
- **Fix**: Save your Excel file as CSV first (see step 3)

### "No valid errors found"
- Your CSV is empty or missing required fields
- **Fix**: Make sure you have Description, Organ System, and Topic filled in

### "Failed to parse CSV"
- File format issue
- **Fix**: Make sure you saved as CSV (not Excel)
- Try re-downloading the template and copying your data over

### "Invalid organ system"
- You misspelled an organ system name
- **Fix**: Use one of these exact names:
  - Cardiovascular
  - Respiratory
  - Gastrointestinal
  - Renal
  - Endocrine
  - Reproductive
  - Musculoskeletal
  - Nervous
  - Hematology
  - Immunology
  - Behavioral
  - Skin
  - General

## Example CSV (what it looks like)

```
Date,Description,Organ System,Topic,Error Type,Confidence,Next Steps,Tags,...
2025-01-15,Confused aldosterone vs cortisol,Endocrine,Adrenal Physiology,knowledge,2,Review pathway|Draw chart,high-yield,...
2025-01-16,Missed STEMI on ECG,Cardiovascular,ECG Interpretation,knowledge,1,Practice ECGs,high-yield,cardio,...
```

## Tips

✅ **Do**:
- Fill out template in Excel (easier)
- Save as CSV before uploading
- Keep example row for reference (delete before uploading)
- Use pipe `|` or commas to separate next steps

❌ **Don't**:
- Upload Excel files (.xlsx, .xls) - they won't work
- Leave required fields blank
- Use fancy Excel formatting (colors, formulas) - they'll be lost
- Worry about getting everything perfect - you can edit later

## Need Help?

- Check the [UX_IMPROVEMENTS.md](UX_IMPROVEMENTS.md) for more features
- Review the [PREMIUM_FEATURES.md](PREMIUM_FEATURES.md) for advanced options
- Open an issue on GitHub if stuck
