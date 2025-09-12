import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import config from '../../config.js';

const FileUpload = ({ onUploadSuccess, onUploadError, onUploadStart, onFileSelected }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // If onFileSelected callback is provided, use it for custom handling
    if (onFileSelected) {
      onFileSelected(file);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    onUploadStart && onUploadStart();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${config.API_URL}/upload/trains`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        onUploadSuccess && onUploadSuccess(response.data);
      } else {
        onUploadError && onUploadError(response.data.message || 'Upload failed');
      }
    } catch (error) {
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.response?.data?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.data.errors;
        const invalidCount = error.response.data.data.invalidRecords;
        errorMessage = `Validation failed: ${invalidCount} records have errors. Please check your data format.`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      onUploadError && onUploadError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadSuccess, onUploadError, onUploadStart, onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/xml': ['.xml']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-teal-500 bg-teal-500/10 scale-105' 
            : 'border-gray-600 hover:border-teal-500 hover:bg-gray-800/50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {uploading ? (
            <div className="w-full max-w-md">
              <p className="text-white mb-2 font-medium">Uploading... {uploadProgress}%</p>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">Processing your file...</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium text-white">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  or click to select a file
                </p>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">Supported formats:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">CSV</span>
                  <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">JSON</span>
                  <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">Excel</span>
                  <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">XML</span>
                </div>
                <p>Maximum file size: 10MB</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
