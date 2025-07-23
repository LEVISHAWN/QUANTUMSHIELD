/**
 * Dashboard Data Routes
 * Provides comprehensive dashboard data aggregation for the frontend
 * Handles system overview, statistics, and real-time monitoring data
 */

const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireClearanceLevel, logActivity } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard/overview
 * Get main dashboard overview with key metrics and status
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const clearanceLevel = req.user.quantumClearanceLevel;

    // Get system configurations for the user
    const userSystems = await executeQuery(`
      SELECT 
        sc.*,
        ca_current.name as current_algorithm_name,
        ca_current.quantum_resistance_level as current_resistance_level,
        ca_backup.name as backup_algorithm_name
      FROM system_configurations sc
      LEFT JOIN cryptographic_algorithms ca_current ON sc.current_algorithm_id = ca_current.id
      LEFT JOIN cryptographic_algorithms ca_backup ON sc.backup_algorithm_id = ca_backup.id
      WHERE sc.user_id = ?
      ORDER BY sc.updated_at DESC
    `, [userId]);

    // Get active threat count
    const threatCounts = await executeQuery(`
      SELECT 
        COUNT(*) as total_active_threats,
        COUNT(CASE WHEN severity_level >= 4 THEN 1 END) as high_severity_threats,
        AVG(severity_level) as avg_threat_level
      FROM threat_intelligence 
      WHERE is_active = true
    `);

    // Get recent key rotations for user's systems
    const recentRotations = await executeQuery(`
      SELECT 
        krh.*,
        sc.system_name,
        ca.name as new_algorithm_name
      FROM key_rotation_history krh
      JOIN system_configurations sc ON krh.system_config_id = sc.id
      JOIN cryptographic_algorithms ca ON krh.new_algorithm_id = ca.id
      WHERE sc.user_id = ?
      ORDER BY krh.rotation_timestamp DESC
      LIMIT 5
    `, [userId]);

    // Get AI recommendations for the user
    const aiRecommendations = await executeQuery(`
      SELECT 
        ar.*,
        ca.name as recommended_algorithm_name,
        sc.system_name
      FROM ai_recommendations ar
      JOIN cryptographic_algorithms ca ON ar.recommended_algorithm_id = ca.id
      LEFT JOIN system_configurations sc ON ar.system_config_id = sc.id
      WHERE ar.user_id = ? AND ar.recommendation_status = 'pending'
      ORDER BY ar.confidence_score DESC, ar.created_at DESC
      LIMIT 3
    `, [userId]);

    // Calculate overall quantum readiness score
    const quantumReadinessScore = calculateQuantumReadinessScore(userSystems);

    // Get system health metrics
    const systemHealth = calculateSystemHealth(userSystems, threatCounts[0]);

    // Build response based on clearance level
    const dashboardData = {
      quantumShieldStatus: 'dashboard_loaded',
      overview: {
        totalSystems: userSystems.length,
        quantumReadinessScore,
        systemHealth,
        activeThreats: threatCounts[0].total_active_threats,
        highSeverityThreats: threatCounts[0].high_severity_threats,
        avgThreatLevel: Math.round(threatCounts[0].avg_threat_level * 10) / 10
      },
      userSystems: userSystems.slice(0, 10), // Limit for performance
      recentRotations,
      aiRecommendations,
      lastUpdated: new Date().toISOString()
    };

    // Add additional data for higher clearance levels
    if (clearanceLevel >= 3) {
      // Global statistics for analysts and admins
      const globalStats = await executeQuery(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
          (SELECT COUNT(*) FROM system_configurations) as total_systems,
          (SELECT COUNT(*) FROM cryptographic_algorithms WHERE implementation_status = 'standardized') as standardized_algorithms,
          (SELECT COUNT(*) FROM key_rotation_history WHERE rotation_timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as rotations_24h
      `);

      dashboardData.globalStatistics = globalStats[0];
    }

    res.json(dashboardData);

  } catch (error) {
    console.error('Error loading dashboard overview:', error);
    res.status(500).json({
      error: 'Failed to load dashboard overview',
      quantumShieldStatus: 'dashboard_error'
    });
  }
});

/**
 * GET /api/dashboard/analytics
 * Get detailed analytics data for charts and graphs
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const userId = req.user.userId;

    // Calculate date range
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeframe] || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Threat trend data
    const threatTrends = await executeQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as threat_count,
        AVG(severity_level) as avg_severity
      FROM threat_intelligence 
      WHERE created_at >= ? AND is_active = true
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [startDate]);

    // Key rotation frequency analysis
    const rotationTrends = await executeQuery(`
      SELECT 
        DATE(krh.rotation_timestamp) as date,
        COUNT(*) as rotation_count,
        COUNT(CASE WHEN krh.rotation_trigger = 'threat_detected' THEN 1 END) as threat_triggered_rotations
      FROM key_rotation_history krh
      JOIN system_configurations sc ON krh.system_config_id = sc.id
      WHERE krh.rotation_timestamp >= ? AND sc.user_id = ?
      GROUP BY DATE(krh.rotation_timestamp)
      ORDER BY date DESC
    `, [startDate, userId]);

    // Algorithm usage distribution
    const algorithmUsage = await executeQuery(`
      SELECT 
        ca.name as algorithm_name,
        ca.category,
        ca.quantum_resistance_level,
        COUNT(sc.id) as usage_count
      FROM cryptographic_algorithms ca
      LEFT JOIN system_configurations sc ON ca.id = sc.current_algorithm_id AND sc.user_id = ?
      GROUP BY ca.id, ca.name, ca.category, ca.quantum_resistance_level
      ORDER BY usage_count DESC, ca.quantum_resistance_level DESC
    `, [userId]);

    // Security posture over time
    const securityPosture = await executeQuery(`
      SELECT 
        DATE(sc.updated_at) as date,
        AVG(ca.quantum_resistance_level) as avg_resistance_level,
        AVG(ca.performance_score) as avg_performance_score
      FROM system_configurations sc
      JOIN cryptographic_algorithms ca ON sc.current_algorithm_id = ca.id
      WHERE sc.updated_at >= ? AND sc.user_id = ?
      GROUP BY DATE(sc.updated_at)
      ORDER BY date DESC
    `, [startDate, userId]);

    res.json({
      quantumShieldStatus: 'analytics_loaded',
      analytics: {
        timeframe,
        threatTrends: threatTrends.reverse(), // Chronological order for charts
        rotationTrends: rotationTrends.reverse(),
        algorithmUsage,
        securityPosture: securityPosture.reverse(),
        summary: {
          totalThreatsInPeriod: threatTrends.reduce((sum, t) => sum + t.threat_count, 0),
          totalRotationsInPeriod: rotationTrends.reduce((sum, r) => sum + r.rotation_count, 0),
          mostUsedAlgorithm: algorithmUsage[0]?.algorithm_name || 'None',
          averageQuantumResistance: algorithmUsage.length > 0 ? 
            algorithmUsage.reduce((sum, a) => sum + (a.quantum_resistance_level * a.usage_count), 0) / 
            algorithmUsage.reduce((sum, a) => sum + a.usage_count, 0) : 0
        }
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error loading dashboard analytics:', error);
    res.status(500).json({
      error: 'Failed to load dashboard analytics',
      quantumShieldStatus: 'analytics_error'
    });
  }
});

/**
 * GET /api/dashboard/system-status/:systemId
 * Get detailed status for a specific system configuration
 */
router.get('/system-status/:systemId', authenticateToken, async (req, res) => {
  try {
    const { systemId } = req.params;
    const userId = req.user.userId;

    // Get system configuration with algorithm details
    const systems = await executeQuery(`
      SELECT 
        sc.*,
        ca_current.name as current_algorithm_name,
        ca_current.quantum_resistance_level,
        ca_current.performance_score,
        ca_current.security_strength,
        ca_current.implementation_status,
        ca_backup.name as backup_algorithm_name
      FROM system_configurations sc
      LEFT JOIN cryptographic_algorithms ca_current ON sc.current_algorithm_id = ca_current.id
      LEFT JOIN cryptographic_algorithms ca_backup ON sc.backup_algorithm_id = ca_backup.id
      WHERE sc.id = ? AND sc.user_id = ?
    `, [systemId, userId]);

    if (systems.length === 0) {
      return res.status(404).json({
        error: 'System configuration not found',
        quantumShieldStatus: 'system_not_found'
      });
    }

    const system = systems[0];

    // Get rotation history for this system
    const rotationHistory = await executeQuery(`
      SELECT 
        krh.*,
        ca_old.name as old_algorithm_name,
        ca_new.name as new_algorithm_name
      FROM key_rotation_history krh
      LEFT JOIN cryptographic_algorithms ca_old ON krh.old_algorithm_id = ca_old.id
      JOIN cryptographic_algorithms ca_new ON krh.new_algorithm_id = ca_new.id
      WHERE krh.system_config_id = ?
      ORDER BY krh.rotation_timestamp DESC
      LIMIT 10
    `, [systemId]);

    // Get relevant threat intelligence
    const relevantThreats = await executeQuery(`
      SELECT *
      FROM threat_intelligence
      WHERE is_active = true 
      AND (JSON_CONTAINS(affected_algorithms, ?) 
           OR JSON_CONTAINS(affected_algorithms, ?))
      ORDER BY severity_level DESC, created_at DESC
      LIMIT 5
    `, [
      `"${system.current_algorithm_id}"`,
      `"${system.current_algorithm_name}"`
    ]);

    // Calculate next rotation time
    const lastRotation = rotationHistory[0];
    const nextRotationTime = lastRotation ? 
      new Date(lastRotation.rotation_timestamp.getTime() + (system.key_rotation_interval * 1000)) :
      new Date(system.created_at.getTime() + (system.key_rotation_interval * 1000));

    // System health assessment
    const healthAssessment = {
      overallHealth: 'GOOD', // This would be calculated based on various factors
      quantumReadiness: calculateSystemQuantumReadiness(system),
      threatExposure: relevantThreats.length > 0 ? 'MODERATE' : 'LOW',
      rotationCompliance: isRotationCompliant(system, lastRotation),
      recommendations: generateSystemRecommendations(system, relevantThreats)
    };

    res.json({
      quantumShieldStatus: 'system_status_retrieved',
      system: {
        ...system,
        configuration_data: JSON.parse(system.configuration_data || '{}')
      },
      rotationHistory,
      relevantThreats,
      healthAssessment,
      nextRotationTime,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving system status:', error);
    res.status(500).json({
      error: 'Failed to retrieve system status',
      quantumShieldStatus: 'system_status_error'
    });
  }
});

/**
 * POST /api/dashboard/export
 * Export dashboard data for reporting or backup
 */
router.post('/export', authenticateToken, requireClearanceLevel(2), async (req, res) => {
  try {
    const { 
      includePersonalData = true, 
      includeThreats = true, 
      includeRotationHistory = true,
      format = 'json',
      timeframe = '90d' 
    } = req.body;

    const userId = req.user.userId;
    
    // Calculate date range
    const days = parseInt(timeframe.replace('d', '')) || 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const exportData = {
      exportMetadata: {
        exportId: require('uuid').v4(),
        exportedBy: userId,
        exportDate: new Date().toISOString(),
        timeframe,
        format
      }
    };

    if (includePersonalData) {
      // Export user's system configurations
      exportData.systemConfigurations = await executeQuery(`
        SELECT sc.*, ca.name as current_algorithm_name
        FROM system_configurations sc
        LEFT JOIN cryptographic_algorithms ca ON sc.current_algorithm_id = ca.id
        WHERE sc.user_id = ?
      `, [userId]);
    }

    if (includeRotationHistory) {
      // Export rotation history
      exportData.rotationHistory = await executeQuery(`
        SELECT krh.*, sc.system_name
        FROM key_rotation_history krh
        JOIN system_configurations sc ON krh.system_config_id = sc.id
        WHERE sc.user_id = ? AND krh.rotation_timestamp >= ?
        ORDER BY krh.rotation_timestamp DESC
      `, [userId, startDate]);
    }

    if (includeThreats) {
      // Export relevant threat intelligence
      exportData.threatIntelligence = await executeQuery(`
        SELECT *
        FROM threat_intelligence
        WHERE created_at >= ? AND is_active = true
        ORDER BY severity_level DESC, created_at DESC
      `, [startDate]);
    }

    // Log the export activity
    await logActivity(
      userId,
      'dashboard_data_export',
      'dashboard',
      null,
      {
        includePersonalData,
        includeThreats,
        includeRotationHistory,
        format,
        timeframe,
        recordCount: {
          systems: exportData.systemConfigurations?.length || 0,
          rotations: exportData.rotationHistory?.length || 0,
          threats: exportData.threatIntelligence?.length || 0
        }
      },
      req.ip,
      req.get('User-Agent')
    );

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename=quantumshield-export-${Date.now()}.json`);
    res.setHeader('Content-Type', 'application/json');

    res.json({
      quantumShieldStatus: 'export_completed',
      ...exportData
    });

  } catch (error) {
    console.error('Error exporting dashboard data:', error);
    res.status(500).json({
      error: 'Failed to export dashboard data',
      quantumShieldStatus: 'export_error'
    });
  }
});

