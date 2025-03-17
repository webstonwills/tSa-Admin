import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { notify } from '@/components/ui/sonner';

const DebugPage: React.FC = () => {
  const { user, userProfile, refreshProfile, forceCorrectProfile } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  
  useEffect(() => {
    console.log('Debug Page - Current user:', user);
    console.log('Debug Page - User profile data:', userProfile);
    
    // Check for any profile in the database
    const checkProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
        
      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        console.log('Sample profiles in database:', data);
      }
    };
    
    checkProfiles();
  }, [user, userProfile]);
  
  const handleRefreshProfile = async () => {
    try {
      await refreshProfile();
      notify.success('Profile refreshed');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      notify.error('Failed to refresh profile');
    }
  };
  
  const handleCheckSession = async () => {
    const { data } = await supabase.auth.getSession();
    console.log('Current session:', data.session);
    notify.info(data.session ? 'Session found' : 'No active session');
  };

  const handleForceCorrectProfile = async () => {
    setIsFixing(true);
    try {
      const success = await forceCorrectProfile();
      if (success) {
        notify.success('Profile matched and fixed', {
          description: 'Your profile has been properly matched to your account.'
        });
      } else {
        notify.error('Failed to fix profile', {
          description: 'Could not match your profile to your account.'
        });
      }
    } catch (error) {
      console.error('Error fixing profile:', error);
      notify.error('Error fixing profile');
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto my-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Logged in:</strong> {user ? 'Yes' : 'No'}</p>
              {user && (
                <>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Created at:</strong> {new Date(user.created_at).toLocaleString()}</p>
                </>
              )}
              <div className="mt-4">
                <Button onClick={handleCheckSession} variant="outline" className="mr-2">
                  Check Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Profile loaded:</strong> {userProfile ? 'Yes' : 'No'}</p>
              {userProfile ? (
                <>
                  <p><strong>Profile ID:</strong> {userProfile.id}</p>
                  <p><strong>First Name:</strong> {userProfile.firstName || 'Not set'}</p>
                  <p><strong>Last Name:</strong> {userProfile.lastName || 'Not set'}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                  <p><strong>Role:</strong> {userProfile.role || 'user'}</p>
                  <p><strong>Department ID:</strong> {userProfile.departmentId || 'Not assigned'}</p>
                  <p><strong>Department Name:</strong> {userProfile.departmentName || 'Unknown'}</p>
                  <p><strong>Department Code:</strong> {userProfile.departmentCode || 'Unknown'}</p>
                </>
              ) : (
                <p>No profile data available.</p>
              )}
              <div className="mt-4 space-x-2">
                <Button onClick={handleRefreshProfile} className="mr-2">
                  Refresh Profile
                </Button>
                <Button onClick={handleForceCorrectProfile} variant="destructive" disabled={isFixing}>
                  {isFixing ? 'Fixing profile...' : 'Force Match Profile'}
                </Button>
              </div>
              <pre className="bg-gray-100 p-4 rounded mt-4 text-xs overflow-auto max-h-60">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugPage; 