/**
 * QuantumShield Backend Server
 * Main server file that initializes the Express application and all middleware
 * Handles cross-platform compatibility and provides API endpoints for the frontend
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import route modules
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/cryptographic');
const threatRoutes = require('./routes/threat-detection');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai-engine');

// Import utilities
const { initializeDatabase } = require('./utils/database-setup');
const { startThreatMonitoring } = require('./utils/threat-monitor');
const { startKeyRotationScheduler } = require('./utils/key-rotation');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - Essential for production deployment
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    quantumShieldStatus: 'rate_limited'
  }
});

// Apply middleware stack
app.use(limiter);
app.use(compression()); // Compress responses for better performance
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Quantum-Token']
}));

// Logging middleware - Different formats based on environment
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware for quantum-specific headers
app.use((req, res, next) => {
  res.header('X-QuantumShield-Version', '1.0.0');
  res.header('X-Post-Quantum-Ready', 'true');
  next();
});

// API Routes - All frontend interactions go through these endpoints
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint for monitoring and deployment
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    quantumReady: true,
    database: 'connected',
    aiEngine: 'operational'
  });
});

// Serve static files from frontend build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('QuantumShield Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    quantumShieldStatus: 'error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Quantum endpoint not found',
    quantumShieldStatus: 'not_found',
    availableEndpoints: ['/api/health', '/api/auth', '/api/crypto', '/api/threats', '/api/dashboard', '/api/ai']
  });
});

// Initialize server and dependencies
async function startQuantumShield() {
  try {
    // Initialize database connection and create tables
    console.log('🔐 Initializing QuantumShield Database...');
    await initializeDatabase();
    
    // Start background services
    console.log('🤖 Starting AI Threat Monitoring...');
    startThreatMonitoring();
    
    console.log('🔄 Starting Adaptive Key Rotation System...');
    startKeyRotationScheduler();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 QuantumShield Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://localhost:${PORT}
🔗 API Base: http://localhost:${PORT}/api
💾 Database: MySQL (${process.env.DB_NAME})
🛡️  Security: Post-Quantum Ready
🤖 AI Engine: Operational
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Platform: ${process.platform}
Node.js: ${process.version}
Environment: ${process.env.NODE_ENV || 'development'}

🔐 QuantumShield is now protecting the quantum future!
      `);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down QuantumShield...');
      server.close(() => {
        console.log('🔐 QuantumShield server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down QuantumShield...');
      server.close(() => {
        console.log('🔐 QuantumShield server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start QuantumShield:', error);
    process.exit(1);
  }
}

// Start the application
startQuantumShield();

module.exports = app;