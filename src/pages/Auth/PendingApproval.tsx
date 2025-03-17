import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';

const PendingApproval = () => {
  const { signOut, userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AuthLayout
      title="Account Pending Approval"
      subtitle="Your account is awaiting administrator approval"
    >
      <div className="mb-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center p-4 mb-4"
        >
          <div className="rounded-full bg-blue-100 p-6 text-blue-600 mb-4">
            <Clock size={48} />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Thank you for registering
          </h2>
          
          <p className="text-gray-600 mb-4">
            Your account for <span className="font-medium text-gray-700">{userProfile?.email}</span> has been successfully 
            created but requires administrator approval before you can access the dashboard.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-left w-full">
            <h3 className="font-medium text-amber-800 mb-1">What happens next?</h3>
            <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5">
              <li>An administrator will review your registration details</li>
              <li>You may be assigned to a specific department based on organizational needs</li>
              <li>You'll receive an email notification once your account is approved</li>
              <li>Approval typically takes 1-2 business days</li>
            </ul>
          </div>
          
          <div className="space-y-3 mt-2 w-full">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={handleSignOut}
            >
              <ArrowLeft size={16} className="mr-2" />
              Return to Login
            </Button>
            
            <p className="text-xs text-gray-500">
              If you have any questions, please contact your department manager or email
              <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800 ml-1">
                support@example.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
};

export default PendingApproval; 