
import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { motion } from 'framer-motion';
import { Mail, KeyRound, Shield } from 'lucide-react';

const ForgotPassword = () => {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a verification code"
    >
      <div className="mb-6 space-y-4">
        <div className="flex justify-center space-x-8">
          {[
            { icon: Mail, text: 'Get Code' },
            { icon: KeyRound, text: 'Enter Code' },
            { icon: Shield, text: 'Reset Password' },
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
      
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPassword;
