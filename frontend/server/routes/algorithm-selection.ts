import { RequestHandler } from "express";
import { 
  AlgorithmProfile, 
  AlgorithmSelection, 
  AlgorithmRecommendation, 
  SelectionRequirements, 
  AlgorithmPerformance, 
  SecurityProfile, 
  APIResponse 
} from "@shared/quantum-types";

class AlgorithmSelectionEngine {
  private algorithms: Map<string, AlgorithmProfile> = new Map();
  private aiModels = {
    performancePredictor: this.createPerformancePredictor(),
    securityAnalyzer: this.createSecurityAnalyzer(),
    compatibilityMatcher: this.createCompatibilityMatcher(),
    migrationComplexityEstimator: this.createMigrationEstimator()
  };

  constructor() {
    this.initializeAlgorithmDatabase();
  }

  private initializeAlgorithmDatabase() {
    // Post-Quantum Cryptography Algorithms
    const algorithms: AlgorithmProfile[] = [
      {
        id: 'crystals-kyber-512',
        name: 'CRYSTALS-Kyber-512',
        type: 'asymmetric',
        quantumResistant: true,
        keySize: [800],
        performance: {
          encryptionSpeed: 15.2,    // MB/s
          decryptionSpeed: 18.5,
          keyGenerationTime: 0.8,   // ms
          signatureTime: 0,
          verificationTime: 0,
          memoryUsage: 1.2,         // MB
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
          keyGenerationTime: 12.5,   // Slower key generation
          signatureTime: 1.2,        // Faster signatures
          verificationTime: 0.3,     // Very fast verification
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
        id: 'sphincs-sha256-128s',
        name: 'SPHINCS+-SHA256-128s',
        type: 'signature',
        quantumResistant: true,
        keySize: [32],
        performance: {
          encryptionSpeed: 0,
          decryptionSpeed: 0,
          keyGenerationTime: 0.1,
          signatureTime: 45.2,       // Very slow signatures
          verificationTime: 1.8,
          memoryUsage: 0.5,
          cpuUsage: 35
        },
        security: {
          quantumSecurityLevel: 128,
          classicalSecurityLevel: 256,
          knownVulnerabilities: [],
          lastSecurityReview: new Date('2024-01-15'),
          recommendedUntil: new Date('2040-01-01')
        },
        compliance: ['NIST', 'FIPS-140-2'],
        maturity: 'standardized'
      },
      // Legacy algorithms for comparison
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
          quantumSecurityLevel: 0,     // Broken by quantum computers
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

  async selectAlgorithm(
    organizationId: string,
    useCase: string,
    requirements: SelectionRequirements
  ): Promise<AlgorithmSelection> {
    
    // Filter algorithms by use case and quantum resistance requirement
    const candidateAlgorithms = this.filterCandidates(useCase, requirements);
    
    // Score each algorithm using AI models
    const recommendations = await Promise.all(
      candidateAlgorithms.map(alg => this.scoreAlgorithm(alg, requirements, organizationId))
    );

    // Sort by overall score
    recommendations.sort((a, b) => b.score - a.score);

    // Generate AI reasoning
    const aiReasoning = this.generateAIReasoning(recommendations, requirements, useCase);
    const confidence = this.calculateConfidence(recommendations, requirements);

    return {
      organizationId,
      useCase: useCase as any,
      requirements,
      recommendations,
      aiReasoning,
      confidence
    };
  }

  private filterCandidates(useCase: string, requirements: SelectionRequirements): AlgorithmProfile[] {
    const useCaseMapping = {
      'data-encryption': ['asymmetric', 'symmetric'],
      'communication': ['asymmetric', 'key-exchange'],
      'digital-signatures': ['signature'],
      'key-exchange': ['asymmetric', 'key-exchange']
    };

    const targetTypes = useCaseMapping[useCase] || ['asymmetric'];
    
    return Array.from(this.algorithms.values()).filter(alg => {
      // Filter by type
      if (!targetTypes.includes(alg.type)) return false;
      
      // Filter by quantum resistance requirement
      if (requirements.quantumResistance && !alg.quantumResistant) return false;
      
      // Filter by compliance requirements
      if (requirements.compliance.length > 0) {
        const hasRequiredCompliance = requirements.compliance.some(req => 
          alg.compliance.includes(req)
        );
        if (!hasRequiredCompliance) return false;
      }

      // Filter deprecated algorithms unless specifically allowed
      if (alg.maturity === 'deprecated' && requirements.quantumResistance) return false;

      return true;
    });
  }

  private async scoreAlgorithm(
    algorithm: AlgorithmProfile,
    requirements: SelectionRequirements,
    organizationId: string
  ): Promise<AlgorithmRecommendation> {
    
    const scores = {
      performance: this.aiModels.performancePredictor(algorithm, requirements),
      security: this.aiModels.securityAnalyzer(algorithm, requirements),
      compliance: this.scoreCompliance(algorithm, requirements),
      compatibility: this.aiModels.compatibilityMatcher(algorithm, requirements),
      migration: this.aiModels.migrationComplexityEstimator(algorithm, requirements.migrationComplexity)
    };

    // Weighted overall score
    const weights = this.getWeightings(requirements);
    const overallScore = (
      scores.performance * weights.performance +
      scores.security * weights.security +
      scores.compliance * weights.compliance +
      scores.compatibility * weights.compatibility +
      scores.migration * weights.migration
    ) / Object.values(weights).reduce((sum, w) => sum + w, 0);

    const reasoning = this.generateRecommendationReasoning(algorithm, scores, requirements);
    const tradeoffs = this.identifyTradeoffs(algorithm, scores);
    const implementationNotes = this.generateImplementationNotes(algorithm, requirements);

    return {
      algorithm,
      score: Math.round(overallScore * 100),
      reasoning,
      tradeoffs,
      implementationNotes
    };
  }

  private createPerformancePredictor() {
    return (algorithm: AlgorithmProfile, requirements: SelectionRequirements): number => {
      const perf = algorithm.performance;
      let score = 0;

      // Base performance metrics (normalized to 0-1 scale)
      const encryptionScore = Math.min(perf.encryptionSpeed / 20, 1); // 20 MB/s as reference
      const keyGenScore = Math.max(0, 1 - perf.keyGenerationTime / 50); // 50ms as max acceptable
      const memoryScore = Math.max(0, 1 - perf.memoryUsage / 10); // 10MB as reference
      const cpuScore = Math.max(0, 1 - perf.cpuUsage / 50); // 50% as reference

      // Signature-specific scoring
      if (algorithm.type === 'signature') {
        const signScore = Math.max(0, 1 - perf.signatureTime / 10); // 10ms as reference
        const verifyScore = Math.max(0, 1 - perf.verificationTime / 5); // 5ms as reference
        score = (signScore * 0.4 + verifyScore * 0.3 + keyGenScore * 0.2 + memoryScore * 0.1);
      } else {
        score = (encryptionScore * 0.4 + keyGenScore * 0.3 + memoryScore * 0.2 + cpuScore * 0.1);
      }

      // Adjust based on performance requirements
      if (requirements.performance === 'high') {
        score *= 1.2; // Boost high-performance algorithms
      } else if (requirements.performance === 'low') {
        score = Math.min(score + 0.3, 1); // More tolerant of lower performance
      }

      return Math.min(score, 1);
    };
  }

  private createSecurityAnalyzer() {
    return (algorithm: AlgorithmProfile, requirements: SelectionRequirements): number => {
      const security = algorithm.security;
      let score = 0;

      // Quantum resistance is paramount
      if (requirements.quantumResistance) {
        if (algorithm.quantumResistant) {
          score += 0.6; // Base score for quantum resistance
          
          // Bonus for higher quantum security levels
          if (security.quantumSecurityLevel >= 192) score += 0.2;
          else if (security.quantumSecurityLevel >= 128) score += 0.1;
        } else {
          score = 0.1; // Heavy penalty for non-quantum-resistant algorithms
        }
      } else {
        score += 0.4; // Base score for classical security
      }

      // Classical security level
      const classicalBonus = Math.min(security.classicalSecurityLevel / 256, 1) * 0.2;
      score += classicalBonus;

      // Penalty for known vulnerabilities
      score -= security.knownVulnerabilities.length * 0.1;

      // Recency of security review
      const reviewAge = (Date.now() - security.lastSecurityReview.getTime()) / (365 * 24 * 60 * 60 * 1000);
      if (reviewAge > 2) score -= 0.1; // Penalty for old reviews

      // Algorithm maturity
      const maturityBonus = {
        'standardized': 0.1,
        'draft': 0.05,
        'experimental': 0,
        'deprecated': -0.3
      };
      score += maturityBonus[algorithm.maturity] || 0;

      return Math.max(0, Math.min(score, 1));
    };
  }

  private createCompatibilityMatcher() {
    return (algorithm: AlgorithmProfile, requirements: SelectionRequirements): number => {
      let score = 0.7; // Base compatibility score

      // Check compatibility requirements
      requirements.compatibility.forEach(req => {
        if (req.toLowerCase().includes('legacy') && !algorithm.quantumResistant) {
          score += 0.2;
        }
        if (req.toLowerCase().includes('nist') && algorithm.compliance.includes('NIST')) {
          score += 0.15;
        }
        if (req.toLowerCase().includes('fips') && algorithm.compliance.includes('FIPS-140-2')) {
          score += 0.15;
        }
      });

      // Standardized algorithms have better compatibility
      if (algorithm.maturity === 'standardized') score += 0.1;

      return Math.min(score, 1);
    };
  }

  private createMigrationEstimator() {
    return (algorithm: AlgorithmProfile, migrationComplexity: string): number => {
      let score = 0.5; // Base migration score

      // Algorithm maturity affects migration complexity
      const maturityImpact = {
        'standardized': 0.3,    // Easier migration
        'draft': 0.1,
        'experimental': -0.2,   // Harder migration
        'deprecated': -0.1
      };
      score += maturityImpact[algorithm.maturity] || 0;

      // Quantum algorithms typically have higher migration complexity
      if (algorithm.quantumResistant) {
        if (migrationComplexity === 'low') score -= 0.2;
        else if (migrationComplexity === 'high') score += 0.2;
      }

      // Key size impacts migration (larger keys = more complex)
      const avgKeySize = algorithm.keySize.reduce((sum, size) => sum + size, 0) / algorithm.keySize.length;
      if (avgKeySize > 2000) score -= 0.1;
      else if (avgKeySize < 500) score += 0.1;

      return Math.max(0, Math.min(score, 1));
    };
  }

  private scoreCompliance(algorithm: AlgorithmProfile, requirements: SelectionRequirements): number {
    if (requirements.compliance.length === 0) return 1;

    const matchedCompliance = requirements.compliance.filter(req => 
      algorithm.compliance.includes(req)
    ).length;

    return matchedCompliance / requirements.compliance.length;
  }

  private getWeightings(requirements: SelectionRequirements) {
    // Default weightings
    let weights = {
      performance: 0.25,
      security: 0.35,
      compliance: 0.2,
      compatibility: 0.1,
      migration: 0.1
    };

    // Adjust weights based on requirements
    if (requirements.quantumResistance) {
      weights.security = 0.45; // Increase security importance
      weights.performance = 0.2;
    }

    if (requirements.performance === 'high') {
      weights.performance = 0.35;
      weights.security = 0.3;
    }

    if (requirements.compliance.length > 0) {
      weights.compliance = 0.3;
      weights.security = 0.3;
      weights.performance = 0.2;
    }

    return weights;
  }

  private generateRecommendationReasoning(
    algorithm: AlgorithmProfile,
    scores: any,
    requirements: SelectionRequirements
  ): string {
    const reasons = [];

    if (algorithm.quantumResistant && requirements.quantumResistance) {
      reasons.push(`Provides quantum resistance with ${algorithm.security.quantumSecurityLevel}-bit security level`);
    }

    if (scores.performance > 0.7) {
      reasons.push("Excellent performance characteristics for the use case");
    } else if (scores.performance < 0.4) {
      reasons.push("Performance trade-offs may be acceptable for security benefits");
    }

    if (algorithm.maturity === 'standardized') {
      reasons.push("NIST-standardized algorithm with proven track record");
    }

    if (scores.compliance === 1) {
      reasons.push("Meets all specified compliance requirements");
    }

    return reasons.join('. ') + '.';
  }

  private identifyTradeoffs(algorithm: AlgorithmProfile, scores: any): string[] {
    const tradeoffs = [];

    if (algorithm.performance.keyGenerationTime > 10) {
      tradeoffs.push("Slower key generation may impact system initialization");
    }

    if (algorithm.performance.memoryUsage > 2) {
      tradeoffs.push("Higher memory usage compared to classical algorithms");
    }

    if (algorithm.type === 'signature' && algorithm.performance.signatureTime > 5) {
      tradeoffs.push("Signature generation may be slower than classical alternatives");
    }

    if (algorithm.keySize[0] > 2000) {
      tradeoffs.push("Larger key sizes may impact storage and transmission");
    }

    if (!algorithm.quantumResistant) {
      tradeoffs.push("Vulnerable to quantum computer attacks");
    }

    return tradeoffs;
  }

  private generateImplementationNotes(algorithm: AlgorithmProfile, requirements: SelectionRequirements): string {
    const notes = [];

    if (algorithm.quantumResistant) {
      notes.push("Ensure implementation uses NIST-approved parameter sets");
      notes.push("Consider hybrid deployment with classical algorithms during transition");
    }

    if (algorithm.performance.memoryUsage > 1) {
      notes.push("Allocate sufficient memory for key operations");
    }

    if (requirements.performance === 'high') {
      notes.push("Consider hardware acceleration for optimal performance");
    }

    if (algorithm.maturity === 'draft') {
      notes.push("Monitor for standardization updates and potential parameter changes");
    }

    return notes.join('. ') + '.';
  }

  private generateAIReasoning(
    recommendations: AlgorithmRecommendation[],
    requirements: SelectionRequirements,
    useCase: string
  ): string {
    if (recommendations.length === 0) {
      return "No suitable algorithms found for the specified requirements.";
    }

    const top = recommendations[0];
    const reasoning = [];

    reasoning.push(`Based on the ${useCase} use case analysis`);

    if (requirements.quantumResistance) {
      reasoning.push("prioritizing quantum-resistant algorithms");
    }

    if (requirements.performance === 'high') {
      reasoning.push("with emphasis on high performance");
    }

    reasoning.push(`${top.algorithm.name} emerged as the optimal choice`);
    reasoning.push(`(confidence: ${top.score}%)`);

    if (recommendations.length > 1) {
      const alternative = recommendations[1];
      reasoning.push(`with ${alternative.algorithm.name} as a strong alternative`);
    }

    return reasoning.join(' ') + '.';
  }

  private calculateConfidence(
    recommendations: AlgorithmRecommendation[],
    requirements: SelectionRequirements
  ): number {
    if (recommendations.length === 0) return 0;

    const topScore = recommendations[0].score;
    const scoreSpread = recommendations.length > 1 ? 
      topScore - recommendations[1].score : topScore;

    // Higher confidence when there's a clear winner
    let confidence = Math.min(topScore / 100 + scoreSpread / 200, 1);

    // Adjust confidence based on requirements clarity
    if (requirements.quantumResistance) confidence += 0.1;
    if (requirements.compliance.length > 0) confidence += 0.1;
    if (requirements.performance !== 'medium') confidence += 0.05;

    return Math.min(confidence, 1);
  }

  getAllAlgorithms(): AlgorithmProfile[] {
    return Array.from(this.algorithms.values());
  }

  getAlgorithm(algorithmId: string): AlgorithmProfile | undefined {
    return this.algorithms.get(algorithmId);
  }
}

const algorithmSelectionEngine = new AlgorithmSelectionEngine();

export const selectAlgorithm: RequestHandler = async (req, res) => {
  try {
    const { organizationId, useCase, requirements } = req.body;
    
    if (!organizationId || !useCase || !requirements) {
      return res.status(400).json({
        success: false,
        error: "Organization ID, use case, and requirements are required",
        timestamp: new Date()
      } as APIResponse);
    }

    const selection = await algorithmSelectionEngine.selectAlgorithm(
      organizationId,
      useCase,
      requirements
    );
    
    res.json({
      success: true,
      data: selection,
      timestamp: new Date()
    } as APIResponse<AlgorithmSelection>);
  } catch (error) {
    console.error('Algorithm selection error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to select algorithm",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getAlgorithms: RequestHandler = async (req, res) => {
  try {
    const { type, quantumResistant } = req.query;
    
    let algorithms = algorithmSelectionEngine.getAllAlgorithms();
    
    if (type) {
      algorithms = algorithms.filter(alg => alg.type === type);
    }
    
    if (quantumResistant !== undefined) {
      const isQuantumResistant = quantumResistant === 'true';
      algorithms = algorithms.filter(alg => alg.quantumResistant === isQuantumResistant);
    }
    
    res.json({
      success: true,
      data: algorithms,
      timestamp: new Date()
    } as APIResponse<AlgorithmProfile[]>);
  } catch (error) {
    console.error('Get algorithms error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve algorithms",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getAlgorithmById: RequestHandler = async (req, res) => {
  try {
    const { algorithmId } = req.params;
    
    const algorithm = algorithmSelectionEngine.getAlgorithm(algorithmId);
    
    if (!algorithm) {
      return res.status(404).json({
        success: false,
        error: "Algorithm not found",
        timestamp: new Date()
      } as APIResponse);
    }
    
    res.json({
      success: true,
      data: algorithm,
      timestamp: new Date()
    } as APIResponse<AlgorithmProfile>);
  } catch (error) {
    console.error('Get algorithm error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve algorithm",
      timestamp: new Date()
    } as APIResponse);
  }
};
