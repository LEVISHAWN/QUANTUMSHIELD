import React from 'react';
import { User } from '../types/auth';

interface AIRecommendationsPageProps {
  user: User | null;
}

const AIRecommendationsPage: React.FC<AIRecommendationsPageProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">AI Security Insights</h1>
        <p className="text-purple-400 mt-2">AI-powered recommendations for enhanced security</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Latest Recommendations</h2>
        <div className="space-y-3">
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-blue-400 text-xl">🤖</span>
              <div>
                <h3 className="text-white font-medium">Update Algorithm Parameters</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Consider increasing Kyber key size for enhanced quantum resistance
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-xl">✅</span>
              <div>
                <h3 className="text-white font-medium">Security Posture Good</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Your current configuration provides strong post-quantum protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationsPage;
