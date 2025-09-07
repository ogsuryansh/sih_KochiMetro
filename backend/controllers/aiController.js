const { runOptimization } = require('../services/aiService');

const runAIOptimization = (req, res) => {
  try {
    const result = runOptimization();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('AI controller error:', error);
    res.status(500).json({
      success: false,
      message: 'AI optimization failed',
      error: error.message
    });
  }
};

module.exports = {
  runAIOptimization
};
 