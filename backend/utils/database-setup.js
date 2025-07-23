/**
 * Database Setup and Schema Creation
 * Creates all necessary tables and initial data for QuantumShield
 * Handles database initialization across different platforms
 */

const { executeQuery, testConnection } = require('../config/database');

/**
 * SQL Schema for QuantumShield Database
 * All tables needed for the application functionality
 */
const createTablesQueries = [
  // Users table - Authentication and user management
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'analyst', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    quantum_clearance_level INT DEFAULT 1,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
  )`,

  // Cryptographic algorithms table - Stores available post-quantum algorithms
  `CREATE TABLE IF NOT EXISTS cryptographic_algorithms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('key_exchange', 'digital_signature', 'encryption') NOT NULL,
    quantum_resistance_level INT NOT NULL DEFAULT 1,
    performance_score DECIMAL(5,2) DEFAULT 0.0,
    security_strength INT NOT NULL,
    implementation_status ENUM('experimental', 'candidate', 'standardized') DEFAULT 'experimental',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_resistance_level (quantum_resistance_level)
  )`,

  // System configurations - Current cryptographic setup for each system/client
  `CREATE TABLE IF NOT EXISTS system_configurations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    system_name VARCHAR(200) NOT NULL,
    current_algorithm_id VARCHAR(36),
    backup_algorithm_id VARCHAR(36),
    key_rotation_interval INT DEFAULT 86400,
    threat_sensitivity_level INT DEFAULT 3,
    auto_rotation_enabled BOOLEAN DEFAULT true,
    configuration_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_algorithm_id) REFERENCES cryptographic_algorithms(id),
    FOREIGN KEY (backup_algorithm_id) REFERENCES cryptographic_algorithms(id),
    INDEX idx_user_systems (user_id),
    INDEX idx_system_name (system_name)
  )`,

  // Threat intelligence - AI-detected and manual threat assessments
  `CREATE TABLE IF NOT EXISTS threat_intelligence (
    id VARCHAR(36) PRIMARY KEY,
    threat_type ENUM('quantum_advance', 'algorithm_weakness', 'system_vulnerability', 'research_breakthrough') NOT NULL,
    severity_level INT NOT NULL DEFAULT 1,
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    source ENUM('ai_detection', 'manual_entry', 'external_feed', 'research_monitor') NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    affected_algorithms JSON,
    predicted_impact_date DATE,
    mitigation_suggestions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    INDEX idx_threat_type (threat_type),
    INDEX idx_severity (severity_level),
    INDEX idx_created_date (created_at)
  )`,

  // Key rotation history - Track all key rotations and their triggers
  `CREATE TABLE IF NOT EXISTS key_rotation_history (
    id VARCHAR(36) PRIMARY KEY,
    system_config_id VARCHAR(36) NOT NULL,
    old_algorithm_id VARCHAR(36),
    new_algorithm_id VARCHAR(36) NOT NULL,
    rotation_trigger ENUM('scheduled', 'threat_detected', 'manual', 'emergency') NOT NULL,
    trigger_details JSON,
    rotation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_status ENUM('initiated', 'in_progress', 'completed', 'failed') DEFAULT 'initiated',
    performance_impact JSON,
    FOREIGN KEY (system_config_id) REFERENCES system_configurations(id) ON DELETE CASCADE,
    FOREIGN KEY (old_algorithm_id) REFERENCES cryptographic_algorithms(id),
    FOREIGN KEY (new_algorithm_id) REFERENCES cryptographic_algorithms(id),
    INDEX idx_system_rotations (system_config_id),
    INDEX idx_rotation_timestamp (rotation_timestamp)
  )`,

  // AI recommendations - Store AI-generated algorithm recommendations
  `CREATE TABLE IF NOT EXISTS ai_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    system_config_id VARCHAR(36),
    recommended_algorithm_id VARCHAR(36) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    reasoning TEXT,
    system_requirements JSON,
    performance_predictions JSON,
    risk_assessment JSON,
    recommendation_status ENUM('pending', 'accepted', 'rejected', 'implemented') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (system_config_id) REFERENCES system_configurations(id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_algorithm_id) REFERENCES cryptographic_algorithms(id),
    INDEX idx_user_recommendations (user_id),
    INDEX idx_status (recommendation_status)
  )`,

  // Activity logs - Comprehensive audit trail
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_action_type (action_type),
    INDEX idx_created_date (created_at)
  )`
];

/**
 * Initial data to populate the database
 */
