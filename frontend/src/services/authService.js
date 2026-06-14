import api from './api';

const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    _storeTokens(res.data);
    return res.data;
  },

  async login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    _storeTokens(res.data);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout() {
    const refresh_token = localStorage.getItem('refresh_token');
    try {
      if (refresh_token) await api.post('/auth/logout', { refresh_token });
    } finally {
      _clearTokens();
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getStoredUser() {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },
};

function _storeTokens({ access_token, refresh_token }) {
  localStorage.setItem('access_token',  access_token);
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
}

function _clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export default authService;
