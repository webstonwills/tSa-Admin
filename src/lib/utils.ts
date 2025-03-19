import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_CONFIG } from "./config"

/**
 * Tailwind CSS class merger utility
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe localStorage wrapper with error handling
 */
export const safeStorage = {
  getItem: (key: string, defaultValue: string = ''): string => {
    try {
      const value = localStorage.getItem(key)
      return value !== null ? value : defaultValue
    } catch (e) {
      console.error('Failed to access localStorage:', e)
      return defaultValue
    }
  },

  getObject: <T>(key: string, defaultValue: T): T => {
    try {
      const value = localStorage.getItem(key)
      if (value) {
        return JSON.parse(value) as T
      }
      return defaultValue
    } catch (e) {
      console.error('Failed to access or parse localStorage object:', e)
      return defaultValue
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (e) {
      console.error('Failed to write to localStorage:', e)
      return false
    }
  },

  setObject: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('Failed to write object to localStorage:', e)
      return false
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error('Failed to remove from localStorage:', e)
      return false
    }
  }
}

/**
 * Fetcher with timeout and retry
 */
export async function fetchWithTimeout<T>(
  fetchFn: () => Promise<T>,
  timeout: number = API_CONFIG.TIMEOUTS.DEFAULT,
  retries: number = API_CONFIG.RETRY.MAX_ATTEMPTS
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create the timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`))
        }, timeout * (attempt > 1 ? API_CONFIG.RETRY.BACKOFF_FACTOR : 1))
      })
      
      // Race between the fetch and timeout
      return await Promise.race([
        fetchFn(),
        timeoutPromise
      ])
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Attempt ${attempt} failed:`, lastError)
      
      // If we've used all retries, throw the error
      if (attempt === retries) {
        throw lastError
      }
      
      // Wait before retrying (with exponential backoff)
      const backoffTime = 1000 * Math.pow(API_CONFIG.RETRY.BACKOFF_FACTOR, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, backoffTime))
    }
  }
  
  // This should never be reached due to the throw above, but TypeScript needs it
  throw lastError || new Error('Failed after retries')
}

/**
 * Helper to create a controlled abort controller with timeout
 */
export function createTimeoutController(timeout: number): { controller: AbortController; cancel: () => void } {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  return {
    controller,
    cancel: () => {
      clearTimeout(timeoutId)
    }
  }
}

/**
 * Debug logger that can be disabled in production
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args)
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  }
}
