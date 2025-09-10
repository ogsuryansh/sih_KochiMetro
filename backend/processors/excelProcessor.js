const XLSX = require('xlsx');

const processExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        reject(new Error('No worksheets found in Excel file'));
        return;
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        reject(new Error('No data found in Excel file'));
        return;
      }
      
      const results = jsonData.map((row, index) => {
        // Map Excel columns to train object structure
        const train = {
          trainId: row.trainId || row['Train ID'] || row.train_id || row['train_id'] || row.TrainID,
          status: row.status || row.Status || row.STATUS || 'Service',
          mileage: parseInt(row.mileage || row.Mileage || row.mileage_km || row['Mileage (km)'] || row.MILEAGE) || 0,
          branding: row.branding || row.Branding || row.BRANDING || 'Kochi Metro',
          fitness: row.fitness || row.Fitness || row.FITNESS || 'Good',
          jobCardStatus: row.jobCardStatus || row['Job Card Status'] || row.job_card_status || row['Job Card'] || row.JOBCARD || 'Active',
          lastMaintenance: row.lastMaintenance || row['Last Maintenance'] || row.last_maintenance || row['Last Maint.'] || row.LAST_MAINT || new Date().toISOString().split('T')[0],
          nextMaintenance: row.nextMaintenance || row['Next Maintenance'] || row.next_maintenance || row['Next Maint.'] || row.NEXT_MAINT || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        return train;
      }).filter(train => train.trainId); // Only include trains with valid trainId
      
      if (results.length === 0) {
        reject(new Error('No valid data found in Excel file'));
      } else {
        resolve(results);
      }
    } catch (error) {
      reject(new Error(`Excel processing failed: ${error.message}`));
    }
  });
};

module.exports = { processExcel };
