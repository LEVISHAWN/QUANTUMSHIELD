/**
 * Authentication and Authorization Middleware
 * Handles JWT token verification, role-based access control, and activity logging
 * Essential for securing all API endpoints
 */

const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to authenticate JWT tokens
 * Verifies token and adds user information to request object
 */
async function authenticateToken(req, res, next) {
  try {
    // Extract token from Authorization header or X-Quantum-Token header
    const authHeader = req.headers['authorization'] || req.headers['x-quantum-token'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

    if (!token) {
      return res.status(401).json({
        error: 'Access token required for QuantumShield operations',
        quantumShieldStatus: 'token_missing'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists and is active
    const users = await executeQuery(
      'SELECT id, username, email, role, quantum_clearance_level, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        error: 'User account not found or deactivated',
        quantumShieldStatus: 'user_inactive'
      });
    }

    // Add user information to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      quantumClearanceLevel: decoded.quantumClearanceLevel
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access token has expired',
        quantumShieldStatus: 'token_expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid access token',
        quantumShieldStatus: 'token_invalid'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication service error',
      quantumShieldStatus: 'auth_error'
    });
  }
}

/**
 * Middleware to require specific roles
 * Use after authenticateToken middleware
 * @param {Array} allowedRoles - Array of roles that can access the endpoint
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        quantumShieldStatus: 'auth_required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        quantumShieldStatus: 'insufficient_role',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to require minimum quantum clearance level
 * Use after authenticateToken middleware
 * @param {number} minLevel - Minimum clearance level required (1-5)
 */
function requireClearanceLevel(minLevel = 1) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        quantumShieldStatus: 'auth_required'
      });
    }

    if (req.user.quantumClearanceLevel < minLevel) {
      return res.status(403).json({
        error: `Insufficient quantum clearance level. Required: ${minLevel}, Current: ${req.user.quantumClearanceLevel}`,
        quantumShieldStatus: 'insufficient_clearance',
        requiredLevel: minLevel,
        userLevel: req.user.quantumClearanceLevel
      });
    }

    next();
  };
}

/**
 * Activity logging function
 * Records user actions for audit trail and security monitoring
 * @param {string} userId - User ID performing the action
 * @param {string} actionType - Type of action being performed
 * @param {string} entityType - Type of entity being acted upon
 * @param {string} entityId - ID of the entity being acted upon
 * @param {object} details - Additional details about the action
 * @param {string} ipAddress - IP address of the request
 * @param {string} userAgent - User agent string
 */
async function logActivity(userId, actionType, entityType, entityId, details, ipAddress, userAgent) {
  try {
    const activityId = uuidv4();
    
    await executeQuery(`
      INSERT INTO activity_logs 
      (id, user_id, action_type, entity_type, entity_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      activityId,
      userId,
      actionType,
      entityType,
      entityId,
      JSON.stringify(details || {}),
      ipAddress,
      userAgent
    ]);

    // Log to console for development/debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📋 Activity Log: ${actionType} by ${userId || 'anonymous'} on ${entityType}:${entityId}`);
    }

  } catch (error) {
    // Don't fail the request if logging fails, but log the error
    console.error('Failed to log activity:', error);
  }
}

/**
 * Middleware to automatically log API requests
 * Logs all authenticated requests for audit purposes
 */
function logRequest(req, res, next) {
  // Store original res.json function
  const originalJson = res.json;
  
  // Override res.json to capture response status
  res.json = function(body) {
    // Log the request if user is authenticated
    if (req.user) {
      logActivity(
        req.user.userId,
        `api_${req.method.toLowerCase()}`,
        'api_endpoint',
        req.originalUrl,
        {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          quantumShieldStatus: body?.quantumShieldStatus
        },
        req.ip,
        req.get('User-Agent')
      ).catch(err => console.error('Request logging error:', err));
    }

    // Call original function
    return originalJson.call(this, body);
  };

  next();
}

/**
 * Rate limiting middleware for sensitive operations
 * Prevents abuse of critical QuantumShield functions
 */
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create rate limiters for different operation types
const authLimiter = new RateLimiterMemory({
  points: 5, // Number of attempts
  duration: 300, // Per 5 minutes
  blockDuration: 900 // Block for 15 minutes
});

const threatDetectionLimiter = new RateLimiterMemory({
  points: 10, // 10 scans
  duration: 3600, // Per hour
  blockDuration: 1800 // Block for 30 minutes
});

const keyRotationLimiter = new RateLimiterMemory({
  points: 20, // 20 rotations
  duration: 3600, // Per hour
  blockDuration: 3600 // Block for 1 hour
});

/**
 * Create rate limiting middleware
 * @param {object} limiter - Rate limiter instance
 * @param {string} operation - Operation name for error messages
 */
function createRateLimitMiddleware(limiter, operation) {
  return async (req, res, next) => {
    try {
      const key = req.user ? `${req.user.userId}_${req.ip}` : req.ip;
      await limiter.consume(key);
      next();
    } catch (rateLimiterRes) {
      const remainingPoints = rateLimiterRes.remainingPoints;
      const msBeforeNext = rateLimiterRes.msBeforeNext;

      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext)
      });

      res.status(429).json({
        error: `Too many ${operation} attempts. Please try again later.`,
        quantumShieldStatus: 'rate_limited',
        retryAfter: Math.round(msBeforeNext / 1000)
      });
    }
  };
}

// Export middleware functions and rate limiters
module.exports = {
  authenticateToken,
  requireRole,
  requireClearanceLevel,
  logActivity,
  logRequest,
  
  // Rate limiting middleware
  authRateLimit: createRateLimitMiddleware(authLimiter, 'authentication'),
  threatDetectionRateLimit: createRateLimitMiddleware(threatDetectionLimiter, 'threat detection'),
  keyRotationRateLimit: createRateLimitMiddleware(keyRotationLimiter, 'key rotation'),
  
  // Direct access to limiters for custom implementations
  limiters: {
    auth: authLimiter,
    threatDetection: threatDetectionLimiter,
    keyRotation: keyRotationLimiter
  }
};