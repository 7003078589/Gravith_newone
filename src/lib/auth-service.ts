// Authentication service for connecting to backend API
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: 'admin' | 'user';
      organizationId: string;
      organizationRole: 'owner' | 'admin' | 'manager' | 'user';
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    organization: {
      id: string;
      name: string;
      subscription?: 'free' | 'basic' | 'premium' | 'enterprise';
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      createdBy: string;
    };
  };
  error?: string;
}

export class AuthService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // For now, we'll use a mock response since we need to implement user authentication in backend
      // This will be replaced with actual API call once backend auth is implemented

      // Mock authentication - replace with actual API call
      const mockUsers = [
        {
          id: 'user1',
          username: 'admin',
          email: 'admin@gavithconstruction.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as const,
          organizationId: 'org1',
          organizationRole: 'owner' as const,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'user2',
          username: 'manager',
          email: 'manager@gavithconstruction.com',
          firstName: 'Manager',
          lastName: 'User',
          role: 'user' as const,
          organizationId: 'org1',
          organizationRole: 'manager' as const,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'user3',
          username: 'engineer',
          email: 'engineer@gavithconstruction.com',
          firstName: 'Engineer',
          lastName: 'User',
          role: 'user' as const,
          organizationId: 'org1',
          organizationRole: 'user' as const,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockOrganizations = [
        {
          id: 'org1',
          name: 'Gavith Construction Pvt. Ltd.',
          subscription: 'premium' as const,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'system',
        },
      ];

      const userCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'manager', password: 'manager123' },
        { username: 'engineer', password: 'engineer123' },
      ];

      // Check credentials
      const credMatch = userCredentials.find(
        (c) => c.username === credentials.username && c.password === credentials.password,
      );

      if (!credMatch) {
        return {
          success: false,
          error: 'Invalid username or password',
        };
      }

      const user = mockUsers.find((u) => u.username === credentials.username);
      const organization = mockOrganizations.find((o) => o.id === user?.organizationId);

      if (!user || !organization) {
        return {
          success: false,
          error: 'User or organization not found',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          error: 'User account is inactive. Please contact your administrator.',
        };
      }

      return {
        success: true,
        data: {
          user,
          organization,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  static async logout(): Promise<void> {
    // Clear any stored tokens or session data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      // Check if user is logged in by checking localStorage
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        return {
          success: false,
          error: 'No user session found',
        };
      }

      return {
        success: true,
        data: JSON.parse(userData),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: 'Failed to get user data',
      };
    }
  }
}
