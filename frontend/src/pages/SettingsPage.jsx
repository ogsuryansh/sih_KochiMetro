import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Configure system settings and preferences
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Card className="text-center py-16">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Settings</h2>
            <p className="text-gray-400 text-lg mb-6 max-w-md">
              System configuration and user preferences are coming soon. Customize your experience.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg text-sm font-medium">
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

export default SettingsPage;
