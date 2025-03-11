import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Building, User, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const departments = [
  { id: 'ceo', name: 'CEO Office', code: 'CEO' },
  { id: 'sec', name: 'Secretary', code: 'SEC' },
  { id: 'fin', name: 'Finance', code: 'FIN' },
  { id: 'bm', name: 'Business Management', code: 'BM' },
  { id: 'aud', name: 'Auditor', code: 'AUD' },
  { id: 'wel', name: 'Welfare', code: 'WEL' },
  { id: 'bmem', name: 'Board Member', code: 'BMEM' },
];

const SignupForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const navigate = useNavigate();
  
  const generateDepartmentId = () => {
    const selectedDept = departments.find(dept => dept.id === department);
    if (selectedDept) {
      // Generate a random 3-digit number
      const randomId = Math.floor(Math.random() * 900 + 100);
      setDepartmentId(`${selectedDept.code}_${randomId}`);
    }
  };

  useEffect(() => {
    if (department) {
      generateDepartmentId();
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword || !department) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const selectedDept = departments.find(dept => dept.id === department);
      
      if (!selectedDept) {
        toast.error('Invalid department selected');
        setIsLoading(false);
        return;
      }
      
      // Query existing departments first
      const { data: existingDepts, error: deptQueryError } = await supabase
        .from('departments')
        .select('id, department_code')
        .eq('department_code', selectedDept.code);
      
      if (deptQueryError) {
        console.error('Error querying departments:', deptQueryError);
        toast.error(`Error querying departments: ${deptQueryError.message}`);
        setIsLoading(false);
        return;
      }
      
      let departmentDbId;
      
      // If department exists, use it - otherwise create it
      if (existingDepts && existingDepts.length > 0) {
        departmentDbId = existingDepts[0].id;
        console.log(`Found existing department: ${selectedDept.code} with ID: ${departmentDbId}`);
      } else {
        // Create new department with a public insert that doesn't require auth
        const { data: newDept, error: createDeptError } = await supabase
          .from('departments')
          .insert({
            name: selectedDept.name,
            department_code: selectedDept.code,
          })
          .select('id')
          .single();
        
        if (createDeptError) {
          console.error('Error creating department:', createDeptError);
          toast.error(`Department creation failed: ${createDeptError.message}`);
          setIsLoading(false);
          return;
        }
        
        departmentDbId = newDept.id;
        console.log(`Created new department: ${selectedDept.code} with ID: ${departmentDbId}`);
      }
      
      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            department_id: departmentDbId,
            department_code: departmentId,
            role: selectedDept.id.toUpperCase(),
          },
        },
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error(`Signup failed: ${authError.message}`);
        setIsLoading(false);
        return;
      }
      
      if (authData?.user) {
        console.log('User created successfully:', authData.user.id);
        
        // Log the signup in audit logs
        try {
          await supabase.rpc('log_audit_event', {
            action: 'SIGNUP',
            entity_type: 'USER',
            entity_id: authData.user.id,
            details: JSON.stringify({
              email: email,
              department_code: departmentId,
              department_id: departmentDbId
            })
          });
        } catch (auditError) {
          console.error('Audit log error:', auditError);
          // Non-blocking error, continue with signup
        }
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(`An unexpected error occurred: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Enter your first name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Enter your last name"
            />
          </div>
        </div>
      </div>

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
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Department
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="department"
            name="department"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {department && (
        <div>
          <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Department ID (Auto-generated)
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="departmentId"
              name="departmentId"
              type="text"
              readOnly
              value={departmentId}
              className="block w-full pl-10 appearance-none rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
            />
            <button
              type="button"
              onClick={generateDepartmentId}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-blue-600 hover:text-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This is your unique department ID. You will need this to log in.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Create a password"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Confirm your password"
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </motion.button>
      </div>

      <div className="text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Already have an account?</span>{' '}
        <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;
