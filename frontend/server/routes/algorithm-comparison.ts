import { RequestHandler } from "express";
import { 
  AlgorithmComparison, 
  AlgorithmProfile, 
  ComparisonCriteria, 
  ComparisonResult, 
  ComparisonSummary, 
  APIResponse 
} from "@shared/quantum-types";

class AlgorithmComparisonService {
  private algorithms: Map<string, AlgorithmProfile> = new Map();

  constructor() {
    this.initializeAlgorithmDatabase();
  }

  private initializeAlgorithmDatabase() {
    // Initialize with the same algorithms as the selection engine
    // In a real implementation, this would be shared or fetched from a database
    const algorithms: AlgorithmProfile[] = [
      {
        id: 'crystals-kyber-512',
        name: 'CRYSTALS-Kyber-512',
        type: 'asymmetric',
        quantumResistant: true,
        keySize: [800],
        performance: {
          encryptionSpeed: 15.2,
          decryptionSpeed: 18.5,
          keyGenerationTime: 0.8,
          signatureTime: 0,
          verificationTime: 0,
          memoryUsage: 1.2,
          cpuUsage: 15
        },
        security: {
          quantumSecurityLevel: 128,
          classicalSecurityLevel: 256,
          knownVulnerabilities: [],
          lastSecurityReview: new Date('2024-01-15'),
          recommendedUntil: new Date('2035-01-01')
        },
        compliance: ['NIST', 'FIPS-140-2'],
        maturity: 'standardized'
      },
      {
        id: 'crystals-kyber-768',
        name: 'CRYSTALS-Kyber-768',
        type: 'asymmetric',
        quantumResistant: true,
        keySize: [1184],
        performance: {
          encryptionSpeed: 12.8,
          decryptionSpeed: 15.2,
          keyGenerationTime: 1.2,
          signatureTime: 0,
          verificationTime: 0,
          memoryUsage: 1.8,
          cpuUsage: 22
        },
        security: {
          quantumSecurityLevel: 192,
          classicalSecurityLevel: 384,
          knownVulnerabilities: [],
          lastSecurityReview: new Date('2024-01-15'),
          recommendedUntil: new Date('2040-01-01')
        },
        compliance: ['NIST', 'FIPS-140-2'],
        maturity: 'standardized'
      },
      {
        id: 'crystals-dilithium2',
        name: 'CRYSTALS-Dilithium2',
        type: 'signature',
        quantumResistant: true,
        keySize: [2420],
        performance: {
          encryptionSpeed: 0,
          decryptionSpeed: 0,
          keyGenerationTime: 1.5,
          signatureTime: 2.3,
          verificationTime: 0.8,
          memoryUsage: 2.5,
          cpuUsage: 18
        },
        security: {
          quantumSecurityLevel: 128,
          classicalSecurityLevel: 256,
          knownVulnerabilities: [],
          lastSecurityReview: new Date('2024-01-15'),
          recommendedUntil: new Date('2035-01-01')
        },
        compliance: ['NIST', 'FIPS-140-2'],
        maturity: 'standardized'
      },
      {
        id: 'falcon-512',
        name: 'FALCON-512',
        type: 'signature',
        quantumResistant: true,
        keySize: [897],
        performance: {
          encryptionSpeed: 0,
          decryptionSpeed: 0,
          keyGenerationTime: 12.5,
          signatureTime: 1.2,
          verificationTime: 0.3,
          memoryUsage: 0.9,
          cpuUsage: 25
        },
        security: {
          quantumSecurityLevel: 128,
          classicalSecurityLevel: 256,
          knownVulnerabilities: [],
          lastSecurityReview: new Date('2024-01-15'),
          recommendedUntil: new Date('2035-01-01')
        },
        compliance: ['NIST'],
        maturity: 'standardized'
      },
      {
        id: 'rsa-2048',
        name: 'RSA-2048',
        type: 'asymmetric',
        quantumResistant: false,
        keySize: [2048],
        performance: {
          encryptionSpeed: 8.5,
          decryptionSpeed: 2.1,
          keyGenerationTime: 45.0,
          signatureTime: 2.8,
          verificationTime: 0.2,
          memoryUsage: 0.8,
          cpuUsage: 12
        },
        security: {
          quantumSecurityLevel: 0,
          classicalSecurityLevel: 112,
          knownVulnerabilities: ['Quantum factoring'],
          lastSecurityReview: new Date('2023-01-01'),
          recommendedUntil: new Date('2030-01-01')
        },
        compliance: ['FIPS-140-2'],
        maturity: 'deprecated'
      },
      {
        id: 'ecdsa-p256',
        name: 'ECDSA P-256',
        type: 'signature',
        quantumResistant: false,
        keySize: [256],
        performance: {
          encryptionSpeed: 0,
          decryptionSpeed: 0,
          keyGenerationTime: 0.3,
          signatureTime: 0.8,
          verificationTime: 1.5,
          memoryUsage: 0.2,
          cpuUsage: 8
        },
        security: {
          quantumSecurityLevel: 0,
          classicalSecurityLevel: 128,
          knownVulnerabilities: ['Quantum discrete log'],
          lastSecurityReview: new Date('2023-01-01'),
          recommendedUntil: new Date('2030-01-01')
        },
        compliance: ['FIPS-140-2'],
        maturity: 'deprecated'
      }
    ];

    algorithms.forEach(alg => this.algorithms.set(alg.id, alg));
  }

