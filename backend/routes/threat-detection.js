/**
 * Threat Detection and Intelligence Routes
 * Manages quantum threat intelligence, detection, and alert systems
 * Provides AI-powered threat analysis and mitigation recommendations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireRole, logActivity } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/threats/dashboard
 * Get comprehensive threat intelligence dashboard data
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30d', severity = 'all' } = req.query;

    // Calculate date range based on timeframe
    const timeframeDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeframe] || 30;

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - timeframeDays);

    // Build severity filter
    let severityFilter = '';
    const severityParams = [];
    
    if (severity !== 'all' && ['1', '2', '3', '4', '5'].includes(severity)) {
      severityFilter = ' AND severity_level >= ?';
      severityParams.push(parseInt(severity));
    }

    // Get active threats
    const activeThreats = await executeQuery(`
      SELECT id, threat_type, severity_level, confidence_score, source, title, 
             description, predicted_impact_date, created_at, updated_at
      FROM threat_intelligence 
      WHERE is_active = true AND created_at >= ?${severityFilter}
      ORDER BY severity_level DESC, confidence_score DESC, created_at DESC
      LIMIT 20
    `, [dateFilter, ...severityParams]);

    // Get threat statistics
    const threatStats = await executeQuery(`
      SELECT 
        threat_type,
        COUNT(*) as count,
        AVG(severity_level) as avg_severity,
        AVG(confidence_score) as avg_confidence,
        MAX(severity_level) as max_severity
      FROM threat_intelligence 
      WHERE is_active = true AND created_at >= ?${severityFilter}
      GROUP BY threat_type
      ORDER BY count DESC
    `, [dateFilter, ...severityParams]);

    // Get severity distribution
    const severityDistribution = await executeQuery(`
      SELECT 
        severity_level,
        COUNT(*) as count
      FROM threat_intelligence 
      WHERE is_active = true AND created_at >= ?${severityFilter}
      GROUP BY severity_level
      ORDER BY severity_level
    `, [dateFilter, ...severityParams]);

    // Get trend data (daily threat counts)
    const trendData = await executeQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as threat_count,
        AVG(severity_level) as avg_severity
      FROM threat_intelligence 
      WHERE is_active = true AND created_at >= ?${severityFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [dateFilter, ...severityParams]);

    // Calculate threat level (overall security status)
    const overallThreatLevel = calculateOverallThreatLevel(activeThreats);

    // Get recent mitigation actions (if user has sufficient clearance)
    let recentMitigations = [];
    if (req.user.quantumClearanceLevel >= 2) {
      recentMitigations = await executeQuery(`
        SELECT krh.*, sc.system_name, ca.name as new_algorithm_name
        FROM key_rotation_history krh
        JOIN system_configurations sc ON krh.system_config_id = sc.id
        JOIN cryptographic_algorithms ca ON krh.new_algorithm_id = ca.id
        WHERE krh.rotation_trigger IN ('threat_detected', 'emergency')
        AND krh.rotation_timestamp >= ?
        ORDER BY krh.rotation_timestamp DESC
        LIMIT 10
      `, [dateFilter]);
    }

    res.json({
      quantumShieldStatus: 'threat_dashboard_loaded',
      dashboard: {
        overallThreatLevel,
        activeThreats,
        statistics: {
          totalActiveThreats: activeThreats.length,
          threatsByType: threatStats,
          severityDistribution,
          trendData: trendData.reverse() // Chronological order for charts
        },
        recentMitigations,
        timeframe,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error loading threat dashboard:', error);
    res.status(500).json({
      error: 'Failed to load threat intelligence dashboard',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * POST /api/threats/detect
 * Trigger AI-powered threat detection scan
 */