const initialData = {
  // Default post-quantum cryptographic algorithms
  algorithms: [
    {
      id: 'kyber-768',
      name: 'CRYSTALS-Kyber-768',
      category: 'key_exchange',
      quantum_resistance_level: 5,
      performance_score: 8.5,
      security_strength: 192,
      implementation_status: 'standardized',
      description: 'NIST-standardized lattice-based key encapsulation mechanism with strong quantum resistance.'
    },
    {
      id: 'dilithium-3',
      name: 'CRYSTALS-Dilithium-3',
      category: 'digital_signature',
      quantum_resistance_level: 5,
      performance_score: 7.8,
      security_strength: 192,
      implementation_status: 'standardized',
      description: 'NIST-standardized lattice-based digital signature algorithm optimized for security and performance.'
    },
    {
      id: 'falcon-512',
      name: 'FALCON-512',
      category: 'digital_signature',
      quantum_resistance_level: 4,
      performance_score: 9.1,
      security_strength: 128,
      implementation_status: 'standardized',
      description: 'Compact lattice-based signature scheme with excellent performance characteristics.'
    },
    {
      id: 'sphincs-128f',
      name: 'SPHINCS+-128f',
      category: 'digital_signature',
      quantum_resistance_level: 5,
      performance_score: 6.2,
      security_strength: 128,
      implementation_status: 'standardized',
      description: 'Hash-based signature scheme with strong security guarantees and no trapdoors.'
    },
    {
      id: 'bike-l1',
      name: 'BIKE Level 1',
      category: 'key_exchange',
      quantum_resistance_level: 3,
      performance_score: 7.5,
      security_strength: 128,
      implementation_status: 'candidate',
      description: 'Code-based key encapsulation mechanism with moderate quantum resistance.'
    }
  ],

  // Sample threat intelligence data
  threats: [
    {
      id: 'quantum-advance-2024',
      threat_type: 'quantum_advance',
      severity_level: 4,
      confidence_score: 85.5,
      source: 'ai_detection',
      title: 'Quantum Computing Breakthrough Detection',
      description: 'AI systems detected potential quantum computing advancement that may impact RSA-2048 security within 18-24 months.',
      affected_algorithms: '["rsa-2048", "ecc-p256"]',
      predicted_impact_date: '2025-12-01',
      mitigation_suggestions: '["migrate_to_kyber", "increase_key_rotation_frequency", "implement_hybrid_approach"]'
    }
  ]
};

/**
 * Initialize database with all required tables and initial data
 */
async function initializeDatabase() {
  try {
    console.log('🔐 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Cannot establish database connection');
    }

    console.log('📊 Creating database schema...');

    // Drop existing tables to ensure clean schema
    const dropQueries = [
      'DROP TABLE IF EXISTS activity_logs',
      'DROP TABLE IF EXISTS ai_recommendations',
      'DROP TABLE IF EXISTS key_rotation_history',
      'DROP TABLE IF EXISTS system_configurations',
      'DROP TABLE IF EXISTS threat_intelligence',
      'DROP TABLE IF EXISTS cryptographic_algorithms',
      'DROP TABLE IF EXISTS users'
    ];

    for (const query of dropQueries) {
      await executeQuery(query);
    }

    // Create all tables
    for (const query of createTablesQueries) {
      await executeQuery(query);
    }

    console.log('📝 Populating initial data...');
    
    // Insert cryptographic algorithms
    for (const algo of initialData.algorithms) {
      const existingAlgo = await executeQuery(
        'SELECT id FROM cryptographic_algorithms WHERE id = ?', 
        [algo.id]
      );
      
      if (existingAlgo.length === 0) {
        await executeQuery(`
          INSERT INTO cryptographic_algorithms 
          (id, name, category, quantum_resistance_level, performance_score, security_strength, implementation_status, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          algo.id, algo.name, algo.category, algo.quantum_resistance_level,
          algo.performance_score, algo.security_strength, algo.implementation_status, algo.description
        ]);
      }
    }

    // Insert threat intelligence data
    for (const threat of initialData.threats) {
      const existingThreat = await executeQuery(
        'SELECT id FROM threat_intelligence WHERE id = ?', 
        [threat.id]
      );
      
      if (existingThreat.length === 0) {
        await executeQuery(`
          INSERT INTO threat_intelligence 
          (id, threat_type, severity_level, confidence_score, source, title, description, affected_algorithms, predicted_impact_date, mitigation_suggestions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          threat.id, threat.threat_type, threat.severity_level, threat.confidence_score,
          threat.source, threat.title, threat.description, threat.affected_algorithms,
          threat.predicted_impact_date, threat.mitigation_suggestions
        ]);
      }
    }

    console.log('✅ Database initialization completed successfully!');
    console.log(`
🔐 QuantumShield Database Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Tables: ${createTablesQueries.length} created
🧮 Algorithms: ${initialData.algorithms.length} loaded  
�� Threats: ${initialData.threats.length} monitored
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    return true;

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Export the initialization function
module.exports = {
  initializeDatabase,
  createTablesQueries,
  initialData
};
