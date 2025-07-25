import { apiRequest } from "@/lib/queryClient";

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const adminAuth = {
  async login(data: AdminLoginData) {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  },

  async register(data: AdminRegisterData) {
    const response = await fetch('/api/admin/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  },

  async forgotPassword(email: string) {
    const response = await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    }

    return await response.json();
  },

  async getProfile(): Promise<AdminProfile> {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No admin token found');
    }

    const response = await fetch('/api/admin/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get admin profile');
    }

    return await response.json();
  },

  async logout() {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('adminToken');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('adminToken');
    return !!token;
  },

  getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};