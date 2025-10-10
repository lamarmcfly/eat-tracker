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
          <div className="flex items-center justify-center gap-8">
            {/* Left: Logo */}
            <div className="w-48 h-48 flex items-center justify-center">
              <Image
                src="/EAT logo.png"
                alt="E.A.T. Tracker Logo"
                width={192}
                height={192}
                className="rounded-2xl"
                priority
              />
            </div>

            {/* Right: Title and subtitle */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">E.A.T. Tracker</h1>
              <p className="text-blue-100 text-sm md:text-base">Error Analysis & Targeted Learning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Errors</h2>
          </div>

          {recentErrors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 mb-6 text-lg">Start tracking your errors to improve faster</p>
              <Link
                href="/log"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Log Your First Error
              </Link>
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{errors.length}</div>
                  <div className="text-sm text-blue-800">Total</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {errors.filter(e => e.errorType === 'knowledge').length}
                  </div>
                  <div className="text-sm text-green-800">Knowledge</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">
                    {errors.filter(e => e.errorType === 'reasoning').length}
                  </div>
                  <div className="text-sm text-orange-800">Reasoning</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">
                    {new Set(errors.map(e => e.topic)).size}
                  </div>
                  <div className="text-sm text-purple-800">Topics</div>
                </div>
              </div>

              {/* Recent Errors List */}
              <div className="space-y-3">
                {recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
