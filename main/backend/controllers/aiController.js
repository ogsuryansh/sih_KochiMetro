const { runOptimization } = require('../services/aiService');
const { runPlan } = require('../services/planner');

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

const runPlanning = (req, res) => {
  try {
    const input = req.body || {};
    const result = runPlan(input);
    res.json(result);
  } catch (error) {
    console.error('Planning controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Planning failed',
      error: error.message
    });
  }
};

module.exports = {
  runAIOptimization,
  runPlanning
};
 