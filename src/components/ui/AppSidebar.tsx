import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Home,
  FileText,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  AlertTriangle,
  Bell,
  Mail,
  Briefcase,
  Heart,
  Vote,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppSidebarProps {
  onClose: () => void;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    href: '/dashboard',
    roles: ['ceo', 'finance', 'treasurer', 'audit', 'hr', 'operations', 'marketing', 'sec', 'fin', 'bm', 'aud', 'wel', 'bmem'],
  },
  {
    name: 'Transactions',
    icon: <DollarSign className="h-5 w-5" />,
    href: '/transactions',
    roles: ['ceo', 'finance', 'treasurer', 'audit', 'fin', 'aud'],
  },
  {
    name: 'Reports',
    icon: <FileText className="h-5 w-5" />,
    href: '/reports',
    roles: ['ceo', 'finance', 'treasurer', 'audit', 'fin', 'aud', 'bmem'],
  },
  {
    name: 'Employees',
    icon: <Users className="h-5 w-5" />,
    href: '/employees',
    roles: ['ceo', 'hr'],
  },
  {
    name: 'Campaigns',
    icon: <Bell className="h-5 w-5" />,
    href: '/campaigns',
    roles: ['ceo', 'marketing'],
  },
  {
    name: 'Operations',
    icon: <Briefcase className="h-5 w-5" />,
    href: '/operations',
    roles: ['ceo', 'operations', 'bm'],
  },
  {
    name: 'Communications',
    icon: <Mail className="h-5 w-5" />,
    href: '/communications',
    roles: ['ceo', 'sec'],
  },
  {
    name: 'Welfare Programs',
    icon: <Heart className="h-5 w-5" />,
    href: '/welfare',
    roles: ['ceo', 'wel'],
  },
  {
    name: 'Board Resolutions',
    icon: <Vote className="h-5 w-5" />,
    href: '/board',
    roles: ['ceo', 'bmem'],
  },
  {
    name: 'Audit Log',
    icon: <AlertTriangle className="h-5 w-5" />,
    href: '/audit',
    roles: ['ceo', 'audit', 'aud'],
  },
  {
    name: 'Forum',
    icon: <MessageSquare className="h-5 w-5" />,
    href: '/dashboard/:role/forum',
    roles: ['ceo', 'finance', 'treasurer', 'audit', 'hr', 'operations', 'marketing', 'sec', 'fin', 'bm', 'aud', 'wel', 'bmem'],
  },
  {
    name: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    href: '/settings',
    roles: ['ceo', 'finance', 'treasurer', 'audit', 'hr', 'operations', 'marketing', 'sec', 'fin', 'bm', 'aud', 'wel', 'bmem'],
  },
  {
    name: 'Registration Approval',
    icon: <UserCheck className="h-5 w-5" />,
    href: '/dashboard/registration-approval',
    roles: ['ceo', 'admin'],
  },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const isMobile = useIsMobile();
  
  const currentPath = location.pathname;
  const userRole = currentPath.split('/')[2] || 'ceo';
  
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  ).map(item => {
    const href = item.href.replace(':role', userRole);
    return { ...item, href };
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-full flex-col bg-white glass-morphism shadow-lg">
      <div className="flex flex-shrink-0 items-center px-6 py-4 h-16 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 p-1 shadow-md">
            <div className="h-full w-full flex items-center justify-center text-white text-xs font-bold">
              AF
            </div>
          </div>
          <span className="text-xl font-semibold text-gray-900">Admin Finance</span>
        </Link>
        <div className="ml-auto lg:hidden">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3" aria-label="Sidebar">
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
            </h3>
            
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={isMobile ? onClose : undefined}
                >
                  <motion.div
                    initial={false}
                    animate={{ color: isActive ? '#2563eb' : '#6b7280' }}
                    className="mr-3"
                  >
                    {item.icon}
                  </motion.div>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
      
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="w-full">
          <div className="flex items-center mb-3">
            <div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                {user?.email?.substring(0, 2).toUpperCase() || 'JD'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.email || 'John Doe'}</p>
              <p className="text-xs font-medium text-gray-500">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
