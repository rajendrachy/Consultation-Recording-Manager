import { create } from 'zustand';
import axios from 'axios';

// Base API URL configuration
const API_URL = 'http://localhost:5000/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('crm_user')) || null,
  token: localStorage.getItem('crm_token') || null,
  isAuthenticated: !!localStorage.getItem('crm_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('crm_token', token);
      localStorage.setItem('crm_user', JSON.stringify(userData));

      set({
        token,
        user: userData,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
      const { token, ...userData } = response.data;

      localStorage.setItem('crm_token', token);
      localStorage.setItem('crm_user', JSON.stringify(userData));

      set({
        token,
        user: userData,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: (updatedData) => {
    const currentUser = get().user;
    const newUser = { ...currentUser, ...updatedData };
    localStorage.setItem('crm_user', JSON.stringify(newUser));
    set({ user: newUser });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
