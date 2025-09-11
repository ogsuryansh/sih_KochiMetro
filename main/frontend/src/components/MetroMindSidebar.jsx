import React from 'react';

const MetroMindSidebar = () => {
  return (
    <div className="w-1/4 bg-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-white font-bold text-xl">
          MetroMind AI Supervisor
        </h1>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Past Chats */}
      <div className="flex-1 px-4">
        <h3 className="text-gray-400 text-sm font-medium mb-3">Recent Chats</h3>
        <div className="space-y-2">
          {/* Placeholder for past chats */}
          <div className="text-gray-500 text-sm p-3 bg-gray-700/50 rounded-lg">
            No previous chats yet
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetroMindSidebar;

