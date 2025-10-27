'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import RealDataDisplay from '@/components/RealDataDisplay';
import { SaaSHomepage } from '@/components/SaaSHomepage';

export default function HomePage() {
  const router = useRouter();
  const [showRealData, setShowRealData] = useState(false);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleShowRealData = () => {
    setShowRealData(true);
  };

  const handleBackToHome = () => {
    setShowRealData(false);
  };

  if (showRealData) {
    return (
      <div>
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Gavith Build - Real Data</h1>
              <button
                onClick={handleBackToHome}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
        <RealDataDisplay />
      </div>
    );
  }

  return (
    <div>
      <SaaSHomepage onLogin={handleLogin} onGetStarted={handleGetStarted} />

      {/* Real Data Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleShowRealData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors font-medium"
        >
          📊 View Real Data
        </button>
      </div>
    </div>
  );
}