  async compareAlgorithms(
    algorithmIds: string[],
    criteria: ComparisonCriteria
  ): Promise<AlgorithmComparison> {
    
    if (algorithmIds.length < 2) {
      throw new Error("At least 2 algorithms required for comparison");
    }

    const algorithms = algorithmIds.map(id => this.algorithms.get(id)).filter(Boolean) as AlgorithmProfile[];
    
    if (algorithms.length !== algorithmIds.length) {
      throw new Error("One or more algorithms not found");
    }

    const results = algorithms.map(algorithm => 
      this.evaluateAlgorithm(algorithm, criteria)
    );

    const summary = this.generateComparisonSummary(results, algorithms);

    return {
      id: `comparison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      algorithms: algorithmIds,
      criteria,
      results,
      summary,
      generatedAt: new Date()
    };
  }

  private evaluateAlgorithm(algorithm: AlgorithmProfile, criteria: ComparisonCriteria): ComparisonResult {
    const scores = {
      performance: criteria.includePerformance ? this.evaluatePerformance(algorithm) : 0,
      security: criteria.includeSecurity ? this.evaluateSecurity(algorithm) : 0,
      compliance: criteria.includeCompliance ? this.evaluateCompliance(algorithm) : 0,
      quantumResistance: criteria.includeQuantumResistance ? this.evaluateQuantumResistance(algorithm) : 0,
      overall: 0
    };

    // Calculate weighted overall score
    const weights = criteria.weightings;
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight > 0) {
      scores.overall = (
        scores.performance * weights.performance +
        scores.security * weights.security +
        scores.compliance * weights.compliance +
        scores.quantumResistance * weights.quantumResistance
      ) / totalWeight;
    }

    const strengths = this.identifyStrengths(algorithm, scores);
    const weaknesses = this.identifyWeaknesses(algorithm, scores);
    const bestUseCase = this.determineBestUseCase(algorithm, scores);

    return {
      algorithmId: algorithm.id,
      scores,
      strengths,
      weaknesses,
      bestUseCase
    };
  }

  private evaluatePerformance(algorithm: AlgorithmProfile): number {
    const perf = algorithm.performance;
    let score = 0;
    let components = 0;

    // Key generation performance (lower time is better)
    if (perf.keyGenerationTime > 0) {
      score += Math.max(0, 100 - (perf.keyGenerationTime / 50) * 100); // 50ms as baseline
      components++;
    }

    // Memory usage (lower is better)
    if (perf.memoryUsage > 0) {
      score += Math.max(0, 100 - (perf.memoryUsage / 5) * 100); // 5MB as baseline
      components++;
    }

    // CPU usage (lower is better)
    if (perf.cpuUsage > 0) {
      score += Math.max(0, 100 - (perf.cpuUsage / 50) * 100); // 50% as baseline
      components++;
    }

    // Algorithm-specific performance metrics
    if (algorithm.type === 'signature') {
      if (perf.signatureTime > 0) {
        score += Math.max(0, 100 - (perf.signatureTime / 10) * 100); // 10ms as baseline
        components++;
      }
      if (perf.verificationTime > 0) {
        score += Math.max(0, 100 - (perf.verificationTime / 5) * 100); // 5ms as baseline
        components++;
      }
    } else {
      if (perf.encryptionSpeed > 0) {
        score += Math.min(100, (perf.encryptionSpeed / 20) * 100); // 20 MB/s as excellent
        components++;
      }
      if (perf.decryptionSpeed > 0) {
        score += Math.min(100, (perf.decryptionSpeed / 20) * 100);
        components++;
      }
    }

    return components > 0 ? Math.round(score / components) : 0;
  }

  private evaluateSecurity(algorithm: AlgorithmProfile): number {
    const security = algorithm.security;
    let score = 0;

    // Quantum security level
    if (algorithm.quantumResistant) {
      score += 40; // Base points for quantum resistance
      
      if (security.quantumSecurityLevel >= 256) score += 30;
      else if (security.quantumSecurityLevel >= 192) score += 25;
      else if (security.quantumSecurityLevel >= 128) score += 20;
    } else {
      score += 10; // Minimal points for non-quantum-resistant
    }

    // Classical security level
    if (security.classicalSecurityLevel >= 256) score += 20;
    else if (security.classicalSecurityLevel >= 128) score += 15;
    else if (security.classicalSecurityLevel >= 112) score += 10;
    else score += 5;

    // Vulnerability assessment
    score -= security.knownVulnerabilities.length * 5; // Penalty for vulnerabilities

    // Algorithm maturity
    const maturityBonus = {
      'standardized': 15,
      'draft': 10,
      'experimental': 5,
      'deprecated': -20
    };
    score += maturityBonus[algorithm.maturity] || 0;

    // Recent security review
    const reviewAge = (Date.now() - security.lastSecurityReview.getTime()) / (365 * 24 * 60 * 60 * 1000);
    if (reviewAge <= 1) score += 10;
    else if (reviewAge <= 2) score += 5;
    else score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private evaluateCompliance(algorithm: AlgorithmProfile): number {
    const complianceStandards = ['NIST', 'FIPS-140-2', 'ISO-27001', 'SOC-2'];
    const matchedStandards = algorithm.compliance.filter(std => 
      complianceStandards.includes(std)
    ).length;
    
    let score = (matchedStandards / complianceStandards.length) * 80; // Base compliance score

    // Bonus for critical standards
    if (algorithm.compliance.includes('NIST')) score += 10;
    if (algorithm.compliance.includes('FIPS-140-2')) score += 10;

    // Penalty for deprecated algorithms
    if (algorithm.maturity === 'deprecated') score -= 30;

    return Math.max(0, Math.min(100, score));
  }

  private evaluateQuantumResistance(algorithm: AlgorithmProfile): number {
    if (!algorithm.quantumResistant) return 0;

    let score = 60; // Base score for quantum resistance

    // Security level bonus
    if (algorithm.security.quantumSecurityLevel >= 256) score += 40;
    else if (algorithm.security.quantumSecurityLevel >= 192) score += 30;
    else if (algorithm.security.quantumSecurityLevel >= 128) score += 20;

    // Standardization bonus
    if (algorithm.maturity === 'standardized') score += 15;
    else if (algorithm.maturity === 'draft') score += 5;

    // NIST approval bonus
    if (algorithm.compliance.includes('NIST')) score += 10;

    return Math.min(100, score);
  }

  private identifyStrengths(algorithm: AlgorithmProfile, scores: any): string[] {
    const strengths = [];

    if (scores.performance >= 80) {
      strengths.push("Excellent performance characteristics");
    }

    if (scores.security >= 85) {
      strengths.push("Strong security properties");
    }

    if (algorithm.quantumResistant) {
      strengths.push("Quantum-resistant design");
    }

    if (algorithm.maturity === 'standardized') {
      strengths.push("NIST standardized algorithm");
    }

    if (algorithm.compliance.includes('FIPS-140-2')) {
      strengths.push("FIPS-140-2 compliant");
    }

    if (algorithm.performance.memoryUsage < 1.0) {
      strengths.push("Low memory footprint");
    }

    if (algorithm.type === 'signature' && algorithm.performance.verificationTime < 2) {
      strengths.push("Fast signature verification");
    }

    if (algorithm.type !== 'signature' && algorithm.performance.encryptionSpeed > 15) {
      strengths.push("High encryption throughput");
    }

    return strengths;
  }

  private identifyWeaknesses(algorithm: AlgorithmProfile, scores: any): string[] {
    const weaknesses = [];

    if (scores.performance < 50) {
      weaknesses.push("Performance limitations");
    }

    if (!algorithm.quantumResistant) {
      weaknesses.push("Vulnerable to quantum attacks");
    }

    if (algorithm.maturity === 'deprecated') {
      weaknesses.push("Deprecated algorithm");
    }

    if (algorithm.security.knownVulnerabilities.length > 0) {
      weaknesses.push(`Known vulnerabilities: ${algorithm.security.knownVulnerabilities.join(', ')}`);
    }

    if (algorithm.performance.keyGenerationTime > 10) {
      weaknesses.push("Slow key generation");
    }

    if (algorithm.performance.memoryUsage > 3) {
      weaknesses.push("High memory usage");
    }

    if (algorithm.type === 'signature' && algorithm.performance.signatureTime > 5) {
      weaknesses.push("Slow signature generation");
    }

    if (algorithm.keySize[0] > 2000) {
      weaknesses.push("Large key sizes");
    }

    return weaknesses;
  }

  private determineBestUseCase(algorithm: AlgorithmProfile, scores: any): string {
    if (algorithm.type === 'signature') {
      if (algorithm.performance.verificationTime < 1) {
        return "High-frequency signature verification";
      } else if (algorithm.performance.signatureTime < 3) {
        return "Real-time digital signing";
      } else {
        return "Secure document signing";
      }
    } else if (algorithm.type === 'asymmetric' || algorithm.type === 'key-exchange') {
      if (algorithm.performance.encryptionSpeed > 15) {
        return "High-throughput data encryption";
      } else if (algorithm.quantumResistant) {
        return "Future-proof secure communications";
      } else {
        return "Legacy system compatibility";
      }
    }

    return "General cryptographic applications";
  }

  private generateComparisonSummary(results: ComparisonResult[], algorithms: AlgorithmProfile[]): ComparisonSummary {
    const sortedByOverall = [...results].sort((a, b) => b.scores.overall - a.scores.overall);
    const sortedByPerformance = [...results].sort((a, b) => b.scores.performance - a.scores.performance);
    const sortedBySecurity = [...results].sort((a, b) => b.scores.security - a.scores.security);
    const sortedByQuantum = [...results].sort((a, b) => b.scores.quantumResistance - a.scores.quantumResistance);

    const winner = sortedByOverall[0].algorithmId;
    const topPerformer = sortedByPerformance[0].algorithmId;
    const mostSecure = sortedBySecurity[0].algorithmId;
    const bestQuantumResistance = sortedByQuantum[0].algorithmId;

    const winnerAlgorithm = algorithms.find(alg => alg.id === winner);
    const recommendation = this.generateRecommendation(winnerAlgorithm!, sortedByOverall[0]);

    return {
      winner,
      topPerformer,
      mostSecure,
      bestQuantumResistance,
      recommendation
    };
  }

  private generateRecommendation(algorithm: AlgorithmProfile, result: ComparisonResult): string {
    const recommendations = [];

    if (algorithm.quantumResistant) {
      recommendations.push(`${algorithm.name} is recommended for quantum-resistant applications`);
    } else {
      recommendations.push(`${algorithm.name} may be suitable for legacy compatibility but should be replaced with quantum-resistant alternatives`);
    }

    if (result.scores.performance >= 80) {
      recommendations.push("with excellent performance characteristics");
    } else if (result.scores.performance >= 60) {
      recommendations.push("with acceptable performance for most use cases");
    } else {
      recommendations.push("though performance considerations should be evaluated");
    }

    if (algorithm.maturity === 'standardized') {
      recommendations.push("This NIST-standardized algorithm provides proven reliability");
    }

    return recommendations.join('. ') + '.';
  }

  getAlgorithm(algorithmId: string): AlgorithmProfile | undefined {
    return this.algorithms.get(algorithmId);
  }

  getAllAlgorithms(): AlgorithmProfile[] {
    return Array.from(this.algorithms.values());
  }
}

const comparisonService = new AlgorithmComparisonService();

export const compareAlgorithms: RequestHandler = async (req, res) => {
  try {
    const { algorithmIds, criteria } = req.body;
    
    if (!algorithmIds || !Array.isArray(algorithmIds) || algorithmIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: "At least 2 algorithm IDs are required for comparison",
        timestamp: new Date()
      } as APIResponse);
    }

    if (!criteria) {
      return res.status(400).json({
        success: false,
        error: "Comparison criteria are required",
        timestamp: new Date()
      } as APIResponse);
    }

    const comparison = await comparisonService.compareAlgorithms(algorithmIds, criteria);
    
    res.json({
      success: true,
      data: comparison,
      timestamp: new Date()
    } as APIResponse<AlgorithmComparison>);
  } catch (error) {
    console.error('Algorithm comparison error:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to compare algorithms",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getComparisonPresets: RequestHandler = async (req, res) => {
  try {
    const presets = {
      "performance-focused": {
        includePerformance: true,
        includeSecurity: true,
        includeCompliance: false,
        includeQuantumResistance: true,
        weightings: {
          performance: 0.5,
          security: 0.3,
          compliance: 0.0,
          quantumResistance: 0.2
        }
      },
      "security-focused": {
        includePerformance: true,
        includeSecurity: true,
        includeCompliance: true,
        includeQuantumResistance: true,
        weightings: {
          performance: 0.2,
          security: 0.4,
          compliance: 0.2,
          quantumResistance: 0.2
        }
      },
      "compliance-focused": {
        includePerformance: false,
        includeSecurity: true,
        includeCompliance: true,
        includeQuantumResistance: true,
        weightings: {
          performance: 0.0,
          security: 0.3,
          compliance: 0.5,
          quantumResistance: 0.2
        }
      },
      "quantum-ready": {
        includePerformance: true,
        includeSecurity: true,
        includeCompliance: true,
        includeQuantumResistance: true,
        weightings: {
          performance: 0.2,
          security: 0.3,
          compliance: 0.1,
          quantumResistance: 0.4
        }
      }
    };

    res.json({
      success: true,
      data: presets,
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Get comparison presets error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve comparison presets",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getBenchmarkData: RequestHandler = async (req, res) => {
  try {
    const { algorithmId } = req.params;
    
    const algorithm = comparisonService.getAlgorithm(algorithmId);
    if (!algorithm) {
      return res.status(404).json({
        success: false,
        error: "Algorithm not found",
        timestamp: new Date()
      } as APIResponse);
    }

    // Generate synthetic benchmark data
    const benchmarkData = {
      algorithmId,
      testEnvironment: {
        cpu: "Intel Xeon E5-2686 v4",
        memory: "16GB DDR4",
        os: "Ubuntu 22.04 LTS",
        compiler: "GCC 11.2.0"
      },
      performance: {
        ...algorithm.performance,
        operationsPerSecond: {
          keyGeneration: Math.round(1000 / algorithm.performance.keyGenerationTime),
          encryption: algorithm.type !== 'signature' ? Math.round(algorithm.performance.encryptionSpeed * 1000) : 0,
          decryption: algorithm.type !== 'signature' ? Math.round(algorithm.performance.decryptionSpeed * 1000) : 0,
          signing: algorithm.type === 'signature' ? Math.round(1000 / algorithm.performance.signatureTime) : 0,
          verification: algorithm.type === 'signature' ? Math.round(1000 / algorithm.performance.verificationTime) : 0
        }
      },
      scalability: {
        lowLoad: { latency: algorithm.performance.keyGenerationTime, throughput: 1000 },
        mediumLoad: { latency: algorithm.performance.keyGenerationTime * 1.2, throughput: 800 },
        highLoad: { latency: algorithm.performance.keyGenerationTime * 1.5, throughput: 600 }
      },
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: benchmarkData,
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Get benchmark data error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve benchmark data",
      timestamp: new Date()
    } as APIResponse);
  }
};
