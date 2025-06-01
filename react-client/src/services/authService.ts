import api from '../api/axios';
import type { LoginCredentials, RegisterCredentials, User } from '../types/index.types';

export const login = async (credentials: LoginCredentials) => {
  try {
    console.log('Sending login request with:', credentials); // לוג לבדיקה

    const response = await api.post<{ token: string; user: User }>('/users/login', {
      email: credentials.email,
      password: credentials.password
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const register = async (userData: RegisterCredentials) => {
  try {
    const response = await api.post<{ token: string; user: User }>('/users/register', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};