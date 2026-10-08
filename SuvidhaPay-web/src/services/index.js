import apiClient from './apiClient';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  return query.toString();
};

export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  me: () => apiClient.get('/auth/me'),
};

export const vehicleService = {
  create: (data) => apiClient.post('/vehicles', data),
  search: (params) => apiClient.get(`/vehicles/search?${buildQuery(params)}`),
  list: (params) => apiClient.get(`/vehicles?${buildQuery(params)}`),
};
