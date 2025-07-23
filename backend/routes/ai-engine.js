/**
 * AI Engine Routes
 * Handles AI-powered cryptographic recommendations, threat analysis, and system optimization
 * Provides intelligent decision support for post-quantum cryptography management
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');
const { authenticateToken, requireClearanceLevel, logActivity } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/ai/recommend-algorithm
 * Get AI-powered algorithm recommendations based on system requirements
 */
router.post('/recommend-algorithm', authenticateToken, async (req, res) => {
  try {
    const {
      systemRequirements = {},
      performancePriority = 'balanced', // 'performance', 'security', 'balanced'
      currentAlgorithm = null,
      threatContext = [],
      constraints = {}
    } = req.body;

    // Validate input parameters
    const validPriorities = ['performance', 'security', 'balanced'];
    if (!validPriorities.includes(performancePriority)) {
      return res.status(400).json({
        error: 'Invalid performance priority. Must be: performance, security, or balanced',
        quantumShieldStatus: 'validation_failed'
      });
    }

    console.log('🤖 AI Engine: Analyzing system requirements for algorithm recommendation...');

    // Get all available algorithms
    const availableAlgorithms = await executeQuery(`
      SELECT * FROM cryptographic_algorithms 
      WHERE implementation_status IN ('candidate', 'standardized')
      ORDER BY quantum_resistance_level DESC, performance_score DESC
    `);

    // Get threat intelligence that might affect the recommendation
    const activeThreats = await executeQuery(`
      SELECT * FROM threat_intelligence 
      WHERE is_active = true AND severity_level >= 3
      ORDER BY severity_level DESC, confidence_score DESC
      LIMIT 10
    `);

    // Run AI recommendation algorithm
    const recommendations = await generateAIRecommendations(
      availableAlgorithms,
      systemRequirements,
      performancePriority,
      currentAlgorithm,
      activeThreats,
      constraints
    );

    // Store recommendations in database for tracking
    for (const recommendation of recommendations.slice(0, 3)) { // Store top 3
      const recommendationId = uuidv4();
      
      await executeQuery(`
        INSERT INTO ai_recommendations 
        (id, user_id, recommended_algorithm_id, confidence_score, reasoning, 
         system_requirements, performance_predictions, risk_assessment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        recommendationId,
        req.user.userId,
        recommendation.algorithm.id,
        recommendation.confidenceScore,
        recommendation.reasoning,
        JSON.stringify(systemRequirements),
        JSON.stringify(recommendation.performancePredictions),
        JSON.stringify(recommendation.riskAssessment)
      ]);
    }

    // Log AI recommendation request
    await logActivity(
      req.user.userId,
      'ai_recommendation_requested',
      'ai_recommendations',
      null,
      {
        performancePriority,
        systemRequirements,
        recommendationCount: recommendations.length,
        topRecommendation: recommendations[0]?.algorithm.name
      },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      message: 'AI algorithm recommendations generated successfully',
      quantumShieldStatus: 'recommendations_generated',
      analysisId: uuidv4(),
      recommendations,
      analysisMetadata: {
        totalAlgorithmsAnalyzed: availableAlgorithms.length,
        threatsConsidered: activeThreats.length,
        performancePriority,
        confidenceLevel: recommendations[0]?.confidenceScore || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({
      error: 'Failed to generate AI algorithm recommendations',
      quantumShieldStatus: 'ai_error'
    });
  }
});

/**
 * POST /api/ai/analyze-threat-impact
 * Analyze the potential impact of specific threats on current systems
 */
router.post('/analyze-threat-impact', authenticateToken, requireClearanceLevel(2), async (req, res) => {
  try {
    const { 
      threatId,
      systemIds = [],
      analysisDepth = 'standard' // 'basic', 'standard', 'comprehensive'
    } = req.body;

    if (!threatId) {
      return res.status(400).json({
        error: 'Threat ID is required for impact analysis',
        quantumShieldStatus: 'validation_failed'
      });
    }

    // Get threat details
    const threats = await executeQuery(
      'SELECT * FROM threat_intelligence WHERE id = ?',
      [threatId]
    );

    if (threats.length === 0) {
      return res.status(404).json({
        error: 'Threat not found',
        quantumShieldStatus: 'threat_not_found'
      });
    }

    const threat = threats[0];
    threat.affected_algorithms = JSON.parse(threat.affected_algorithms || '[]');

    // Get systems to analyze
    let systemsQuery = `
      SELECT sc.*, ca.name as current_algorithm_name, ca.quantum_resistance_level
      FROM system_configurations sc
      LEFT JOIN cryptographic_algorithms ca ON sc.current_algorithm_id = ca.id
      WHERE sc.user_id = ?
    `;
    
    let queryParams = [req.user.userId];

    if (systemIds.length > 0) {
      const placeholders = systemIds.map(() => '?').join(',');
      systemsQuery += ` AND sc.id IN (${placeholders})`;
      queryParams = [...queryParams, ...systemIds];
    }

    const systems = await executeQuery(systemsQuery, queryParams);

    console.log(`🤖 AI Engine: Analyzing threat impact on ${systems.length} systems...`);

    // Perform AI-powered impact analysis
    const impactAnalysis = await performThreatImpactAnalysis(
      threat,
      systems,
      analysisDepth
    );

    // Store analysis results
    const analysisId = uuidv4();
    await logActivity(
      req.user.userId,
      'threat_impact_analysis',
      'threat_intelligence',
      threatId,
      {
        analysisId,
        systemsAnalyzed: systems.length,
        analysisDepth,
        overallRisk: impactAnalysis.overallRisk,
        affectedSystems: impactAnalysis.affectedSystems.length
      },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      message: 'Threat impact analysis completed',
      quantumShieldStatus: 'impact_analysis_completed',
      analysisId,
      threatAnalysis: {
        threat: {
          id: threat.id,
          title: threat.title,
          severity: threat.severity_level,
          confidence: threat.confidence_score
        },
        impactAnalysis,
        mitigationRecommendations: generateMitigationRecommendations(impactAnalysis),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error analyzing threat impact:', error);
    res.status(500).json({
      error: 'Failed to analyze threat impact',
      quantumShieldStatus: 'analysis_error'
    });
  }
});

/**
 * POST /api/ai/optimize-system
 * AI-powered system optimization recommendations
 */
router.post('/optimize-system', authenticateToken, async (req, res) => {
  try {
    const {
      systemId,
      optimizationGoals = ['security', 'performance'], // 'security', 'performance', 'cost', 'compliance'
      constraints = {},
      timeHorizon = 'medium' // 'short', 'medium', 'long'
    } = req.body;

    if (!systemId) {
      return res.status(400).json({
        error: 'System ID is required for optimization',
        quantumShieldStatus: 'validation_failed'
      });
    }

    // Get system configuration with full details
    const systems = await executeQuery(`
      SELECT sc.*, ca.*, 
             ca_backup.name as backup_algorithm_name,
             ca_backup.quantum_resistance_level as backup_resistance_level
      FROM system_configurations sc
      LEFT JOIN cryptographic_algorithms ca ON sc.current_algorithm_id = ca.id
      LEFT JOIN cryptographic_algorithms ca_backup ON sc.backup_algorithm_id = ca_backup.id
      WHERE sc.id = ? AND sc.user_id = ?
    `, [systemId, req.user.userId]);

    if (systems.length === 0) {
      return res.status(404).json({
        error: 'System configuration not found',
        quantumShieldStatus: 'system_not_found'
      });
    }

    const system = systems[0];

    // Get system's rotation history for pattern analysis
    const rotationHistory = await executeQuery(`
      SELECT * FROM key_rotation_history 
      WHERE system_config_id = ?
      ORDER BY rotation_timestamp DESC
      LIMIT 20
    `, [systemId]);

    // Get relevant threats
    const relevantThreats = await executeQuery(`
      SELECT * FROM threat_intelligence
      WHERE is_active = true 
      AND JSON_CONTAINS(affected_algorithms, ?)
      ORDER BY severity_level DESC
    `, [`"${system.current_algorithm_id}"`]);

    console.log(`🤖 AI Engine: Optimizing system configuration for ${system.system_name}...`);

    // Run AI optimization algorithm
    const optimizationResult = await performSystemOptimization(
      system,
      rotationHistory,
      relevantThreats,
      optimizationGoals,
      constraints,
      timeHorizon
    );

    // Log optimization request
    await logActivity(
      req.user.userId,
      'system_optimization_requested',
      'system_configurations',
      systemId,
      {
        optimizationGoals,
        constraints,
        timeHorizon,
        currentAlgorithm: system.name,
        optimizationScore: optimizationResult.overallScore
      },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      message: 'System optimization analysis completed',
      quantumShieldStatus: 'optimization_completed',
      systemOptimization: {
        systemId,
        systemName: system.system_name,
        currentConfiguration: {
          algorithm: system.name,
          quantumResistance: system.quantum_resistance_level,
          performanceScore: system.performance_score,
          rotationInterval: system.key_rotation_interval
        },
        optimizationResult,
        implementationPlan: generateImplementationPlan(optimizationResult),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error optimizing system:', error);
    res.status(500).json({
      error: 'Failed to optimize system configuration',
      quantumShieldStatus: 'optimization_error'
    });
  }
});

/**
 * GET /api/ai/predictions/quantum-timeline
 * Get AI predictions for quantum computing development timeline
 */
router.get('/predictions/quantum-timeline', authenticateToken, requireClearanceLevel(2), async (req, res) => {
  try {
    const { 
      timeHorizon = '10y',
      confidenceThreshold = 0.5,
      includeResearchTrends = true 
    } = req.query;

    console.log('🤖 AI Engine: Generating quantum computing timeline predictions...');

    // This would connect to real quantum research monitoring in production
    const predictions = await generateQuantumTimelinePredictions(
      timeHorizon,
      parseFloat(confidenceThreshold),
      includeResearchTrends === 'true'
    );

    // Get current threat landscape for context
    const currentThreats = await executeQuery(`
      SELECT threat_type, COUNT(*) as count, AVG(confidence_score) as avg_confidence
      FROM threat_intelligence 
      WHERE is_active = true AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY threat_type
    `);

    res.json({
      quantumShieldStatus: 'timeline_predictions_generated',
      quantumTimeline: {
        predictions,
        currentThreatLandscape: currentThreats,
        analysisParameters: {
          timeHorizon,
          confidenceThreshold: parseFloat(confidenceThreshold),
          includeResearchTrends
        },
        lastUpdated: new Date().toISOString(),
        disclaimer: 'Predictions based on current research trends, patent filings, and investment patterns. Actual developments may vary significantly.'
      }
    });

  } catch (error) {
    console.error('Error generating quantum timeline predictions:', error);
    res.status(500).json({
      error: 'Failed to generate quantum timeline predictions',
      quantumShieldStatus: 'prediction_error'
    });
  }
});

/**
 * AI Algorithm Functions
 */

async function generateAIRecommendations(algorithms, requirements, priority, currentAlgo, threats, constraints) {
  // Simulate advanced AI analysis with realistic scoring
  const recommendations = [];

  for (const algorithm of algorithms) {
    let score = 0;
    let reasoning = [];

    // Quantum resistance scoring (40% weight)
    const resistanceScore = (algorithm.quantum_resistance_level / 5) * 40;
    score += resistanceScore;
    reasoning.push(`Quantum resistance level: ${algorithm.quantum_resistance_level}/5`);

    // Performance scoring (30% weight)
    const performanceScore = (algorithm.performance_score || 0) * 0.3;
    score += performanceScore;
    reasoning.push(`Performance score: ${algorithm.performance_score || 0}/10`);

    // Maturity scoring (20% weight)
    const maturityScores = { 'experimental': 5, 'candidate': 15, 'standardized': 20 };
    const maturityScore = maturityScores[algorithm.implementation_status] || 0;
    score += maturityScore;
    reasoning.push(`Implementation status: ${algorithm.implementation_status}`);

    // Threat context scoring (10% weight)
    const threatExposure = threats.some(threat => 
      JSON.parse(threat.affected_algorithms || '[]').includes(algorithm.id)
    );
    const threatScore = threatExposure ? 0 : 10;
    score += threatScore;

    if (threatExposure) {
      reasoning.push('⚠️ Currently exposed to active threats');
    }

    // Priority adjustments
    if (priority === 'security') {
      score += resistanceScore * 0.5; // Boost security score
      reasoning.push('🔒 Security-prioritized recommendation');
    } else if (priority === 'performance') {
      score += performanceScore * 0.5; // Boost performance score
      reasoning.push('⚡ Performance-prioritized recommendation');
    }

    // Avoid recommending current algorithm unless it's significantly better
    if (currentAlgo === algorithm.id) {
      score *= 0.8;
      reasoning.push('⚪ Currently in use - consider alternatives');
    }

    const confidenceScore = Math.min(99.9, Math.max(10, score + Math.random() * 10));

    recommendations.push({
      algorithm,
      confidenceScore: Math.round(confidenceScore * 10) / 10,
      reasoning: reasoning.join(' • '),
      performancePredictions: {
        quantumResistanceYears: Math.max(5, algorithm.quantum_resistance_level * 2 + Math.random() * 3),
        performanceImpact: algorithm.performance_score >= 8 ? 'minimal' : 
                          algorithm.performance_score >= 6 ? 'moderate' : 'significant',
        migrationComplexity: algorithm.implementation_status === 'standardized' ? 'low' : 
                           algorithm.implementation_status === 'candidate' ? 'medium' : 'high'
      },
      riskAssessment: {
        quantumVulnerabilityRisk: algorithm.quantum_resistance_level >= 4 ? 'LOW' : 
                                 algorithm.quantum_resistance_level >= 3 ? 'MODERATE' : 'HIGH',
        implementationRisk: maturityScores[algorithm.implementation_status] >= 15 ? 'LOW' : 'MEDIUM',
        performanceRisk: algorithm.performance_score >= 7 ? 'LOW' : 'MEDIUM'
      }
    });
  }

  // Sort by confidence score and return top recommendations
  return recommendations
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 5);
}

async function performThreatImpactAnalysis(threat, systems, depth) {
  const affectedSystems = [];
  const analysisDetails = [];
  
  for (const system of systems) {
    const isAffected = threat.affected_algorithms.includes(system.current_algorithm_id) ||
                      threat.affected_algorithms.includes(system.current_algorithm_name);
    
    if (isAffected) {
      const impactLevel = calculateImpactLevel(threat, system);
      const timeToImpact = estimateTimeToImpact(threat, system);
      
      affectedSystems.push({
        systemId: system.id,
        systemName: system.system_name,
        currentAlgorithm: system.current_algorithm_name,
        impactLevel,
        timeToImpact,
        riskScore: (threat.severity_level * 10) + (5 - system.quantum_resistance_level) * 5,
        mitigationUrgency: impactLevel === 'CRITICAL' ? 'IMMEDIATE' : 
                          impactLevel === 'HIGH' ? 'URGENT' : 'MODERATE'
      });
    }

    if (depth === 'comprehensive') {
      analysisDetails.push({
        systemId: system.id,
        algorithmVulnerability: isAffected ? 'VULNERABLE' : 'PROTECTED',
        quantumReadiness: system.quantum_resistance_level >= 4 ? 'READY' : 'NEEDS_UPGRADE',
        backupProtection: system.backup_algorithm_id ? 'AVAILABLE' : 'NONE'
      });
    }
  }

  const overallRisk = calculateOverallRisk(threat, affectedSystems);

  return {
    overallRisk,
    affectedSystemsCount: affectedSystems.length,
    totalSystemsAnalyzed: systems.length,
    affectedSystems,
    analysisDetails: depth === 'comprehensive' ? analysisDetails : undefined,
    keyFindings: generateKeyFindings(threat, affectedSystems),
    urgentActionsRequired: affectedSystems.filter(s => s.mitigationUrgency === 'IMMEDIATE').length
  };
}

async function performSystemOptimization(system, history, threats, goals, constraints, horizon) {
  const optimizations = [];
  let overallScore = 60; // Baseline score

  // Algorithm optimization
  if (goals.includes('security')) {
    if (system.quantum_resistance_level < 4) {
      optimizations.push({
        type: 'algorithm_upgrade',
        priority: 'HIGH',
        description: 'Upgrade to higher quantum-resistance algorithm',
        expectedImprovement: '25% security increase',
        estimatedCost: 'MEDIUM'
      });
      overallScore += 20;
    }
  }

  // Performance optimization
  if (goals.includes('performance')) {
    if (system.performance_score < 7) {
      optimizations.push({
        type: 'performance_tuning',
        priority: 'MEDIUM',
        description: 'Optimize algorithm implementation for better performance',
        expectedImprovement: '15% performance increase',
        estimatedCost: 'LOW'
      });
      overallScore += 15;
    }
  }

  // Rotation frequency optimization
  const avgRotationInterval = history.length > 0 ? 
    history.reduce((sum, r) => sum + (r.rotation_timestamp ? 1 : 0), 0) : 0;
  
  if (threats.length > 0 && system.key_rotation_interval > 86400) {
    optimizations.push({
      type: 'rotation_frequency',
      priority: 'MEDIUM',
      description: 'Increase key rotation frequency due to active threats',
      expectedImprovement: '10% threat resistance increase',
      estimatedCost: 'LOW'
    });
    overallScore += 10;
  }

  // Backup algorithm configuration
  if (!system.backup_algorithm_id) {
    optimizations.push({
      type: 'backup_configuration',
      priority: 'MEDIUM',
      description: 'Configure backup algorithm for redundancy',
      expectedImprovement: 'Failover protection',
      estimatedCost: 'LOW'
    });
    overallScore += 10;
  }

  return {
    overallScore: Math.min(100, overallScore),
    optimizations,
    priorityActions: optimizations.filter(o => o.priority === 'HIGH'),
    estimatedImplementationTime: calculateImplementationTime(optimizations),
    riskReduction: calculateRiskReduction(optimizations)
  };
}

async function generateQuantumTimelinePredictions(timeHorizon, threshold, includeResearch) {
  const years = parseInt(timeHorizon.replace('y', '')) || 10;
  const currentYear = new Date().getFullYear();
  
  const milestones = [
    {
      year: currentYear + 2,
      event: 'Quantum Error Correction Improvements',
      probability: 0.8,
      impact: 'MODERATE',
      description: 'Significant improvements in quantum error correction rates',
      confidence: 85.5
    },
    {
      year: currentYear + 4,
      event: '1000+ Qubit Systems',
      probability: 0.65,
      impact: 'HIGH',
      description: 'First practical quantum computers with 1000+ physical qubits',
      confidence: 72.3
    },
    {
      year: currentYear + 6,
      event: 'RSA-2048 Breaking Demonstration',
      probability: 0.4,
      impact: 'CRITICAL',
      description: 'Public demonstration of breaking RSA-2048 encryption',
      confidence: 55.7
    },
    {
      year: currentYear + 8,
      event: 'Widespread Quantum Advantage',
      probability: 0.3,
      impact: 'CRITICAL',
      description: 'Quantum computers widely available for cryptographic attacks',
      confidence: 45.2
    }
  ];

  return {
    timeHorizon: years,
    milestones: milestones.filter(m => m.year <= currentYear + years && m.confidence >= threshold * 100),
    trendAnalysis: {
      accelerationFactor: 1.2, // Quantum development is accelerating
      investmentTrend: 'INCREASING',
      researchBreakthroughs: includeResearch ? 15 : undefined, // per year
      industryReadiness: 'MODERATE'
    },
    recommendations: [
      'Begin post-quantum migration within 2 years',
      'Implement hybrid cryptographic systems',
      'Monitor quantum research developments monthly',
      'Establish quantum incident response plans'
    ]
  };
}

// Helper functions
function calculateImpactLevel(threat, system) {
  const threatSeverity = threat.severity_level;
  const systemVulnerability = 5 - system.quantum_resistance_level;
  const overallImpact = (threatSeverity + systemVulnerability) / 2;
  
  if (overallImpact >= 4.5) return 'CRITICAL';
  if (overallImpact >= 3.5) return 'HIGH';
  if (overallImpact >= 2.5) return 'MODERATE';
  return 'LOW';
}

function estimateTimeToImpact(threat, system) {
  const baseTime = threat.predicted_impact_date ? 
    Math.ceil((new Date(threat.predicted_impact_date) - new Date()) / (1000 * 60 * 60 * 24 * 365)) : 5;
  
  const resistanceMultiplier = system.quantum_resistance_level / 5;
  return Math.max(1, Math.ceil(baseTime * resistanceMultiplier));
}

function calculateOverallRisk(threat, affectedSystems) {
  if (affectedSystems.length === 0) return 'LOW';
  
  const avgRiskScore = affectedSystems.reduce((sum, s) => sum + s.riskScore, 0) / affectedSystems.length;
  const criticalSystems = affectedSystems.filter(s => s.impactLevel === 'CRITICAL').length;
  
  if (avgRiskScore >= 40 || criticalSystems >= 2) return 'CRITICAL';
  if (avgRiskScore >= 30 || criticalSystems >= 1) return 'HIGH';
  if (avgRiskScore >= 20) return 'MODERATE';
  return 'LOW';
}

function generateKeyFindings(threat, affectedSystems) {
  const findings = [];
  
  findings.push(`${affectedSystems.length} systems directly affected by this threat`);
  
  const criticalSystems = affectedSystems.filter(s => s.impactLevel === 'CRITICAL');
  if (criticalSystems.length > 0) {
    findings.push(`${criticalSystems.length} systems require immediate attention`);
  }
  
  const avgTimeToImpact = affectedSystems.reduce((sum, s) => sum + s.timeToImpact, 0) / affectedSystems.length;
  findings.push(`Average time to impact: ${Math.round(avgTimeToImpact)} years`);
  
  return findings;
}

function generateMitigationRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.urgentActionsRequired > 0) {
    recommendations.push({
      priority: 'IMMEDIATE',
      action: 'emergency_rotation',
      description: `Perform emergency key rotation for ${analysis.urgentActionsRequired} critical systems`
    });
  }
  
  if (analysis.affectedSystemsCount > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'algorithm_migration',
      description: 'Plan migration to quantum-resistant algorithms for all affected systems'
    });
  }
  
  recommendations.push({
    priority: 'MEDIUM',
    action: 'monitoring_increase',
    description: 'Increase monitoring frequency for threat developments'
  });
  
  return recommendations;
}

function generateImplementationPlan(optimizationResult) {
  const plan = {
    phases: [],
    totalDuration: '4-8 weeks',
    prerequisites: [],
    risks: []
  };
  
  if (optimizationResult.priorityActions.length > 0) {
    plan.phases.push({
      phase: 1,
      name: 'High Priority Optimizations',
      duration: '1-2 weeks',
      actions: optimizationResult.priorityActions.map(a => a.description)
    });
  }
  
  const mediumActions = optimizationResult.optimizations.filter(o => o.priority === 'MEDIUM');
  if (mediumActions.length > 0) {
    plan.phases.push({
      phase: 2,
      name: 'Medium Priority Optimizations',
      duration: '2-4 weeks',
      actions: mediumActions.map(a => a.description)
    });
  }
  
  return plan;
}

function calculateImplementationTime(optimizations) {
  const timeMap = { 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0.5 };
  const totalWeeks = optimizations.reduce((sum, opt) => sum + timeMap[opt.priority], 0);
  return `${totalWeeks}-${totalWeeks * 2} weeks`;
}

function calculateRiskReduction(optimizations) {
  const riskReduction = optimizations.length * 15; // Each optimization reduces risk by ~15%
  return Math.min(80, riskReduction); // Cap at 80% risk reduction
}

module.exports = router;