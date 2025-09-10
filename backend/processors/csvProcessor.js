const csv = require('csv-parser');
const fs = require('fs');

const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        console.log('CSV row data:', data);
        // Map CSV columns to train object structure
        // Handle various column name formats
        const train = {
          trainId: data.trainId || data['Train ID'] || data.train_id || data['train_id'] || data.TrainID,
          status: data.status || data.Status || data.STATUS || 'Service',
          mileage: parseInt(data.mileage || data.Mileage || data.mileage_km || data['Mileage (km)'] || data.MILEAGE) || 0,
          branding: data.branding || data.Branding || data.BRANDING || 'Kochi Metro',
          fitness: data.fitness || data.Fitness || data.FITNESS || 'Good',
          jobCardStatus: data.jobCardStatus || data['Job Card Status'] || data.job_card_status || data['Job Card'] || data.JOBCARD || 'Active',
          lastMaintenance: data.lastMaintenance || data['Last Maintenance'] || data.last_maintenance || data['Last Maint.'] || data.LAST_MAINT || new Date().toISOString().split('T')[0],
          nextMaintenance: data.nextMaintenance || data['Next Maintenance'] || data.next_maintenance || data['Next Maint.'] || data.NEXT_MAINT || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        // Only add if trainId exists and is not empty
        if (train.trainId && train.trainId.trim() !== '') {
          results.push(train);
        }
      })
      .on('end', () => {
        if (results.length === 0) {
          reject(new Error('No valid data found in CSV file'));
        } else {
          resolve(results);
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV processing failed: ${error.message}`));
      });
  });
};

module.exports = { processCSV };
