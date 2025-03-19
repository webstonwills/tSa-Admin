import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { notify } from '@/components/ui/sonner';

// Define user profile type
export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  departmentId: string | null;
  departmentCode: string | null;
  departmentName: string | null;
  approvalStatus: string;  // Changed to required with default value
  approvedBy: string | null;
  approvalDate: string | null;
  rejectionReason: string | null;
}

// Define approval status types for clear code readability
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  userRole: string;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  forceCorrectProfile: () => Promise<boolean>;
  isApproved: () => boolean;
  isPending: () => boolean;
  isRejected: () => boolean;
  isCEO: () => boolean;
}

// Cache for department data to reduce database queries
const departmentCache = new Map<string, { name: string; code: string }>();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility to safely get and set items in localStorage
const safeLocalStorage = {
  getItem: (key: string, defaultValue: string = ''): string => {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      console.error('Failed to access localStorage:', e);
      return defaultValue;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
      return false;
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();

  // Use a ref to track profile refresh in progress to prevent duplicate calls
  const refreshInProgress = useRef(false);
  // Track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);

  // Set mounted state on mount and clear on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe state update functions that check mounted status
  const safeSetLoading = useCallback((value: boolean) => {
    if (isMounted.current) setLoading(value);
  }, []);
  
  const safeSetUserProfile = useCallback((profile: UserProfile | null) => {
    if (isMounted.current) setUserProfile(profile);
  }, []);
  
  const safeSetUserRole = useCallback((role: string) => {
    if (isMounted.current) setUserRole(role);
  }, []);

  // Enhanced profile fetching with retry mechanism
  const fetchUserProfile = useCallback(async (userId: string, options = { retryCount: 2, useCache: true }): Promise<UserProfile | null> => {
    const cacheKey = `profile_${userId}`;
    
    // Try to get from cache first if useCache is true
    if (options.useCache) {
      try {
        const cachedProfile = safeLocalStorage.getItem(cacheKey);
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile) as UserProfile;
          const cacheTime = parseInt(safeLocalStorage.getItem(`${cacheKey}_time`) || '0');
          const now = Date.now();
          
          // Use cache if it's less than 5 minutes old
          if (cacheTime && (now - cacheTime < 5 * 60 * 1000)) {
            console.log('AUTH DEBUG: Using cached profile data');
            safeSetUserProfile(profile);
            safeSetUserRole(profile.role);
            return profile;
          }
        }
      } catch (e) {
        console.error('AUTH DEBUG: Error reading cached profile:', e);
      }
    }
    
    // Function to attempt fetch with timeout
    const attemptFetch = async (attempt: number): Promise<UserProfile | null> => {
      // Get the user's email from auth for verification
      const { data: authUser } = await supabase.auth.getUser();
      const authEmail = authUser?.user?.email;
      
      console.log(`AUTH DEBUG: Fetching profile for user (attempt ${attempt}):`, userId);
      
      // Timeout promise
      const timeoutPromise = new Promise<any>((resolve) => {
        setTimeout(() => {
          console.log(`AUTH DEBUG: Profile fetch timeout on attempt ${attempt}`);
          resolve(null);
        }, attempt === 1 ? 5000 : 8000); // Longer timeout on retry
      });
      
      // Actual fetch promise
      const fetchPromise = supabase
        .from('profiles')
        .select(`
          id, 
          first_name, 
          last_name, 
          email, 
          role, 
          department_id,
          departments:department_id (
            name,
            department_code
          ),
          approval_status,
          approved_by,
          approval_date,
          rejection_reason
        `)
        .eq('id', userId)
        .single();
        
      // Race between timeout and fetch
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // If timeout won or there was an error
      if (!result || result.error) {
        if (attempt < options.retryCount) {
          console.log(`AUTH DEBUG: Retrying profile fetch, attempt ${attempt + 1}`);
          return attemptFetch(attempt + 1);
        }
        
        // Use fallback after all retries
        const fallbackProfile: UserProfile = {
          id: userId,
          firstName: '',
          lastName: '',
          email: authEmail || '',
          role: 'user',
          departmentId: null,
          departmentCode: null,
          departmentName: null,
          approvalStatus: APPROVAL_STATUS.PENDING,
          approvedBy: null,
          approvalDate: null,
          rejectionReason: null
        };
        
        // Try to get role from auth metadata
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.user_metadata?.role) {
            fallbackProfile.role = authData.user.user_metadata.role;
          }
        } catch (e) {
          console.error('AUTH DEBUG: Failed to get role from metadata', e);
        }
        
        return fallbackProfile;
      }
      
      // Map database record to UserProfile
      const profileData = result.data;
      const profile: UserProfile = {
        id: profileData.id,
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: profileData.email || authEmail || '',
        role: profileData.role || 'user',
        departmentId: profileData.department_id,
        departmentCode: profileData.departments?.department_code || null,
        departmentName: profileData.departments?.name || null,
        approvalStatus: profileData.role === 'ceo' || profileData.departments?.department_code === 'CEO' 
          ? APPROVAL_STATUS.APPROVED 
          : profileData.approval_status || APPROVAL_STATUS.PENDING,
        approvedBy: profileData.approved_by || null,
        approvalDate: profileData.approval_date || null,
        rejectionReason: profileData.rejection_reason || null
      };
      
      return profile;
    };
    
    try {
      // Start fetch attempt
      const profile = await attemptFetch(1);
      
      if (profile) {
        // Update state
        safeSetUserProfile(profile);
        safeSetUserRole(profile.role);
        
        // Cache the profile
        safeLocalStorage.setItem(cacheKey, JSON.stringify(profile));
        safeLocalStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        safeLocalStorage.setItem('userRole', profile.role);
        
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('AUTH DEBUG: Error in fetchUserProfile:', error);
      return null;
    }
  }, [safeSetUserProfile, safeSetUserRole]);

  // Simplified refreshProfile function
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user || refreshInProgress.current) {
      return;
    }
    
    refreshInProgress.current = true;
    
    try {
      await fetchUserProfile(user.id, { retryCount: 1, useCache: false });
    } finally {
      refreshInProgress.current = false;
    }
  }, [user, fetchUserProfile]);

  // Optimize the updateProfile function
  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Convert from camelCase to snake_case for database
      const dbData: any = {};
      if (data.firstName !== undefined) dbData.first_name = data.firstName;
      if (data.lastName !== undefined) dbData.last_name = data.lastName;
      if (data.email !== undefined) dbData.email = data.email;
      if (data.departmentId !== undefined) dbData.department_id = data.departmentId;
      
      const { error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        notify.error('Failed to update profile', {
          description: 'There was a problem updating your profile information'
        });
        return false;
      }
      
      // Create updated profile first, then update state
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          firstName: data.firstName !== undefined ? data.firstName : userProfile.firstName,
          lastName: data.lastName !== undefined ? data.lastName : userProfile.lastName,
          email: data.email !== undefined ? data.email : userProfile.email,
          departmentId: data.departmentId !== undefined ? data.departmentId : userProfile.departmentId,
        };
        
        // Update the local state with the new profile
        safeSetUserProfile(updatedProfile);
      }
      
      // Only fetch the profile again if department changed (since we need updated department name)
      if (data.departmentId) {
        await refreshProfile();
      }
      
      notify.success('Profile updated successfully', {
        description: 'Your profile information has been saved'
      });
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      notify.error('An unexpected error occurred', {
        description: 'Could not verify profile update'
      });
      return false;
    }
  }, [user, refreshProfile, safeSetUserProfile]);

  // Enhanced validateSessionAndUser method
  const validateSessionAndUser = async () => {
    try {
      console.log('Initializing auth session');
      safeSetLoading(true);
      
      // Check for login flags in localStorage
      const isLoginInProgress = safeLocalStorage.getItem('tsa_login_in_progress') === 'true';
      const lastLoginEmail = safeLocalStorage.getItem('tsa_last_login_email');
      const lastLoginError = safeLocalStorage.getItem('tsa_login_error');
      
      // Get session from Supabase
      const { data } = await supabase.auth.getSession();
      
      // Log the session state
      if (data.session) {
        console.log('Session found:', data.session.user.id);
        
        // Direct CEO redirection for initial loads
        // This helps if the CEO is already logged in but got redirected to login page
        const userMeta = data.session.user.user_metadata;
        const isCEO = userMeta?.role === 'ceo' || userMeta?.department_code === 'CEO';
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/auth/login') || 
                           window.location.hash.includes('/auth/login') || 
                           currentPath.includes('/auth/pending-approval') ||
                           window.location.hash.includes('/auth/pending-approval');
        
        if (isCEO && isAuthPage) {
          console.log('AUTH DEBUG: CEO detected on login/pending page, redirecting to dashboard');
          const baseUrl = window.location.origin;
          // Use hash routing pattern
          window.location.href = `${baseUrl}/#/dashboard/ceo`;
          return;
        }
      } else {
        console.log('No active session found');
        
        // If login was in progress but we have no session, something failed
        if (isLoginInProgress && lastLoginError) {
          console.error('Login was in progress but failed:', lastLoginError);
          notify.error('Login failed', { description: lastLoginError });
          safeLocalStorage.removeItem('tsa_login_in_progress');
          safeLocalStorage.removeItem('tsa_login_error');
        }
      }
      
      // Update state if component is still mounted
      if (isMounted.current) {
      setSession(data.session);
      setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          // Try to load cached role first for immediate UI response
          const cachedRole = safeLocalStorage.getItem('tsa_user_role');
          if (cachedRole) {
            safeSetUserRole(cachedRole);
          }
          
          // Fetch user profile in background (or use cache)
          fetchUserProfile(data.session.user.id).catch(error => {
            console.error('Error in initial profile fetch, continuing:', error);
          });
        } else {
          // Clear state on no session
          safeSetUserProfile(null);
          safeSetUserRole('');
          safeLocalStorage.removeItem('userRole');
          safeLocalStorage.removeItem('tsa_user_role');
          safeLocalStorage.removeItem('tsa_user_status');
        }
        
        // Mark session as checked and initialization complete
        setSessionChecked(true);
        setIsInitialized(true);
      }

      // Check if we're continuing from a login process
      if (isLoginInProgress && data.session) {
        console.log('AUTH DEBUG: Detected successful login, completing process');
        safeLocalStorage.removeItem('tsa_login_in_progress');
        
        // Show success notification
        notify.success('Authentication successful', {
          description: 'Your profile is being loaded in the background'
        });
      }
    } catch (error) {
      console.error("Error in validateSessionAndUser:", error);
      // Mark session as checked even if there was an error
      if (isMounted.current) {
        setSessionChecked(true);
        setIsInitialized(true);
      }
    } finally {
      safeSetLoading(false);
    }
  };

  // Improved auth state change handler
  const setupAuthSubscription = useCallback(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      try {
        console.log("Auth state change event:", event);
        
        // Only set loading for critical auth events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          safeSetLoading(true);
        }
        
        // Guard against state updates after unmount
        if (!isMounted.current) return;
        
        // Update session and user state immediately
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        
        if (nextSession?.user) {
          // Check for CEO redirect flag
          const isCEORedirect = safeLocalStorage.getItem('tsa_ceo_redirect') === 'true';
          
          // Try to get role from metadata for immediate UI response
          const role = nextSession.user.user_metadata?.role;
          const departmentCode = nextSession.user.user_metadata?.department_code;
          const isCEO = role === 'ceo' || departmentCode === 'CEO';
          
          if (role) {
            safeSetUserRole(role);
            safeLocalStorage.setItem('tsa_user_role', role);
          }
          
          // Special handling for CEOs to avoid redirection issues
          if (isCEO && isCEORedirect) {
            console.log('AUTH DEBUG: Detected CEO redirect flag, confirming redirect');
            
            // Clear the flag immediately to prevent loops
            safeLocalStorage.removeItem('tsa_ceo_redirect');
            
            // Check if we're already on the CEO dashboard
            const currentPath = window.location.pathname;
            const currentHash = window.location.hash;
            
            if (!currentPath.includes('/dashboard/ceo') && !currentHash.includes('/dashboard/ceo')) {
              console.log('AUTH DEBUG: CEO not on dashboard, redirecting');
              
              // Ensure we use hash router format
              const baseUrl = window.location.origin;
              window.location.href = `${baseUrl}/#/dashboard/ceo`;
              return;
            }
          }
          
          // Fetch profile in background
          fetchUserProfile(nextSession.user.id).catch(error => {
            console.error('Error fetching profile after auth state change:', error);
          });
        } else {
          // Clear state on sign out
          safeSetUserProfile(null);
          safeSetUserRole('');
          safeLocalStorage.removeItem('userRole');
          safeLocalStorage.removeItem('tsa_user_role');
          safeLocalStorage.removeItem('tsa_user_status');
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          safeSetLoading(false);
        }
      }
    });
    
    return subscription;
  }, [fetchUserProfile, safeSetLoading, safeSetUserProfile, safeSetUserRole]);

  const signOut = useCallback(async () => {
    try {
      safeSetLoading(true);
    await supabase.auth.signOut();
      safeSetUserProfile(null);
      safeSetUserRole('');
      
      // Clear any stored role data
      localStorage.removeItem('userRole');
      
      // Navigate to login after successful sign-out
    navigate('/auth/login');
      notify.success('Signed out successfully', {
        description: 'You have been safely logged out'
      });
    } catch (error) {
      console.error("Error signing out:", error);
      notify.error("Failed to sign out", {
        description: "Please try again or close your browser to ensure you're logged out"
      });
    } finally {
      safeSetLoading(false);
    }
  }, [navigate, safeSetLoading, safeSetUserProfile, safeSetUserRole]);

  // Add a method to ensure profile integrity and privacy
  const forceCorrectProfile = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log('Ensuring profile data integrity for:', user.email);
      
      // Get user metadata which might have role/department info
      const { data: authData } = await supabase.auth.getUser();
      const userMetadata = authData?.user?.user_metadata || {};
      console.log('User metadata from auth:', userMetadata);
      
      // Find profiles with matching email
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (
            name,
            department_code
          )
        `)
        .eq('email', user.email);
        
      if (error) {
        console.error('Error verifying profile integrity:', error);
        return false;
      }
      
      if (!profiles || profiles.length === 0) {
        console.log('No profiles found with email:', user.email);
        
        // Check if this is a CEO based on metadata
        let role = 'user';
        const departmentCode = userMetadata?.department_code || '';
        
        if (departmentCode.toUpperCase() === 'CEO') {
          role = 'ceo';
          console.log('Setting role to CEO based on metadata');
        }
        
        // Create a new profile if none exists
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: userMetadata.first_name || '',
              last_name: userMetadata.last_name || '',
              role: role,
              department_id: userMetadata.department_id || null
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating new profile:', createError);
            return false;
          }
          
          console.log('Created new profile to maintain data integrity:', newProfile);
          await refreshProfile();
          return true;
        } catch (createError) {
          console.error('Error creating profile:', createError);
          return false;
        }
      }
      
      console.log('Found profiles with matching email:', profiles);
      
      // Check if any profile indicates a CEO role
      const ceoProfile = profiles.find(p => 
        p.role?.toLowerCase() === 'ceo' || 
        p.departments?.department_code === 'CEO'
      );
      
      // Prefer CEO profile if one exists
      const matchingProfile = ceoProfile || profiles[0];
      console.log('Selected profile for update:', matchingProfile);
      
      // Update the profile ID to match auth ID
      if (matchingProfile.id !== user.id) {
        // Preserve CEO role and department assignments when updating
        const updateData: any = { id: user.id };
        
        // Preserve CEO role if present
        if (ceoProfile && ceoProfile.id === matchingProfile.id) {
          updateData.role = 'ceo';
        }
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', matchingProfile.id);
          
        if (updateError) {
          console.error('Error updating profile association:', updateError);
          return false;
        }
        
        console.log('Profile association updated for proper security mapping');
      }
      
      // Now fetch the profile again
      await refreshProfile();
      return true;
    } catch (error) {
      console.error('Error in profile integrity check:', error);
      return false;
    }
  }, [user, refreshProfile]);

  // Helper function for approval status
  const isApproved = useCallback(() => {
    if (!userProfile) return false;
    // CEO users are automatically approved
    if (userProfile.role === 'ceo' || userProfile.departmentCode === 'CEO') return true;
    return userProfile.approvalStatus === APPROVAL_STATUS.APPROVED;
  }, [userProfile]);

  const isPending = useCallback(() => {
    if (!userProfile) return false;
    // CEO users are never pending
    if (userProfile.role === 'ceo' || userProfile.departmentCode === 'CEO') return false;
    return userProfile.approvalStatus === APPROVAL_STATUS.PENDING || !userProfile.approvalStatus;
  }, [userProfile]);

  const isRejected = useCallback(() => {
    if (!userProfile) return false;
    return userProfile.approvalStatus === APPROVAL_STATUS.REJECTED;
  }, [userProfile]);

  const isCEO = useCallback(() => {
    if (!userProfile) return false;
    return userProfile.role === 'ceo' || userProfile.departmentCode === 'CEO';
  }, [userProfile]);

  const value = {
    session,
    user,
    userProfile,
    userRole: userRole || 'user', // Ensure there's always a default role
    loading: loading || !sessionChecked, // Consider loading until session is checked
    signOut,
    updateProfile,
    refreshProfile,
    // Add a method to ensure profile integrity and privacy
    forceCorrectProfile,
    isApproved,
    isPending,
    isRejected,
    isCEO
    };

    // Effect for initial session validation and auth subscription setup
    useEffect(() => {
      // Skip if already initialized
      if (isInitialized) return;
      
      // Initialize auth and validate session
      const initAuth = async () => {
        await validateSessionAndUser();
      };
      
      initAuth();
      
      // Set up auth subscription
      const subscription = setupAuthSubscription();
      
      return () => {
        subscription.unsubscribe();
      };
    }, [isInitialized, validateSessionAndUser, setupAuthSubscription]);

    // Background sync effect
    useEffect(() => {
      // Only set up sync if we're initialized and have a user
      if (!isInitialized || !user) return;
      
      console.log('Setting up background profile sync');
      
      // Set up periodic profile refresh
      const intervalId = setInterval(() => {
        // Only refresh if not in progress and we have a user
        if (!refreshInProgress.current && user) {
          console.log('Background profile sync triggered');
          refreshProfile().catch(error => {
            console.error('Background sync error:', error);
          });
        }
      }, 5 * 60 * 1000); // Every 5 minutes
      
      return () => {
        clearInterval(intervalId);
      };
    }, [isInitialized, user, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
