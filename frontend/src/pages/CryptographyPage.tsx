import React from 'react';
import { User } from '../types/auth';

interface CryptographyPageProps {
  user: User | null;
}

const CryptographyPage: React.FC<CryptographyPageProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Cryptography Management</h1>
        <p className="text-purple-400 mt-2">Manage your post-quantum cryptographic algorithms</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Active Algorithms</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Kyber-512</h3>
              <p className="text-gray-400 text-sm">Key Encapsulation Mechanism</p>
            </div>
            <span className="text-green-400">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Dilithium-2</h3>
              <p className="text-gray-400 text-sm">Digital Signature Algorithm</p>
            </div>
            <span className="text-green-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptographyPage;
