/**
 * Authentication Routes
 * Handles user registration, login, and JWT token management
 * All user authentication flows are processed here
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const { authenticateToken, logActivity } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with quantum clearance assignment
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required',
        quantumShieldStatus: 'validation_failed'
      });
    }

    // Password strength validation (minimum requirements for quantum security)
    if (password.length < 12) {
      return res.status(400).json({
        error: 'Password must be at least 12 characters for quantum-level security',
        quantumShieldStatus: 'password_weak'
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'User with this email or username already exists',
        quantumShieldStatus: 'user_exists'
      });
    }

    // Hash password with high salt rounds for security
    const saltRounds = 14; // Higher than default for quantum-era security
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique user ID
    const userId = uuidv4();

    // Assign quantum clearance level based on role
    const quantumClearanceLevel = {
      'admin': 5,
      'analyst': 3,
      'user': 1
    }[role] || 1;

    // Insert new user into database
    await executeQuery(`
      INSERT INTO users 
      (id, username, email, password_hash, role, quantum_clearance_level) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, username, email, passwordHash, role, quantumClearanceLevel]);

    // Log registration activity
    await logActivity(userId, 'user_registration', 'users', userId, {
      username,
      email,
      role,
      quantumClearanceLevel
    }, req.ip, req.get('User-Agent'));

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId, 
        username, 
        email, 
        role, 
        quantumClearanceLevel 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully with quantum security clearance',
      quantumShieldStatus: 'registration_success',
      user: {
        id: userId,
        username,
        email,
        role,
        quantumClearanceLevel
      },
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed due to server error',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and provide JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        quantumShieldStatus: 'validation_failed'
      });
    }

    // Find user by email
    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ? AND is_active = true',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        quantumShieldStatus: 'auth_failed'
      });
    }

    const user = users[0];

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordValid) {
      // Log failed login attempt
      await logActivity(null, 'login_failed', 'users', user.id, {
        email,
        reason: 'invalid_password'
      }, req.ip, req.get('User-Agent'));

      return res.status(401).json({
        error: 'Invalid credentials',
        quantumShieldStatus: 'auth_failed'
      });
    }

    // Update last login timestamp
    await executeQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        quantumClearanceLevel: user.quantum_clearance_level
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    await logActivity(user.id, 'user_login', 'users', user.id, {
      email,
      username: user.username
    }, req.ip, req.get('User-Agent'));

    res.json({
      message: 'Login successful - Quantum Shield activated',
      quantumShieldStatus: 'login_success',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        quantumClearanceLevel: user.quantum_clearance_level,
        lastLogin: user.last_login
      },
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed due to server error',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile information
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, role, quantum_clearance_level, created_at, last_login FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User profile not found',
        quantumShieldStatus: 'user_not_found'
      });
    }

    const user = users[0];

    res.json({
      quantumShieldStatus: 'profile_retrieved',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        quantumClearanceLevel: user.quantum_clearance_level,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate token (client-side token removal)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log logout activity
    await logActivity(req.user.userId, 'user_logout', 'users', req.user.userId, {
      username: req.user.username
    }, req.ip, req.get('User-Agent'));

    res.json({
      message: 'Logout successful - Quantum Shield deactivated',
      quantumShieldStatus: 'logout_success'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout process failed',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Refresh JWT token for continued authentication
 */
router.post('/refresh-token', authenticateToken, async (req, res) => {
  try {
    // Generate new token with extended expiration
    const newToken = jwt.sign(
      {
        userId: req.user.userId,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        quantumClearanceLevel: req.user.quantumClearanceLevel
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Token refreshed successfully',
      quantumShieldStatus: 'token_refreshed',
      token: newToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      quantumShieldStatus: 'server_error'
    });
  }
});

module.exports = router;