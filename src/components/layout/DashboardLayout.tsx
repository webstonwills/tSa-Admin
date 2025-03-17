import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import AppSidebar from '../ui/AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, MessageSquare, Bell, Search, LogOut, UserCircle, User, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, userProfile } = useAuth();
  const { toast } = useToast();

  // Close sidebar on route change if on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get the current role's base path
  const getBasePath = () => {
    const path = location.pathname;
    const segments = path.split('/');
    if (segments.length > 2) {
      return `/dashboard/${segments[2]}`;
    }
    return '/dashboard';
  };

  // Create a profile URL that includes the user's role
  const getProfileUrl = () => {
    const basePath = getBasePath();
    return `${basePath}/profile`;
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!userProfile) return 'U';
    
    const firstName = userProfile.firstName || '';
    const lastName = userProfile.lastName || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="flex h-full">
        {/* Sidebar for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ ease: "easeOut", duration: 0.25 }}
              className="fixed inset-0 z-40 lg:hidden"
            >
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ ease: "easeOut", duration: 0.25 }}
                className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Sidebar content */}
              <motion.div className="fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-white shadow-lg rounded-r-xl">
                <AppSidebar onClose={() => setSidebarOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
              <div className="h-12 w-12 rounded-md bg-white/10 p-1.5 flex items-center justify-center overflow-hidden">
                <img 
                  src="/assets/logo-white.png" 
                  alt="TSA Logo" 
                  className="h-9 w-9 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <span className="ml-2 text-xl font-medium text-white">Admin</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top navigation */}
          <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0 flex items-center">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 mr-2 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/logo-white.png" 
                    alt="TSA Logo" 
                    className="h-7 w-7 object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-800">Admin Hub</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none">
                <Search className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Messages */}
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none">
                <MessageSquare className="h-5 w-5" />
              </button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {userProfile?.departmentName || 'No Department'}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getProfileUrl())}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`${getBasePath()}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/debug')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Debug Auth</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-blue-50 to-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