/**
 * Helper Functions
 */

function calculateQuantumReadinessScore(systems) {
  if (systems.length === 0) return 0;

  const totalScore = systems.reduce((sum, system) => {
    const resistanceScore = system.current_resistance_level || 0;
    const hasBackup = system.backup_algorithm_id ? 1 : 0;
    const rotationFrequency = system.auto_rotation_enabled ? 1 : 0;
    
    return sum + (resistanceScore * 20) + (hasBackup * 10) + (rotationFrequency * 10);
  }, 0);

  return Math.min(100, Math.round(totalScore / systems.length));
}

function calculateSystemHealth(systems, threatData) {
  const totalSystems = systems.length;
  if (totalSystems === 0) return 'UNKNOWN';

  const healthySystems = systems.filter(system => {
    const hasCurrentAlgo = system.current_algorithm_id;
    const hasGoodResistance = system.current_resistance_level >= 3;
    const autoRotationEnabled = system.auto_rotation_enabled;
    
    return hasCurrentAlgo && hasGoodResistance && autoRotationEnabled;
  }).length;

  const healthPercentage = (healthySystems / totalSystems) * 100;
  const threatLevel = threatData.avg_threat_level || 0;

  if (healthPercentage >= 80 && threatLevel <= 2) return 'EXCELLENT';
  if (healthPercentage >= 60 && threatLevel <= 3) return 'GOOD';
  if (healthPercentage >= 40 && threatLevel <= 4) return 'FAIR';
  return 'NEEDS_ATTENTION';
}

