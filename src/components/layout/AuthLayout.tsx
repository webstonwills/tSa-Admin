import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Link to="/auth/login" className="inline-block">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-8 flex justify-center"
            >
              <div className="h-28 w-28 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={`${import.meta.env.BASE_URL}assets/logo-white.png`}
                  alt="TSA Logo" 
                  className="h-22 w-22 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
            </motion.div>
          </Link>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight"
          >
            {title}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-2 text-base text-gray-600"
          >
            {subtitle}
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white py-8 px-6 shadow-xl rounded-2xl glass-morphism"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
