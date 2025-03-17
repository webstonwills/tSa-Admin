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

  // Memoize the fetchUserProfile function to prevent unnecessary recreations
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) {
      console.error('fetchUserProfile called with no userId');
      return null;
    }
    
    try {
      console.log('Fetching profile for user:', userId);
      
      // Get the authenticated user's email from the auth state
      const { data: userData } = await supabase.auth.getUser();
      const authEmail = userData?.user?.email;
      
      console.log('Auth email:', authEmail);
      
      // Use a more efficient single query with a join for better performance
      let { data: profileData, error: profileError } = await supabase
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
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Check if this is a permissions error
        if (profileError.code === 'PGRST301') {
          notify.error('Permission denied when fetching profile', {
            description: 'Please check your database RLS policies'
          });
        }
        
        // If no profile found and we have auth email, try to find by email
        if (authEmail) {
          const { data: emailProfiles, error: emailError } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('email', authEmail);
          
          if (!emailError && emailProfiles && emailProfiles.length > 0) {
            console.log('Found profile with matching email:', emailProfiles[0]);
            
            // Try to update the profile ID to match auth ID
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ id: userId })
              .eq('id', emailProfiles[0].id);
              
            if (updateError) {
              console.error('Error updating profile ID:', updateError);
            } else {
              console.log('Profile ID updated to match auth ID');
              // Retry fetching with the updated ID
              return await fetchUserProfile(userId);
            }
          }
        }
        
        return null;
      }

      if (!profileData) {
        console.warn('No profile found for user:', userId);
        
        // Add debugging: Check if there are ANY profiles in the database for this user
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .limit(10);
          
        if (allProfilesError) {
          console.error('Error fetching sample profiles:', allProfilesError);
        } else {
          console.log('Sample of available profiles:', allProfiles);
          
          // Check if there's a profile with matching email
          if (authEmail && allProfiles) {
            const matchingEmailProfile = allProfiles.find(profile => profile.email === authEmail);
            if (matchingEmailProfile) {
              console.log('Found profile with matching email but different ID:', matchingEmailProfile);
              
              // Try to fetch this profile instead
              const { data: correctProfile, error: correctProfileError } = await supabase
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
                  )
                `)
                .eq('id', matchingEmailProfile.id)
                .single();
                
              if (!correctProfileError && correctProfile) {
                console.log('Successfully retrieved profile with matching email:', correctProfile);
                
                // Update the auth user ID to match the profile
                try {
                  // We can't directly change the Supabase auth ID, but we can make
                  // the profile ID match what the auth system expects
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ id: userId })
                    .eq('id', matchingEmailProfile.id);
                    
                if (updateError) {
                  console.error('Error updating profile ID:', updateError);
                } else {
                  console.log('Profile ID updated to match auth ID');
                  // Now fetch the profile with the updated ID
                  return await fetchUserProfile(userId);
                }
              } catch (updateError) {
                console.error('Error updating profile ID:', updateError);
              }
              
              profileData = correctProfile;
            }
          }
        }
      }
      
      // If no matching profile found, check if we need to create one
      if (!profileData && authEmail) {
        // Try to create a profile for this user
        console.log('Creating new profile for user:', userId);
        try {
          const { data: authUser } = await supabase.auth.getUser();
          const userData = authUser?.user?.user_metadata || {};
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: authEmail,
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              role: 'user'
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
          } else if (newProfile) {
            console.log('Created new profile:', newProfile);
            // Fetch the full profile with departments to avoid type errors
            return await fetchUserProfile(userId);
          }
        } catch (createError) {
          console.error('Error creating profile:', createError);
        }
      }
      
      // If still no profile, return null
      if (!profileData) {
        return null;
      }
    }

    // Ensure email matches authenticated user
    if (authEmail && profileData.email !== authEmail) {
      console.warn(`Profile email (${profileData.email}) doesn't match authenticated user (${authEmail})`);
      
      // Try to update the profile email to match auth email
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email: authEmail })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating profile email:', updateError);
        } else {
          console.log('Profile email updated to match auth email');
          profileData.email = authEmail;
        }
      } catch (updateError) {
        console.error('Error updating profile email:', updateError);
      }
    }

    console.log('Profile data received:', profileData);

    // Map the response to our UserProfile interface
    const profile: UserProfile = {
      id: profileData.id,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      email: profileData.email,
      role: profileData.role || 'user',
      departmentId: profileData.department_id,
      departmentCode: profileData.departments?.department_code || null,
      departmentName: profileData.departments?.name || null,
      approvalStatus: profileData.role === 'ceo' || profileData.departments?.department_code === 'CEO' 
        ? APPROVAL_STATUS.APPROVED 
        : APPROVAL_STATUS.PENDING,
      approvedBy: null,
      approvalDate: null,
      rejectionReason: null
    };

    // Cache this department for future reference
    if (profileData.department_id && profileData.departments) {
      departmentCache.set(profileData.department_id, {
        name: profileData.departments.name,
        code: profileData.departments.department_code
      });
    }

    // Store the role in localStorage too for debugging and resilience
    localStorage.setItem('userRole', profile.role);
    
    // Use safe setState methods
    safeSetUserProfile(profile);
    safeSetUserRole(profile.role);
    
    console.log('Profile processed and state updated:', profile);
    
    return profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}, [safeSetUserProfile, safeSetUserRole]);

