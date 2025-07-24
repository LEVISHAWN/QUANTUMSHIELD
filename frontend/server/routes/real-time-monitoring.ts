import { RequestHandler } from "express";
import { Server as SocketIOServer } from "socket.io";
import { 
  SecurityEvent, 
  MonitoringDashboard, 
  SystemStatus, 
  ComponentStatus, 
  WebSocketMessage, 
  APIResponse 
} from "@shared/quantum-types";

class RealTimeMonitoringService {
  private io: SocketIOServer | null = null;
  private events: SecurityEvent[] = [];
  private systemMetrics: Map<string, any> = new Map();
  private alertThresholds = {
    threatDetection: 0.8,
    keyRotationFailure: 1,
    complianceViolation: 1,
    performanceDegradation: 0.7,
    systemFailure: 1
  };

  setSocketIO(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
    this.startSystemMonitoring();
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Send initial dashboard data
      socket.emit('dashboard-data', this.generateDashboard('default'));
      
      socket.on('subscribe-organization', (organizationId: string) => {
        socket.join(`org-${organizationId}`);
        socket.emit('dashboard-data', this.generateDashboard(organizationId));
      });

      socket.on('acknowledge-event', (eventId: string) => {
        this.acknowledgeEvent(eventId, socket.id);
      });

      socket.on('request-system-status', () => {
        socket.emit('system-status', this.getSystemStatus());
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private startSystemMonitoring() {
    // Simulate real-time monitoring with periodic checks
    setInterval(() => {
      this.performSystemHealthCheck();
      this.checkSecurityMetrics();
      this.generateRandomEvents();
    }, 5000); // Every 5 seconds

    // Simulate more intensive checks
    setInterval(() => {
      this.performDeepSecurityScan();
      this.checkComplianceStatus();
    }, 30000); // Every 30 seconds
  }

  private performSystemHealthCheck() {
    const components: ComponentStatus[] = [
      {
        name: 'Quantum Threat Engine',
        status: Math.random() > 0.95 ? 'degraded' : 'online',
        responseTime: 50 + Math.random() * 200,
        errorRate: Math.random() * 2
      },
      {
        name: 'Key Rotation Service',
        status: Math.random() > 0.98 ? 'offline' : 'online',
        responseTime: 30 + Math.random() * 100,
        errorRate: Math.random() * 1
      },
      {
        name: 'Compliance Monitor',
        status: 'online',
        responseTime: 20 + Math.random() * 80,
        errorRate: Math.random() * 0.5
      },
      {
        name: 'Algorithm Selector',
        status: Math.random() > 0.97 ? 'degraded' : 'online',
        responseTime: 40 + Math.random() * 150,
        errorRate: Math.random() * 1.5
      }
    ];

    const overallHealth = this.calculateOverallHealth(components);
    const systemStatus: SystemStatus = {
      overall: overallHealth,
      components,
      uptime: Date.now() - (24 * 60 * 60 * 1000), // 24 hours in ms
      lastHealthCheck: new Date()
    };

    this.systemMetrics.set('systemStatus', systemStatus);
    this.broadcastToAll('system-status', systemStatus);
  }

  private calculateOverallHealth(components: ComponentStatus[]): 'healthy' | 'warning' | 'critical' {
    const offlineCount = components.filter(c => c.status === 'offline').length;
    const degradedCount = components.filter(c => c.status === 'degraded').length;

    if (offlineCount > 0) return 'critical';
    if (degradedCount > 1) return 'warning';
    return 'healthy';
  }

  private checkSecurityMetrics() {
    const metrics = {
      threatsDetected: Math.floor(Math.random() * 5),
      threatsBlocked: Math.floor(Math.random() * 3),
      keysRotated: Math.floor(Math.random() * 2),
      complianceScore: 75 + Math.random() * 20,
      systemHealth: 85 + Math.random() * 15,
      activeAlgorithms: 6 + Math.floor(Math.random() * 4)
    };

    this.systemMetrics.set('securityMetrics', metrics);
    
    // Check for threshold violations
    if (metrics.threatsDetected > this.alertThresholds.threatDetection * 10) {
      this.createEvent('attack-attempt', 'warning', 'High threat detection rate observed');
    }
  }

  private generateRandomEvents() {
    // Randomly generate security events
    if (Math.random() > 0.7) {
      const eventTypes = ['attack-attempt', 'key-rotation', 'compliance-check', 'algorithm-switch', 'performance-alert'];
      const severities = ['info', 'warning', 'error', 'critical'];
      
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any;
      const severity = severities[Math.floor(Math.random() * severities.length)] as any;
      
      this.createEvent(type, severity, this.generateEventDescription(type, severity));
    }
  }

  private generateEventDescription(type: string, severity: string): string {
    const descriptions = {
      'attack-attempt': [
        'Quantum cryptographic attack pattern detected',
        'Unusual encryption key usage observed',
        'Potential side-channel attack identified',
        'Brute force attempt on quantum-resistant algorithm'
      ],
      'key-rotation': [
        'Automated key rotation completed successfully',
        'Key rotation triggered by threat level increase',
        'Emergency key rotation due to compliance requirement',
        'Scheduled quantum-safe key renewal executed'
      ],
      'compliance-check': [
        'NIST compliance verification completed',
        'ISO-27001 audit checkpoint passed',
        'FIPS-140-2 validation status updated',
        'SOC-2 security controls reviewed'
      ],
      'algorithm-switch': [
        'Migrated to CRYSTALS-Kyber for key exchange',
        'Upgraded to post-quantum signature algorithm',
        'Algorithm performance optimization applied',
        'Quantum-resistant cipher suite activated'
      ],
      'performance-alert': [
        'Cryptographic operation latency spike detected',
        'Key generation performance degradation',
        'Algorithm throughput below threshold',
        'Memory usage exceeded optimal range'
      ]
    };

    const typeDescriptions = descriptions[type] || ['Security event occurred'];
    const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
    
    return severity === 'critical' ? `CRITICAL: ${description}` : description;
  }

  private performDeepSecurityScan() {
    // Simulate comprehensive security analysis
    const findings = {
      vulnerabilities: Math.floor(Math.random() * 3),
      misconfigurations: Math.floor(Math.random() * 2),
      complianceIssues: Math.floor(Math.random() * 4),
      performanceIssues: Math.floor(Math.random() * 2)
    };

    if (findings.vulnerabilities > 0) {
      this.createEvent('attack-attempt', 'high', `Security scan detected ${findings.vulnerabilities} potential vulnerabilities`);
    }
  }

  private checkComplianceStatus() {
    // Simulate compliance monitoring
    const complianceScore = 70 + Math.random() * 30;
    
    if (complianceScore < 80) {
      this.createEvent('compliance-check', 'warning', 
        `Compliance score below threshold: ${Math.round(complianceScore)}%`);
    }
  }

  createEvent(
    type: SecurityEvent['type'], 
    severity: SecurityEvent['severity'], 
    description: string,
    source: string = 'system',
    metadata: Record<string, any> = {}
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      severity,
      source,
      description,
      metadata,
      resolved: false
    };

    this.events.unshift(event); // Add to beginning of array
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(0, 1000);
    }

    // Broadcast event to all connected clients
    this.broadcastToAll('security-event', event);

    // Send alert for high-severity events
    if (['error', 'critical'].includes(severity)) {
      this.broadcastToAll('security-alert', {
        event,
        alertLevel: severity,
        requiresAction: severity === 'critical'
      });
    }

    return event;
  }

  acknowledgeEvent(eventId: string, acknowledgedBy: string) {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.acknowledgedBy = acknowledgedBy;
      
      this.broadcastToAll('event-acknowledged', {
        eventId,
        acknowledgedBy,
        timestamp: new Date()
      });
    }
  }

