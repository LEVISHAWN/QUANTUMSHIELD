import React from 'react';
import { Link } from 'react-router-dom';

interface HomePageProps {
  onSignUpClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSignUpClick }) => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Prepare for the
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Quantum Era
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              QuantumShield provides AI-driven post-quantum cryptography solutions to protect 
              your organization from the looming threat of quantum computing attacks. Secure 
              your future today.
            </p>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {/* Starter Plan */}
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
                <div className="text-3xl font-bold text-white mb-1">
                  $500<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="text-gray-300 text-sm mb-6 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Basic quantum protection
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Essential monitoring
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Email support
                  </li>
                </ul>
                <button className="w-full bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors">
                  Get Started
                </button>
              </div>

              {/* Professional Plan - Most Popular */}
              <div className="bg-gradient-to-b from-purple-600/20 to-blue-600/20 backdrop-blur-lg border border-purple-500 rounded-2xl p-6 relative transform scale-105">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
                <div className="text-3xl font-bold text-white mb-1">
                  $1200<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="text-gray-300 text-sm mb-6 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Advanced threat detection
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Real-time monitoring
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Custom integrations
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                  Get Started
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-white mb-1">
                  $5000<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="text-gray-300 text-sm mb-6 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Full enterprise suite
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    24/7 dedicated support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Custom algorithms
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Compliance reporting
                  </li>
                </ul>
                <button className="w-full bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors">
                  Get Started
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onSignUpClick}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Your Free Trial
              </button>
              <Link
                to="/features"
                className="text-purple-400 hover:text-purple-300 px-8 py-4 text-lg font-semibold transition-colors underline underline-offset-4"
              >
                Learn More
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Enterprise Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Quick Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>SOC Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Section */}
      <section className="py-20 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose QuantumShield?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay ahead of quantum threats with our comprehensive protection suite
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Protection</h3>
              <p className="text-gray-400">Advanced machine learning algorithms predict and prevent quantum threats before they happen.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM2 8a6 6 0 1112 0 6 6 0 01-12 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-gray-400">24/7 monitoring of your cryptographic infrastructure with instant threat alerts.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Post-Quantum Crypto</h3>
              <p className="text-gray-400">Future-proof encryption algorithms that resist both classical and quantum attacks.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
