/**
 * API Service Layer - Backend API calls with JWT authentication
 * Replaces localStorage/patientRecordStore with real backend
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.loadTokens();
  }

  loadTokens() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  saveTokens(access, refresh) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiry
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      } else {
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
    return false;
  }

  // ========== Auth ==========
  async register(data) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.saveTokens(result.access_token, result.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async login(email, password) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.saveTokens(result.access_token, result.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  logout() {
    this.clearTokens();
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  // ========== Medicines ==========
  async getMedicines() {
    return this.request('/medicines');
  }

  async addMedicine(data) {
    return this.request('/medicines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMedicine(medicineId) {
    return this.request(`/medicines/${medicineId}`, {
      method: 'DELETE',
    });
  }

  async generateQR(medicineId) {
    return this.request('/medicines/generate-qr', {
      method: 'POST',
      body: JSON.stringify({ medicine_id: medicineId }),
    });
  }

  // ========== Schedules ==========
  async getSchedules(patientId) {
    return this.request(`/patients/${patientId}/schedules`);
  }

  async getTodaysSchedule(patientId) {
    return this.request(`/patients/${patientId}/schedule/today`);
  }

  async createSchedule(data) {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logDose(data) {
    return this.request('/schedules/dose', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== Adherence ==========
  async logAdherence(data) {
    return this.request('/adherence/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdherence(patientId, days = 30) {
    return this.request(`/patients/${patientId}/adherence?days=${days}`);
  }

  // ========== Prescriptions / Safety ==========
  async scanPrescription(data) {
    return this.request('/rx/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRiskFlags(patientId) {
    return this.request(`/prescriptions/risk-flags?patient_id=${patientId}`);
  }

  async getSafetyAnalysis(medications) {
    return this.request('/safety/analyze', {
      method: 'POST',
      body: JSON.stringify({ medications }),
    });
  }

  // ========== Caregiver ==========
  async getCaregivers(patientId) {
    return this.request(`/patients/${patientId}/caregivers`);
  }

  async linkCaregiver(data) {
    return this.request('/caregivers/link', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCaregiverPatients(caregiverId) {
    return this.request(`/caregivers/${caregiverId}/patients`);
  }

  async notifyRisk(patientId, severity) {
    return this.request('/caregiver/notify-risk', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, max_severity: severity }),
    });
  }

  // ========== TTS ==========
  async getAudio(warningType, lang = 'mr') {
    return this.request(`/tts/audio?warning_type=${warningType}&lang=${lang}`);
  }

  // ========== FDA OpenFDA ==========
  async getFdaSignals(drugName) {
    return this.request(`/safety/fda/${encodeURIComponent(drugName)}`);
  }

  async crossRefFda(drugNames) {
    return this.request('/safety/fda/crossref', {
      method: 'POST',
      body: JSON.stringify({ drugs: drugNames }),
    });
  }

  // ========== Health ==========
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiService();
export default api;