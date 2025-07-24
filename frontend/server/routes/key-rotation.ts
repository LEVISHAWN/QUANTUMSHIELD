import { RequestHandler } from "express";
import { 
  CryptographicKey, 
  RotationSchedule, 
  RotationTrigger, 
  KeyUsage, 
  PerformanceMetric, 
  APIResponse 
} from "@shared/quantum-types";

class AdaptiveKeyRotationService {
  private keys: Map<string, CryptographicKey> = new Map();
  private rotationQueue: string[] = [];
  private rotationHistory: Map<string, Date[]> = new Map();

  // Quantum-resistant algorithms with their specifications
  private quantumAlgorithms = {
    'CRYSTALS-Kyber': { keySize: [512, 768, 1024], purpose: 'key-exchange', quantumSecurity: 128 },
    'CRYSTALS-Dilithium': { keySize: [2420, 3309, 4627], purpose: 'signing', quantumSecurity: 128 },
    'FALCON': { keySize: [897, 1793], purpose: 'signing', quantumSecurity: 128 },
    'SPHINCS+': { keySize: [32, 48, 64], purpose: 'signing', quantumSecurity: 256 },
    'SABER': { keySize: [672, 992, 1312], purpose: 'key-exchange', quantumSecurity: 128 },
    'NTRU': { keySize: [699, 930, 1230], purpose: 'key-exchange', quantumSecurity: 128 }
  };

  async createKey(
    algorithm: string, 
    keySize: number, 
    purpose: 'encryption' | 'signing' | 'key-exchange',
    organizationId: string
  ): Promise<CryptographicKey> {
    const keyId = this.generateKeyId();
    const isQuantumResistant = Object.keys(this.quantumAlgorithms).includes(algorithm);
    
    const key: CryptographicKey = {
      id: keyId,
      algorithm,
      keySize,
      purpose,
      createdAt: new Date(),
      expiresAt: this.calculateExpirationDate(algorithm, purpose),
      rotationSchedule: this.createAdaptiveSchedule(algorithm, purpose, organizationId),
      quantumResistant: isQuantumResistant,
      usage: {
        operationsCount: 0,
        dataVolume: 0,
        lastUsed: new Date(),
        performanceMetrics: []
      }
    };

    this.keys.set(keyId, key);
    this.scheduleRotation(keyId);
    
    return key;
  }

  private generateKeyId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private calculateExpirationDate(algorithm: string, purpose: string): Date {
    // Base expiration times (in hours)
    const baseExpirations = {
      'encryption': 8760,  // 1 year
      'signing': 17520,    // 2 years
      'key-exchange': 720  // 1 month
    };

    let baseHours = baseExpirations[purpose] || 8760;
    
    // Reduce expiration for non-quantum-resistant algorithms
    if (!Object.keys(this.quantumAlgorithms).includes(algorithm)) {
      baseHours *= 0.5; // Half the lifetime for legacy algorithms
    }

    return new Date(Date.now() + baseHours * 60 * 60 * 1000);
  }

  private createAdaptiveSchedule(algorithm: string, purpose: string, organizationId: string): RotationSchedule {
    const isQuantumResistant = Object.keys(this.quantumAlgorithms).includes(algorithm);
    
    // Adaptive rotation intervals based on quantum resistance and risk level
    let baseInterval = this.getBaseRotationInterval(purpose);
    if (!isQuantumResistant) {
      baseInterval *= 0.25; // Rotate legacy algorithms 4x more frequently
    }

    const triggers: RotationTrigger[] = [
      {
        type: 'time-based',
        threshold: baseInterval,
        enabled: true
      },
      {
        type: 'usage-count',
        threshold: this.getUsageThreshold(purpose),
        enabled: true
      },
      {
        type: 'threat-level',
        threshold: 0.7, // Rotate when threat level reaches 70%
        enabled: true
      }
    ];

    // Add compliance-based rotation for enterprise clients
    if (this.isEnterpriseOrganization(organizationId)) {
      triggers.push({
        type: 'compliance-requirement',
        threshold: 1, // Any compliance requirement triggers rotation
        enabled: true
      });
    }

    return {
      interval: baseInterval,
      nextRotation: new Date(Date.now() + baseInterval * 60 * 60 * 1000),
      autoRotate: true,
      adaptiveRotation: true,
      triggers
    };
  }

  private getBaseRotationInterval(purpose: string): number {
    // Base intervals in hours
    const intervals = {
      'encryption': 168,     // 1 week
      'signing': 720,        // 1 month
      'key-exchange': 24     // 1 day
    };
    return intervals[purpose] || 168;
  }

  private getUsageThreshold(purpose: string): number {
    // Maximum operations before forced rotation
    const thresholds = {
      'encryption': 1000000,  // 1M operations
      'signing': 100000,      // 100K signatures
      'key-exchange': 10000   // 10K key exchanges
    };
    return thresholds[purpose] || 100000;
  }

