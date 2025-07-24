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
      console.error('Registration validation failed: missing username, email, or password', { username, email });
      return res.status(400).json({
        error: 'Username, email, and password are required',
        quantumShieldStatus: 'validation_failed'
      });
    }

    // Password strength validation (minimum requirements for quantum security)
    if (password.length < 12) {
      console.error('Registration validation failed: password too short');
      return res.status(400).json({
        error: 'Password must be at least 12 characters for quantum-level security',
        quantumShieldStatus: 'password_weak'
      });
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await executeQuery(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );
    } catch (dbErr) {
      console.error('Database error during user existence check:', dbErr);
      throw dbErr;
    }

    if (existingUser.length > 0) {
      console.error('Registration failed: user already exists', { username, email });
      return res.status(409).json({
        error: 'User with this email or username already exists',
        quantumShieldStatus: 'user_exists'
      });
    }

    // Hash password with high salt rounds for security
    let passwordHash;
    try {
      passwordHash = await bcrypt.hash(password, 14);
    } catch (hashErr) {
      console.error('Error hashing password:', hashErr);
      throw hashErr;
    }

    // Generate unique user ID
    const userId = uuidv4();

    // Assign quantum clearance level based on role
    const quantumClearanceLevel = {
      'admin': 5,
      'analyst': 3,
      'user': 1
    }[role] || 1;

    // Insert new user into database
    try {
      await executeQuery(`
        INSERT INTO users 
        (id, username, email, password_hash, role, quantum_clearance_level) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, username, email, passwordHash, role, quantumClearanceLevel]);
    } catch (insertErr) {
      console.error('Database error during user insert:', insertErr);
      throw insertErr;
    }

    // Log registration activity
    try {
      await logActivity(userId, 'user_registration', 'users', userId, {
        username,
        email,
        role,
        quantumClearanceLevel
      }, req.ip, req.get('User-Agent'));
    } catch (logErr) {
      console.error('Error logging registration activity:', logErr);
    }

    // Generate JWT token for immediate login
    let token;
    try {
      token = jwt.sign(
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
    } catch (jwtErr) {
      console.error('Error generating JWT token:', jwtErr);
      throw jwtErr;
    }

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
    let users;
    try {
      users = await executeQuery(
        'SELECT * FROM users WHERE email = ? AND is_active = true',
        [email]
      );
    } catch (dbErr) {
      console.error('Database error during user lookup (login):', dbErr);
      throw dbErr;
    }

    if (users.length === 0) {
      console.error('Login failed: user not found or inactive', { email });
      return res.status(401).json({
        error: 'Invalid credentials',
        quantumShieldStatus: 'auth_failed'
      });
    }

    const user = users[0];

    // Verify password
    let passwordValid;
    try {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    } catch (compareErr) {
      console.error('Error comparing password during login:', compareErr);
      throw compareErr;
    }
    
    if (!passwordValid) {
      // Log failed login attempt
      try {
        await logActivity(null, 'login_failed', 'users', user.id, {
          email,
          reason: 'invalid_password'
        }, req.ip, req.get('User-Agent'));
      } catch (logErr) {
        console.error('Error logging failed login attempt:', logErr);
      }

      console.error('Login failed: invalid password', { email });
      return res.status(401).json({
        error: 'Invalid credentials',
        quantumShieldStatus: 'auth_failed'
      });
    }

    // Update last login timestamp
    try {
      await executeQuery(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
    } catch (updateErr) {
      console.error('Database error updating last_login during login:', updateErr);
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
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
    } catch (jwtErr) {
      console.error('Error generating JWT token during login:', jwtErr);
      throw jwtErr;
    }

    // Log successful login
    try {
      await logActivity(user.id, 'user_login', 'users', user.id, {
        email,
        username: user.username
      }, req.ip, req.get('User-Agent'));
    } catch (logErr) {
      console.error('Error logging successful login:', logErr);
    }

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