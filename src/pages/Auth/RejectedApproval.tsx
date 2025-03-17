import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';

const RejectedApproval = () => {
  const { signOut, userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AuthLayout
      title="Registration Declined"
      subtitle="Your account request was not approved"
    >
      <div className="mb-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center p-4 mb-4"
        >
          <div className="rounded-full bg-red-100 p-6 text-red-600 mb-4">
            <XCircle size={48} />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            We're sorry
          </h2>
          
          <p className="text-gray-600 mb-4">
            The account request for <span className="font-medium text-gray-700">{userProfile?.email}</span> was 
            declined by an administrator.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-left w-full">
            <h3 className="font-medium text-blue-800 mb-1">What this means</h3>
            <p className="text-sm text-blue-700 mb-2">
              There could be several reasons for this decision:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
              <li>The requested department may not be accepting new members at this time</li>
              <li>Additional verification may be required for your account</li>
              <li>Your role in the organization may need to be clarified</li>
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
              If you believe this is an error or have questions, please contact your department manager or email
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

export default RejectedApproval; 