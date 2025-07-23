import React from 'react';
import { User } from '../types/auth';

interface DashboardPageProps {
  user: User | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.username}!</h1>
          <p className="text-purple-400 mt-2">QuantumShield Security Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">System Status</h3>
              <p className="text-green-400 mt-1">🟢 Operational</p>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Active Algorithms</h3>
              <p className="text-purple-400 mt-1">5 Post-Quantum</p>
            </div>
            <div className="text-2xl">🔐</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Threat Level</h3>
              <p className="text-yellow-400 mt-1">⚠️ Moderate</p>
            </div>
            <div className="text-2xl">🤖</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-green-400">✅</span>
              <span className="text-white">Key rotation completed</span>
            </div>
            <span className="text-gray-400 text-sm">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-blue-400">🔍</span>
              <span className="text-white">Threat scan initiated</span>
            </div>
            <span className="text-gray-400 text-sm">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-purple-400">🚀</span>
              <span className="text-white">System initialized</span>
            </div>
            <span className="text-gray-400 text-sm">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
