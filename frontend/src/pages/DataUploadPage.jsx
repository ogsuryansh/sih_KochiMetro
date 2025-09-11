import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Notification from '../components/Notification';
import FileUpload from '../components/FileUpload';
import DataPreview from '../components/DataPreview';
import FieldMapping from '../components/FieldMapping';
import axios from 'axios';

const DataUploadPage = () => {
  const { user } = useAuth();
  const [uploadInfo, setUploadInfo] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewErrors, setPreviewErrors] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [originalFields, setOriginalFields] = useState([]);
  const [suggestedMapping, setSuggestedMapping] = useState(null);
  const [customMapping, setCustomMapping] = useState(null);
  const [tempFilePath, setTempFilePath] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchUploadInfo();
  }, []);

  const fetchUploadInfo = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/info`
      );
      if (response.data.success) {
        setUploadInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching upload info:', error);
    }
  };

  const handleUploadSuccess = (response) => {
    const { validRecords, invalidRecords, duplicatesSkipped, validationErrors } = response.data;
    
    let message = `Successfully uploaded ${validRecords} records!`;
    if (duplicatesSkipped > 0) {
      message += ` ${duplicatesSkipped} duplicates were skipped.`;
    }
    if (invalidRecords > 0) {
      message += ` ${invalidRecords} records were rejected due to validation errors.`;
    }
    
    setNotification({
      isVisible: true,
      message: message,
      type: 'success'
    });
    
    // Show validation errors if any
    if (validationErrors && validationErrors.length > 0) {
      setPreviewErrors(validationErrors);
    }
    
    // Clear preview data
    setPreviewData(null);
    setFileName('');
    setFileType('');
  };

  const handleUploadError = (errorMessage) => {
    setNotification({
      isVisible: true,
      message: errorMessage,
      type: 'error'
    });
  };

  const handleUploadStart = () => {
    setNotification({
      isVisible: false,
      message: '',
      type: 'info'
    });
  };

  const handleFileSelected = async (file) => {
    // First, upload file to get field mapping suggestions
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/trains`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (response.data.success) {
        // File processed successfully with smart mapping
        handleUploadSuccess(response.data);
      } else if (response.data.data && response.data.data.originalFields) {
        // Show field mapping interface
        setOriginalFields(response.data.data.originalFields);
        setSuggestedMapping(response.data.data.suggestedMapping);
        setShowFieldMapping(true);
        setFileName(file.name);
        setFileType(file.name.split('.').pop().toLowerCase());
      }
    } catch (error) {
      if (error.response?.data?.data?.originalFields) {
        // Show field mapping for files that need custom mapping
        setOriginalFields(error.response.data.data.originalFields);
        setSuggestedMapping(error.response.data.data.suggestedMapping);
        setShowFieldMapping(true);
        setFileName(file.name);
        setFileType(file.name.split('.').pop().toLowerCase());
      } else {
        handleUploadError(error.response?.data?.message || 'Upload failed');
      }
    }
  };

  const handleMappingConfirm = async (mapping) => {
    setCustomMapping(mapping);
    setShowFieldMapping(false);
    
    // Now upload with custom mapping
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mapping/apply`,
        {
          filePath: tempFilePath,
          fileType: `.${fileType}`,
          customMapping: mapping
        }
      );
      
      if (response.data.success) {
        // Process the mapped data
        const mappedData = response.data.data.mappedData;
        setPreviewData(mappedData);
        setNotification({
          isVisible: true,
          message: `File processed successfully! ${mappedData.length} records ready for upload.`,
          type: 'success'
        });
      }
    } catch (error) {
      handleUploadError('Failed to apply field mapping');
    }
  };

  const clearPreview = () => {
    setPreviewData(null);
    setPreviewErrors(null);
    setFileName('');
    setFileType('');
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-800 dark:to-gray-700 px-6 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white dark:text-white mb-2">
          Data Upload
        </h1>
        <p className="text-gray-400 dark:text-gray-300 text-sm sm:text-base">
          Upload train data from CSV, JSON, Excel, or XML files
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Upload Section */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Upload File</h2>
              <p className="text-gray-400 text-sm">
                Select a file containing train data to upload to the system
              </p>
            </div>

            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onUploadStart={handleUploadStart}
              onFileSelected={handleFileSelected}
            />

            {previewData && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Upload Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPreview}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear Preview
                  </Button>
                </div>
                <DataPreview
                  data={previewData}
                  errors={previewErrors}
                  fileName={fileName}
                  fileType={fileType}
                />
              </div>
            )}
          </Card>

          {/* Upload Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Guidelines</h2>
            
            {uploadInfo && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Supported Formats</h3>
                  <div className="flex flex-wrap gap-2">
                    {uploadInfo.supportedFormats?.map((format, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm font-medium"
                      >
                        {format.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">File Requirements</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Maximum file size: {uploadInfo.maxFileSize}</li>
                    <li>• One file at a time</li>
                    <li>• Train ID must be in format: KM-XXX</li>
                    <li>• Required fields: Train ID, Status, Mileage, Fitness</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Data Validation</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Duplicate Train IDs will be skipped</li>
                    <li>• Invalid data will be rejected</li>
                    <li>• Missing required fields will cause errors</li>
                    <li>• Date formats must be YYYY-MM-DD</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-400 font-medium text-sm mb-1">Sample CSV Format</h4>
                  <p className="text-blue-300 text-xs">
                    Train ID,Status,Mileage,Fitness,Job Card Status,Last Maintenance,Next Maintenance
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    KM-026,Service,12000,Good,Active,2024-11-20,2024-12-20
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Uploads or Statistics */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Upload Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-teal-400 mb-1">25</div>
              <div className="text-sm text-gray-400">Current Fleet Size</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">4</div>
              <div className="text-sm text-gray-400">Supported Formats</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">10MB</div>
              <div className="text-sm text-gray-400">Max File Size</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Field Mapping Modal */}
      {showFieldMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Configure Field Mapping</h2>
                <button
                  onClick={() => setShowFieldMapping(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <FieldMapping
                originalFields={originalFields}
                suggestedMapping={suggestedMapping}
                sampleData={[]}
                onMappingChange={setCustomMapping}
                onConfirm={handleMappingConfirm}
              />
            </div>
          </div>
        </div>
      )}

      <Notification
        isVisible={notification.isVisible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default DataUploadPage;
