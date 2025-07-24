import { RequestHandler } from "express";
import { AuthRequest, AuthResponse, RegisterRequest, User, Organization, APIResponse } from "@shared/quantum-types";

// In a real implementation, you would use a proper database and hashing library
// This is a simplified implementation for demonstration purposes
class AuthenticationService {
  private users: Map<string, User & { password: string }> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default organization
    const defaultOrg: Organization = {
      id: 'default-org',
      name: 'Default Organization',
      tier: 'professional',
      settings: {
        threatSensitivity: 'medium',
        keyRotationInterval: 24,
        complianceStandards: ['NIST', 'FIPS-140-2'],
        monitoringEnabled: true,
        realTimeAlerts: true,
        algorithmPreferences: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium']
      },
      users: [],
      createdAt: new Date()
    };
    this.organizations.set(defaultOrg.id, defaultOrg);

    // Create default admin user
    const adminUser = {
      id: 'admin-user',
      name: 'Administrator',
      email: 'admin@quantumshield.com',
      password: this.hashPassword('admin123'), // In real app, use bcrypt
      role: 'admin' as const,
      organizationId: defaultOrg.id,
      createdAt: new Date(),
      lastActive: new Date()
    };
    this.users.set(adminUser.email, adminUser);
    defaultOrg.users.push(adminUser.id);

    // Create demo enterprise organization
    const enterpriseOrg: Organization = {
      id: 'enterprise-corp',
      name: 'Enterprise Corporation',
      tier: 'enterprise',
      settings: {
        threatSensitivity: 'critical',
        keyRotationInterval: 12,
        complianceStandards: ['NIST', 'FIPS-140-2', 'ISO-27001', 'SOC-2'],
        monitoringEnabled: true,
        realTimeAlerts: true,
        algorithmPreferences: ['CRYSTALS-Kyber-768', 'CRYSTALS-Dilithium2', 'FALCON-512']
      },
      users: [],
      createdAt: new Date()
    };
    this.organizations.set(enterpriseOrg.id, enterpriseOrg);

    // Create demo users
    const demoUsers = [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@quantumshield.com',
        password: this.hashPassword('password123'),
        role: 'user' as const,
        organizationId: defaultOrg.id,
        createdAt: new Date(),
        lastActive: new Date()
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@enterprise.com',
        password: this.hashPassword('securepass456'),
        role: 'enterprise' as const,
        organizationId: enterpriseOrg.id,
        createdAt: new Date(),
        lastActive: new Date()
      }
    ];

    demoUsers.forEach(user => {
      this.users.set(user.email, user);
      const org = this.organizations.get(user.organizationId!);
      if (org) {
        org.users.push(user.id);
      }
    });
  }

  private hashPassword(password: string): string {
    // In a real implementation, use bcrypt or similar
    // This is just for demo purposes
    return Buffer.from(password).toString('base64');
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = this.users.get(email.toLowerCase());
    
    if (!user || !this.verifyPassword(password, user.password)) {
      throw new Error('Invalid email or password');
    }

    // Update last active
    user.lastActive = new Date();

    // Generate session token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.sessions.set(token, {
      userId: user.id,
      expiresAt
    });

    // Return user without password
    const { password: _, ...safeUser } = user;
    
    return {
      user: safeUser,
      token,
      expiresAt
    };
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const { name, email, password, organizationName } = registerData;
    
    // Check if user already exists
    if (this.users.has(email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    let organizationId = 'default-org';
    
    // Create new organization if specified
    if (organizationName) {
      const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newOrg: Organization = {
        id: orgId,
        name: organizationName,
        tier: 'starter',
        settings: {
          threatSensitivity: 'medium',
          keyRotationInterval: 48,
          complianceStandards: ['NIST'],
          monitoringEnabled: true,
          realTimeAlerts: false,
          algorithmPreferences: ['CRYSTALS-Kyber-512', 'CRYSTALS-Dilithium2']
        },
        users: [],
        createdAt: new Date()
      };
      this.organizations.set(orgId, newOrg);
      organizationId = orgId;
    }

    // Create new user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = this.hashPassword(password);
    
    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: organizationName ? 'admin' as const : 'user' as const,
      organizationId,
      createdAt: new Date(),
      lastActive: new Date()
    };

    this.users.set(email.toLowerCase(), newUser);
    
    // Add user to organization
    const org = this.organizations.get(organizationId);
    if (org) {
      org.users.push(userId);
    }

    // Auto-login after registration
    return this.login(email, password);
  }

  async validateToken(token: string): Promise<User | null> {
    const session = this.sessions.get(token);
    
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        this.sessions.delete(token); // Clean up expired session
      }
      return null;
    }

    // Find user by ID
    const user = Array.from(this.users.values()).find(u => u.id === session.userId);
    if (!user) {
      this.sessions.delete(token); // Clean up orphaned session
      return null;
    }

    // Update last active
    user.lastActive = new Date();

    // Return user without password
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async logout(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (!user) return null;

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    return this.organizations.get(organizationId) || null;
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If email is being changed, check for conflicts
    if (updates.email && updates.email !== user.email) {
      const emailExists = this.users.has(updates.email.toLowerCase());
      if (emailExists) {
        throw new Error('Email already in use');
      }
      
      // Update email key in users map
      this.users.delete(user.email);
      user.email = updates.email.toLowerCase();
      this.users.set(user.email, user);
    }

    if (updates.name) {
      user.name = updates.name;
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!this.verifyPassword(currentPassword, user.password)) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    user.password = this.hashPassword(newPassword);
  }

  async updateOrganizationSettings(organizationId: string, settings: Partial<Organization['settings']>): Promise<Organization> {
    const org = this.organizations.get(organizationId);
    if (!org) {
      throw new Error('Organization not found');
    }

    org.settings = { ...org.settings, ...settings };
    return org;
  }

  // Clean up expired sessions periodically
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(token);
      }
    }
  }

  // Get system statistics
  getSystemStats() {
    return {
      totalUsers: this.users.size,
      totalOrganizations: this.organizations.size,
      activeSessions: this.sessions.size,
      usersByRole: {
        admin: Array.from(this.users.values()).filter(u => u.role === 'admin').length,
        enterprise: Array.from(this.users.values()).filter(u => u.role === 'enterprise').length,
        user: Array.from(this.users.values()).filter(u => u.role === 'user').length
      }
    };
  }
}

