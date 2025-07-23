import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen quantum-bg flex items-center justify-center">
      <div className="text-center">
        <div className="quantum-spinner mb-8"></div>
        <h2 className="text-3xl font-bold text-white mb-4">QuantumShield</h2>
        <p className="text-purple-400">Initializing quantum security protocols...</p>
      </div>
      
      <style jsx>{`
        .quantum-spinner {
          width: 80px;
          height: 80px;
          margin: 0 auto;
          border: 4px solid rgba(147, 51, 234, 0.3);
          border-left: 4px solid #9333ea;
          border-radius: 50%;
          animation: quantumSpin 1s linear infinite;
        }
        
        @keyframes quantumSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
