import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E.A.T. Tracker - Error Analysis & Targeted Learning",
  description: "Evidence-based error tracking and study planning for medical students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                E.A.T. Tracker
              </Link>
              <div className="flex gap-2 md:gap-4">
                <Link href="/log" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs md:text-base">
                  Log
                </Link>
                <Link href="/import" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs md:text-base">
                  Import
                </Link>
                <Link href="/insights" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs md:text-base">
                  Insights
                </Link>
                <Link href="/system-insights" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs md:text-base">
                  Systems
                </Link>
                <Link href="/recommendations" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs md:text-base">
                  Learn
                </Link>
                <Link href="/plan" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs md:text-base">
                  Plan
                </Link>
                <Link href="/export" className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-xs md:text-base">
                  Export
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
