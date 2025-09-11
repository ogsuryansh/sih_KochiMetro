const fs = require('fs');
const path = require('path');

const getTrains = () => {
  const trainsPath = path.join(__dirname, '../data/trains.json');
  const trainsData = fs.readFileSync(trainsPath, 'utf8');
  return JSON.parse(trainsData);
};

const getFleetSummary = (req, res) => {
  try {
    const trains = getTrains();
    
    const summary = {
      totalTrains: trains.length,
      inService: trains.filter(train => train.status === 'Service').length,
      standby: trains.filter(train => train.status === 'Standby').length,
      maintenance: trains.filter(train => train.status === 'Maintenance').length,
      overdueMaintenance: trains.filter(train => train.jobCardStatus === 'Overdue').length
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Fleet summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch fleet summary' 
    });
  }
};

const getAllTrains = (req, res) => {
  try {
    const trains = getTrains();
    
    res.json({
      success: true,
      data: trains
    });
  } catch (error) {
    console.error('Get trains error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch trains data' 
    });
  }
};

module.exports = {
  getFleetSummary,
  getAllTrains
};
