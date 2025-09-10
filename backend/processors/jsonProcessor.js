const fs = require('fs');

const processJSON = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      // Handle both array and single object
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      const results = dataArray.map((item, index) => {
        // Map JSON properties to train object structure
        const train = {
          trainId: item.trainId || item['Train ID'] || item.train_id || item.TrainID,
          status: item.status || item.Status || item.STATUS || 'Service',
          mileage: parseInt(item.mileage || item.Mileage || item.mileage_km || item['Mileage (km)'] || item.MILEAGE) || 0,
          branding: item.branding || item.Branding || item.BRANDING || 'Kochi Metro',
          fitness: item.fitness || item.Fitness || item.FITNESS || 'Good',
          jobCardStatus: item.jobCardStatus || item['Job Card Status'] || item.job_card_status || item['Job Card'] || item.JOBCARD || 'Active',
          lastMaintenance: item.lastMaintenance || item['Last Maintenance'] || item.last_maintenance || item['Last Maint.'] || item.LAST_MAINT || new Date().toISOString().split('T')[0],
          nextMaintenance: item.nextMaintenance || item['Next Maintenance'] || item.next_maintenance || item['Next Maint.'] || item.NEXT_MAINT || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        return train;
      }).filter(train => train.trainId); // Only include trains with valid trainId
      
      if (results.length === 0) {
        reject(new Error('No valid data found in JSON file'));
      } else {
        resolve(results);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        reject(new Error('Invalid JSON format'));
      } else {
        reject(new Error(`JSON processing failed: ${error.message}`));
      }
    }
  });
};

module.exports = { processJSON };