// Refresh the user's profile - declaring this early to fix the linter error
const refreshProfile = useCallback(async (): Promise<void> => {
  // If no user, wait a bit to see if the user state gets updated
  if (!user) {
    console.log('refreshProfile: Waiting for user state to be available...');
    
    // Wait for a short time to see if user gets set
    return new Promise<void>((resolve) => {
      let checkCount = 0;
      const waitForUser = setInterval(() => {
        checkCount++;
        if (user) {
          clearInterval(waitForUser);
          console.log('refreshProfile: User state became available, continuing refresh');
          // User is now available, proceed with refresh
          refreshInProgress.current = true;
          fetchUserProfile(user.id)
            .then(profile => {
              if (profile) {
                console.log('Profile refreshed successfully with role:', profile.role);
              }
              resolve();
            })
            .catch(error => {
              console.error('Error refreshing profile after waitForUser:', error);
              resolve();
            })
            .finally(() => {
              refreshInProgress.current = false;
            });
        } else if (checkCount > 10) { // Check for ~2 seconds
          // Give up after multiple attempts
          clearInterval(waitForUser);
          console.warn('refreshProfile called but no user became available after waiting');
          resolve();
        }
      }, 200);
    });
  }
  
  // Prevent concurrent refresh calls
  if (refreshInProgress.current) {
    console.log('refreshProfile: Already in progress, skipping');
    return;
  }
  
  try {
    refreshInProgress.current = true;
    
    // Check both user metadata and profile data for CEO indication
    const { data: authUser } = await supabase.auth.getUser();
    const userMetadata = authUser?.user?.user_metadata || {};
    
    // First check if we need to fix CEO role assignment
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id, 
        role, 
        department_id,
        departments:department_id (
          name,
          department_code
        )
      `)
      .eq('id', user.id)
      .single();
      
    console.log('refreshProfile: Current profile data:', profileData);
    console.log('refreshProfile: User metadata:', userMetadata);
    
    // Check for CEO indicators in multiple places
    const isCEODepartment = profileData?.departments?.department_code === 'CEO';
    const isCEORole = (profileData?.role || '').toLowerCase() === 'ceo';
    const isCEOMetadata = (userMetadata?.department_code || '').toUpperCase() === 'CEO';
    
    console.log('refreshProfile: CEO indicators - Department:', isCEODepartment, 'Role:', isCEORole, 'Metadata:', isCEOMetadata);
    
    // If any CEO indicator is true but role isn't set as CEO, update the role
    if ((isCEODepartment || isCEOMetadata) && !isCEORole) {
      console.log('refreshProfile: Fixing CEO role assignment');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'ceo' })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('refreshProfile: Error updating CEO role:', updateError);
      } else {
        console.log('refreshProfile: CEO role fixed successfully');
      }
    }
    
    const profile = await fetchUserProfile(user.id);
    if (profile) {
      console.log('Profile refreshed successfully with role:', profile.role);
    }
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

// Validate stored session on mount
useEffect(() => {
  // Skip if already initialized
  if (isInitialized) return;
  
  const validateSessionAndUser = async () => {
    try {
      console.log('Initializing auth session');
      safeSetLoading(true);
      
      // Get session from Supabase
      const { data } = await supabase.auth.getSession();
      
      // Log the session state
      if (data.session) {
        console.log('Session found:', data.session.user.id);
      } else {
        console.log('No active session found');
      }
      
      // Update state if component is still mounted
      if (isMounted.current) {
      setSession(data.session);
      setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          // Fetch user profile if we have a session
          try {
            // First check if we need to fix the CEO role assignment
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, role, department_id, departments(department_code)')
              .eq('id', data.session.user.id)
              .single();
              
            if (!profileError && profileData) {
              // Check if there's a mismatch between role and department code
              if (profileData.departments?.department_code === 'CEO' && profileData.role !== 'ceo') {
                console.log('Fixing CEO role assignment - department is CEO but role is', profileData.role);
                
                // Update the profile to have the correct CEO role
                await supabase
                  .from('profiles')
                  .update({ role: 'ceo' })
                  .eq('id', data.session.user.id);
                  
                console.log('CEO role fixed');
              }
            }
            
            await fetchUserProfile(data.session.user.id);
          } catch (profileError) {
            console.error('Error fetching initial profile:', profileError);
          }
        }
        
        // Mark session as checked and initialization complete
        setSessionChecked(true);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Error getting initial session:", error);
      // Mark session as checked even if there was an error
      if (isMounted.current) {
        setSessionChecked(true);
      }
    } finally {
      safeSetLoading(false);
    }
  };

  validateSessionAndUser();

    // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
    try {
      console.log("Auth state change event:", event);
      
      // Only set loading for critical auth events
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        safeSetLoading(true);
      }
      
      // Guard against state updates after unmount
      if (!isMounted.current) return;
      
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      
      if (nextSession?.user) {
        await fetchUserProfile(nextSession.user.id);
      } else {
        safeSetUserProfile(null);
        safeSetUserRole('');
        // Clear cached role
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error("Error in auth state change:", error);
    } finally {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        safeSetLoading(false);
      }
    }
    });

    return () => {
      subscription.unsubscribe();
    };
}, [isInitialized, fetchUserProfile, safeSetLoading, safeSetUserProfile, safeSetUserRole]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
