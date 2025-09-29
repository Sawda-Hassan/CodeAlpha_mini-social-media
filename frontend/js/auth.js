// public/js/auth-client.js
// Backend-connected Auth client for mini-social app
// Requires backend endpoints:
// POST /api/auth/login     { emailOrUsername, password } -> { token, refreshToken, user }
// POST /api/auth/register  { username, email, password, displayName } -> { token, refreshToken, user }
// POST /api/auth/refresh   { refreshToken } -> { token }
// GET  /api/me            (Authorization: Bearer <token>) -> { user }
//
// If your API runs on a different origin, set BASE_API_URL accordingly.
const BASE_API_URL = '/api';

class Auth {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.refreshToken = null;
    this.init(); // async but we call without await in constructor
  }

  // initialize: load tokens & user, validate token by calling /api/me (tries refresh if needed)
  async init() {
    try {
      const savedUser = localStorage.getItem('ms_user');
      const savedToken = localStorage.getItem('ms_token');
      const savedRefresh = localStorage.getItem('ms_refresh');

      this.currentUser = savedUser ? JSON.parse(savedUser) : null;
      this.token = savedToken || null;
      this.refreshToken = savedRefresh || null;

      if (this.token) {
        // validate token by calling /api/me
        const res = await fetch(BASE_API_URL + '/me', {
          headers: { 'Authorization': 'Bearer ' + this.token }
        });
        if (res.ok) {
          const data = await res.json();
          // backend /api/me may return { user } or user object — normalize
          this.currentUser = data.user || data;
          localStorage.setItem('ms_user', JSON.stringify(this.currentUser));
          return;
        }
        // token invalid — try refresh
        const refreshed = await this.tryRefresh();
        if (!refreshed) {
          this.clearStorage();
        }
      }
    } catch (err) {
      // any error -> clear stored auth to avoid stale state
      console.warn('Auth.init error:', err);
      this.clearStorage();
    }
  }

  // helper to save tokens + user
  saveAuth({ token, refreshToken, user }) {
    this.token = token || null;
    this.refreshToken = refreshToken || null;
    this.currentUser = user || null;
    if (this.token) localStorage.setItem('ms_token', this.token); else localStorage.removeItem('ms_token');
    if (this.refreshToken) localStorage.setItem('ms_refresh', this.refreshToken); else localStorage.removeItem('ms_refresh');
    if (this.currentUser) localStorage.setItem('ms_user', JSON.stringify(this.currentUser)); else localStorage.removeItem('ms_user');
  }

  // clear stored auth
  clearStorage() {
    this.token = null;
    this.refreshToken = null;
    this.currentUser = null;
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_refresh');
    localStorage.removeItem('ms_user');
  }

  // try refresh token -> returns true if succeeded
  async tryRefresh() {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(BASE_API_URL + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) {
        // update token (keep the same refreshToken stored by backend on login)
        this.token = data.token;
        localStorage.setItem('ms_token', this.token);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Refresh failed', err);
      return false;
    }
  }

  // login against backend, returns { success: true, user } or { success:false, message }
  async login(usernameOrEmail, password) {
    try {
      const res = await fetch(BASE_API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: usernameOrEmail, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || data.msg || 'Login failed' };
      }
      // expected response: { token, refreshToken, user }
      this.saveAuth({ token: data.token, refreshToken: data.refreshToken, user: data.user || data });
      return { success: true, user: this.currentUser };
    } catch (err) {
      console.error('Login error', err);
      return { success: false, message: 'Network error' };
    }
  }

  // register against backend; arguments: username, email, password, displayName (displayName optional)
  async register(username, email, password, displayName = '') {
    try {
      const res = await fetch(BASE_API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, displayName })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || data.msg || 'Register failed' };
      }
      // expected response: { token, refreshToken, user }
      this.saveAuth({ token: data.token, refreshToken: data.refreshToken, user: data.user || data });
      return { success: true, user: this.currentUser };
    } catch (err) {
      console.error('Register error', err);
      return { success: false, message: 'Network error' };
    }
  }

  // logout: clear storage and redirect optionally
  logout(redirect = true) {
    this.clearStorage();
    if (redirect) window.location.href = 'index.html';
  }

  // boolean
  isLoggedIn() {
    return !!this.token && !!this.currentUser;
  }

  // return current user object (or null)
  getCurrentUser() {
    return this.currentUser;
  }

  // require auth for a page - redirect to index.html if not logged in
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  // helper to perform authenticated requests; will try refresh once on 401
  // options: same as fetch options; path is relative to BASE_API_URL
  async request(path, options = {}) {
    const headers = options.headers || {};
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(BASE_API_URL + path, { ...options, headers });
      if (res.status === 401) {
        // try refresh once
        const ok = await this.tryRefresh();
        if (!ok) {
          this.clearStorage();
          throw new Error('Unauthorized');
        }
        // retry with new token
        const headers2 = options.headers || {};
        headers2['Authorization'] = 'Bearer ' + this.token;
        if (!headers2['Content-Type'] && !(options.body instanceof FormData)) {
          headers2['Content-Type'] = 'application/json';
        }
        return fetch(BASE_API_URL + path, { ...options, headers: headers2 });
      }
      return res;
    } catch (err) {
      throw err;
    }
  }
}

// expose singleton to window for easy use in pages
window.auth = new Auth();
