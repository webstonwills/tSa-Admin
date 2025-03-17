import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import { 
  Loader2,
  User,
  Mail,
  Building2,
  Shield,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/components/ui/sonner';

interface Department {
  id: string;
  name: string;
  department_code: string;
}

const UserProfileForm: React.FC = () => {
  const { userProfile, updateProfile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [prevDepartmentId, setPrevDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, department_code')
        .order('name');
      
      if (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments. Please try again later.');
        notify.error('Failed to load departments');
      } else {
        setDepartments(data || []);
      }
    } catch (error) {
      console.error('Error in fetchDepartments:', error);
      setError('An unexpected error occurred. Please try again later.');
      notify.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Set form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setEmail(userProfile.email || '');
      setDepartmentId(userProfile.departmentId || 'none');
      setPrevDepartmentId(userProfile.departmentId || 'none');
    }
  }, [userProfile]);

  // Handle manual profile refresh
  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      notify.success('Profile refreshed successfully');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      notify.error('Failed to refresh profile');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validate the form
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      setIsSaving(false);
      return;
    }

    try {
      const success = await updateProfile({
        firstName,
        lastName
        // Department ID is no longer editable by users
      });

      if (success) {
        notify.success('Profile updated successfully');
        // Refresh the profile to get updated info
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('Failed to update profile. Please try again later.');
      notify.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!userProfile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to view and manage your profile.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information and department settings
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefreshProfile}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh profile</span>
        </Button>
      </CardHeader>

      {error && (
        <div className="px-6 mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Email address cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              Department
            </Label>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading departments...</span>
              </div>
            ) : departments.length > 0 ? (
              <>
                {departments
                  .filter(dept => dept.id === userProfile.departmentId)
                  .map((dept) => (
                    <Input
                      key={dept.id}
                      value={`${dept.name} (${dept.department_code})`}
                      readOnly
                      className="bg-gray-50"
                    />
                  ))}
                {!userProfile.departmentId && (
                  <Input
                    value="No department assigned"
                    readOnly
                    className="bg-gray-50"
                  />
                )}
                <p className="text-xs text-gray-500">
                  Department assignments can only be changed by the CEO
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <Input 
                  value="No departments available" 
                  disabled 
                  className="bg-gray-50" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchDepartments}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              Role
            </Label>
            <Input
              value={userProfile.role || 'user'}
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Role can only be changed by an administrator
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFirstName(userProfile?.firstName || '');
              setLastName(userProfile?.lastName || '');
              setDepartmentId(userProfile?.departmentId || '');
            }}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserProfileForm; 