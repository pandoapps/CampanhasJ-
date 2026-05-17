import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Ocorreu um erro. Tente novamente.';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

export const contactService = {
  list: (params?: { search?: string; tag?: string; page?: number }) =>
    api.get('/contacts', { params }),
  create: (data: unknown) => api.post('/contacts', data),
  update: (id: string, data: unknown) => api.put(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
};

export const tagService = {
  list: () => api.get('/tags'),
  create: (data: unknown) => api.post('/tags', data),
  update: (id: string, data: unknown) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

export const campaignService = {
  list: () => api.get('/campaigns'),
  dailyStats: () => api.get('/campaigns/stats/daily'),
  create: (data: unknown) => api.post('/campaigns', data),
  show: (id: string) => api.get(`/campaigns/${id}`),
  update: (id: string, data: unknown) => api.put(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  send: (id: string) => api.post(`/campaigns/${id}/send`),
  pause: (id: string) => api.post(`/campaigns/${id}/pause`),
  retryFailed: (id: string) => api.post(`/campaigns/${id}/retry-failed`),
};

export const candidateService = {
  list: (params?: { search?: string; plan?: string; status?: string }) =>
    api.get('/admin/candidates', { params }),
  create: (data: unknown) => api.post('/admin/candidates', data),
  update: (id: string, data: unknown) => api.put(`/admin/candidates/${id}`, data),
  delete: (id: string) => api.delete(`/admin/candidates/${id}`),
  block: (id: string) => api.post(`/admin/candidates/${id}/block`),
  unblock: (id: string) => api.post(`/admin/candidates/${id}/unblock`),
};

export const profileService = {
  update: (data: unknown) => api.put('/settings/profile', data),
  updatePassword: (data: unknown) => api.put('/settings/password', data),
};

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
};

export const whatsappService = {
  connect: () => api.post('/settings/whatsapp/connect'),
  status: () => api.get('/settings/whatsapp/status', { params: { _t: Date.now() } }),
  qrcode: () => api.get('/settings/whatsapp/qrcode', { params: { _t: Date.now() } }),
  disconnect: () => api.delete('/settings/whatsapp/disconnect'),
};

export default api;
