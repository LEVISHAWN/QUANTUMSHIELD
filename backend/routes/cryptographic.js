/**
 * Cryptographic Algorithm Management Routes
 * Handles CRUD operations for post-quantum cryptographic algorithms
 * Provides algorithm recommendations and comparisons
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireRole, logActivity } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/crypto/algorithms
 * Retrieve all available cryptographic algorithms with filtering
 */
router.get('/algorithms', authenticateToken, async (req, res) => {
  try {
    const { 
      category, 
      minQuantumResistance = 0, 
      implementationStatus, 
      sortBy = 'quantum_resistance_level',
      sortOrder = 'DESC',
      limit = 50,
      offset = 0 
    } = req.query;

    // Build dynamic query based on filters
    let query = `
      SELECT id, name, category, quantum_resistance_level, performance_score, 
             security_strength, implementation_status, description, 
             created_at, updated_at
      FROM cryptographic_algorithms 
      WHERE 1=1
    `;
    
    const params = [];

    // Apply filters
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (minQuantumResistance > 0) {
      query += ' AND quantum_resistance_level >= ?';
      params.push(parseInt(minQuantumResistance));
    }

    if (implementationStatus) {
      query += ' AND implementation_status = ?';
      params.push(implementationStatus);
    }

    // Add sorting
    const validSortColumns = ['name', 'quantum_resistance_level', 'performance_score', 'security_strength', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const algorithms = await executeQuery(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM cryptographic_algorithms WHERE 1=1';
    const countParams = [];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (minQuantumResistance > 0) {
      countQuery += ' AND quantum_resistance_level >= ?';
      countParams.push(parseInt(minQuantumResistance));
    }
    if (implementationStatus) {
      countQuery += ' AND implementation_status = ?';
      countParams.push(implementationStatus);
    }

    const [countResult] = await executeQuery(countQuery, countParams);

    res.json({
      quantumShieldStatus: 'algorithms_retrieved',
      algorithms,
      pagination: {
        total: countResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + algorithms.length) < countResult.total
      },
      filters: {
        category,
        minQuantumResistance,
        implementationStatus,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error retrieving algorithms:', error);
    res.status(500).json({
      error: 'Failed to retrieve cryptographic algorithms',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * GET /api/crypto/algorithms/:id
 * Get detailed information about a specific algorithm
 */
router.get('/algorithms/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const algorithms = await executeQuery(
      'SELECT * FROM cryptographic_algorithms WHERE id = ?',
      [id]
    );

    if (algorithms.length === 0) {
      return res.status(404).json({
        error: 'Cryptographic algorithm not found',
        quantumShieldStatus: 'algorithm_not_found'
      });
    }

    const algorithm = algorithms[0];

    // Get usage statistics if user has higher clearance
    let usageStats = null;
    if (req.user.quantumClearanceLevel >= 3) {
      const stats = await executeQuery(`
        SELECT 
          COUNT(sc.id) as active_deployments,
          AVG(sc.threat_sensitivity_level) as avg_threat_sensitivity,
          COUNT(krh.id) as rotation_count
        FROM system_configurations sc
        LEFT JOIN key_rotation_history krh ON sc.id = krh.system_config_id
        WHERE sc.current_algorithm_id = ? OR sc.backup_algorithm_id = ?
      `, [id, id]);

      usageStats = stats[0];
    }

    res.json({
      quantumShieldStatus: 'algorithm_details_retrieved',
      algorithm,
      usageStats,
      quantumReadinessScore: calculateQuantumReadinessScore(algorithm)
    });

  } catch (error) {
    console.error('Error retrieving algorithm details:', error);
    res.status(500).json({
      error: 'Failed to retrieve algorithm details',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * POST /api/crypto/algorithms
 * Add a new cryptographic algorithm (Admin only)
 */
router.post('/algorithms', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      category,
      quantum_resistance_level,
      performance_score,
      security_strength,
      implementation_status = 'experimental',
      description
    } = req.body;

    // Input validation
    if (!name || !category || !quantum_resistance_level || !security_strength) {
      return res.status(400).json({
        error: 'Name, category, quantum resistance level, and security strength are required',
        quantumShieldStatus: 'validation_failed'
      });
    }

    const validCategories = ['key_exchange', 'digital_signature', 'encryption'];
    const validStatuses = ['experimental', 'candidate', 'standardized'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category. Must be: key_exchange, digital_signature, or encryption',
        quantumShieldStatus: 'validation_failed'
      });
    }

    if (!validStatuses.includes(implementation_status)) {
      return res.status(400).json({
        error: 'Invalid implementation status. Must be: experimental, candidate, or standardized',
        quantumShieldStatus: 'validation_failed'
      });
    }

    // Check if algorithm with same name already exists
    const existingAlgorithm = await executeQuery(
      'SELECT id FROM cryptographic_algorithms WHERE name = ?',
      [name]
    );

    if (existingAlgorithm.length > 0) {
      return res.status(409).json({
        error: 'Algorithm with this name already exists',
        quantumShieldStatus: 'algorithm_exists'
      });
    }

    const algorithmId = uuidv4();

    await executeQuery(`
      INSERT INTO cryptographic_algorithms 
      (id, name, category, quantum_resistance_level, performance_score, security_strength, implementation_status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      algorithmId, name, category, quantum_resistance_level, 
      performance_score || 0.0, security_strength, implementation_status, description
    ]);

    // Log the addition
    await logActivity(
      req.user.userId, 
      'algorithm_added', 
      'cryptographic_algorithms', 
      algorithmId, 
      { name, category, quantum_resistance_level },
      req.ip, 
      req.get('User-Agent')
    );

    res.status(201).json({
      message: 'Cryptographic algorithm added successfully',
      quantumShieldStatus: 'algorithm_created',
      algorithmId
    });

  } catch (error) {
    console.error('Error adding algorithm:', error);
    res.status(500).json({
      error: 'Failed to add cryptographic algorithm',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * PUT /api/crypto/algorithms/:id
 * Update an existing cryptographic algorithm (Admin only)
 */
router.put('/algorithms/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      quantum_resistance_level,
      performance_score,
      security_strength,
      implementation_status,
      description
    } = req.body;

    // Check if algorithm exists
    const existingAlgorithm = await executeQuery(
      'SELECT * FROM cryptographic_algorithms WHERE id = ?',
      [id]
    );

    if (existingAlgorithm.length === 0) {
      return res.status(404).json({
        error: 'Cryptographic algorithm not found',
        quantumShieldStatus: 'algorithm_not_found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (quantum_resistance_level !== undefined) {
      updates.push('quantum_resistance_level = ?');
      params.push(quantum_resistance_level);
    }
    if (performance_score !== undefined) {
      updates.push('performance_score = ?');
      params.push(performance_score);
    }
    if (security_strength !== undefined) {
      updates.push('security_strength = ?');
      params.push(security_strength);
    }
    if (implementation_status !== undefined) {
      updates.push('implementation_status = ?');
      params.push(implementation_status);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No fields provided for update',
        quantumShieldStatus: 'validation_failed'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await executeQuery(
      `UPDATE cryptographic_algorithms SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Log the update
    await logActivity(
      req.user.userId,
      'algorithm_updated',
      'cryptographic_algorithms',
      id,
      req.body,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      message: 'Cryptographic algorithm updated successfully',
      quantumShieldStatus: 'algorithm_updated'
    });

  } catch (error) {
    console.error('Error updating algorithm:', error);
    res.status(500).json({
      error: 'Failed to update cryptographic algorithm',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * GET /api/crypto/compare
 * Compare multiple cryptographic algorithms
 */
router.get('/compare', authenticateToken, async (req, res) => {
  try {
    const { algorithms } = req.query;

    if (!algorithms) {
      return res.status(400).json({
        error: 'Algorithm IDs parameter is required',
        quantumShieldStatus: 'validation_failed'
      });
    }

    const algorithmIds = algorithms.split(',').slice(0, 5); // Limit to 5 algorithms

    if (algorithmIds.length < 2) {
      return res.status(400).json({
        error: 'At least 2 algorithms required for comparison',
        quantumShieldStatus: 'validation_failed'
      });
    }

    const placeholders = algorithmIds.map(() => '?').join(',');
    const comparisonData = await executeQuery(
      `SELECT * FROM cryptographic_algorithms WHERE id IN (${placeholders})`,
      algorithmIds
    );

    if (comparisonData.length !== algorithmIds.length) {
      return res.status(404).json({
        error: 'One or more algorithms not found',
        quantumShieldStatus: 'algorithm_not_found'
      });
    }

    // Calculate comparison metrics
    const comparison = {
      algorithms: comparisonData,
      metrics: {
        strongestQuantumResistance: Math.max(...comparisonData.map(a => a.quantum_resistance_level)),
        bestPerformance: Math.max(...comparisonData.map(a => a.performance_score || 0)),
        highestSecurity: Math.max(...comparisonData.map(a => a.security_strength)),
        mostMature: comparisonData.filter(a => a.implementation_status === 'standardized').length
      },
      recommendations: generateComparisonRecommendations(comparisonData)
    };

    res.json({
      quantumShieldStatus: 'comparison_generated',
      comparison
    });

  } catch (error) {
    console.error('Error generating comparison:', error);
    res.status(500).json({
      error: 'Failed to generate algorithm comparison',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * Helper function to calculate quantum readiness score
 */
function calculateQuantumReadinessScore(algorithm) {
  const resistanceWeight = 0.4;
  const performanceWeight = 0.2;
  const securityWeight = 0.2;
  const maturityWeight = 0.2;

  const resistanceScore = (algorithm.quantum_resistance_level / 5) * 100;
  const performanceScore = algorithm.performance_score || 0;
  const securityScore = Math.min(algorithm.security_strength / 256, 1) * 100;
  const maturityScore = {
    'experimental': 30,
    'candidate': 60,
    'standardized': 100
  }[algorithm.implementation_status] || 0;

  return (
    resistanceScore * resistanceWeight +
    performanceScore * performanceWeight +
    securityScore * securityWeight +
    maturityScore * maturityWeight
  ).toFixed(2);
}

/**
 * Helper function to generate comparison recommendations
 */
function generateComparisonRecommendations(algorithms) {
  const recommendations = [];

  // Find best overall algorithm
  const bestOverall = algorithms.reduce((best, current) => {
    const bestScore = calculateQuantumReadinessScore(best);
    const currentScore = calculateQuantumReadinessScore(current);
    return parseFloat(currentScore) > parseFloat(bestScore) ? current : best;
  });

  recommendations.push({
    type: 'best_overall',
    algorithm: bestOverall.name,
    reason: 'Highest quantum readiness score combining resistance, performance, and maturity'
  });

  // Find best for high-security applications
  const highSecurityAlgo = algorithms.reduce((best, current) => 
    current.quantum_resistance_level > best.quantum_resistance_level ? current : best
  );

  recommendations.push({
    type: 'high_security',
    algorithm: highSecurityAlgo.name,
    reason: 'Maximum quantum resistance for high-security applications'
  });

  // Find best for performance-critical applications
  const highPerformanceAlgo = algorithms.reduce((best, current) => 
    (current.performance_score || 0) > (best.performance_score || 0) ? current : best
  );

  recommendations.push({
    type: 'high_performance',
    algorithm: highPerformanceAlgo.name,
    reason: 'Best performance characteristics for speed-critical applications'
  });

  return recommendations;
}

module.exports = router;