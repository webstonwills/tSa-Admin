/**
 * Application Configuration
 * 
 * This file contains environment variables and configuration settings used across the application.
 * For sensitive information, use environment variables instead of hardcoding values.
 */

// API Configuration
export const API_CONFIG = {
  // Timeout settings in milliseconds
  TIMEOUTS: {
    DEFAULT: 15000, // 15 seconds for most operations
    PROFILE_FETCH: 10000, // 10 seconds for profile fetches
    AUTH: 20000, // 20 seconds for auth operations
  },
  // Retry settings
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_FACTOR: 1.5, // Exponential backoff
  },
  // Cache settings
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutes cache TTL
    PROFILE_KEY: 'tsa_user_profile', // LocalStorage key for profile cache
  },
};

// Company verification keys - in production, these should come from environment variables
export const COMPANY_VERIFICATION = {
  // CEO key that verifies admin signup - this should be secured and not in client code in production
  CEO_KEY: import.meta.env.VITE_CEO_VERIFICATION_KEY || 'TSA-CEO-2023',
};

// Global application configuration
export const APP_CONFIG = {
  // Company name used throughout the app
  COMPANY_NAME: 'Tshimologong Sacco Association',
  // Default dashboard paths by role
  DASHBOARDS: {
    ADMIN: '/dashboard/admin',
    CEO: '/dashboard/ceo',
    SECRETARY: '/dashboard/sec',
    FINANCE: '/dashboard/fin',
    BUSINESS_MANAGEMENT: '/dashboard/bm',
    AUDITOR: '/dashboard/aud',
    WELFARE: '/dashboard/wel',
    BOARD_MEMBER: '/dashboard/bmem',
    DEFAULT: '/dashboard/profile'
  },
  // LocalStorage keys
  STORAGE_KEYS: {
    USER_PROFILE: 'tsa_user_profile',
    USER_ROLE: 'tsa_user_role',
    USER_STATUS: 'tsa_user_status',
    LOGIN_ERROR: 'tsa_login_error',
    LOGIN_PROGRESS: 'tsa_login_in_progress',
    CEO_REDIRECT: 'tsa_ceo_redirect',
    AUTH_SESSION: 'tsa_auth_session',
    PROFILE_TIMESTAMP: 'tsa_profile_timestamp'
  }
}; 