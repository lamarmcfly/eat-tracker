'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { storage } from '@/lib/storage';
import { ErrorLog } from '@/lib/types';

export default function Home() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    setErrors(storage.getErrors());
  }, []);

  const recentErrors = errors.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-6">
            <Image
              src="/eat-logo.png"
              alt="E.A.T. Tracker Logo"
              width={150}
              height={150}
              className="w-24 h-24 md:w-32 md:h-32"
              priority
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">E.A.T. Tracker</h1>
              <p className="text-blue-100 text-sm md:text-base">Error Analysis & Targeted Learning</p>
            </div>
          </div>
          

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/log"
              className="bg-white text-blue-600 rounded-xl p-6 hover:shadow-2xl transition-all transform hover:scale-105 relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-3xl mb-2">📝</div>
                  <h2 className="text-xl font-bold mb-1">Quick Log</h2>
                  <p className="text-sm text-gray-600">Capture errors in seconds</p>
                </div>
                <div className="ml-4">
                  <Image
                    src="/eat-logo.png"
                    alt="E.A.T. Logo"
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain"
                  />
                </div>
              </div>
            </Link>

            <Link
              href="/insights"
              className="bg-white text-indigo-600 rounded-xl p-6 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📊</div>
              <h2 className="text-xl font-bold mb-1">Insights</h2>
              <p className="text-sm text-gray-600">Discover your patterns</p>
            </Link>

            <Link
              href="/plan"
              className="bg-white text-purple-600 rounded-xl p-6 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-xl font-bold mb-1">Study Plan</h2>
              <p className="text-sm text-gray-600">7-day evidence-based schedule</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats & Recent Errors */}
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-blue-600">{errors.length}</div>
            <div className="text-sm text-gray-600">Total Errors Logged</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-green-600">
              {errors.filter(e => e.errorType === 'knowledge').length}
            </div>
            <div className="text-sm text-gray-600">Knowledge Gaps</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-orange-600">
              {errors.filter(e => e.errorType === 'reasoning').length}
            </div>
            <div className="text-sm text-gray-600">Reasoning Errors</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-purple-600">
              {new Set(errors.map(e => e.topic)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Topics</div>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Errors</h2>
            <Link
              href="/log"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Log New Error
            </Link>
          </div>

          {recentErrors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No errors logged yet. Start by logging your first error!</p>
              <Link
                href="/log"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Log Your First Error
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentErrors.map((error) => (
                <div
                  key={error.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{error.topic}</h3>
                      <p className="text-sm text-gray-600 mt-1">{error.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {error.system}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                          {error.errorType}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(error.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="font-semibold text-gray-800 mb-3">How It Works</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>📝 <strong>Log:</strong> Quick capture of what went wrong, why, and next steps</li>
            <li>📊 <strong>Analyze:</strong> Automatic pattern detection shows your weak spots</li>
            <li>🎯 <strong>Plan:</strong> Evidence-based 7-day schedule with spaced repetition</li>
            <li>🔒 <strong>Private:</strong> All data stays on your device, no tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
