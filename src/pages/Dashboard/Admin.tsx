import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  Users,
  TrendingUp,
  CalendarClock,
  FileText,
  BarChart3,
  Activity,
  Target,
  Building2,
  Shield,
  Settings,
  UserCog
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const AdminDashboard = () => {
  // Enhanced data for the charts
  const revenueData = [
    { name: 'Jan', value: 400, secondValue: 380 },
    { name: 'Feb', value: 300, secondValue: 320 },
    { name: 'Mar', value: 600, secondValue: 550 },
    { name: 'Apr', value: 800, secondValue: 720 },
    { name: 'May', value: 500, secondValue: 480 },
    { name: 'Jun', value: 750, secondValue: 700 }
  ];

  const departmentPerformance = [
    { name: 'Finance', value: 85 },
    { name: 'Marketing', value: 78 },
    { name: 'Operations', value: 92 },
    { name: 'HR', value: 88 },
    { name: 'IT', value: 76 }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Administrator Dashboard</h1>
            <p className="text-gray-500 mt-1">System administration and management overview</p>
          </div>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <OverviewCard
            title="User Accounts"
            value="352"
            change="+24"
            isPositive={true}
            icon={<Users className="h-5 w-5" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <OverviewCard
            title="Departments"
            value="7"
            change="+1"
            isPositive={true}
            icon={<Building2 className="h-5 w-5" />}
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          />
          <OverviewCard
            title="System Security"
            value="98.5%"
            change="+2.3%"
            isPositive={true}
            icon={<Shield className="h-5 w-5" />}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          />
          <OverviewCard
            title="Performance"
            value="94%"
            change="+5%"
            isPositive={true}
            icon={<Activity className="h-5 w-5" />}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ChartCard
            title="System Usage"
            subtitle="Current vs Previous Month"
            type="area"
            data={revenueData}
          />

          <ChartCard
            title="Department Performance"
            subtitle="Resources utilization rate (%)"
            type="bar"
            data={departmentPerformance}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 text-blue-600 mr-2" />
              System Updates
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <p className="font-medium">Security Patches</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Updated</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <p className="font-medium">Database Optimization</p>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">In Progress</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Storage Expansion</p>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Planned</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Recent Activities
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">User Access Audit</p>
                  <p className="text-sm text-gray-500">Complete review of system access permissions</p>
                </div>
                <span className="text-xs text-gray-500">1d ago</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">Backup Verification</p>
                  <p className="text-sm text-gray-500">Weekly system backup verified</p>
                </div>
                <span className="text-xs text-gray-500">3d ago</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserCog className="h-5 w-5 text-blue-600 mr-2" />
              Admin Controls
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">User Management</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Department Config</span>
                  <span className="text-sm font-medium text-blue-600">Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">System Monitoring</span>
                  <span className="text-sm font-medium text-amber-600">Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 