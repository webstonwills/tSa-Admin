
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your credentials to access your dashboard"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
