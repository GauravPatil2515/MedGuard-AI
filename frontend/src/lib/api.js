/**
 * MedGuard AI / SAFE CAP⁺ — Centralized Unified API Client & Environment Resolver
 * ===============================================================================
 * Automatically resolves the correct backend API endpoint across:
 * - Local Vite Development (via Vite dev proxy '/api' -> http://localhost:5000)
 * - Docker / Nginx Container Deployment (via Nginx reverse proxy '/api/' -> backend:5000)
 * - Production HTTPS Cloud Deployments (prevents mixed-content SSL blocks)
 * - Environment Variable Overrides (VITE_API_BASE)
 */

export function getApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:5000/api';

  // 1. Explicit environment variable override
  if (import.meta.env?.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/+$/, '');
  }

  const { protocol, hostname, port } = window.location;

  // 2. Running on HTTPS or standard ports (80 / 443) -> use relative '/api'
  // This is vital to prevent modern browser Mixed-Content blocking
  if (protocol === 'https:' || port === '' || port === '80' || port === '443') {
    return '/api';
  }

  // 3. Vite Development Server (ports 5173, 5174, etc.) -> use proxy '/api'
  if (port === '5173' || port === '5174' || port === '3000') {
    return '/api';
  }

  // 4. Default fallback for bare local connections
  return `http://${hostname}:5000/api`;
}

export const API_BASE = getApiBase();

/**
 * Standardized JSON Fetch Wrapper
 */
export async function apiFetch(endpoint, options = {}) {
  const base = getApiBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response;
}

export async function apiGet(endpoint, options = {}) {
  const res = await apiFetch(endpoint, { ...options, method: 'GET' });
  if (!res.ok) throw new Error(`API GET ${endpoint} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(endpoint, body = {}, options = {}) {
  const res = await apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API POST ${endpoint} failed: ${res.status}`);
  return res.json();
}

export default {
  getApiBase,
  API_BASE,
  apiFetch,
  apiGet,
  apiPost
};
