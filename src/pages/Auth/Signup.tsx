import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import SignupForm from '@/components/auth/SignupForm';
import { motion } from 'framer-motion';
import { Building, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

const Signup = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the organization and access your department dashboard"
    >
      <div className="mb-6 space-y-4">
        <div className="flex justify-center space-x-8">
          {[
            { icon: Building, text: 'Department ID' },
            { icon: Lock, text: 'Secure Signup' },
            { icon: ShieldCheck, text: 'Role Access' },
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
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-md bg-blue-50 p-3 border border-blue-100 shadow-sm mt-2"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs font-medium text-blue-700 leading-relaxed">
                Complete the form below to create your account and get access to your dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
