'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { ErrorLog } from '@/lib/types';
import { getStreakData, getXPProgress, getXPForNextLevel } from '@/lib/streaks';

export default function Home() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [streakData, setStreakData] = useState(getStreakData());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setErrors(storage.getErrors());
    setStreakData(getStreakData());

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const recentErrors = errors.slice(-3).reverse();
  const xpProgress = getXPProgress(streakData.totalXP, streakData.level);
  const nextLevelXP = getXPForNextLevel(streakData.level);

  // Calculate stats
  const stats = {
    total: errors.length,
    thisWeek: errors.filter(e => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(e.timestamp) >= weekAgo;
    }).length,
    lowConfidence: errors.filter(e => {
      const conf = typeof e.confidence === 'number' ? e.confidence : 1;
      return conf <= 2;
    }).length,
    topics: new Set(errors.map(e => e.topic)).size,
  };

  // Get motivational quote
  const quotes = [
    { text: "The expert in anything was once a beginner", author: "Helen Hayes" },
    { text: "Mistakes are proof that you are trying", author: "Unknown" },
    { text: "Every error is a teacher in disguise", author: "Anonymous" },
    { text: "Progress, not perfection", author: "Unknown" },
  ];
  const todayQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 md:pb-8">
      {/* Header with Streak & Level */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Greeting */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">{greeting}! 👋</h1>
            <p className="text-blue-100 text-sm">Let&apos;s continue your learning journey</p>
          </div>

          {/* Streak & Level Cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Streak Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <span className="text-sm font-medium text-blue-100">Streak</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold">{streakData.currentStreak}</div>
              <div className="text-xs text-blue-100 mt-1">
                {streakData.currentStreak === 0 ? 'Start today!' : `Longest: ${streakData.longestStreak} days`}
              </div>
            </div>

            {/* Level Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⭐</span>
                <span className="text-sm font-medium text-blue-100">Level</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold">{streakData.level}</div>
              {/* XP Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress * 100}%` }}
                  />
                </div>
                <div className="text-xs text-blue-100 mt-1">
                  {streakData.totalXP} / {nextLevelXP} XP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {errors.length === 0 ? (
          /* Empty State - First Time User */
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to E.A.T. Tracker!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start tracking your errors to unlock personalized insights and improve faster.
            </p>
            <Link
              href="/log"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Log Your First Error
            </Link>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-800 mb-1">Smart Analytics</h3>
                <p className="text-sm text-gray-600">Pattern recognition and insights</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-800 mb-1">Study Plans</h3>
                <p className="text-sm text-gray-600">Personalized schedules</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-1">Track Progress</h3>
                <p className="text-sm text-gray-600">See improvement over time</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Daily Dashboard */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Today&apos;s Focus</h2>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-blue-800 font-medium">Total Errors</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
                  <div className="text-xs text-green-800 font-medium">This Week</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-orange-600">{stats.lowConfidence}</div>
                  <div className="text-xs text-orange-800 font-medium">Low Confidence</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 transform hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-purple-600">{stats.topics}</div>
                  <div className="text-xs text-purple-800 font-medium">Unique Topics</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/log"
                  className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
                >
                  ➕ Log Error
                </Link>
                <Link
                  href="/insights"
                  className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
                >
                  📊 View Insights
                </Link>
                <Link
                  href="/plan"
                  className="flex-1 min-w-[140px] px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
                >
                  📚 Study Plan
                </Link>
              </div>
            </div>

            {/* Recent Errors */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Errors</h2>
                <Link
                  href="/insights"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all bg-white/50"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{error.topic}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{error.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                            {error.system}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg capitalize">
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
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-indigo-200">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">💬</div>
                <div>
                  <p className="text-gray-800 font-medium italic mb-2">&quot;{todayQuote.text}&quot;</p>
                  <p className="text-sm text-gray-600">— {todayQuote.author}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
