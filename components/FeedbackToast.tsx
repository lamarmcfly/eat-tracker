'use client';

import { useEffect, useState } from 'react';
import { Achievement } from '@/lib/streaks';

interface FeedbackToastProps {
  show: boolean;
  onClose: () => void;
  type: 'success' | 'levelUp' | 'achievement' | 'streak' | 'insight';
  title: string;
  message: string;
  xpGained?: number;
  achievement?: Achievement;
  autoClose?: boolean;
  duration?: number;
}

export default function FeedbackToast({
  show,
  onClose,
  type,
  title,
  message,
  xpGained,
  achievement,
  autoClose = true,
  duration = 5000,
}: FeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, autoClose, duration, onClose]);

  if (!show) return null;

  const backgrounds = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    levelUp: 'bg-gradient-to-r from-purple-500 to-pink-500',
    achievement: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    streak: 'bg-gradient-to-r from-red-500 to-orange-500',
    insight: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  };

  const icons = {
    success: '✅',
    levelUp: '🎉',
    achievement: '🏆',
    streak: '🔥',
    insight: '💡',
  };

  return (
    <div className={`
      fixed top-20 left-1/2 -translate-x-1/2 z-50
      w-[90%] max-w-md
      transition-all duration-300 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
    `}>
      <div className={`
        ${backgrounds[type]}
        text-white
        rounded-2xl shadow-2xl
        p-4
        backdrop-blur-lg
        border border-white/20
      `}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="text-3xl flex-shrink-0 animate-bounce">
            {achievement?.icon || icons[type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">
              {achievement?.title || title}
            </h3>
            <p className="text-white/90 text-sm">
              {achievement?.description || message}
            </p>

            {/* XP Badge */}
            {xpGained && (
              <div className="mt-2 inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <span className="text-xs font-bold">+{xpGained} XP</span>
                <span className="text-xs">⭐</span>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <span className="text-xs">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Success Celebration Component (for multiple achievements)
 */
interface CelebrationProps {
  show: boolean;
  onClose: () => void;
  achievements: Achievement[];
  xpGained: number;
  levelUp?: boolean;
  newLevel?: number;
}

export function Celebration({
  show,
  onClose,
  achievements,
  xpGained,
  levelUp,
  newLevel,
}: CelebrationProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-[scale-in_0.3s_ease-out]">
        {/* Confetti effect */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2 animate-bounce">🎉</div>
          {levelUp ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Level Up!</h2>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Level {newLevel}
              </div>
            </>
          ) : (
            <h2 className="text-2xl font-bold text-gray-800">Awesome!</h2>
          )}
        </div>

        {/* XP Badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
            +{xpGained} XP ⭐
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">Achievements Unlocked:</h3>
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                  <div className="text-xs font-bold text-yellow-600">
                    +{achievement.xpReward} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Keyframe for scale-in animation
const style = `
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = style;
  document.head.appendChild(styleSheet);
}
