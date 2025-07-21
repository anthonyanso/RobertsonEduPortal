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
    const response = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async register(data: AdminRegisterData) {
    const response = await apiRequest('/api/admin/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async forgotPassword(email: string) {
    const response = await apiRequest('/api/admin/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response;
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