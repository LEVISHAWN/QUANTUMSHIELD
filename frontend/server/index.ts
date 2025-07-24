import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Import route handlers
import { handleDemo } from "./routes/demo";

// Authentication routes
import {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getSystemStats,
  authenticateToken
} from "./routes/auth";

// Threat Prediction routes
import {
  predictThreats,
  getThreatById,
  getThreatHistory
} from "./routes/threat-prediction";

// Enterprise Security routes
import {
  getSecurityReport,
  getComplianceStatus,
  updateComplianceIssue
} from "./routes/enterprise-security";

// Key Rotation routes
import {
  createKey,
  rotateKey,
  getKeys,
  getKeyStatus,
  updateKeyUsage
} from "./routes/key-rotation";

// Real-time Monitoring routes
import {
  getDashboard,
  getSystemStatus,
  getEvents,
  acknowledgeEvent,
  createEvent,
  monitoringService
} from "./routes/real-time-monitoring";

// Algorithm Selection routes
import {
  selectAlgorithm,
  getAlgorithms,
  getAlgorithmById
} from "./routes/algorithm-selection";

// Algorithm Comparison routes
import {
  compareAlgorithms,
  getComparisonPresets,
  getBenchmarkData
} from "./routes/algorithm-comparison";

export function createServer() {
  const app = express();
  const server = createHttpServer(app);

  // Set up Socket.IO for real-time monitoring
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Configure appropriately for production
      methods: ["GET", "POST"]
    }
  });

  // Initialize monitoring service with WebSocket support
  monitoringService.setSocketIO(io);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "QuantumShield API v1.0",
      timestamp: new Date(),
      status: "operational"
    });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // ===== AUTHENTICATION ROUTES =====
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/profile", authenticateToken, getProfile);
  app.put("/api/auth/profile", authenticateToken, updateProfile);
  app.put("/api/auth/change-password", authenticateToken, changePassword);
  app.get("/api/auth/stats", authenticateToken, getSystemStats);

  // ===== THREAT PREDICTION ROUTES =====
  app.post("/api/threat-prediction/analyze", authenticateToken, predictThreats);
  app.get("/api/threat-prediction/:threatId", authenticateToken, getThreatById);
  app.get("/api/threat-prediction/history/:organizationId", authenticateToken, getThreatHistory);

  // ===== ENTERPRISE SECURITY ROUTES =====
  app.get("/api/enterprise-security/report/:organizationId", authenticateToken, getSecurityReport);
  app.get("/api/enterprise-security/compliance/:organizationId", authenticateToken, getComplianceStatus);
  app.put("/api/enterprise-security/compliance/issue/:issueId", authenticateToken, updateComplianceIssue);

  // ===== KEY ROTATION ROUTES =====
  app.post("/api/key-rotation/create", authenticateToken, createKey);
  app.post("/api/key-rotation/:keyId/rotate", authenticateToken, rotateKey);
  app.get("/api/key-rotation/keys", authenticateToken, getKeys);
  app.get("/api/key-rotation/:keyId/status", authenticateToken, getKeyStatus);
  app.put("/api/key-rotation/:keyId/usage", authenticateToken, updateKeyUsage);

  // ===== REAL-TIME MONITORING ROUTES =====
  app.get("/api/monitoring/dashboard/:organizationId?", authenticateToken, getDashboard);
  app.get("/api/monitoring/system-status", authenticateToken, getSystemStatus);
  app.get("/api/monitoring/events", authenticateToken, getEvents);
  app.put("/api/monitoring/events/:eventId/acknowledge", authenticateToken, acknowledgeEvent);
  app.post("/api/monitoring/events", authenticateToken, createEvent);

  // ===== ALGORITHM SELECTION ROUTES =====
  app.post("/api/algorithm-selection/select", authenticateToken, selectAlgorithm);
  app.get("/api/algorithm-selection/algorithms", authenticateToken, getAlgorithms);
  app.get("/api/algorithm-selection/algorithms/:algorithmId", authenticateToken, getAlgorithmById);

  // ===== ALGORITHM COMPARISON ROUTES =====
  app.post("/api/algorithm-comparison/compare", authenticateToken, compareAlgorithms);
  app.get("/api/algorithm-comparison/presets", authenticateToken, getComparisonPresets);
  app.get("/api/algorithm-comparison/benchmark/:algorithmId", authenticateToken, getBenchmarkData);

  // ===== ERROR HANDLING =====
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date()
    });
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      timestamp: new Date()
    });
  });

  // Return the HTTP server instead of just the Express app
  // This allows the calling code to listen on the server with WebSocket support
  return { app, server, io };
}