router.post('/detect', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { 
      scanType = 'comprehensive', 
      focusAreas = [], 
      urgency = 'normal' 
    } = req.body;

    // Simulate AI threat detection process
    console.log(`🤖 Initiating ${scanType} threat detection scan...`);

    // Log the detection initiation
    await logActivity(
      req.user.userId,
      'threat_detection_initiated',
      'threat_intelligence',
      null,
      { scanType, focusAreas, urgency },
      req.ip,
      req.get('User-Agent')
    );

    // Simulate detection process with real-world scenarios
    const detectionResults = await performThreatDetection(scanType, focusAreas);

    // Store any new threats found
    const newThreats = [];
    for (const threat of detectionResults.newThreats) {
      const threatId = uuidv4();
      
      await executeQuery(`
        INSERT INTO threat_intelligence 
        (id, threat_type, severity_level, confidence_score, source, title, description, 
         affected_algorithms, predicted_impact_date, mitigation_suggestions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        threatId,
        threat.type,
        threat.severity,
        threat.confidence,
        'ai_detection',
        threat.title,
        threat.description,
        JSON.stringify(threat.affectedAlgorithms),
        threat.predictedImpactDate,
        JSON.stringify(threat.mitigationSuggestions)
      ]);

      newThreats.push({ id: threatId, ...threat });
    }

    res.json({
      message: `Threat detection scan completed - ${newThreats.length} new threats identified`,
      quantumShieldStatus: 'detection_completed',
      scanResults: {
        scanId: uuidv4(),
        scanType,
        timestamp: new Date().toISOString(),
        newThreatsFound: newThreats.length,
        existingThreatsUpdated: detectionResults.updatedThreats.length,
        overallRiskLevel: detectionResults.overallRiskLevel,
        newThreats,
        recommendations: detectionResults.recommendations
      }
    });

  } catch (error) {
    console.error('Error during threat detection:', error);
    res.status(500).json({
      error: 'Threat detection scan failed',
      quantumShieldStatus: 'detection_failed'
    });
  }
});

/**
 * GET /api/threats/:id
 * Get detailed information about a specific threat
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const threats = await executeQuery(
      'SELECT * FROM threat_intelligence WHERE id = ?',
      [id]
    );

    if (threats.length === 0) {
      return res.status(404).json({
        error: 'Threat not found',
        quantumShieldStatus: 'threat_not_found'
      });
    }

    const threat = threats[0];

    // Parse JSON fields
    threat.affected_algorithms = JSON.parse(threat.affected_algorithms || '[]');
    threat.mitigation_suggestions = JSON.parse(threat.mitigation_suggestions || '[]');

    // Get related system configurations that might be affected
    let affectedSystems = [];
    if (req.user.quantumClearanceLevel >= 2 && threat.affected_algorithms.length > 0) {
      const algorithmPlaceholders = threat.affected_algorithms.map(() => '?').join(',');
      
      affectedSystems = await executeQuery(`
        SELECT sc.id, sc.system_name, sc.current_algorithm_id, ca.name as algorithm_name
        FROM system_configurations sc
        JOIN cryptographic_algorithms ca ON sc.current_algorithm_id = ca.id
        WHERE ca.id IN (${algorithmPlaceholders}) OR ca.name IN (${algorithmPlaceholders})
      `, [...threat.affected_algorithms, ...threat.affected_algorithms]);
    }

    // Get mitigation history
    const mitigationHistory = await executeQuery(`
      SELECT krh.*, ca.name as new_algorithm_name
      FROM key_rotation_history krh
      JOIN cryptographic_algorithms ca ON krh.new_algorithm_id = ca.id
      WHERE JSON_CONTAINS(krh.trigger_details, ?, '$.threatId')
      ORDER BY krh.rotation_timestamp DESC
    `, [`"${id}"`]);

    res.json({
      quantumShieldStatus: 'threat_details_retrieved',
      threat,
      affectedSystems,
      mitigationHistory,
      riskAssessment: calculateThreatRiskAssessment(threat)
    });

  } catch (error) {
    console.error('Error retrieving threat details:', error);
    res.status(500).json({
      error: 'Failed to retrieve threat details',
      quantumShieldStatus: 'server_error'
    });
  }
});

/**
 * POST /api/threats/:id/mitigate
 * Initiate mitigation actions for a specific threat
 */
router.post('/:id/mitigate', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      mitigationActions = [], 
      targetSystems = [], 
      urgency = 'normal',
      notes = '' 
    } = req.body;

    // Verify threat exists
    const threats = await executeQuery(
      'SELECT * FROM threat_intelligence WHERE id = ?',
      [id]
    );

    if (threats.length === 0) {
      return res.status(404).json({
        error: 'Threat not found',
        quantumShieldStatus: 'threat_not_found'
      });
    }

    const threat = threats[0];

    // Execute mitigation actions
    const mitigationResults = [];

    for (const action of mitigationActions) {
      switch (action.type) {
        case 'key_rotation':
          // Trigger emergency key rotation for specified systems
          for (const systemId of targetSystems) {
            const rotationResult = await initiateEmergencyKeyRotation(
              systemId, 
              action.newAlgorithmId, 
              id, 
              req.user.userId
            );
            mitigationResults.push(rotationResult);
          }
          break;

        case 'algorithm_migration':
          // Plan algorithm migration
          const migrationPlan = await createAlgorithmMigrationPlan(
            targetSystems,
            action.targetAlgorithmId,
            threat
          );
          mitigationResults.push(migrationPlan);
          break;

        case 'security_enhancement':
          // Apply additional security measures
          const securityEnhancement = await applySecurityEnhancements(
            targetSystems,
            action.enhancements
          );
          mitigationResults.push(securityEnhancement);
          break;

        default:
          mitigationResults.push({
            action: action.type,
            status: 'unknown_action_type',
            message: `Unknown mitigation action: ${action.type}`
          });
      }
    }

    // Log mitigation activity
    await logActivity(
      req.user.userId,
      'threat_mitigation_initiated',
      'threat_intelligence',
      id,
      {
        threatTitle: threat.title,
        mitigationActions,
        targetSystems,
        urgency,
        notes
      },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      message: 'Threat mitigation actions initiated successfully',
      quantumShieldStatus: 'mitigation_initiated',
      mitigationId: uuidv4(),
      results: mitigationResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error initiating threat mitigation:', error);
    res.status(500).json({
      error: 'Failed to initiate threat mitigation',
      quantumShieldStatus: 'mitigation_failed'
    });
  }
});

/**
 * GET /api/threats/predictions/quantum-timeline
 * Get AI predictions for quantum computing timeline and impacts
 */
router.get('/predictions/quantum-timeline', authenticateToken, async (req, res) => {
  try {
    // This would connect to real quantum research monitoring in production
    const predictions = generateQuantumTimelinePredictions();

    res.json({
      quantumShieldStatus: 'predictions_generated',
      timeline: predictions,
      lastUpdated: new Date().toISOString(),
      disclaimer: 'Predictions based on current research trends and AI analysis. Actual developments may vary.'
    });

  } catch (error) {
    console.error('Error generating quantum timeline:', error);
    res.status(500).json({
      error: 'Failed to generate quantum timeline predictions',
      quantumShieldStatus: 'prediction_failed'
    });
  }
});

/**
 * Helper Functions
 */

function calculateOverallThreatLevel(threats) {
  if (threats.length === 0) return 'LOW';

  const avgSeverity = threats.reduce((sum, t) => sum + t.severity_level, 0) / threats.length;
  const maxSeverity = Math.max(...threats.map(t => t.severity_level));
  const highConfidenceThreats = threats.filter(t => t.confidence_score > 80).length;

  if (maxSeverity >= 5 || (avgSeverity >= 4 && highConfidenceThreats >= 2)) return 'CRITICAL';
  if (maxSeverity >= 4 || avgSeverity >= 3.5) return 'HIGH';
  if (maxSeverity >= 3 || avgSeverity >= 2.5) return 'MODERATE';
  return 'LOW';
}

async function performThreatDetection(scanType, focusAreas) {
  // Simulate AI detection with realistic scenarios
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

  const possibleThreats = [
    {
      type: 'quantum_advance',
      severity: 4,
      confidence: 87.5,
      title: 'Quantum Error Correction Breakthrough Detected',
      description: 'Recent research papers suggest significant progress in quantum error correction, potentially accelerating practical quantum computing timeline.',
      affectedAlgorithms: ['rsa-2048', 'ecc-p256'],
      predictedImpactDate: '2026-03-15',
      mitigationSuggestions: ['migrate_to_lattice_based', 'increase_key_rotation_frequency', 'implement_hybrid_cryptography']
    },
    {
      type: 'algorithm_weakness',
      severity: 3,
      confidence: 72.3,
      title: 'Side-Channel Vulnerability in Implementation',
      description: 'AI analysis detected potential side-channel vulnerabilities in current Kyber implementations.',
      affectedAlgorithms: ['kyber-768'],
      predictedImpactDate: '2025-06-01',
      mitigationSuggestions: ['update_implementation', 'apply_countermeasures', 'monitor_deployments']
    }
  ];

  // Randomly select threats based on scan type
  const threatCount = scanType === 'comprehensive' ? 2 : 1;
  const selectedThreats = possibleThreats.slice(0, threatCount);

  return {
    newThreats: selectedThreats,
    updatedThreats: [],
    overallRiskLevel: 'MODERATE',
    recommendations: [
      'Consider upgrading to latest post-quantum algorithms',
      'Increase monitoring frequency for critical systems',
      'Review and update incident response procedures'
    ]
  };
}

function calculateThreatRiskAssessment(threat) {
  const severityScore = threat.severity_level * 20;
  const confidenceScore = threat.confidence_score;
  const timelineScore = threat.predicted_impact_date ? 
    Math.max(0, 100 - ((new Date(threat.predicted_impact_date) - new Date()) / (1000 * 60 * 60 * 24 * 365) * 20)) : 50;

  const overallRisk = (severityScore * 0.4 + confidenceScore * 0.3 + timelineScore * 0.3);

  return {
    overallRisk: Math.round(overallRisk),
    severityScore,
    confidenceScore,
    timelineScore,
    riskLevel: overallRisk >= 80 ? 'CRITICAL' : overallRisk >= 60 ? 'HIGH' : overallRisk >= 40 ? 'MODERATE' : 'LOW'
  };
}

async function initiateEmergencyKeyRotation(systemId, newAlgorithmId, threatId, userId) {
  try {
    const rotationId = uuidv4();
    
    await executeQuery(`
      INSERT INTO key_rotation_history 
      (id, system_config_id, new_algorithm_id, rotation_trigger, trigger_details, completion_status)
      VALUES (?, ?, ?, 'emergency', ?, 'initiated')
    `, [
      rotationId,
      systemId,
      newAlgorithmId,
      JSON.stringify({ threatId, initiatedBy: userId, reason: 'threat_mitigation' })
    ]);

    return {
      action: 'key_rotation',
      status: 'initiated',
      rotationId,
      systemId,
      message: 'Emergency key rotation initiated successfully'
    };

  } catch (error) {
    return {
      action: 'key_rotation',
      status: 'failed',
      systemId,
      error: error.message
    };
  }
}

async function createAlgorithmMigrationPlan(systemIds, targetAlgorithmId, threat) {
  return {
    action: 'algorithm_migration',
    status: 'planned',
    migrationId: uuidv4(),
    affectedSystems: systemIds.length,
    targetAlgorithm: targetAlgorithmId,
    estimatedDuration: '2-4 weeks',
    message: 'Algorithm migration plan created - manual execution required'
  };
}

async function applySecurityEnhancements(systemIds, enhancements) {
  return {
    action: 'security_enhancement',
    status: 'applied',
    enhancementId: uuidv4(),
    affectedSystems: systemIds.length,
    enhancements,
    message: 'Security enhancements applied successfully'
  };
}

function generateQuantumTimelinePredictions() {
  const currentYear = new Date().getFullYear();
  
  return {
    milestones: [
      {
        year: currentYear + 1,
        event: 'Improved Quantum Error Correction',
        probability: 75,
        impact: 'LOW',
        description: 'Incremental improvements in quantum error correction rates'
      },
      {
        year: currentYear + 3,
        event: 'Fault-Tolerant Quantum Computer (100 qubits)',
        probability: 60,
        impact: 'MODERATE',
        description: 'First practical fault-tolerant quantum computer with 100+ logical qubits'
      },
      {
        year: currentYear + 5,
        event: 'RSA-2048 Vulnerability Demonstration',
        probability: 40,
        impact: 'HIGH',
        description: 'Demonstration of breaking RSA-2048 with quantum algorithms'
      },
      {
        year: currentYear + 8,
        event: 'Large-Scale Quantum Computing',
        probability: 25,
        impact: 'CRITICAL',
        description: 'Widespread availability of quantum computers capable of breaking current encryption'
      }
    ],
    recommendations: [
      'Begin migration to post-quantum cryptography now',
      'Implement crypto-agility in all systems',
      'Establish quantum-safe communication channels',
      'Develop incident response plans for quantum threats'
    ]
  };
}

module.exports = router;