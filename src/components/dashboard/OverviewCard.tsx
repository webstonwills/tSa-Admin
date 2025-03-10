
import React from 'react';
import { motion } from 'framer-motion';

interface OverviewCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  className?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon, 
  className = '' 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-xl bg-white p-6 shadow-md glass-morphism ${className}`}
    >
      <div className="flex items-center">
        <div className="flex-1 mr-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className={`ml-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="flex items-center">
                {isPositive ? (
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                  </svg>
                )}
                {change}
              </span>
            </p>
          </div>
        </div>
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="rounded-full bg-blue-100 p-3 text-blue-600"
        >
          {icon}
        </motion.div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute right-0 bottom-0 h-32 w-32 -rotate-45 translate-x-8 translate-y-10 transform text-blue-50">
        {icon && React.cloneElement(icon as React.ReactElement, { 
          className: 'h-24 w-24 opacity-10' 
        })}
      </div>
    </motion.div>
  );
};

export default OverviewCard;