  private isEnterpriseOrganization(organizationId: string): boolean {
    // Simulate enterprise detection logic
    return organizationId.includes('enterprise') || organizationId.includes('corp');
  }

  async rotateKey(keyId: string, reason: string = 'scheduled'): Promise<CryptographicKey> {
    const existingKey = this.keys.get(keyId);
    if (!existingKey) {
      throw new Error(`Key ${keyId} not found`);
    }

    // Create new key with same parameters but updated algorithms if needed
    const newAlgorithm = this.selectOptimalAlgorithm(existingKey.purpose, existingKey.algorithm);
    const newKeySize = this.selectOptimalKeySize(newAlgorithm, existingKey.keySize);

    const newKey = await this.createKey(
      newAlgorithm,
      newKeySize,
      existingKey.purpose,
      'default' // Would get from context
    );

    // Update rotation history
    const history = this.rotationHistory.get(keyId) || [];
    history.push(new Date());
    this.rotationHistory.set(keyId, history);

    // Mark old key for decommissioning
    existingKey.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days grace period

    console.log(`Key ${keyId} rotated to ${newKey.id}. Reason: ${reason}`);
    
    return newKey;
  }

  private selectOptimalAlgorithm(purpose: string, currentAlgorithm: string): string {
    // Always prefer quantum-resistant algorithms
    const quantumOptions = Object.entries(this.quantumAlgorithms)
      .filter(([_, spec]) => spec.purpose === purpose)
      .map(([name, _]) => name);

    if (quantumOptions.length > 0) {
      // Select based on current performance requirements and maturity
      const preferences = {
        'encryption': ['CRYSTALS-Kyber', 'SABER', 'NTRU'],
        'signing': ['CRYSTALS-Dilithium', 'FALCON', 'SPHINCS+'],
        'key-exchange': ['CRYSTALS-Kyber', 'SABER', 'NTRU']
      };
      
      const preferred = preferences[purpose] || quantumOptions;
      return preferred.find(alg => quantumOptions.includes(alg)) || quantumOptions[0];
    }

    return currentAlgorithm; // Fallback to current if no quantum options
  }

  private selectOptimalKeySize(algorithm: string, currentSize: number): number {
    const algorithmSpec = this.quantumAlgorithms[algorithm];
    if (!algorithmSpec) return currentSize;

    // Select largest available key size for maximum security
    const availableSizes = algorithmSpec.keySize;
    return Math.max(...availableSizes);
  }

  async checkRotationTriggers(keyId: string): Promise<{ shouldRotate: boolean; reasons: string[] }> {
    const key = this.keys.get(keyId);
    if (!key) return { shouldRotate: false, reasons: [] };

    const reasons: string[] = [];
    let shouldRotate = false;

    // Check each trigger
    for (const trigger of key.rotationSchedule.triggers) {
      if (!trigger.enabled) continue;

      switch (trigger.type) {
        case 'time-based':
          if (new Date() >= key.rotationSchedule.nextRotation) {
            shouldRotate = true;
            reasons.push('Scheduled rotation time reached');
          }
          break;

        case 'usage-count':
          if (key.usage.operationsCount >= trigger.threshold) {
            shouldRotate = true;
            reasons.push(`Usage threshold exceeded (${key.usage.operationsCount}/${trigger.threshold})`);
          }
          break;

        case 'threat-level':
          const currentThreatLevel = await this.getCurrentThreatLevel();
          if (currentThreatLevel >= trigger.threshold) {
            shouldRotate = true;
            reasons.push(`High threat level detected (${Math.round(currentThreatLevel * 100)}%)`);
          }
          break;

        case 'compliance-requirement':
          const complianceIssues = await this.checkComplianceRequirements(keyId);
          if (complianceIssues.length > 0) {
            shouldRotate = true;
            reasons.push(`Compliance requirements: ${complianceIssues.join(', ')}`);
          }
          break;
      }
    }

    return { shouldRotate, reasons };
  }

  private async getCurrentThreatLevel(): Promise<number> {
    // Simulate threat level calculation based on external intelligence
    const baseLevel = 0.3;
    const randomVariation = Math.random() * 0.4; // 0-40% additional threat
    const timeBasedFactor = Math.sin(Date.now() / (1000 * 60 * 60 * 24)) * 0.1; // Daily cycle
    
    return Math.min(1, baseLevel + randomVariation + timeBasedFactor);
  }

  private async checkComplianceRequirements(keyId: string): Promise<string[]> {
    const issues: string[] = [];
    
    // Simulate compliance checks
    if (Math.random() > 0.8) {
      issues.push('FIPS-140-2 validation expired');
    }
    
    if (Math.random() > 0.9) {
      issues.push('NIST compliance audit requirement');
    }

    return issues;
  }

