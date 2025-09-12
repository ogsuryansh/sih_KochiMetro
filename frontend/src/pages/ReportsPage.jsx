import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import config from '../../config.js';

const ReportsPage = () => {
  const [trainsData, setTrainsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [fleetFilter, setFleetFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTrainsData();
  }, []);

  const fetchTrainsData = async () => {
    try {
      const response = await fetch(`${config.API_URL}/dashboard/trains`);
      const data = await response.json();
      if (data.success && data.data) {
        setTrainsData(data.data);
      } else {
        console.error('Failed to fetch trains data:', data.message);
        // Set empty array as fallback
        setTrainsData([]);
      }
    } catch (error) {
      console.error('Failed to fetch trains data:', error);
      // Set empty array as fallback
      setTrainsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (trainsData.length === 0) {
      alert('No data available to export');
      return;
    }
    
    const csvData = trainsData.map(train => ({
      'Train ID': train.trainId,
      'Status': train.status,
      'Mileage': train.mileage,
      'Fitness': train.fitness,
      'Job Card Status': train.jobCardStatus,
      'Last Maintenance': train.lastMaintenance,
      'Next Maintenance': train.nextMaintenance
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple PDF generation using browser print
    const printWindow = window.open('', '_blank');
    const reportContent = `
      <html>
        <head>
          <title>Fleet Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-item { text-align: center; padding: 10px; border: 1px solid #ccc; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Kochi Metro Fleet Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <div class="summary-item">
              <h3>${trainsData.filter(t => t.status === 'Service').length}</h3>
              <p>In Service</p>
            </div>
            <div class="summary-item">
              <h3>${trainsData.filter(t => t.status === 'Standby').length}</h3>
              <p>Standby</p>
            </div>
            <div class="summary-item">
              <h3>${trainsData.filter(t => t.status === 'Maintenance').length}</h3>
              <p>In Maintenance</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Train ID</th>
                <th>Status</th>
                <th>Mileage</th>
                <th>Fitness</th>
                <th>Job Card Status</th>
              </tr>
            </thead>
            <tbody>
              ${trainsData.map(train => `
                <tr>
                  <td>${train.trainId}</td>
                  <td>${train.status}</td>
                  <td>${train.mileage}</td>
                  <td>${train.fitness}</td>
                  <td>${train.jobCardStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate mock historical data for Fleet Availability
  const generateFleetAvailabilityData = () => {
    const days = parseInt(dateRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // More realistic variation with trends
      const baseService = 18 + Math.sin(i * 0.5) * 2;
      const baseStandby = 4 + Math.cos(i * 0.3) * 1.5;
      const baseMaintenance = 3 + Math.sin(i * 0.8) * 1.5;
      
      data.push({
        day: dayName,
        service: Math.round(baseService + Math.random() * 2 - 1),
        standby: Math.round(baseStandby + Math.random() * 1.5 - 0.75),
        maintenance: Math.round(baseMaintenance + Math.random() * 1.5 - 0.75)
      });
    }
    
    return data;
  };


  // Generate mileage distribution data
  const generateMileageData = () => {
    const mileages = trainsData.map(train => train.mileage || 0);
    const ranges = [
      { label: '0-10k', min: 0, max: 10000, count: 0, color: 'bg-gradient-to-t from-emerald-600 to-emerald-400', height: 0 },
      { label: '10k-12k', min: 10000, max: 12000, count: 0, color: 'bg-gradient-to-t from-blue-600 to-blue-400', height: 0 },
      { label: '12k-14k', min: 12000, max: 14000, count: 0, color: 'bg-gradient-to-t from-amber-600 to-amber-400', height: 0 },
      { label: '14k-16k', min: 14000, max: 16000, count: 0, color: 'bg-gradient-to-t from-purple-600 to-purple-400', height: 0 },
      { label: '16k+', min: 16000, max: Infinity, count: 0, color: 'bg-gradient-to-t from-red-600 to-red-400', height: 0 },
    ];

    mileages.forEach(mileage => {
      const range = ranges.find(r => mileage >= r.min && mileage < r.max);
      if (range) range.count++;
    });

    // Calculate heights with more variation
    const maxCount = Math.max(...ranges.map(r => r.count));
    ranges.forEach(range => {
      range.height = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
    });

    return ranges;
  };

  // Generate maintenance reasons data
  const generateMaintenanceReasonsData = () => {
    return [
      { name: 'HVAC System', count: 8, color: 'bg-gradient-to-r from-red-500 to-red-400', width: 100 },
      { name: 'Brake System', count: 6, color: 'bg-gradient-to-r from-orange-500 to-orange-400', width: 75 },
      { name: 'Door Mechanism', count: 5, color: 'bg-gradient-to-r from-amber-500 to-amber-400', width: 62.5 },
      { name: 'Signalling', count: 4, color: 'bg-gradient-to-r from-blue-500 to-blue-400', width: 50 },
      { name: 'Telecom', count: 3, color: 'bg-gradient-to-r from-purple-500 to-purple-400', width: 37.5 },
    ];
  };

  // Generate days in maintenance per train data
  const generateMaintenanceDaysData = () => {
    return trainsData.slice(0, 8).map(train => ({
      trainId: train.trainId,
      days: Math.floor(Math.random() * 15) + 1
    }));
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    const totalTrains = trainsData.length;
    
    // Handle empty data case
    if (totalTrains === 0) {
      return {
        fleetAvailability: 0,
        punctuality: 0,
        maintenanceEfficiency: 0,
        avgMileage: 0,
        costPerKm: 0,
        energyEfficiency: 0
      };
    }
    
    const serviceTrains = trainsData.filter(t => t.status === 'Service').length;
    const maintenanceTrains = trainsData.filter(t => t.status === 'Maintenance').length;
    const avgMileage = trainsData.reduce((sum, t) => sum + (t.mileage || 0), 0) / totalTrains;
    
    return {
      fleetAvailability: Math.round((serviceTrains / totalTrains) * 100),
      punctuality: 99.2 + Math.random() * 0.6, // Mock data
      maintenanceEfficiency: Math.round((1 - maintenanceTrains / totalTrains) * 100),
      avgMileage: Math.round(avgMileage),
      costPerKm: 12.5 + Math.random() * 2, // Mock data
      energyEfficiency: 85 + Math.random() * 10 // Mock data
    };
  };

  // Filter trains data based on current filters
  const getFilteredTrainsData = () => {
    let filtered = trainsData;
    
    if (fleetFilter !== 'all') {
      filtered = filtered.filter(train => train.trainId.includes(fleetFilter));
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(train => train.status === statusFilter);
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Fleet performance insights and maintenance analytics
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Performance Metrics Dashboard */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Performance Metrics</h2>
            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📊 Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📄 Export PDF
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(() => {
              const metrics = calculatePerformanceMetrics();
              return [
                { label: 'Fleet Availability', value: `${metrics.fleetAvailability}%`, color: 'text-green-400', icon: '🚀' },
                { label: 'Punctuality', value: `${metrics.punctuality.toFixed(1)}%`, color: 'text-blue-400', icon: '⏰' },
                { label: 'Maintenance Efficiency', value: `${metrics.maintenanceEfficiency}%`, color: 'text-purple-400', icon: '🔧' },
                { label: 'Avg Mileage', value: `${metrics.avgMileage.toLocaleString()} km`, color: 'text-yellow-400', icon: '📏' },
                { label: 'Cost per km', value: `₹${metrics.costPerKm.toFixed(1)}`, color: 'text-red-400', icon: '💰' },
                { label: 'Energy Efficiency', value: `${metrics.energyEfficiency.toFixed(0)}%`, color: 'text-cyan-400', icon: '⚡' }
              ].map((metric, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                  <div className="text-2xl mb-2">{metric.icon}</div>
                  <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                  <div className="text-gray-400 text-sm">{metric.label}</div>
                </div>
              ));
            })()}
          </div>
        </Card>

        {/* Interactive Filters */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Filters & Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Fleet Filter</label>
              <select
                value={fleetFilter}
                onChange={(e) => setFleetFilter(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Trains</option>
                <option value="KM-01">KM-001 to KM-010</option>
                <option value="KM-02">KM-011 to KM-020</option>
                <option value="KM-02">KM-021 to KM-025</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 rounded px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Service">Service</option>
                <option value="Standby">Standby</option>
                <option value="Maintenance">In Maintenance</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {getFilteredTrainsData().length} of {trainsData.length} trains
            </div>
            <button
              onClick={() => {
                setDateRange('7');
                setFleetFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </Card>
        {/* Fleet Availability Report */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Fleet Availability Report</h2>
              <p className="text-gray-400 text-sm">7-day trend of fleet status distribution</p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-300">Service</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-gray-300">Standby</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-300">Maintenance</span>
              </div>
            </div>
          </div>
          <div className="h-80 flex items-end justify-between space-x-3">
            {generateFleetAvailabilityData().map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="w-full flex flex-col justify-end h-64 space-y-1">
                  <div 
                    className="bg-gradient-to-t from-red-600 to-red-400 rounded-t shadow-lg transform transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${(day.maintenance / 25) * 100}%` }}
                    title={`Maintenance: ${day.maintenance}`}
                  ></div>
                  <div 
                    className="bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg transform transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${(day.standby / 25) * 100}%` }}
                    title={`Standby: ${day.standby}`}
                  ></div>
                  <div 
                    className="bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-b shadow-lg transform transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${(day.service / 25) * 100}%` }}
                    title={`Service: ${day.service}`}
                  ></div>
                </div>
                <div className="text-gray-400 text-xs mt-2 font-medium">{day.day}</div>
              </div>
            ))}
          </div>
        </Card>


        {/* Mileage Balancing Audit */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Mileage Balancing Audit</h2>
            <p className="text-gray-400 text-sm">Distribution of train mileage across the fleet</p>
          </div>
          <div className="h-80 flex items-end justify-between space-x-3">
            {generateMileageData().map((range, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div 
                  className={`w-full ${range.color} rounded-t shadow-lg transform transition-all duration-300 group-hover:scale-105`}
                  style={{ height: `${range.height}%` }}
                  title={`${range.label}: ${range.count} trains`}
                ></div>
                <div className="text-gray-400 text-xs mt-2 text-center">
                  <div className="font-medium">{range.label}</div>
                  <div className="font-bold text-white">{range.count}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Maintenance Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Top Maintenance Reasons</h2>
              <p className="text-gray-400 text-sm">Most common causes of maintenance</p>
            </div>
            <div className="h-80 space-y-4">
              {generateMaintenanceReasonsData().map((reason, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 ${reason.color} rounded-full mr-3 shadow-md`}></div>
                    <span className="text-gray-300 text-sm font-medium">{reason.name}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-700 rounded-full h-3 mr-3 shadow-inner">
                      <div 
                        className={`h-3 ${reason.color} rounded-full shadow-md transform transition-all duration-500 group-hover:scale-105`}
                        style={{ width: `${reason.width}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-bold text-sm w-8">{reason.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Days in Maintenance</h2>
              <p className="text-gray-400 text-sm">Maintenance duration by train</p>
            </div>
            <div className="h-80 space-y-4">
              {generateMaintenanceDaysData().map((train, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <span className="text-gray-300 text-sm font-medium">{train.trainId}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-700 rounded-full h-3 mr-3 shadow-inner">
                      <div 
                        className="h-3 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-md transform transition-all duration-500 group-hover:scale-105"
                        style={{ width: `${(train.days / 15) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-bold text-sm w-8">{train.days}d</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Fleet Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const filteredData = getFilteredTrainsData();
              return [
                { 
                  label: 'In Service', 
                  count: filteredData.filter(t => t.status === 'Service').length,
                  color: 'text-green-400',
                  icon: '🚀'
                },
                { 
                  label: 'Standby', 
                  count: filteredData.filter(t => t.status === 'Standby').length,
                  color: 'text-yellow-400',
                  icon: '⏸️'
                },
                { 
                  label: 'In Maintenance', 
                  count: filteredData.filter(t => t.status === 'Maintenance').length,
                  color: 'text-red-400',
                  icon: '🔧'
                },
                { 
                  label: 'Avg Mileage', 
                  count: filteredData.length > 0 ? Math.round(filteredData.reduce((sum, t) => sum + (t.mileage || 0), 0) / filteredData.length) : 0,
                  color: 'text-blue-400',
                  icon: '📏'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.count}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ));
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
