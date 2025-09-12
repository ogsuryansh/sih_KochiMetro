const { processCSV } = require('./csvProcessor');
const { processJSON } = require('./jsonProcessor');
const { processExcel } = require('./excelProcessor');
const { processXML } = require('./xmlProcessor');

// Smart field mapping based on content patterns
const detectFieldMapping = (data) => {
  if (!data || data.length === 0) return null;
  
  const sample = data[0];
  const mapping = {};
  
  // Train ID detection patterns
  const trainIdPatterns = [
    /train.*id/i, /trainid/i, /train_id/i, /id/i, /vehicle.*id/i, /unit.*id/i
  ];
  
  // Status detection patterns  
  const statusPatterns = [
    /status/i, /state/i, /condition/i, /operational.*status/i, /service.*status/i
  ];
  
  // Mileage detection patterns
  const mileagePatterns = [
    /mileage/i, /miles/i, /km/i, /kilometers/i, /distance/i, /odometer/i, /usage/i
  ];
  
  // Fitness detection patterns
  const fitnessPatterns = [
    /fitness/i, /health/i, /condition/i, /performance/i, /rating/i, /grade/i
  ];
  
  // Maintenance detection patterns
  const maintenancePatterns = [
    /maintenance/i, /maint/i, /service/i, /repair/i, /inspection/i
  ];
  
  // Brand detection patterns
  const brandPatterns = [
    /brand/i, /branding/i, /manufacturer/i, /make/i, /company/i
  ];
  
  // Job card patterns
  const jobCardPatterns = [
    /job.*card/i, /work.*order/i, /ticket/i, /task/i, /assignment/i
  ];
  
  // Date patterns
  const datePatterns = [
    /date/i, /time/i, /last/i, /next/i, /due/i, /scheduled/i
  ];
  
  // Function to find matching field
  const findMatchingField = (patterns, sample) => {
    for (const key in sample) {
      for (const pattern of patterns) {
        if (pattern.test(key)) {
          return key;
        }
      }
    }
    return null;
  };
  
  // Map fields
  mapping.trainId = findMatchingField(trainIdPatterns, sample) || 'trainId';
  mapping.status = findMatchingField(statusPatterns, sample) || 'status';
  mapping.mileage = findMatchingField(mileagePatterns, sample) || 'mileage';
  mapping.fitness = findMatchingField(fitnessPatterns, sample) || 'fitness';
  mapping.branding = findMatchingField(brandPatterns, sample) || 'branding';
  mapping.jobCardStatus = findMatchingField(jobCardPatterns, sample) || 'jobCardStatus';
  
  // Find date fields
  const dateFields = [];
  for (const key in sample) {
    for (const pattern of datePatterns) {
      if (pattern.test(key)) {
        dateFields.push(key);
      }
    }
  }
  
  // Assign last and next maintenance dates
  if (dateFields.length >= 2) {
    mapping.lastMaintenance = dateFields[0];
    mapping.nextMaintenance = dateFields[1];
  } else if (dateFields.length === 1) {
    mapping.lastMaintenance = dateFields[0];
    mapping.nextMaintenance = dateFields[0]; // Use same field if only one date
  } else {
    mapping.lastMaintenance = 'lastMaintenance';
    mapping.nextMaintenance = 'nextMaintenance';
  }
  
  return mapping;
};

