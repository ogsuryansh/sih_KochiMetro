import React from 'react';

const DataPreview = ({ data, errors, fileName, fileType }) => {
  if (!data || data.length === 0) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Service': return 'bg-green-500/20 text-green-400';
      case 'Standby': return 'bg-yellow-500/20 text-yellow-400';
      case 'Maintenance': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getFitnessColor = (fitness) => {
    switch (fitness) {
      case 'Excellent': return 'bg-green-500/20 text-green-400';
      case 'Good': return 'bg-blue-500/20 text-blue-400';
      case 'Fair': return 'bg-yellow-500/20 text-yellow-400';
      case 'Poor': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getJobCardColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'Pending': return 'bg-blue-500/20 text-blue-400';
      case 'Overdue': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Data Preview ({data.length} records)
        </h3>
        {fileName && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">{fileName}</span>
            <span className="ml-2 px-2 py-1 bg-gray-700 rounded text-xs">
              {fileType?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {errors && errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h4 className="text-red-400 font-medium">Validation Errors Found</h4>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-300 bg-red-500/10 p-2 rounded">
                <span className="font-medium">Row {error.row}</span> 
                {error.trainId && error.trainId !== 'Unknown' && (
                  <span className="ml-2 text-red-400">({error.trainId})</span>
                )}
                <div className="mt-1 text-xs">
                  {error.errors.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Train ID</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Mileage</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Fitness</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Job Card</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Maint.</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Next Maint.</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((train, index) => (
              <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-3 px-4 text-white font-medium">{train.trainId}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(train.status)}`}>
                    {train.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {train.mileage?.toLocaleString()} km
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getFitnessColor(train.fitness)}`}>
                    {train.fitness}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getJobCardColor(train.jobCardStatus)}`}>
                    {train.jobCardStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300 text-xs">
                  {train.lastMaintenance}
                </td>
                <td className="py-3 px-4 text-gray-300 text-xs">
                  {train.nextMaintenance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Showing first 10 records of {data.length} total
            </p>
            <p className="text-gray-500 text-xs mt-1">
              All records will be processed when you confirm the upload
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPreview;
