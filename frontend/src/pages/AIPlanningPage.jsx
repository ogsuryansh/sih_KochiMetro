import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import config from '../../config.js';

const AIPlanningPage = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState({ mileage: 0.6, fitness: 0.4 });
  const [inductionTime, setInductionTime] = useState('');
  const [serviceCount, setServiceCount] = useState(20);
  const [standbyCount, setStandbyCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const runPlan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.API_URL}/ai/plan/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights,
          inductionTime: inductionTime || new Date().toISOString(),
          serviceCount: Number(serviceCount),
          standbyCount: Number(standbyCount)
        })
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.error || data.message || 'Failed');
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed to run plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          AI Planning
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Advanced AI-powered planning and optimization
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mileage Weight</label>
              <input type="range" min="0" max="1" step="0.05" value={weights.mileage} onChange={(e) => setWeights(w => ({ ...w, mileage: Number(e.target.value) }))} className="w-full" />
              <div className="text-gray-300 text-sm mt-1">{weights.mileage.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Fitness Weight</label>
              <input type="range" min="0" max="1" step="0.05" value={weights.fitness} onChange={(e) => setWeights(w => ({ ...w, fitness: Number(e.target.value) }))} className="w-full" />
              <div className="text-gray-300 text-sm mt-1">{weights.fitness.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Induction Time</label>
              <input type="datetime-local" value={inductionTime} onChange={(e) => setInductionTime(e.target.value)} className="w-full bg-gray-800 text-gray-200 rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Service Count</label>
                <input type="number" min="0" value={serviceCount} onChange={(e) => setServiceCount(e.target.value)} className="w-full bg-gray-800 text-gray-200 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Standby Count</label>
                <input type="number" min="0" value={standbyCount} onChange={(e) => setStandbyCount(e.target.value)} className="w-full bg-gray-800 text-gray-200 rounded px-3 py-2" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={runPlan} disabled={loading} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded disabled:opacity-50">
              {loading ? 'Running…' : 'Run AI Optimization'}
            </button>
            {error && <span className="text-red-400 text-sm">{error}</span>}
          </div>
        </Card>

        {result && (
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Results</h3>
              <div className="text-gray-400 text-sm">Service {result.summary?.service} · Standby {result.summary?.standby} · IBL {result.summary?.ibl}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="text-gray-400 text-sm">
                  <tr>
                    <th className="py-2 pr-4">Train ID</th>
                    <th className="py-2 pr-4">Assignment</th>
                    <th className="py-2 pr-4">Mileage</th>
                    <th className="py-2 pr-4">Fitness</th>
                    <th className="py-2 pr-4">Score</th>
                    <th className="py-2 pr-4">Reasons</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200 text-sm">
                  {result.items?.map((item) => (
                    <tr key={item.trainId} className="border-t border-gray-800">
                      <td className="py-2 pr-4">{item.trainId}</td>
                      <td className="py-2 pr-4">
                        <span className={
                          item.assignment === 'Service' ? 'text-green-400' : item.assignment === 'Standby' ? 'text-yellow-400' : 'text-red-400'
                        }>{item.assignment}</span>
                      </td>
                      <td className="py-2 pr-4">{item.mileage}</td>
                      <td className="py-2 pr-4">{item.fitness}</td>
                      <td className="py-2 pr-4">{(item.score * 100).toFixed(0)}%</td>
                      <td className="py-2 pr-4 max-w-xl">
                        <div className="text-gray-400 truncate">{(item.reasons || []).slice(0, 3).join(' · ')}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIPlanningPage;
