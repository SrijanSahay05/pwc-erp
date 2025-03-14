import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users';

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    user_type: string;
    created_at: string;
    updated_at: string;
  };
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/login/`, credentials);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export default new AuthService(); 