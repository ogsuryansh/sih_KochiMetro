const path = require('path');
const { processCSV } = require('./csvProcessor');
const { processJSON } = require('./jsonProcessor');
const { processExcel } = require('./excelProcessor');
const { processXML } = require('./xmlProcessor');

const processFile = async (filePath, fileType) => {
  try {
    const ext = fileType.toLowerCase();
    
    switch (ext) {
      case '.csv':
        return await processCSV(filePath);
      
      case '.json':
        return await processJSON(filePath);
      
      case '.xlsx':
      case '.xls':
        return await processExcel(filePath);
      
      case '.xml':
        return await processXML(filePath);
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    throw new Error(`File processing failed: ${error.message}`);
  }
};

const getSupportedFormats = () => {
  return [
    { extension: '.csv', mimeType: 'text/csv', name: 'CSV' },
    { extension: '.json', mimeType: 'application/json', name: 'JSON' },
    { extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Excel (XLSX)' },
    { extension: '.xls', mimeType: 'application/vnd.ms-excel', name: 'Excel (XLS)' },
    { extension: '.xml', mimeType: 'application/xml', name: 'XML' }
  ];
};

module.exports = { 
  processFile, 
  getSupportedFormats 
};
