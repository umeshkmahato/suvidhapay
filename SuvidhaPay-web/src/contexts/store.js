import { create } from 'zustand';
import { authService } from '../services';

const storedUser = localStorage.getItem('user');

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(email, password);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
        error: null,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
