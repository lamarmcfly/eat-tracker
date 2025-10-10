'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [showQuickLog, setShowQuickLog] = useState(false);

  const navItems = [
    { href: '/', icon: '🏠', label: 'Home', active: pathname === '/' },
    { href: '/insights', icon: '📊', label: 'Stats', active: pathname === '/insights' },
    { href: '/log', icon: '➕', label: 'Log', active: pathname === '/log', isCenter: true },
    { href: '/plan', icon: '📚', label: 'Plan', active: pathname === '/plan' },
    { href: '/recommendations', icon: '🎯', label: 'Learn', active: pathname === '/recommendations' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            item.isCenter ? (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center relative -mt-8"
              >
                <div className="
                  w-14 h-14
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  rounded-full
                  shadow-lg
                  flex items-center justify-center
                  text-2xl
                  transform transition-all duration-200
                  active:scale-90
                  hover:shadow-xl
                ">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-600 mt-1">
                  {item.label}
                </span>
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center
                  flex-1 h-full
                  transition-colors duration-200
                  ${item.active ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className={`
                  text-xs font-medium
                  ${item.active ? 'text-blue-600' : 'text-gray-600'}
                `}>
                  {item.label}
                </span>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Spacer for mobile to prevent content being hidden behind nav */}
      <div className="h-16 md:hidden" />

      {/* Desktop Navigation - Top Bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <span className="font-bold text-xl text-gray-800">E.A.T. Tracker</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg
                    font-medium text-sm
                    transition-all duration-200
                    ${item.active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for desktop */}
      <div className="hidden md:block h-16" />
    </>
  );
}
