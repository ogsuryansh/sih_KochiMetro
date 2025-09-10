import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';

const ReportsPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Reports
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Generate detailed reports and analytics
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Card className="text-center py-16">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Reports</h2>
            <p className="text-gray-400 text-lg mb-6 max-w-md">
              Comprehensive reporting and analytics dashboard is coming soon. Get insights into your fleet performance.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
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

export default ReportsPage;
