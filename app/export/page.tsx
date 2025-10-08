'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import {
  createShareableSnapshot,
  createExport,
  downloadJSON,
  saveSnapshot,
  getStoredSnapshots,
  deleteSnapshot,
  cleanupExpiredSnapshots,
  ShareableSnapshot,
} from '@/lib/export';
import { ErrorLog, StudyPlan } from '@/lib/types';

export default function ExportPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [snapshots, setSnapshots] = useState<ShareableSnapshot[]>([]);
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [lastCreatedSnapshotId, setLastCreatedSnapshotId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Load errors and plan
    const loadedErrors = storage.getErrors();
    const loadedPlan = storage.getPlan();
    setErrors(loadedErrors);
    setPlan(loadedPlan);

    // Load snapshots
    cleanupExpiredSnapshots();
    loadSnapshots();
  }, []);

  const loadSnapshots = () => {
    const stored = getStoredSnapshots();
    const snapshotsArray = Array.from(stored.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setSnapshots(snapshotsArray);
  };

  const handleExportFull = () => {
    const exportData = createExport(errors, plan || undefined);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadJSON(exportData, `eat-tracker-backup-${timestamp}.json`);
  };

  const handleCreateSnapshot = () => {
    const snapshot = createShareableSnapshot(errors, plan || undefined, expirationDays);
    saveSnapshot(snapshot);
    setLastCreatedSnapshotId(snapshot.id);
    loadSnapshots();
  };

  const handleDeleteSnapshot = (id: string) => {
    if (confirm('Delete this snapshot? This cannot be undone.')) {
      deleteSnapshot(id);
      loadSnapshots();
      if (lastCreatedSnapshotId === id) {
        setLastCreatedSnapshotId(null);
      }
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenSnapshot = (id: string) => {
    window.open(`/share/${id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Export & Share</h1>

        {errors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No data to export yet. Start logging errors first!</p>
          </div>
        ) : (
          <>
            {/* Full Data Export */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">📦</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Full Data Backup</h2>
                  <p className="text-gray-600 mb-4">
                    Download all your error logs and study plan as JSON. Use this for backup or migration.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-blue-900">
                      <div className="font-semibold mb-1">What&apos;s included:</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{errors.length} error log{errors.length !== 1 ? 's' : ''}</li>
                        <li>Study plan {plan ? '(included)' : '(not generated yet)'}</li>
                        <li>All metadata (timestamps, descriptions, external Q-bank data)</li>
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={handleExportFull}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Download Full Backup (.json)
                  </button>
                </div>
              </div>
            </div>

            {/* Create Shareable Snapshot */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🔗</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Shareable Snapshot</h2>
                  <p className="text-gray-600 mb-4">
                    Generate a read-only link for advising. Privacy-focused: only aggregate data, no personal details.
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-green-900">
                      <div className="font-semibold mb-1">Privacy-Safe Sharing:</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>✅ Summary statistics and error patterns</li>
                        <li>✅ NBME system breakdown</li>
                        <li>✅ Current study plan (if exists)</li>
                        <li>❌ NO detailed error descriptions</li>
                        <li>❌ NO personal information</li>
                        <li>❌ NO edit capability</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Expiration
                    </label>
                    <div className="flex gap-3">
                      {[1, 7, 30, 0].map(days => (
                        <button
                          key={days}
                          onClick={() => setExpirationDays(days)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            expirationDays === days
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {days === 0 ? 'Never' : `${days} day${days !== 1 ? 's' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateSnapshot}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
                  >
                    Create Snapshot Link
                  </button>

                  {lastCreatedSnapshotId && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="font-semibold text-yellow-900 mb-2">✨ Snapshot Created!</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/share/${lastCreatedSnapshotId}`}
                          readOnly
                          className="flex-1 px-3 py-2 border border-yellow-300 rounded bg-white text-sm"
                        />
                        <button
                          onClick={() => handleCopyLink(lastCreatedSnapshotId)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors"
                        >
                          {copiedId === lastCreatedSnapshotId ? '✓ Copied!' : 'Copy Link'}
                        </button>
                        <button
                          onClick={() => handleOpenSnapshot(lastCreatedSnapshotId)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Snapshots */}
            {snapshots.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Snapshots</h2>
                <div className="space-y-3">
                  {snapshots.map(snapshot => {
                    const isExpired = snapshot.expiresAt && new Date(snapshot.expiresAt) < new Date();
                    return (
                      <div
                        key={snapshot.id}
                        className={`border rounded-lg p-4 ${isExpired ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">
                                {new Date(snapshot.createdAt).toLocaleString()}
                              </span>
                              {isExpired && (
                                <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-bold rounded">
                                  EXPIRED
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {snapshot.summary.totalErrors} errors • {snapshot.systemBreakdown.length} systems
                              {snapshot.expiresAt && !isExpired && (
                                <span> • Expires {new Date(snapshot.expiresAt).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              ID: {snapshot.id}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!isExpired && (
                              <>
                                <button
                                  onClick={() => handleCopyLink(snapshot.id)}
                                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 transition-colors text-sm"
                                >
                                  {copiedId === snapshot.id ? '✓ Copied' : 'Copy Link'}
                                </button>
                                <button
                                  onClick={() => handleOpenSnapshot(snapshot.id)}
                                  className="px-3 py-2 bg-green-100 text-green-700 rounded font-medium hover:bg-green-200 transition-colors text-sm"
                                >
                                  Open
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteSnapshot(snapshot.id)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded font-medium hover:bg-red-200 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div className="text-sm text-gray-700">
                  <div className="font-semibold mb-2">Privacy & Data Control</div>
                  <ul className="space-y-1">
                    <li>• All data is stored locally in your browser</li>
                    <li>• Snapshots are stored in localStorage (temporary)</li>
                    <li>• Shared links only contain aggregate statistics</li>
                    <li>• You can delete snapshots anytime</li>
                    <li>• No data is sent to external servers</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
