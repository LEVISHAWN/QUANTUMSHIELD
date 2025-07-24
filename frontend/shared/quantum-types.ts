// Quantum Security Platform Types and Interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'enterprise';
  organizationId?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface Organization {
  id: string;
  name: string;
  tier: 'starter' | 'professional' | 'enterprise';
  settings: SecuritySettings;
  users: string[];
  createdAt: Date;
}

export interface SecuritySettings {
  threatSensitivity: 'low' | 'medium' | 'high' | 'critical';
  keyRotationInterval: number; // hours
  complianceStandards: string[];
  monitoringEnabled: boolean;
  realTimeAlerts: boolean;
  algorithmPreferences: string[];
}

// Threat Prediction Engine Types
export interface ThreatAnalysis {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threatType: 'quantum-attack' | 'brute-force' | 'side-channel' | 'cryptographic-weakness';
  probability: number; // 0-1
  description: string;
  affectedSystems: string[];
  recommendations: Recommendation[];
  aiConfidence: number; // 0-1
}

export interface Recommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimatedImpact: string;
  implementation: string;
}

export interface ThreatPredictionRequest {
  organizationId: string;
  timeframe: number; // hours to predict ahead
  includePastData: boolean;
}

// Enterprise Security Types
export interface SecurityCompliance {
  id: string;
  standard: 'NIST' | 'ISO-27001' | 'SOC-2' | 'FIPS-140-2';
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAudit: Date;
  nextAudit: Date;
  issues: ComplianceIssue[];
  score: number; // 0-100
}

export interface ComplianceIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirement: string;
  remediation: string;
  dueDate: Date;
}

export interface EnterpriseSecurityReport {
  organizationId: string;
  reportDate: Date;
  overallScore: number;
  compliance: SecurityCompliance[];
  threats: ThreatAnalysis[];
  recommendations: Recommendation[];
  trends: SecurityTrend[];
}

export interface SecurityTrend {
  metric: string;
  values: { timestamp: Date; value: number }[];
  trend: 'improving' | 'stable' | 'declining';
}

// Adaptive Key Rotation Types
export interface CryptographicKey {
  id: string;
  algorithm: string;
  keySize: number;
  purpose: 'encryption' | 'signing' | 'key-exchange';
  createdAt: Date;
  expiresAt: Date;
  rotationSchedule: RotationSchedule;
  quantumResistant: boolean;
  usage: KeyUsage;
}

export interface RotationSchedule {
  interval: number; // hours
  nextRotation: Date;
  autoRotate: boolean;
  adaptiveRotation: boolean;
  triggers: RotationTrigger[];
}

export interface RotationTrigger {
  type: 'threat-level' | 'usage-count' | 'time-based' | 'compliance-requirement';
  threshold: number;
  enabled: boolean;
}

export interface KeyUsage {
  operationsCount: number;
  dataVolume: number; // bytes
  lastUsed: Date;
  performanceMetrics: PerformanceMetric[];
}

export interface PerformanceMetric {
  operation: string;
  latency: number; // ms
  throughput: number; // ops/sec
  timestamp: Date;
}

// Real-time Monitoring Types
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'attack-attempt' | 'key-rotation' | 'compliance-check' | 'algorithm-switch' | 'performance-alert';
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  description: string;
  metadata: Record<string, any>;
  resolved: boolean;
  acknowledgedBy?: string;
}

export interface MonitoringDashboard {
  organizationId: string;
  metrics: {
    threatsDetected: number;
    threatsBlocked: number;
    keysRotated: number;
    complianceScore: number;
    systemHealth: number;
    activeAlgorithms: number;
  };
  recentEvents: SecurityEvent[];
  systemStatus: SystemStatus;
}

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: ComponentStatus[];
  uptime: number; // seconds
  lastHealthCheck: Date;
}

export interface ComponentStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number; // ms
  errorRate: number; // percentage
}

// AI-driven Algorithm Selection Types
export interface AlgorithmProfile {
  id: string;
  name: string;
  type: 'symmetric' | 'asymmetric' | 'hash' | 'signature';
  quantumResistant: boolean;
  keySize: number[];
  performance: AlgorithmPerformance;
  security: SecurityProfile;
  compliance: string[];
  maturity: 'experimental' | 'draft' | 'standardized' | 'deprecated';
}

export interface AlgorithmPerformance {
  encryptionSpeed: number; // MB/s
  decryptionSpeed: number; // MB/s
  keyGenerationTime: number; // ms
  signatureTime: number; // ms
  verificationTime: number; // ms
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
}

export interface SecurityProfile {
  quantumSecurityLevel: number; // bits
  classicalSecurityLevel: number; // bits
  knownVulnerabilities: string[];
  lastSecurityReview: Date;
  recommendedUntil: Date;
}

export interface AlgorithmSelection {
  organizationId: string;
  useCase: 'data-encryption' | 'communication' | 'digital-signatures' | 'key-exchange';
  requirements: SelectionRequirements;
  recommendations: AlgorithmRecommendation[];
  aiReasoning: string;
  confidence: number; // 0-1
}

export interface SelectionRequirements {
  quantumResistance: boolean;
  performance: 'high' | 'medium' | 'low';
  compliance: string[];
  compatibility: string[];
  migrationComplexity: 'low' | 'medium' | 'high';
}

export interface AlgorithmRecommendation {
  algorithm: AlgorithmProfile;
  score: number; // 0-100
  reasoning: string;
  tradeoffs: string[];
  implementationNotes: string;
}

// Algorithm Comparison Types
export interface AlgorithmComparison {
  id: string;
  algorithms: string[]; // algorithm IDs
  criteria: ComparisonCriteria;
  results: ComparisonResult[];
  summary: ComparisonSummary;
  generatedAt: Date;
}

export interface ComparisonCriteria {
  includePerformance: boolean;
  includeSecurity: boolean;
  includeCompliance: boolean;
  includeQuantumResistance: boolean;
  weightings: {
    performance: number;
    security: number;
    compliance: number;
    quantumResistance: number;
  };
}

export interface ComparisonResult {
  algorithmId: string;
  scores: {
    performance: number;
    security: number;
    compliance: number;
    quantumResistance: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  bestUseCase: string;
}

export interface ComparisonSummary {
  winner: string; // algorithm ID
  topPerformer: string;
  mostSecure: string;
  bestQuantumResistance: string;
  recommendation: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'security-event' | 'threat-alert' | 'key-rotation' | 'system-status' | 'compliance-update';
  payload: any;
  timestamp: Date;
}

// Authentication Types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
}
