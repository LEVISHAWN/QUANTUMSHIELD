import React from 'react';
import { User } from '../types/auth';

interface SystemConfigPageProps {
  user: User | null;
}

const SystemConfigPage: React.FC<SystemConfigPageProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">System Configuration</h1>
        <p className="text-purple-400 mt-2">Configure your QuantumShield security settings</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Auto Key Rotation</h3>
              <p className="text-gray-400 text-sm">Automatically rotate keys every 24 hours</p>
            </div>
            <div className="text-green-400">Enabled</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Threat Detection</h3>
              <p className="text-gray-400 text-sm">Real-time quantum threat monitoring</p>
            </div>
            <div className="text-green-400">Enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;
