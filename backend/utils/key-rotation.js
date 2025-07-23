/**
 * Adaptive Key Rotation Scheduler
 * Automatically rotates cryptographic keys based on threat level and schedule
 */

const cron = require('node-cron');
const { executeQuery } = require('../config/database');

/**
 * Start the key rotation scheduler
 */
function startKeyRotationScheduler() {
  console.log('🔄 Starting Adaptive Key Rotation System...');
  
  // Check for scheduled rotations every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      await checkScheduledRotations();
    } catch (error) {
      console.error('❌ Key rotation scheduler error:', error);
    }
  });

  // Check for threat-triggered rotations every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await checkThreatTriggeredRotations();
    } catch (error) {
      console.error('❌ Threat-based rotation check error:', error);
    }
  });
}

/**
 * Check for systems that need scheduled key rotation
 */
async function checkScheduledRotations() {
  try {
    const systems = await executeQuery(`
      SELECT sc.*, krh.rotation_timestamp as last_rotation
      FROM system_configurations sc
      LEFT JOIN (
        SELECT system_config_id, MAX(rotation_timestamp) as rotation_timestamp
        FROM key_rotation_history 
        WHERE completion_status = 'completed'
        GROUP BY system_config_id
      ) krh ON sc.id = krh.system_config_id
      WHERE sc.auto_rotation_enabled = true
    `);

    for (const system of systems) {
      const lastRotation = system.last_rotation ? new Date(system.last_rotation) : new Date(0);
      const rotationInterval = system.key_rotation_interval * 1000; // Convert to milliseconds
      const timeSinceRotation = Date.now() - lastRotation.getTime();

      if (timeSinceRotation >= rotationInterval) {
        await performKeyRotation(system.id, 'scheduled', {
          interval: system.key_rotation_interval,
          last_rotation: system.last_rotation
        });
      }
    }
  } catch (error) {
    console.error('❌ Error checking scheduled rotations:', error);
  }
}

/**
 * Check for systems that need emergency rotation due to threats
 */
async function checkThreatTriggeredRotations() {
  try {
    // Get high-severity threats from the last 24 hours
    const recentThreats = await executeQuery(`
      SELECT * FROM threat_intelligence 
      WHERE severity_level >= 4 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      AND is_active = true
    `);

    if (recentThreats.length > 0) {
      // Get all systems that might be affected
      const systems = await executeQuery(`
        SELECT * FROM system_configurations 
        WHERE auto_rotation_enabled = true
      `);

      for (const system of systems) {
        // Check if any threats affect this system's current algorithm
        const affectedByThreat = recentThreats.some(threat => {
          const affectedAlgos = JSON.parse(threat.affected_algorithms || '[]');
          return affectedAlgos.includes(system.current_algorithm_id);
        });

        if (affectedByThreat) {
          await performKeyRotation(system.id, 'threat_detected', {
            threats: recentThreats.map(t => t.id),
            trigger_time: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking threat-triggered rotations:', error);
  }
}

/**
 * Perform key rotation for a system
 */
async function performKeyRotation(systemConfigId, trigger, triggerDetails) {
  try {
    console.log(`🔄 Initiating key rotation for system ${systemConfigId} (trigger: ${trigger})`);

    // Get system configuration
    const systems = await executeQuery(
      'SELECT * FROM system_configurations WHERE id = ?',
      [systemConfigId]
    );

    if (systems.length === 0) {
      throw new Error(`System configuration not found: ${systemConfigId}`);
    }

    const system = systems[0];
    const rotationId = `rotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Record rotation initiation
    await executeQuery(`
      INSERT INTO key_rotation_history 
      (id, system_config_id, old_algorithm_id, new_algorithm_id, rotation_trigger, trigger_details, completion_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      rotationId,
      systemConfigId,
      system.current_algorithm_id,
      system.backup_algorithm_id || system.current_algorithm_id,
      trigger,
      JSON.stringify(triggerDetails),
      'initiated'
    ]);

    // Simulate rotation process
    await simulateRotationProcess(rotationId, system);

    console.log(`✅ Key rotation completed for system ${systemConfigId}`);

  } catch (error) {
    console.error(`❌ Key rotation failed for system ${systemConfigId}:`, error);
  }
}

/**
 * Simulate the key rotation process
 */
async function simulateRotationProcess(rotationId, system) {
  try {
    // Update rotation status to in_progress
    await executeQuery(
      'UPDATE key_rotation_history SET completion_status = ? WHERE id = ?',
      ['in_progress', rotationId]
    );

    // Simulate rotation time (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate performance impact data
    const performanceImpact = {
      rotation_duration_ms: 1000 + Math.random() * 2000,
      cpu_usage_spike: Math.random() * 10 + 5,
      memory_usage_mb: Math.random() * 50 + 10,
      network_overhead_kb: Math.random() * 100 + 20
    };

    // Complete rotation
    await executeQuery(`
      UPDATE key_rotation_history 
      SET completion_status = ?, performance_impact = ?
      WHERE id = ?
    `, [
      'completed',
      JSON.stringify(performanceImpact),
      rotationId
    ]);

    // Update system configuration if using backup algorithm
    if (system.backup_algorithm_id && system.backup_algorithm_id !== system.current_algorithm_id) {
      await executeQuery(
        'UPDATE system_configurations SET current_algorithm_id = ? WHERE id = ?',
        [system.backup_algorithm_id, system.id]
      );
    }

  } catch (error) {
    // Mark rotation as failed
    await executeQuery(
      'UPDATE key_rotation_history SET completion_status = ? WHERE id = ?',
      ['failed', rotationId]
    );
    throw error;
  }
}

module.exports = {
  startKeyRotationScheduler,
  performKeyRotation,
  checkScheduledRotations,
  checkThreatTriggeredRotations
};
