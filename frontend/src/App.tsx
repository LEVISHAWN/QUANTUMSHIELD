/**
 * Main Application Component
 * Root component for QuantumShield marketing website with authentication
 * Handles routing between marketing pages and dashboard
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import marketing page components
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import SecurityPage from './pages/SecurityPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';

// Import dashboard pages (for authenticated users)
import DashboardPage from './pages/DashboardPage';
import CryptographyPage from './pages/CryptographyPage';
import ThreatMonitoringPage from './pages/ThreatMonitoringPage';
import SystemConfigPage from './pages/SystemConfigPage';
import AIRecommendationsPage from './pages/AIRecommendationsPage';

// Import layout components
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LoadingScreen from './components/ui/LoadingScreen';

// Import auth components
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';

// Import services and types
import { authService } from './services/authService';
import { User } from './types/auth';

// Import styles
import './styles/globals.css';

function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Theme state for futuristic purple-black design
  const [theme, setTheme] = useState<'dark' | 'quantum'>('quantum');

  /**
   * Initialize authentication state on app load
   * Checks for existing auth token and validates user session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user has a valid token
        const token = localStorage.getItem('quantumShieldToken');
        if (token) {
          // Validate token and get user data
          const userData = await authService.validateToken();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('quantumShieldToken');
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        // Clear invalid authentication state
        localStorage.removeItem('quantumShieldToken');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user login
   * Updates authentication state and stores user data
   */
  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('quantumShieldToken', token);

    // Close modals and sidebar
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setSidebarOpen(false);
  };

  /**
   * Handle user logout
   * Clears authentication state and redirects to home
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('quantumShieldToken');
      setSidebarOpen(false);
      setShowLoginModal(false);
      setShowRegisterModal(false);
    }
  };

  /**
   * Modal handlers
   */
  const handleShowLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleShowRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  /**
   * Toggle sidebar visibility (mobile responsiveness)
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen ${theme} transition-all duration-300`}>
      <div className="quantum-bg min-h-screen">
        <Router>
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              // Marketing website for unauthenticated users
              <motion.div
                key="marketing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen"
              >
                {/* Marketing Header */}
                <Header
                  onLoginClick={handleShowLogin}
                  onSignUpClick={handleShowRegister}
                />

                {/* Marketing Routes */}
                <Routes>
                  <Route
                    path="/"
                    element={<HomePage onSignUpClick={handleShowRegister} />}
                  />
                  <Route
                    path="/features"
                    element={<FeaturesPage />}
                  />
                  <Route
                    path="/security"
                    element={<SecurityPage onSignUpClick={handleShowRegister} />}
                  />
                  <Route
                    path="/pricing"
                    element={<PricingPage onSignUpClick={handleShowRegister} />}
                  />
                  <Route
                    path="/about"
                    element={<AboutPage />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                  />
                </Routes>

                {/* Auth Modals */}
                <LoginModal
                  isOpen={showLoginModal}
                  onClose={handleCloseModals}
                  onLogin={handleLogin}
                  onSwitchToRegister={handleSwitchToRegister}
                />
                <RegisterModal
                  isOpen={showRegisterModal}
                  onClose={handleCloseModals}
                  onLogin={handleLogin}
                  onSwitchToLogin={handleSwitchToLogin}
                />
              </motion.div>
            ) : (
              // Authenticated dashboard layout
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-screen overflow-hidden"
              >
                {/* Sidebar Navigation */}
                <Sidebar
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  user={user}
                />

                {/* Sidebar overlay for mobile */}
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Top Navigation */}
                  <Navbar
                    user={user}
                    onToggleSidebar={toggleSidebar}
                    onLogout={handleLogout}
                    theme={theme}
                    onThemeChange={setTheme}
                  />

                  {/* Main Content with Page Transitions */}
                  <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <motion.div
                      className="container mx-auto px-4 py-6 max-w-7xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <Routes>
                        {/* Dashboard - Main overview page */}
                        <Route
                          path="/dashboard"
                          element={<DashboardPage user={user} />}
                        />

                        {/* Cryptography Management */}
                        <Route
                          path="/cryptography"
                          element={<CryptographyPage user={user} />}
                        />

                        {/* Threat Monitoring & Intelligence */}
                        <Route
                          path="/threats"
                          element={<ThreatMonitoringPage user={user} />}
                        />

                        {/* System Configuration */}
                        <Route
                          path="/systems"
                          element={<SystemConfigPage user={user} />}
                        />

                        {/* AI-Powered Recommendations */}
                        <Route
                          path="/ai-recommendations"
                          element={<AIRecommendationsPage user={user} />}
                        />

                        {/* Default redirect to dashboard */}
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />

                        {/* 404 fallback */}
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" replace />}
                        />
                      </Routes>
                    </motion.div>
                  </main>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Router>
      </div>
    </div>
  );
}

export default App;
