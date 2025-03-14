
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  Briefcase,
  Target,
  CalendarClock,
  TrendingUp,
  Users,
  BarChart3,
  LineChart,
  PieChart,
  Clock,
  CheckCircle,
  GitPullRequest
} from 'lucide-react';

const BusinessManagementDashboard = () => {
  const projectPerformanceData = [
    { name: 'Week 1', value: 85 },
    { name: 'Week 2', value: 78 },
    { name: 'Week 3', value: 92 },
    { name: 'Week 4', value: 88 }
  ];

  const resourceAllocationData = [
    { name: 'Product Dev', value: 42 },
    { name: 'Marketing', value: 18 },
    { name: 'Research', value: 15 },
    { name: 'Operations', value: 25 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Business Management</h1>
          <p className="text-gray-500 mt-1">Operational oversight and project tracking</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard
          title="Active Projects"
          value="12"
          change="+2"
          isPositive={true}
          icon={<Briefcase className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <OverviewCard
          title="Team Performance"
          value="92%"
          change="+5%"
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <OverviewCard
          title="Goals Achieved"
          value="85%"
          change="+8%"
          isPositive={true}
          icon={<Target className="h-5 w-5" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
        <OverviewCard
          title="Time to Delivery"
          value="18 Days"
          change="-3"
          isPositive={true}
          icon={<Clock className="h-5 w-5" />}
          className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Project Performance"
          subtitle="Weekly progress overview"
          type="line"
          data={projectPerformanceData}
        />

        <ChartCard
          title="Resource Allocation"
          subtitle="By department"
          type="bar"
          data={resourceAllocationData}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <GitPullRequest className="h-5 w-5 text-blue-600 mr-2" />
            Project Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Market Research Analysis</p>
                <p className="text-xs text-gray-500">Research Team</p>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs text-gray-600">85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Product Development</p>
                <p className="text-xs text-gray-500">Engineering Team</p>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-xs text-gray-600">65%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Process Optimization</p>
                <p className="text-xs text-gray-500">Operations Team</p>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-xs text-gray-600">40%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            Performance Metrics
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Team Productivity</span>
                <span className="text-sm font-medium text-green-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Cost Efficiency</span>
                <span className="text-sm font-medium text-blue-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Time to Market</span>
                <span className="text-sm font-medium text-amber-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Quality Assurance</span>
                <span className="text-sm font-medium text-green-600">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            Recent Milestones
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Strategy Planning Completed</p>
                <p className="text-sm text-gray-500">Q3 objectives defined</p>
              </div>
              <span className="text-xs text-gray-500">2d ago</span>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">New Software Deployment</p>
                <p className="text-sm text-gray-500">Project management tools upgraded</p>
              </div>
              <span className="text-xs text-gray-500">1w ago</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Team Reorganization</p>
                <p className="text-sm text-gray-500">Structure optimized for new projects</p>
              </div>
              <span className="text-xs text-gray-500">2w ago</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BusinessManagementDashboard;
