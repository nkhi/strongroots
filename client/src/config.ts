/**
 * Application configuration constants
 */

// API base URL - configurable via env for multi-device access (moved to port 4000, Cap uses 3000)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    || `http://${window.location.hostname}:4000`;

// Memos URL - configurable via env for multi-device access  
export const MEMOS_URL = import.meta.env.VITE_MEMOS_URL
    || `http://${window.location.hostname}:5230`;

// Immich URL - configurable via env for multi-device access  
export const IMMICH_URL = import.meta.env.VITE_IMMICH_URL
    || `http://${window.location.hostname}:2283`;

// Cap URL - configurable via env for multi-device access
export const CAP_URL = import.meta.env.VITE_CAP_URL
    || `http://${window.location.hostname}:3000`;