  generateDashboard(organizationId: string): MonitoringDashboard {
    const securityMetrics = this.systemMetrics.get('securityMetrics') || {
      threatsDetected: 0,
      threatsBlocked: 0,
      keysRotated: 0,
      complianceScore: 85,
      systemHealth: 90,
      activeAlgorithms: 8
    };

    const recentEvents = this.events
      .slice(0, 10) // Last 10 events
      .filter(event => !event.resolved || event.severity === 'critical');

    const systemStatus = this.systemMetrics.get('systemStatus') || this.getDefaultSystemStatus();

    return {
      organizationId,
      metrics: securityMetrics,
      recentEvents,
      systemStatus
    };
  }

  private getDefaultSystemStatus(): SystemStatus {
    return {
      overall: 'healthy',
      components: [
        { name: 'Quantum Threat Engine', status: 'online', responseTime: 75, errorRate: 0.1 },
        { name: 'Key Rotation Service', status: 'online', responseTime: 45, errorRate: 0.05 },
        { name: 'Compliance Monitor', status: 'online', responseTime: 35, errorRate: 0.02 },
        { name: 'Algorithm Selector', status: 'online', responseTime: 60, errorRate: 0.08 }
      ],
      uptime: 86400000, // 24 hours
      lastHealthCheck: new Date()
    };
  }

