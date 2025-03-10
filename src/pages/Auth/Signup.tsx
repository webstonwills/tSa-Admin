
import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import SignupForm from '../../components/auth/SignupForm';

const Signup = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the Admin Finance Hub to manage your department"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
