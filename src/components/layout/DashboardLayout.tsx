
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import AppSidebar from '../ui/AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, MessageSquare, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
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
              
              {/* Sidebar */}
              <div className="relative h-full w-72">
                <AppSidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-72">
            <AppSidebar onClose={() => {}} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white glass-morphism">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center">
                <div className="w-full max-w-2xl lg:max-w-none">
                  <div className="relative text-gray-400 focus-within:text-gray-500">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border-0 bg-white/80 py-2 pl-10 pr-3 text-gray-900 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </div>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6 space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => navigate('/dashboard/forum')}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </button>

                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                        U
                      </div>
                    </button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 text-gray-400 hover:text-gray-500"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-gray-50 focus:outline-none"
          >
            <div className="py-4 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
