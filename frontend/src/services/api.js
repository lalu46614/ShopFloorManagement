import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Machines API
export const machinesAPI = {
  getAll: () => api.get('/machines'),
  getOne: (id) => api.get(`/machines/${id}`),
  update: (data) => api.post('/machines/update', data),
  batchUpdate: (machines) => api.post('/machines/batch', { machines }),
  getLLMStatus: () => api.get('/machines/status/llm'),
};

// Safety API
export const safetyAPI = {
  getAll: () => api.get('/safety'),
  getOne: (area) => api.get(`/safety/${area}`),
  update: (data) => api.post('/safety/update', data),
  getLogs: (area) => api.get('/safety/logs', { params: { area } }),
  getLLMStatus: () => api.get('/safety/status/llm'),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  update: (data) => api.post('/orders/update', data),
  batchUpdate: (orders) => api.post('/orders/batch', { orders }),
  getLLMStatus: () => api.get('/orders/status/llm'),
};

// AI API
export const aiAPI = {
  query: (workflow, message) => api.post('/ai/query', { workflow, message }),
  dailySummary: () => api.get('/ai/daily-summary'),
};

export default api;

