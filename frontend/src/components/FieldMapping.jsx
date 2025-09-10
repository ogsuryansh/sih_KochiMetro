import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FieldMapping = ({ 
  originalFields, 
  suggestedMapping, 
  sampleData, 
  onMappingChange, 
  onConfirm 
}) => {
  const [mapping, setMapping] = useState(suggestedMapping || {});
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (suggestedMapping) {
      setMapping(suggestedMapping);
    }
  }, [suggestedMapping]);

  const fieldTypes = {
    trainId: { name: 'Train ID', required: true, description: 'Unique identifier (e.g., KM-001)' },
    status: { name: 'Status', required: true, description: 'Service, Standby, or Maintenance' },
    mileage: { name: 'Mileage', required: true, description: 'Distance in kilometers' },
    fitness: { name: 'Fitness', required: true, description: 'Excellent, Good, Fair, or Poor' },
    branding: { name: 'Branding', required: false, description: 'Manufacturer or company name' },
    jobCardStatus: { name: 'Job Card Status', required: true, description: 'Active, Pending, In Progress, or Overdue' },
    lastMaintenance: { name: 'Last Maintenance', required: true, description: 'Date of last maintenance' },
    nextMaintenance: { name: 'Next Maintenance', required: true, description: 'Scheduled next maintenance date' }
  };

  const handleMappingChange = (targetField, sourceField) => {
    const newMapping = { ...mapping, [targetField]: sourceField };
    setMapping(newMapping);
    onMappingChange && onMappingChange(newMapping);
  };

  const generatePreview = () => {
    if (!sampleData || sampleData.length === 0) return [];
    
    return sampleData.slice(0, 3).map((row, index) => {
      const preview = {};
      Object.entries(mapping).forEach(([targetField, sourceField]) => {
        if (sourceField && row[sourceField] !== undefined) {
          preview[targetField] = row[sourceField];
        }
      });
      return { ...preview, _original: row };
    });
  };

  const mappedPreviewData = generatePreview();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Field Mapping Configuration</h3>
        <p className="text-gray-400 text-sm mb-6">
          Map your data columns to the required train data fields. The system has suggested mappings based on your data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(fieldTypes).map(([targetField, config]) => (
          <div key={targetField} className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {config.name}
              {config.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <p className="text-xs text-gray-500">{config.description}</p>
            <select
              value={mapping[targetField] || ''}
              onChange={(e) => handleMappingChange(targetField, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="">Select column...</option>
              {originalFields.map(field => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {mappedPreviewData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-white mb-3">Data Preview</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-400">Train ID</th>
                  <th className="text-left py-2 px-3 text-gray-400">Status</th>
                  <th className="text-left py-2 px-3 text-gray-400">Mileage</th>
                  <th className="text-left py-2 px-3 text-gray-400">Fitness</th>
                  <th className="text-left py-2 px-3 text-gray-400">Job Card</th>
                </tr>
              </thead>
              <tbody>
                {mappedPreviewData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-2 px-3 text-white">{row.trainId || '-'}</td>
                    <td className="py-2 px-3 text-gray-300">{row.status || '-'}</td>
                    <td className="py-2 px-3 text-gray-300">{row.mileage || '-'}</td>
                    <td className="py-2 px-3 text-gray-300">{row.fitness || '-'}</td>
                    <td className="py-2 px-3 text-gray-300">{row.jobCardStatus || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => onConfirm && onConfirm(mapping)}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
        >
          Confirm Mapping
        </button>
      </div>
    </div>
  );
};

export default FieldMapping;
