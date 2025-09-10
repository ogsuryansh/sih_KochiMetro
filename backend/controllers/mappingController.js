const { detectFieldMapping, applySmartMapping } = require('../processors/smartProcessor');
const { processFile } = require('../processors/fileProcessor');

// Preview file and suggest field mappings
const previewFile = async (req, res) => {
  try {
    const { filePath, fileType } = req.body;
    
    if (!filePath || !fileType) {
      return res.status(400).json({
        success: false,
        message: 'File path and type are required'
      });
    }
    
    // Process file to get raw data
    const rawData = await processFile(filePath, fileType);
    
    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data found in file'
      });
    }
    
    // Detect field mapping
    const suggestedMapping = detectFieldMapping(rawData);
    
    // Get sample data (first 5 records)
    const sampleData = rawData.slice(0, 5);
    
    res.json({
      success: true,
      data: {
        originalFields: Object.keys(rawData[0] || {}),
        suggestedMapping: suggestedMapping,
        sampleData: sampleData,
        totalRecords: rawData.length
      }
    });
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      message: 'File preview failed',
      error: error.message
    });
  }
};

// Apply custom field mapping
const applyMapping = async (req, res) => {
  try {
    const { filePath, fileType, customMapping } = req.body;
    
    if (!filePath || !fileType || !customMapping) {
      return res.status(400).json({
        success: false,
        message: 'File path, type, and mapping are required'
      });
    }
    
    // Process file to get raw data
    const rawData = await processFile(filePath, fileType);
    
    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data found in file'
      });
    }
    
    // Apply custom mapping
    const mappedData = applySmartMapping(rawData, customMapping);
    
    if (mappedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found after mapping'
      });
    }
    
    res.json({
      success: true,
      data: {
        mappedData: mappedData,
        mapping: customMapping,
        totalRecords: mappedData.length,
        sampleData: mappedData.slice(0, 5)
      }
    });
    
  } catch (error) {
    console.error('Mapping error:', error);
    res.status(500).json({
      success: false,
      message: 'Field mapping failed',
      error: error.message
    });
  }
};

// Get supported field types and their descriptions
const getFieldTypes = (req, res) => {
  try {
    const fieldTypes = {
      trainId: {
        name: 'Train ID',
        description: 'Unique identifier for the train (e.g., KM-001)',
        required: true,
        examples: ['KM-001', 'TRAIN-123', 'Unit-456']
      },
      status: {
        name: 'Status',
        description: 'Current operational status',
        required: true,
        values: ['Service', 'Standby', 'Maintenance'],
        examples: ['Service', 'Active', 'Running', 'Standby', 'Idle', 'Maintenance', 'Repair']
      },
      mileage: {
        name: 'Mileage',
        description: 'Distance traveled in kilometers',
        required: true,
        type: 'number',
        examples: ['12000', '15,000 km', '12000.5']
      },
      fitness: {
        name: 'Fitness Level',
        description: 'Condition assessment of the train',
        required: true,
        values: ['Excellent', 'Good', 'Fair', 'Poor'],
        examples: ['Excellent', 'Good', 'A+', 'Fair', 'Average', 'Poor', 'Bad']
      },
      branding: {
        name: 'Branding',
        description: 'Train manufacturer or branding',
        required: false,
        examples: ['Kochi Metro', 'Bombardier', 'Siemens']
      },
      jobCardStatus: {
        name: 'Job Card Status',
        description: 'Current work order status',
        required: true,
        values: ['Active', 'Pending', 'In Progress', 'Overdue'],
        examples: ['Active', 'Open', 'Pending', 'Scheduled', 'In Progress', 'Working', 'Overdue', 'Late']
      },
      lastMaintenance: {
        name: 'Last Maintenance',
        description: 'Date of last maintenance (YYYY-MM-DD)',
        required: true,
        type: 'date',
        examples: ['2024-11-20', '11/20/2024', '20-Nov-2024']
      },
      nextMaintenance: {
        name: 'Next Maintenance',
        description: 'Scheduled next maintenance date (YYYY-MM-DD)',
        required: true,
        type: 'date',
        examples: ['2024-12-20', '12/20/2024', '20-Dec-2024']
      }
    };
    
    res.json({
      success: true,
      data: {
        fieldTypes: fieldTypes,
        requiredFields: ['trainId', 'status', 'mileage', 'fitness', 'jobCardStatus', 'lastMaintenance', 'nextMaintenance'],
        optionalFields: ['branding']
      }
    });
    
  } catch (error) {
    console.error('Field types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get field types',
      error: error.message
    });
  }
};

module.exports = {
  previewFile,
  applyMapping,
  getFieldTypes
};