// Singleton instance
const authService = new AuthenticationService();

// Clean up expired sessions every hour
setInterval(() => {
  authService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

// Middleware to authenticate requests
export const authenticateToken: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
      timestamp: new Date()
    } as APIResponse);
  }

  try {
    const user = await authService.validateToken(token);
    if (!user) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
        timestamp: new Date()
      } as APIResponse);
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Token validation failed",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as AuthRequest;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
        timestamp: new Date()
      } as APIResponse);
    }

    const authResponse = await authService.login(email, password);
    
    res.json({
      success: true,
      data: authResponse,
      timestamp: new Date()
    } as APIResponse<AuthResponse>);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || "Authentication failed",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const register: RequestHandler = async (req, res) => {
  try {
    const registerData = req.body as RegisterRequest;
    
    if (!registerData.name || !registerData.email || !registerData.password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
        timestamp: new Date()
      } as APIResponse);
    }

    const authResponse = await authService.register(registerData);
    
    res.status(201).json({
      success: true,
      data: authResponse,
      timestamp: new Date()
    } as APIResponse<AuthResponse>);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message || "Registration failed",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      await authService.logout(token);
    }
    
    res.json({
      success: true,
      data: { message: "Logged out successfully" },
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getProfile: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const organization = await authService.getOrganization(user.organizationId);
    
    res.json({
      success: true,
      data: {
        user,
        organization
      },
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve profile",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, email } = req.body;
    
    const updatedUser = await authService.updateUserProfile(user.id, { name, email });
    
    res.json({
      success: true,
      data: updatedUser,
      timestamp: new Date()
    } as APIResponse<User>);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update profile",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const changePassword: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
        timestamp: new Date()
      } as APIResponse);
    }
    
    await authService.changePassword(user.id, currentPassword, newPassword);
    
    res.json({
      success: true,
      data: { message: "Password changed successfully" },
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to change password",
      timestamp: new Date()
    } as APIResponse);
  }
};

export const getSystemStats: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Only admin users can access system stats
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        timestamp: new Date()
      } as APIResponse);
    }
    
    const stats = authService.getSystemStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    } as APIResponse);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve system statistics",
      timestamp: new Date()
    } as APIResponse);
  }
};

// Export auth service for use in other modules
export { authService };
