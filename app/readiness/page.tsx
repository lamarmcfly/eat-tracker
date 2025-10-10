'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeTest, ExamTarget, PracticeTestType, ExamReadiness } from '@/lib/types';
import { practiceTestStorage } from '@/lib/practiceTestStorage';
import { calculateExamReadiness, getExamTargetName, getConfidenceColor } from '@/lib/examReadiness';
import { calculateShelfToStep2Correlation, getShelfExamName, getPerformanceTier } from '@/lib/shelfToStep2';

export default function ReadinessPage() {
  const router = useRouter();
  const [examTarget, setExamTarget] = useState<ExamTarget>('step1');
  const [tests, setTests] = useState<PracticeTest[]>([]);
  const [readiness, setReadiness] = useState<ExamReadiness | null>(null);
  const [showAddTest, setShowAddTest] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    testType: '' as PracticeTestType,
    testName: '',
    date: new Date().toISOString().split('T')[0],
    correctAnswers: '',
    totalQuestions: '',
    predictedScore: '',
    notes: '',
  });

  useEffect(() => {
    loadTests();
  }, [examTarget]);

  const loadTests = () => {
    const allTests = practiceTestStorage.getTests();
    setTests(allTests);
    const readinessData = calculateExamReadiness(allTests, examTarget);
    setReadiness(readinessData);
  };

  const handleAddTest = () => {
    if (!formData.testType || !formData.correctAnswers || !formData.totalQuestions) {
      alert('Please fill in test type, correct answers, and total questions');
      return;
    }

    const correct = parseInt(formData.correctAnswers);
    const total = parseInt(formData.totalQuestions);
    const percentCorrect = (correct / total) * 100;

    const newTest: PracticeTest = {
      id: `test-${Date.now()}`,
      examTarget,
      testType: formData.testType,
      testName: formData.testName || formData.testType,
      date: new Date(formData.date),
      score: 0, // Will be calculated
      percentCorrect,
      totalQuestions: total,
      correctAnswers: correct,
      predictedScore: formData.predictedScore ? parseInt(formData.predictedScore) : undefined,
      notes: formData.notes || undefined,
    };

    practiceTestStorage.saveTest(newTest);
    loadTests();
    setShowAddTest(false);

    // Reset form
    setFormData({
      testType: '' as PracticeTestType,
      testName: '',
      date: new Date().toISOString().split('T')[0],
      correctAnswers: '',
      totalQuestions: '',
      predictedScore: '',
      notes: '',
    });
  };

  const getTestTypeOptions = (): PracticeTestType[] => {
    switch (examTarget) {
      case 'step1':
        return ['nbme-step1', 'uwsa1-step1', 'uwsa2-step1', 'free120-step1', 'amboss-sa-step1', 'other'];
      case 'step2ck':
        return ['nbme-step2', 'uwsa1-step2', 'uwsa2-step2', 'free120-step2', 'amboss-sa-step2', 'other'];
      case 'shelf':
        return ['nbme-shelf-im', 'nbme-shelf-surgery', 'nbme-shelf-peds', 'nbme-shelf-obgyn', 'nbme-shelf-psych', 'nbme-shelf-neuro', 'nbme-shelf-family', 'nbme-shelf-other'];
      default:
        return ['other'];
    }
  };

  const getConfidenceBgColor = (confidence: ExamReadiness['confidence']) => {
    return {
      'high': 'bg-green-50 border-green-200',
      'moderate': 'bg-blue-50 border-blue-200',
      'low': 'bg-yellow-50 border-yellow-200',
      'not-ready': 'bg-red-50 border-red-200',
    }[confidence];
  };

  const getConfidenceTextColor = (confidence: ExamReadiness['confidence']) => {
    return {
      'high': 'text-green-800',
      'moderate': 'text-blue-800',
      'low': 'text-yellow-800',
      'not-ready': 'text-red-800',
    }[confidence];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Exam Readiness</h1>
          <button
            type="button"
            onClick={() => setShowAddTest(!showAddTest)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {showAddTest ? 'Cancel' : '+ Add Practice Test'}
          </button>
        </div>

        {/* Exam Target Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Exam</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['step1', 'step2ck', 'step3', 'shelf'] as ExamTarget[]).map(target => (
              <button
                key={target}
                type="button"
                onClick={() => setExamTarget(target)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors border-2 ${
                  examTarget === target
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {getExamTargetName(target)}
              </button>
            ))}
          </div>
        </div>

        {/* Add Test Form */}
        {showAddTest && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Practice Test</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({...formData, testType: e.target.value as PracticeTestType})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select test type...</option>
                    {getTestTypeOptions().map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Name (optional)</label>
                  <input
                    type="text"
                    value={formData.testName}
                    onChange={(e) => setFormData({...formData, testName: e.target.value})}
                    placeholder="e.g., NBME 25"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answers *</label>
                  <input
                    type="number"
                    value={formData.correctAnswers}
                    onChange={(e) => setFormData({...formData, correctAnswers: e.target.value})}
                    placeholder="e.g., 156"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions *</label>
                  <input
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({...formData, totalQuestions: e.target.value})}
                    placeholder="e.g., 200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Predicted Score (optional)</label>
                  <input
                    type="number"
                    value={formData.predictedScore}
                    onChange={(e) => setFormData({...formData, predictedScore: e.target.value})}
                    placeholder="e.g., 235 (NBME prediction)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Felt rushed, tough questions, etc."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddTest}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Save Practice Test
              </button>
            </div>
          </div>
        )}

        {/* Readiness Assessment */}
        {readiness && (
          <div className={`rounded-xl shadow-lg p-6 border-2 ${getConfidenceBgColor(readiness.confidence)}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold ${getConfidenceTextColor(readiness.confidence)} mb-2`}>
                  {readiness.message}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">Tests Taken: {readiness.totalTests}</span>
                  <span className="font-medium">Average: {readiness.averageScore.toFixed(1)}%</span>
                  <span className="font-medium">Trend: {readiness.recentTrend}</span>
                  {readiness.hasConsecutive65Plus && (
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                      ✓ 2+ Consecutive 65%+
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Recommendations:</h3>
              <ul className="space-y-1">
                {readiness.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Test History */}
        {readiness && readiness.testHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Practice Test History</h2>
            <div className="space-y-3">
              {readiness.testHistory.slice().reverse().map((test, idx) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">{test.testName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        test.percentCorrect >= 65 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {test.percentCorrect.toFixed(1)}%
                      </span>
                      {test.predictedScore && (
                        <span className="text-sm text-gray-600">Predicted: {test.predictedScore}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {test.date.toLocaleDateString()} • {test.correctAnswers}/{test.totalQuestions} correct
                      {test.notes && <span> • {test.notes}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-800 mb-1">📊 Research-Backed Readiness Criterion</p>
          <p className="text-blue-700">
            Studies show that <strong>2 consecutive practice test scores ≥65%</strong> is a strong predictor of exam readiness.
            This tool uses this criterion along with NBME predictions and score trends to assess your preparedness.
          </p>
        </div>
      </div>
    </div>
  );
}
