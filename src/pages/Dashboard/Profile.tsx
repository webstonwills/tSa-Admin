import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserProfileForm from '@/components/profile/UserProfileForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  UserCircle,
  Shield,
  KeyRound,
  Bell,
  Clock
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ProfilePage: React.FC = () => {
  const { userProfile, user } = useAuth();
  
  // Add console logs to see what data we have
  console.log('Profile Page - Current user:', user);
  console.log('Profile Page - User profile data:', userProfile);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile, security, and preferences</p>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none gap-1 md:gap-0">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span className="hidden md:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden md:inline">Activity</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile">
              <UserProfileForm />
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="two-factor" />
                        <Label htmlFor="two-factor">Disabled</Label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-medium">Sessions</h3>
                        <p className="text-sm text-gray-500">
                          Manage your active sessions and sign out from other devices
                        </p>
                      </div>
                      <button className="text-blue-600 hover:underline text-sm font-medium">
                        Manage Sessions
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-medium">Password</h3>
                        <p className="text-sm text-gray-500">
                          Update your password regularly to keep your account secure
                        </p>
                      </div>
                      <button className="text-blue-600 hover:underline text-sm font-medium">
                        Change Password
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive important updates via email
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="email-notif" defaultChecked />
                        <Label htmlFor="email-notif">Enabled</Label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-medium">In-App Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Receive notifications within the app
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="app-notif" defaultChecked />
                        <Label htmlFor="app-notif">Enabled</Label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-medium">Forum Notifications</h3>
                        <p className="text-sm text-gray-500">
                          Get notified about new messages in forums
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="forum-notif" defaultChecked />
                        <Label htmlFor="forum-notif">Enabled</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Account Activity</CardTitle>
                  <CardDescription>
                    View your recent account activity and login history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 font-medium text-sm grid grid-cols-4 gap-2">
                        <div>Date</div>
                        <div>Activity</div>
                        <div>IP Address</div>
                        <div>Location</div>
                      </div>
                      <div className="divide-y">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-3 text-sm grid grid-cols-4 gap-2">
                            <div className="text-gray-600">Today, 2:30 PM</div>
                            <div>Signed in</div>
                            <div>192.168.1.{i}</div>
                            <div>Lagos, Nigeria</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage; 