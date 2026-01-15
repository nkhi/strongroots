/**
 * Application configuration constants
 */

// API base URL - configurable via env for multi-device access
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    || `http://${window.location.hostname}:3000`;

// Memos URL - configurable via env for multi-device access  
export const MEMOS_URL = import.meta.env.VITE_MEMOS_URL
    || `http://${window.location.hostname}:5230`;