function calculateSystemQuantumReadiness(system) {
  const resistanceLevel = system.quantum_resistance_level || 0;
  const performanceScore = system.performance_score || 0;
  const hasBackup = system.backup_algorithm_id ? 20 : 0;
  const autoRotation = system.auto_rotation_enabled ? 20 : 0;

  return Math.min(100, (resistanceLevel * 15) + performanceScore + hasBackup + autoRotation);
}

function isRotationCompliant(system, lastRotation) {
  if (!lastRotation) return false;
  
  const rotationInterval = system.key_rotation_interval * 1000; // Convert to milliseconds
  const timeSinceLastRotation = Date.now() - lastRotation.rotation_timestamp.getTime();
  
  return timeSinceLastRotation < rotationInterval;
}

function generateSystemRecommendations(system, threats) {
  const recommendations = [];

  // Check quantum resistance level
  if (system.quantum_resistance_level < 4) {
    recommendations.push({
      priority: 'HIGH',
      category: 'algorithm_upgrade',
      message: 'Consider upgrading to a higher quantum-resistance algorithm',
      action: 'upgrade_algorithm'
    });
  }

  // Check backup algorithm
  if (!system.backup_algorithm_id) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'backup_configuration',
      message: 'Configure a backup algorithm for failover scenarios',
      action: 'add_backup_algorithm'
    });
  }

  // Check auto-rotation
  if (!system.auto_rotation_enabled) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'automation',
      message: 'Enable auto-rotation for improved security posture',
      action: 'enable_auto_rotation'
    });
  }

  // Check threat exposure
  if (threats.length > 0) {
    const highSeverityThreats = threats.filter(t => t.severity_level >= 4);
    if (highSeverityThreats.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'threat_response',
        message: `${highSeverityThreats.length} high-severity threats detected. Consider immediate mitigation.`,
        action: 'review_threats'
      });
    }
  }

  return recommendations;
}

module.exports = router;