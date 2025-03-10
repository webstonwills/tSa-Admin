
import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

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
