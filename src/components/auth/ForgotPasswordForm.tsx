
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

      setIsLoading(false);
      
      if (error) {
        console.error('Error details:', error);
        toast.error(error.message || 'Failed to send verification code');
        return;
      }
      
      setStep('verification');
      toast.success('Verification code sent to your email');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred. Please try again.');
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
      
      setIsLoading(false);
      
      if (error) {
        toast.error(error.message || 'Invalid verification code');
        return;
      }
      
      setStep('success');
      toast.success('Password successfully reset');
    } catch (error: any) {
      console.error('Password reset verification error:', error);
      toast.error('An unexpected error occurred. Please try again.');
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
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Sending...</>
          ) : (
            'Send verification code'
          )}
        </Button>
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
          <Input
            id="verification-code"
            name="verification-code"
            type="text"
            required
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="pl-10"
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
          <Input
            id="new-password"
            name="new-password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10"
            placeholder="Enter new password"
            minLength={8}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Password must be at least 8 characters long
        </p>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Verifying...</>
          ) : (
            'Reset Password'
          )}
        </Button>
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
        <Button
          type="button"
          onClick={() => navigate('/auth/login')}
          className="inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to sign in
        </Button>
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