// Apply smart mapping to data
const applySmartMapping = (data, mapping) => {
  if (!mapping) return data;
  
    return data.map((item, index) => {
      const mapped = {};
      
      // Map each field
      for (const [targetField, sourceField] of Object.entries(mapping)) {
        if (sourceField && item[sourceField] !== undefined) {
          mapped[targetField] = item[sourceField];
        }
      }
      
      // If no trainId found, try to generate one or use row index
      if (!mapped.trainId || mapped.trainId.trim() === '') {
        // Try to find any ID-like field
        const idFields = Object.keys(item).filter(key => 
          key.toLowerCase().includes('id') || 
          key.toLowerCase().includes('train') ||
          key.toLowerCase().includes('unit') ||
          key.toLowerCase().includes('vehicle')
        );
        
        if (idFields.length > 0) {
          mapped.trainId = item[idFields[0]];
        } else {
          // Generate a temporary ID
          mapped.trainId = `TEMP-${index + 1}`;
        }
      }
    
    // Set defaults for missing fields
    if (!mapped.branding) mapped.branding = 'Kochi Metro';
    if (!mapped.status) mapped.status = 'Service';
    if (!mapped.fitness) mapped.fitness = 'Good';
    if (!mapped.jobCardStatus) mapped.jobCardStatus = 'Active';
    if (!mapped.mileage) mapped.mileage = 0;
    
    // Handle dates
    if (!mapped.lastMaintenance) {
      mapped.lastMaintenance = new Date().toISOString().split('T')[0];
    }
    if (!mapped.nextMaintenance) {
      mapped.nextMaintenance = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    // Clean and convert data
    if (mapped.trainId) {
      mapped.trainId = String(mapped.trainId).trim();
    }
    
    if (mapped.mileage) {
      const mileage = String(mapped.mileage).replace(/[^\d]/g, '');
      mapped.mileage = parseInt(mileage) || 0;
    }
    
    // Normalize status values
    if (mapped.status) {
      const status = String(mapped.status).toLowerCase();
      if (status.includes('service') || status.includes('active') || status.includes('running')) {
        mapped.status = 'Service';
      } else if (status.includes('standby') || status.includes('idle') || status.includes('waiting')) {
        mapped.status = 'Standby';
      } else if (status.includes('maintenance') || status.includes('repair') || status.includes('down')) {
        mapped.status = 'Maintenance';
      }
    }
    
    // Normalize fitness values
    if (mapped.fitness) {
      const fitness = String(mapped.fitness).toLowerCase();
      if (fitness.includes('excellent') || fitness.includes('perfect') || fitness.includes('a+')) {
        mapped.fitness = 'Excellent';
      } else if (fitness.includes('good') || fitness.includes('fine') || fitness.includes('a')) {
        mapped.fitness = 'Good';
      } else if (fitness.includes('fair') || fitness.includes('average') || fitness.includes('b')) {
        mapped.fitness = 'Fair';
      } else if (fitness.includes('poor') || fitness.includes('bad') || fitness.includes('c')) {
        mapped.fitness = 'Poor';
      }
    }
    
    // Normalize job card status
    if (mapped.jobCardStatus) {
      const jobCard = String(mapped.jobCardStatus).toLowerCase();
      if (jobCard.includes('active') || jobCard.includes('open') || jobCard.includes('assigned')) {
        mapped.jobCardStatus = 'Active';
      } else if (jobCard.includes('pending') || jobCard.includes('waiting') || jobCard.includes('scheduled')) {
        mapped.jobCardStatus = 'Pending';
      } else if (jobCard.includes('progress') || jobCard.includes('working') || jobCard.includes('ongoing')) {
        mapped.jobCardStatus = 'In Progress';
      } else if (jobCard.includes('overdue') || jobCard.includes('late') || jobCard.includes('delayed')) {
        mapped.jobCardStatus = 'Overdue';
      }
    }
    
    return mapped;
  }).filter(item => item.trainId); // Only include items with trainId
};

// Enhanced file processor with smart mapping - supports both file paths and memory buffers
const processFileSmart = async (filePathOrBuffer, fileType, originalFileName = null) => {
  try {
    const ext = fileType.toLowerCase();
    let rawData;
    
    // Process file based on type - handle both file paths and memory buffers
    switch (ext) {
      case '.csv':
        rawData = await processCSV(filePathOrBuffer, originalFileName);
        break;
      case '.json':
        rawData = await processJSON(filePathOrBuffer, originalFileName);
        break;
      case '.xlsx':
      case '.xls':
        rawData = await processExcel(filePathOrBuffer, originalFileName);
        break;
      case '.xml':
        rawData = await processXML(filePathOrBuffer, originalFileName);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in file');
    }
    
    // Detect field mapping
    const mapping = detectFieldMapping(rawData);
    console.log('Detected field mapping:', mapping);
    
    // Apply smart mapping
    const mappedData = applySmartMapping(rawData, mapping);
    
    if (mappedData.length === 0) {
      console.log('No valid data found after mapping. Raw data sample:', rawData.slice(0, 2));
      console.log('Applied mapping:', mapping);
      console.log('Available columns:', rawData.length > 0 ? Object.keys(rawData[0]) : []);
      
      // Check if this looks like train data
      const sampleRow = rawData[0] || {};
      const hasTrainFields = Object.keys(sampleRow).some(key => 
        key.toLowerCase().includes('train') || 
        key.toLowerCase().includes('id') ||
        key.toLowerCase().includes('status') ||
        key.toLowerCase().includes('mileage')
      );
      
      if (!hasTrainFields) {
        throw new Error('This file does not appear to contain train fleet data. Please upload a file with train information (Train ID, Status, Mileage, etc.).');
      }
      
      throw new Error('No valid data found after mapping. Please check your data format and ensure it contains train fleet information.');
    }
    
    return {
      data: mappedData,
      mapping: mapping,
      originalFields: rawData.length > 0 ? Object.keys(rawData[0]) : [],
      mappedFields: Object.keys(mappedData[0] || {})
    };
    
  } catch (error) {
    throw new Error(`Smart file processing failed: ${error.message}`);
  }
};

module.exports = { 
  processFileSmart, 
  detectFieldMapping, 
  applySmartMapping 
};
