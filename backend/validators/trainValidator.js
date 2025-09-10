const Joi = require('joi');

const trainSchema = Joi.object({
  trainId: Joi.string().pattern(/^KM-\d{3}$/).required().messages({
    'string.pattern.base': 'Train ID must be in format KM-XXX (e.g., KM-001)',
    'any.required': 'Train ID is required'
  }),
  status: Joi.string().valid('Service', 'Standby', 'Maintenance').required().messages({
    'any.only': 'Status must be one of: Service, Standby, Maintenance',
    'any.required': 'Status is required'
  }),
  mileage: Joi.number().integer().min(0).max(1000000).required().messages({
    'number.base': 'Mileage must be a number',
    'number.integer': 'Mileage must be an integer',
    'number.min': 'Mileage must be at least 0',
    'number.max': 'Mileage cannot exceed 1,000,000',
    'any.required': 'Mileage is required'
  }),
  branding: Joi.string().min(1).max(100).default('Kochi Metro').messages({
    'string.min': 'Branding must be at least 1 character',
    'string.max': 'Branding cannot exceed 100 characters'
  }),
  fitness: Joi.string().valid('Excellent', 'Good', 'Fair', 'Poor').required().messages({
    'any.only': 'Fitness must be one of: Excellent, Good, Fair, Poor',
    'any.required': 'Fitness is required'
  }),
  jobCardStatus: Joi.string().valid('Active', 'Pending', 'In Progress', 'Overdue').required().messages({
    'any.only': 'Job Card Status must be one of: Active, Pending, In Progress, Overdue',
    'any.required': 'Job Card Status is required'
  }),
  lastMaintenance: Joi.date().iso().required().messages({
    'date.format': 'Last Maintenance must be a valid date in YYYY-MM-DD format',
    'any.required': 'Last Maintenance is required'
  }),
  nextMaintenance: Joi.date().iso().min(Joi.ref('lastMaintenance')).required().messages({
    'date.format': 'Next Maintenance must be a valid date in YYYY-MM-DD format',
    'date.min': 'Next Maintenance must be after Last Maintenance',
    'any.required': 'Next Maintenance is required'
  })
});

const validateTrainData = async (data) => {
  const errors = [];
  const validData = [];
  
  for (let i = 0; i < data.length; i++) {
    const { error, value } = trainSchema.validate(data[i], { 
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      errors.push({
        row: i + 1,
        trainId: data[i].trainId || 'Unknown',
        errors: error.details.map(detail => detail.message)
      });
    } else {
      validData.push(value);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    validData: validData,
    totalRecords: data.length,
    validRecords: validData.length,
    invalidRecords: errors.length
  };
};

const validateSingleTrain = (trainData) => {
  const { error, value } = trainSchema.validate(trainData, { 
    abortEarly: false,
    stripUnknown: true
  });
  
  return {
    isValid: !error,
    error: error,
    data: value
  };
};

module.exports = { 
  validateTrainData, 
  validateSingleTrain,
  trainSchema 
};
