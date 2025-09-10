import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';

const AIPlanningPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          AI Planning
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Advanced AI-powered planning and optimization
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Card className="text-center py-16">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">AI Planning</h2>
            <p className="text-gray-400 text-lg mb-6 max-w-md">
              Intelligent planning algorithms and predictive analytics are coming soon. Get ready for next-generation AI optimization.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Coming Soon
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIPlanningPage;
