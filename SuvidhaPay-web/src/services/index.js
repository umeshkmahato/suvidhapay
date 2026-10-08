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
  options: () => apiClient.get('/vehicles/options'),
  getById: (id, params) => apiClient.get(`/vehicles/${id}?${buildQuery(params)}`),
};

export const rateService = {
  list: () => apiClient.get('/rate-master'),
  save: (data) => apiClient.put('/rate-master', data),
};

export const dueService = {
  create: (data) => apiClient.post('/dues', data),
  list: (params) => apiClient.get(`/dues?${buildQuery(params)}`),
  getById: (id) => apiClient.get(`/dues/${id}`),
  update: (id, data) => apiClient.put(`/dues/${id}`, data),
  cancel: (id, data) => apiClient.post(`/dues/${id}/cancel`, data),
  outstanding: (params) => apiClient.get(`/dues/outstanding?${buildQuery(params)}`),
};
