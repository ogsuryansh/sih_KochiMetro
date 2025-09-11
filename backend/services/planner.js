const fs = require('fs');
const path = require('path');

const readSampleTrains = () => {
  const trainsPath = path.join(__dirname, '../data/trains.json');
  const data = fs.readFileSync(trainsPath, 'utf8');
  return JSON.parse(data);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const fitnessToScore = (fitness) => {
  if (!fitness) return 0.0;
  const map = { 'Excellent': 1.0, 'Good': 0.7, 'Fair': 0.4, 'Poor': 0.0 };
  return map[fitness] !== undefined ? map[fitness] : 0.0;
};

const normalize = (value, min, max) => {
  if (max === min) return 0.0;
  return (value - min) / (max - min);
};

const computeMileageStats = (trains) => {
  const mileages = trains.map(t => Number(t.mileage || 0));
  const min = Math.min(...mileages);
  const max = Math.max(...mileages);
  const avg = mileages.reduce((a, b) => a + b, 0) / (mileages.length || 1);
  return { min, max, avg };
};

const evaluateEligibility = (train) => {
  const reasons = [];
  let eligibleForService = true;

  if (String(train.fitness || '').toLowerCase() === 'poor') {
    eligibleForService = false;
    reasons.push('fitness: Poor');
  }

  if (String(train.jobCardStatus || '').toLowerCase() === 'in progress') {
    // Treat in-progress job cards as must-fix for demo
    eligibleForService = false;
    reasons.push('job-card: in progress');
  }

  return { eligibleForService, reasons };
};

const scoreTrain = (train, ctx) => {
  const { stats, weights } = ctx;
  const reasons = [];

  const fitnessScore = fitnessToScore(train.fitness);
  reasons.push(`fitnessScore=${fitnessScore.toFixed(2)}`);

  const mileage = Number(train.mileage || 0);
  // Prefer closer to average to balance wear
  const deviation = Math.abs(mileage - stats.avg);
  const deviationNorm = normalize(deviation, 0, Math.max(1, stats.max - stats.min));
  const mileageScore = 1 - deviationNorm; // closer to avg => higher
  reasons.push(`mileageScore=${mileageScore.toFixed(2)}`);

  const score = clamp(
    (weights.mileage || 0.6) * mileageScore +
    (weights.fitness || 0.4) * fitnessScore,
    0,
    1
  );

  return { score, details: reasons };
};

const runPlan = (input = {}) => {
  const {
    trains: inputTrains,
    weights = { mileage: 0.6, fitness: 0.4 },
    inductionTime = new Date().toISOString(),
    serviceCount = 20,
    standbyCount = 3
  } = input;

  const trains = Array.isArray(inputTrains) && inputTrains.length > 0 ? inputTrains : readSampleTrains();

  const stats = computeMileageStats(trains);
  const ctx = { stats, weights, inductionTime };

  const evaluated = trains.map(t => {
    const eligibility = evaluateEligibility(t);
    const scoring = scoreTrain(t, ctx);
    return {
      trainId: t.trainId,
      mileage: t.mileage,
      fitness: t.fitness,
      jobCardStatus: t.jobCardStatus,
      currentStatus: t.status,
      eligible: eligibility.eligibleForService,
      score: scoring.score,
      reasons: [...eligibility.reasons, ...scoring.details]
    };
  });

  const ineligible = evaluated.filter(e => !e.eligible).map(e => ({ ...e, assignment: 'IBL' }));
  const eligible = evaluated.filter(e => e.eligible);

  eligible.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // tie-breaker: lower mileage first
    if ((a.mileage || 0) !== (b.mileage || 0)) return (a.mileage || 0) - (b.mileage || 0);
    return String(a.trainId).localeCompare(String(b.trainId));
  });

  const assigned = [];
  eligible.forEach((e, idx) => {
    if (idx < serviceCount) {
      assigned.push({ ...e, assignment: 'Service' });
    } else if (idx < serviceCount + standbyCount) {
      assigned.push({ ...e, assignment: 'Standby' });
    } else {
      assigned.push({ ...e, assignment: 'IBL' });
    }
  });

  const items = [...assigned, ...ineligible];

  const summary = {
    totalTrains: items.length,
    service: items.filter(i => i.assignment === 'Service').length,
    standby: items.filter(i => i.assignment === 'Standby').length,
    ibl: items.filter(i => i.assignment === 'IBL').length,
    avgMileage: Number(stats.avg.toFixed(2))
  };

  const id = new Date().toISOString();

  return {
    success: true,
    id,
    inputs: { weights, inductionTime, serviceCount, standbyCount },
    summary,
    items
  };
};

module.exports = { runPlan };



