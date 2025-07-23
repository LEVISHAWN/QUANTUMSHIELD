import React from 'react';
import { User } from '../../types/auth';

interface NavbarProps {
  user: User | null;
  onToggleSidebar: () => void;
  onLogout: () => void;
  theme: 'dark' | 'quantum';
  onThemeChange: (theme: 'dark' | 'quantum') => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onToggleSidebar, 
  onLogout, 
  theme, 
  onThemeChange 
}) => {
  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-white hover:text-purple-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">QuantumShield</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-400">Welcome,</span>
            <span className="text-sm font-medium text-white">{user?.username}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
