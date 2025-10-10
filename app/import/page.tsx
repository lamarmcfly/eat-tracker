'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { migrateConfidence } from '@/lib/confidenceMigration';
import {
  validateImport,
  validateBatchImport,
  convertToErrorLog,
  QBankImportFormat,
  ImportValidationResult,
} from '@/lib/qbankImport';
import { ErrorLog } from '@/lib/types';

export default function ImportPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [validationResults, setValidationResults] = useState<ImportValidationResult[]>([]);
  const [previewData, setPreviewData] = useState<Partial<ErrorLog>[]>([]);
  const [importMode, setImportMode] = useState<'single' | 'batch'>('single');
  const [showHelp, setShowHelp] = useState(false);

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      if (Array.isArray(parsed)) {
        // Batch import
        setImportMode('batch');
        const { results } = validateBatchImport(parsed);
        setValidationResults(results);

        // Generate preview for valid items
        const validItems = parsed.filter((_, idx) => results[idx].valid);
        const previews = validItems.map(item => convertToErrorLog(item as QBankImportFormat));
        setPreviewData(previews);
      } else {
        // Single import
        setImportMode('single');
        const result = validateImport(parsed);
        setValidationResults([result]);

        if (result.valid) {
          const preview = convertToErrorLog(parsed as QBankImportFormat);
          setPreviewData([preview]);
        } else {
          setPreviewData([]);
        }
      }
    } catch (error) {
      setValidationResults([{
        valid: false,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Parse error'}`],
        warnings: [],
      }]);
      setPreviewData([]);
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) return;

    // Import all valid items
    previewData.forEach(item => {
      const errorLog: ErrorLog = {
        id: item.id!,
        timestamp: item.timestamp!,
        description: item.description!,
        system: item.system!,
        systemId: item.systemId,
        topic: item.topic!,
        errorType: item.errorType || 'knowledge',
        confidence: item.confidence ? migrateConfidence(item.confidence) : 1,
        cognitiveLevel: item.cognitiveLevel,
        nextSteps: item.nextSteps || [],
        externalQuestion: item.externalQuestion,
      };

      storage.saveError(errorLog);
    });

    // Reset form
    setJsonInput('');
    setValidationResults([]);
    setPreviewData([]);

    // Navigate to insights
    router.push('/insights');
  };

  const validCount = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.length - validCount;
  const hasWarnings = validationResults.some(r => r.warnings.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Import Q-Bank Data</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {showHelp ? 'Hide' : 'Show'} Examples
          </button>
        </div>

        {showHelp && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Import Format Examples</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Single Question (Minimal)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "questionId": "uw-12345",
  "questionBank": "uworld",
  "system": "Cardiovascular",
  "topic": "Acute Coronary Syndrome",
  "difficulty": "medium",
  "percentCorrect": 65
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Full Metadata (UWorld/Amboss)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "questionId": "amb-789",
  "questionBank": "amboss",
  "description": "Got ACS management wrong",
  "system": "Cardiovascular",
  "topic": "STEMI",
  "difficulty": 3,
  "percentCorrect": 58,
  "learningObjectives": [
    "Recognize clinical presentation of STEMI",
    "Understand indications for fibrinolytic therapy"
  ],
  "tags": ["High-Yield", "Step 2"],
  "bloomsLevel": "Apply",
  "estimatedTime": 90,
  "errorType": "reasoning",
  "confidence": "eliminated"
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Batch Import (Array)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`[
  {
    "questionId": "uw-100",
    "questionBank": "uworld",
    "system": "Respiratory",
    "topic": "Pneumonia",
    "difficulty": 2
  },
  {
    "questionId": "uw-101",
    "questionBank": "uworld",
    "system": "Cardiovascular",
    "topic": "Heart Failure",
    "difficulty": 4
  }
]`}
                </pre>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Supported Q-Banks</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">UWorld</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">Amboss</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded">NBME</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Kaplan</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded">USMLE-Rx</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded">Other</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Paste JSON Data</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder='Paste your Q-bank JSON here...\n\nExample:\n{\n  "questionId": "uw-12345",\n  "questionBank": "uworld",\n  "system": "Cardiovascular",\n  "topic": "Acute MI",\n  "difficulty": 3,\n  "percentCorrect": 65\n}'
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleValidate}
              disabled={!jsonInput.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Validate & Preview
            </button>
            <button
              onClick={() => {
                setJsonInput('');
                setValidationResults([]);
                setPreviewData([]);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Validation Results</h2>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-2xl font-bold text-gray-800">{validationResults.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-700">Valid</div>
                <div className="text-2xl font-bold text-green-800">{validCount}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-700">Invalid</div>
                <div className="text-2xl font-bold text-red-800">{invalidCount}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-700">Warnings</div>
                <div className="text-2xl font-bold text-yellow-800">
                  {validationResults.reduce((sum, r) => sum + r.warnings.length, 0)}
                </div>
              </div>
            </div>

            {/* Errors and Warnings */}
            {validationResults.some(r => !r.valid || r.warnings.length > 0) && (
              <div className="space-y-2 mb-6">
                {validationResults.map((result, idx) => (
                  <div key={idx}>
                    {result.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="font-semibold text-red-800 mb-1">
                          {importMode === 'batch' ? `Item ${idx + 1}: ` : ''}Errors
                        </div>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {result.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="font-semibold text-yellow-800 mb-1">
                          {importMode === 'batch' ? `Item ${idx + 1}: ` : ''}Warnings
                        </div>
                        <ul className="text-sm text-yellow-700 list-disc list-inside">
                          {result.warnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Preview */}
            {previewData.length > 0 && (
              <>
                <h3 className="font-bold text-gray-800 mb-3">Import Preview</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {previewData.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 font-medium">System:</span>{' '}
                          <span className="text-gray-800">{item.system}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Topic:</span>{' '}
                          <span className="text-gray-800">{item.topic}</span>
                        </div>
                        {item.externalQuestion && (
                          <>
                            <div>
                              <span className="text-gray-600 font-medium">Q-Bank:</span>{' '}
                              <span className="text-gray-800 uppercase">{item.externalQuestion.questionBank}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Question ID:</span>{' '}
                              <span className="text-gray-800">{item.externalQuestion.questionId}</span>
                            </div>
                            {item.externalQuestion.difficulty && (
                              <div>
                                <span className="text-gray-600 font-medium">Difficulty:</span>{' '}
                                <span className="text-gray-800">{item.externalQuestion.difficulty}/5</span>
                              </div>
                            )}
                            {item.externalQuestion.percentCorrect && (
                              <div>
                                <span className="text-gray-600 font-medium">% Correct:</span>{' '}
                                <span className="text-gray-800">{item.externalQuestion.percentCorrect}%</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {item.externalQuestion?.learningObjectives && item.externalQuestion.learningObjectives.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="text-xs text-gray-600 font-medium mb-1">Learning Objectives:</div>
                          <ul className="text-sm text-gray-700 list-disc list-inside">
                            {item.externalQuestion.learningObjectives.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleImport}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Confirm & Import {previewData.length} {previewData.length === 1 ? 'Question' : 'Questions'}
                  </button>
                  <button
                    onClick={() => router.push('/insights')}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
