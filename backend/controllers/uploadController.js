const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { processFile } = require('../processors/fileProcessor');
const { processFileSmart } = require('../processors/smartProcessor');
const { validateTrainData } = require('../validators/trainValidator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.xlsx', '.xls', '.xml'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, JSON, Excel, and XML files are allowed.'));
    }
  }
});

// Helper function to save train data to JSON file
const saveTrainData = async (newTrains) => {
  try {
    const trainsPath = path.join(__dirname, '../data/trains.json');
    
    // Check if file exists, if not create it
    if (!fs.existsSync(trainsPath)) {
      fs.writeFileSync(trainsPath, '[]');
    }
    
    let existingTrains = [];
    try {
      const trainsData = fs.readFileSync(trainsPath, 'utf8');
      if (trainsData.trim()) {
        existingTrains = JSON.parse(trainsData);
      }
    } catch (parseError) {
      console.error('Error parsing trains.json, initializing with empty array:', parseError.message);
      existingTrains = [];
      fs.writeFileSync(trainsPath, '[]');
    }
    
    // Ensure existingTrains is an array
    if (!Array.isArray(existingTrains)) {
      existingTrains = [];
    }
    
    // Get existing train IDs to avoid duplicates
    const existingIds = new Set(existingTrains.map(train => train.trainId));
    
    // Filter out duplicates and add new trains
    const uniqueNewTrains = newTrains.filter(train => !existingIds.has(train.trainId));
    const updatedTrains = [...existingTrains, ...uniqueNewTrains];
    
    // Save updated data
    fs.writeFileSync(trainsPath, JSON.stringify(updatedTrains, null, 2));
    
    return {
      totalExisting: existingTrains.length,
      newAdded: uniqueNewTrains.length,
      duplicatesSkipped: newTrains.length - uniqueNewTrains.length,
      totalAfter: updatedTrains.length
    };
  } catch (error) {
    throw new Error(`Failed to save train data: ${error.message}`);
  }
};

const uploadFile = async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    tempFilePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    const originalFileName = req.file.originalname;
    
    console.log(`Processing file: ${originalFileName} (${fileType})`);
    
    // Process the file with smart mapping
    const processResult = await processFileSmart(tempFilePath, fileType);
    const processedData = processResult.data;
    console.log(`Processed ${processedData.length} records from file`);
    console.log('Field mapping used:', processResult.mapping);
    console.log('Sample processed data:', JSON.stringify(processedData[0], null, 2));
    
    if (!processedData || processedData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the uploaded file'
      });
    }
    
    // Validate the data
    console.log('Starting validation...');
    const validationResult = await validateTrainData(processedData);
    console.log('Validation result:', {
      isValid: validationResult.isValid,
      totalRecords: validationResult.totalRecords,
      validRecords: validationResult.validRecords,
      invalidRecords: validationResult.invalidRecords,
      errorCount: validationResult.errors.length
    });
    
    if (!validationResult.isValid) {
      console.log('Validation errors:', validationResult.errors);
      
      // If we have some valid records, proceed with partial upload
      if (validationResult.validRecords > 0) {
        console.log(`Proceeding with partial upload: ${validationResult.validRecords} valid records, ${validationResult.invalidRecords} invalid records`);
        
        // Save valid data to database
        const saveResult = await saveTrainData(validationResult.validData);
        
        return res.json({
          success: true,
          message: `Partial upload completed: ${validationResult.validRecords} records uploaded successfully, ${validationResult.invalidRecords} records rejected due to validation errors`,
          data: {
            fileName: originalFileName,
            fileType: fileType,
            totalRecords: validationResult.totalRecords,
            validRecords: validationResult.validRecords,
            invalidRecords: validationResult.invalidRecords,
            newRecordsAdded: saveResult.newAdded,
            duplicatesSkipped: saveResult.duplicatesSkipped,
            totalFleetSize: saveResult.totalAfter,
            validationErrors: validationResult.errors
          }
        });
      } else {
        // No valid records at all
        return res.status(400).json({
          success: false,
          message: 'All records failed validation',
          data: {
            totalRecords: validationResult.totalRecords,
            validRecords: validationResult.validRecords,
            invalidRecords: validationResult.invalidRecords,
            errors: validationResult.errors
          }
        });
      }
    }

    // Save to database (update trains.json)
    const saveResult = await saveTrainData(validationResult.validData);
    
    res.json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        fileName: originalFileName,
        fileType: fileType,
        totalRecords: validationResult.totalRecords,
        validRecords: validationResult.validRecords,
        newRecordsAdded: saveResult.newAdded,
        duplicatesSkipped: saveResult.duplicatesSkipped,
        totalFleetSize: saveResult.totalAfter
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'File processing failed',
      error: error.message
    });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await fs.remove(tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file:', cleanupError);
      }
    }
  }
};

const getUploadInfo = (req, res) => {
  try {
    const { getSupportedFormats } = require('../processors/fileProcessor');
    const supportedFormats = getSupportedFormats();
    
    res.json({
      success: true,
      data: {
        supportedFormats: supportedFormats,
        maxFileSize: '10MB',
        maxFiles: 1,
        description: 'Upload train data in CSV, JSON, Excel, or XML format'
      }
    });
  } catch (error) {
    console.error('Upload info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload information',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  getUploadInfo
};
