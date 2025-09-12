const xml2js = require('xml2js');
const fs = require('fs');

const processXML = (filePathOrBuffer, originalFileName = null) => {
  return new Promise((resolve, reject) => {
    try {
      let fileContent;
      
      // Handle both file paths and memory buffers
      if (Buffer.isBuffer(filePathOrBuffer)) {
        // Memory buffer - convert to string
        fileContent = filePathOrBuffer.toString('utf8');
      } else {
        // File path - read from file
        fileContent = fs.readFileSync(filePathOrBuffer, 'utf8');
      }
      
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true
      });
      
      parser.parseString(fileContent, (err, result) => {
        if (err) {
          reject(new Error(`XML parsing failed: ${err.message}`));
          return;
        }
        
        try {
          // Handle different XML structures
          let trains = [];
          
          if (result.trains && result.trains.train) {
            trains = Array.isArray(result.trains.train) ? result.trains.train : [result.trains.train];
          } else if (result.train) {
            trains = Array.isArray(result.train) ? result.train : [result.train];
          } else if (result.data && result.data.train) {
            trains = Array.isArray(result.data.train) ? result.data.train : [result.data.train];
          } else {
            reject(new Error('No train data found in XML file'));
            return;
          }
          
          const results = trains.map((train, index) => {
            // Map XML properties to train object structure
            const trainData = {
              trainId: train.trainId || train['Train ID'] || train.train_id || train.TrainID || train.id,
              status: train.status || train.Status || train.STATUS || 'Service',
              mileage: parseInt(train.mileage || train.Mileage || train.mileage_km || train['Mileage (km)'] || train.MILEAGE) || 0,
              branding: train.branding || train.Branding || train.BRANDING || 'Kochi Metro',
              fitness: train.fitness || train.Fitness || train.FITNESS || 'Good',
              jobCardStatus: train.jobCardStatus || train['Job Card Status'] || train.job_card_status || train['Job Card'] || train.JOBCARD || 'Active',
              lastMaintenance: train.lastMaintenance || train['Last Maintenance'] || train.last_maintenance || train['Last Maint.'] || train.LAST_MAINT || new Date().toISOString().split('T')[0],
              nextMaintenance: train.nextMaintenance || train['Next Maintenance'] || train.next_maintenance || train['Next Maint.'] || train.NEXT_MAINT || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
            
            return trainData;
          }).filter(train => train.trainId); // Only include trains with valid trainId
          
          if (results.length === 0) {
            reject(new Error('No valid data found in XML file'));
          } else {
            resolve(results);
          }
        } catch (parseError) {
          reject(new Error(`XML data processing failed: ${parseError.message}`));
        }
      });
    } catch (error) {
      reject(new Error(`XML file reading failed: ${error.message}`));
    }
  });
};

module.exports = { processXML };
