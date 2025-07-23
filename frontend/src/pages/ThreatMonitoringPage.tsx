import React from 'react';
import { User } from '../types/auth';

interface ThreatMonitoringPageProps {
  user: User | null;
}

const ThreatMonitoringPage: React.FC<ThreatMonitoringPageProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Threat Monitoring</h1>
        <p className="text-purple-400 mt-2">Real-time quantum threat detection and analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-2">Threat Level</h3>
          <div className="text-2xl text-yellow-400">⚠️ Moderate</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-2">Scans Today</h3>
          <div className="text-2xl text-blue-400">24</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-2">Vulnerabilities</h3>
          <div className="text-2xl text-red-400">3</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Threats</h2>
        <div className="text-gray-400">No active threats detected</div>
      </div>
    </div>
  );
};

export default ThreatMonitoringPage;
