import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Notification from '../components/Notification';
import AIChat from '../components/AIChat';
import axios from 'axios';

const DashboardPage = () => {
  const { user } = useAuth();    
  
  const [fleetSummary, setFleetSummary] = useState(null);
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });
  const [optimizationResult, setOptimizationResult] = useState(null);

  useEffect(() => {
    fetchFleetSummary();
    fetchTrains();
  }, []);

  useEffect(() => {
    let filtered = trains;

    if (searchTerm) {
      filtered = filtered.filter(train => 
        train.trainId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(train => train.status === statusFilter);
    }

    setFilteredTrains(filtered);
  }, [trains, searchTerm, statusFilter]);

  const fetchFleetSummary = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://sihkochimetro.vercel.app'}/api/dashboard/summary`);
      if (response.data.success) {
        setFleetSummary(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching fleet summary:', error);
      setNotification({
        isVisible: true,
        message: 'Failed to fetch fleet data',
        type: 'error'
      });
    }
  };

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://sihkochimetro.vercel.app'}/api/dashboard/trains`);
      if (response.data.success) {
        setTrains(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching trains:', error);
      setNotification({
        isVisible: true,
        message: 'Failed to fetch train data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const runAIOptimization = async () => {
    try {
      setAiLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://sihkochimetro.vercel.app'}/api/ai/optimize`);
      
      if (response.data.success) {
        setOptimizationResult(response.data.data);
        setNotification({
          isVisible: true,
          message: 'AI optimization completed successfully!',
          type: 'success'
        });
        fetchFleetSummary();
        fetchTrains();
      } else {
        setNotification({
          isVisible: true,
          message: response.data.message || 'AI optimization failed',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('AI optimization error:', error);
      setNotification({
        isVisible: true,
        message: 'AI optimization failed. Please try again.',
        type: 'error'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Service': return 'text-green-400';
      case 'Standby': return 'text-yellow-400';
      case 'Maintenance': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Service': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'Standby': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'Maintenance': return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-slate-800 dark:to-slate-700 px-6 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100 dark:text-slate-300 text-sm sm:text-base">
          Manage your train fleet with AI-powered optimization
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* All Cards - 2x2 grid on mobile, 4 in a row on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card hover className="text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {fleetSummary?.totalTrains || 0}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">Total Trains</p>
          </Card>

          <Card hover className="text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon('Service')} />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {fleetSummary?.inService || 0}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">In Service</p>
          </Card>

          <Card hover className="text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon('Standby')} />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {fleetSummary?.standby || 0}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">Standby</p>
          </Card>

          <Card hover className="text-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon('Maintenance')} />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {fleetSummary?.maintenance || 0}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">Maintenance</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <Card gradient className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">AI Optimization</h2>
              <p className="text-gray-400 mb-6">
                Run AI-powered optimization to automatically schedule trains for service, standby, and maintenance based on real-time data.
              </p>
              <Button
                onClick={runAIOptimization}
                loading={aiLoading}
                size="lg"
                className="w-full"
              >
                {aiLoading ? 'Optimizing...' : 'Run AI Plan'}
              </Button>
            </div>
          </Card>

          <Card>
            <AIChat />
          </Card>
        </div>

        {optimizationResult && (
          <Card className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Last Optimization Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400 mb-2">
                  {optimizationResult.results.optimizationScore}%
                </div>
                <p className="text-gray-400">Optimization Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  +{optimizationResult.results.efficiencyGain}%
                </div>
                <p className="text-gray-400">Efficiency Gain</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  -{optimizationResult.results.maintenanceReduction}%
                </div>
                <p className="text-gray-400">Maintenance Reduction</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-4 lg:space-y-0">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Train Fleet Details</h3>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search Train ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full sm:w-64 text-xs sm:text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm"
              >
                <option value="All">All Status</option>
                <option value="Service">Service</option>
                <option value="Standby">Standby</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-400">Service</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-400">Standby</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-400">Maintenance</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">
              {filteredTrains.length}/{trains.length} trains
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-xs sm:text-sm">Train ID</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-xs sm:text-sm">Status</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-xs sm:text-sm hidden sm:table-cell">Mileage</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-xs sm:text-sm hidden md:table-cell">Fitness</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-xs sm:text-sm hidden lg:table-cell">Job Card</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-xs sm:text-sm hidden xl:table-cell">Last Maint.</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium text-xs sm:text-sm hidden xl:table-cell">Next Maint.</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrains.length > 0 ? (
                  filteredTrains.map((train) => (
                    <tr key={train.trainId} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-white font-medium text-xs sm:text-sm">{train.trainId}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(train.status)}`}>
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${
                            train.status === 'Service' ? 'bg-green-400' :
                            train.status === 'Standby' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <span className="hidden sm:inline">{train.status}</span>
                          <span className="sm:hidden">{train.status.charAt(0)}</span>
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-300 text-xs sm:text-sm hidden sm:table-cell">{train.mileage.toLocaleString()} km</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                          train.fitness === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                          train.fitness === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {train.fitness}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden lg:table-cell">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                          train.jobCardStatus === 'Active' ? 'bg-green-500/20 text-green-400' :
                          train.jobCardStatus === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {train.jobCardStatus}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-300 text-xs sm:text-sm hidden xl:table-cell">{train.lastMaintenance}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-300 text-xs sm:text-sm hidden xl:table-cell">{train.nextMaintenance}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 px-2 sm:px-4 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-lg font-medium">No trains found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default DashboardPage;