  getSystemStatus(): SystemStatus {
    return this.systemMetrics.get('systemStatus') || this.getDefaultSystemStatus();
  }

  getEvents(limit: number = 50, severity?: string): SecurityEvent[] {
    let filteredEvents = this.events;
    
    if (severity) {
      filteredEvents = this.events.filter(event => event.severity === severity);
    }
    
    return filteredEvents.slice(0, limit);
  }

  private broadcastToAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  private broadcastToOrganization(organizationId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`org-${organizationId}`).emit(event, data);
    }
  }
}

// Singleton instance
const monitoringService = new RealTimeMonitoringService();

export const getDashboard: RequestHandler = async (req, res) => {
  try {
    const { organizationId = 'default' } = req.params;
    
    const dashboard = monitoringService.generateDashboard(organizationId);
    
    res.json({
      success: true,
      data: dashboard,
      timestamp: new Date()
    } as APIResponse<MonitoringDashboard>);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve monitoring dashboard",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getSystemStatus: RequestHandler = async (req, res) => {
  try {
    const systemStatus = monitoringService.getSystemStatus();
    
    res.json({
      success: true,
      data: systemStatus,
      timestamp: new Date()
    } as APIResponse<SystemStatus>);
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve system status",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getEvents: RequestHandler = async (req, res) => {
  try {
    const { limit = 50, severity } = req.query;
    
    const events = monitoringService.getEvents(
      Number(limit),
      severity as string
    );
    
    res.json({
      success: true,
      data: events,
      timestamp: new Date()
    } as APIResponse<SecurityEvent[]>);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve security events",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const acknowledgeEvent: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { acknowledgedBy = 'anonymous' } = req.body;
    
    monitoringService.acknowledgeEvent(eventId, acknowledgedBy);
    
    res.json({
      success: true,
      data: { message: "Event acknowledged successfully" },
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Acknowledge event error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to acknowledge event",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const createEvent: RequestHandler = async (req, res) => {
  try {
    const { type, severity, description, source, metadata } = req.body;
    
    if (!type || !severity || !description) {
      return res.status(400).json({
        success: false,
        error: "Type, severity, and description are required",
        timestamp: new Date()
      } as APIResponse);
    }

    const event = monitoringService.createEvent(type, severity, description, source, metadata);
    
    res.json({
      success: true,
      data: event,
      timestamp: new Date()
    } as APIResponse<SecurityEvent>);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to create security event",
      timestamp: new Date()
    } as APIResponse);
  }
};

// Export the monitoring service for use in other modules
export { monitoringService };
