/**
 * Application Configuration
 * 
 * This file contains environment variables and configuration settings used across the application.
 * For sensitive information, use environment variables instead of hardcoding values.
 */

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
    CEO: '/dashboard/ceo', // Use the original CEO dashboard
    SECRETARY: '/dashboard/sec',
    FINANCE: '/dashboard/fin',
    BUSINESS_MANAGEMENT: '/dashboard/bm',
    AUDITOR: '/dashboard/aud',
    WELFARE: '/dashboard/wel',
    BOARD_MEMBER: '/dashboard/bmem',
    // Default for users with no specific role/department
    DEFAULT: '/dashboard/profile',
  },
}; 