  async scheduleRotation(keyId: string): Promise<void> {
    const key = this.keys.get(keyId);
    if (!key || !key.rotationSchedule.autoRotate) return;

    // Add to rotation queue if not already scheduled
    if (!this.rotationQueue.includes(keyId)) {
      this.rotationQueue.push(keyId);
    }

    // In a real implementation, this would use a job scheduler like Bull or Agenda
    setTimeout(async () => {
      try {
        const { shouldRotate, reasons } = await this.checkRotationTriggers(keyId);
        if (shouldRotate) {
          await this.rotateKey(keyId, `Automatic: ${reasons.join(', ')}`);
        }
      } catch (error) {
        console.error(`Failed to auto-rotate key ${keyId}:`, error);
      }
    }, key.rotationSchedule.interval * 60 * 60 * 1000);
  }

  async updateKeyUsage(keyId: string, operation: string, dataSize: number): Promise<void> {
    const key = this.keys.get(keyId);
    if (!key) return;

    key.usage.operationsCount++;
    key.usage.dataVolume += dataSize;
    key.usage.lastUsed = new Date();

    // Record performance metrics
    const metric: PerformanceMetric = {
      operation,
      latency: 1 + Math.random() * 10, // Simulate 1-11ms latency
      throughput: 1000 + Math.random() * 5000, // Simulate throughput
      timestamp: new Date()
    };

    key.usage.performanceMetrics.push(metric);

    // Keep only last 100 metrics
    if (key.usage.performanceMetrics.length > 100) {
      key.usage.performanceMetrics = key.usage.performanceMetrics.slice(-100);
    }

    // Check if usage triggers rotation
    const { shouldRotate, reasons } = await this.checkRotationTriggers(keyId);
    if (shouldRotate) {
      await this.rotateKey(keyId, `Usage-triggered: ${reasons.join(', ')}`);
    }
  }

  getAllKeys(): CryptographicKey[] {
    return Array.from(this.keys.values());
  }

  getKey(keyId: string): CryptographicKey | undefined {
    return this.keys.get(keyId);
  }

  getRotationHistory(keyId: string): Date[] {
    return this.rotationHistory.get(keyId) || [];
  }
}

const keyRotationService = new AdaptiveKeyRotationService();

export const createKey: RequestHandler = async (req, res) => {
  try {
    const { algorithm, keySize, purpose, organizationId } = req.body;
    
    if (!algorithm || !keySize || !purpose) {
      return res.status(400).json({
        success: false,
        error: "Algorithm, key size, and purpose are required",
        timestamp: new Date()
      } as APIResponse);
    }

    const key = await keyRotationService.createKey(algorithm, keySize, purpose, organizationId || 'default');
    
    res.json({
      success: true,
      data: key,
      timestamp: new Date()
    } as APIResponse<CryptographicKey>);
  } catch (error) {
    console.error('Create key error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to create cryptographic key",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const rotateKey: RequestHandler = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { reason } = req.body;
    
    const newKey = await keyRotationService.rotateKey(keyId, reason);
    
    res.json({
      success: true,
      data: {
        oldKeyId: keyId,
        newKey,
        rotatedAt: new Date()
      },
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Rotate key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to rotate key",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getKeys: RequestHandler = async (req, res) => {
  try {
    const keys = keyRotationService.getAllKeys();
    
    res.json({
      success: true,
      data: keys,
      timestamp: new Date()
    } as APIResponse<CryptographicKey[]>);
  } catch (error) {
    console.error('Get keys error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve keys",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getKeyStatus: RequestHandler = async (req, res) => {
  try {
    const { keyId } = req.params;
    
    const key = keyRotationService.getKey(keyId);
    if (!key) {
      return res.status(404).json({
        success: false,
        error: "Key not found",
        timestamp: new Date()
      } as APIResponse);
    }

    const { shouldRotate, reasons } = await keyRotationService.checkRotationTriggers(keyId);
    const rotationHistory = keyRotationService.getRotationHistory(keyId);
    
    res.json({
      success: true,
      data: {
        key,
        shouldRotate,
        rotationReasons: reasons,
        rotationHistory,
        status: shouldRotate ? 'rotation-required' : 'active'
      },
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Get key status error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get key status",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const updateKeyUsage: RequestHandler = async (req, res) => {
  try {
    const { keyId } = req.params;
    const { operation, dataSize } = req.body;
    
    await keyRotationService.updateKeyUsage(keyId, operation, dataSize);
    
    res.json({
      success: true,
      data: { message: "Key usage updated successfully" },
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Update key usage error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to update key usage",
      timestamp: new Date()
    } as APIResponse);
  }
};
