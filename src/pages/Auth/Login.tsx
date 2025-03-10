
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { Building, ShieldCheck, Lock } from 'lucide-react';

const Login = () => {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your credentials to access your dashboard"
    >
      <div className="mb-6 space-y-4">
        <div className="flex justify-center space-x-8">
          {[
            { icon: Building, text: 'Department ID' },
            { icon: Lock, text: 'Secure Login' },
            { icon: ShieldCheck, text: 'Role-based Access' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <item.icon size={16} />
              </div>
              <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
