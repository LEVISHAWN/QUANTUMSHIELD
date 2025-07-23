import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/cryptography', label: 'Cryptography', icon: '🔐' },
    { path: '/threats', label: 'Threat Monitor', icon: '🛡️' },
    { path: '/systems', label: 'System Config', icon: '⚙️' },
    { path: '/ai-recommendations', label: 'AI Insights', icon: '🤖' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-black/40 lg:backdrop-blur-lg lg:border-r lg:border-gray-800">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4">
            <h2 className="text-lg font-bold text-white">Navigation</h2>
          </div>
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-black/90 backdrop-blur-lg border-r border-gray-800 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">QuantumShield</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
