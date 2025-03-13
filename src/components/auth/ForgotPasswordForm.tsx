import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'verification' | 'success'>('email');
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call our edge function to send a verification code
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });
      
      if (error) {
        toast.error(error.message || 'Failed to send verification code');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
      setStep('verification');
      toast.success('Verification code sent to your email');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || !newPassword) {
      toast.error('Please enter both the verification code and new password');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call our edge function to verify the code and reset password
      const { data, error } = await supabase.functions.invoke('verify-reset-code', {
        body: { 
          email, 
          code: verificationCode, 
          newPassword 
        }
      });
      
      if (error) {
        toast.error(error.message || 'Invalid verification code');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
      setStep('success');
      toast.success('Password successfully reset');
    } catch (error) {
      console.error('Password reset verification error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendCode} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`flex w-full justify-center rounded-md border border-transparent py-2.5 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : null}
          {isLoading ? 'Sending...' : 'Send verification code'}
        </motion.button>
      </div>

      <div className="text-center text-sm">
        <Link to="/auth/login" className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to sign in
        </Link>
      </div>
    </form>
  );

  const renderVerificationStep = () => (
    <form onSubmit={handleVerifyAndReset} className="space-y-6">
      <div>
        <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Verification Code
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <KeyRound className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="verification-code"
            name="verification-code"
            type="text"
            required
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter 6-digit code"
            maxLength={6}
            pattern="[0-9]{6}"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter the 6-digit code sent to {email}
        </p>
      </div>

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <KeyRound className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="new-password"
            name="new-password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter new password"
            minLength={8}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Password must be at least 8 characters long
        </p>
      </div>

      <div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`flex w-full justify-center rounded-md border border-transparent py-2.5 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : null}
          {isLoading ? 'Verifying...' : 'Reset Password'}
        </motion.button>
      </div>

      <div className="text-center text-sm">
        <button 
          type="button" 
          onClick={() => setStep('email')}
          className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to enter email
        </button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-100">Password reset successful</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Your password has been successfully reset.
      </p>
      <div className="mt-6">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => navigate('/auth/login')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to sign in
        </motion.button>
      </div>
    </div>
  );

  return (
    <div>
      {step === 'email' && renderEmailStep()}
      {step === 'verification' && renderVerificationStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );
};

export default ForgotPasswordForm;
