
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  Heart,
  Users,
  CalendarClock,
  Handshake,
  Activity,
  Award,
  LineChart,
  UserCheck,
  ScrollText,
  Leaf
} from 'lucide-react';

const WelfareDashboard = () => {
  const satisfactionData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 72 },
    { name: 'Mar', value: 68 },
    { name: 'Apr', value: 75 },
    { name: 'May', value: 80 },
    { name: 'Jun', value: 85 }
  ];

  const programData = [
    { name: 'Health', value: 45 },
    { name: 'Education', value: 32 },
    { name: 'Housing', value: 28 },
    { name: 'Food', value: 35 },
    { name: 'Community', value: 25 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welfare Dashboard</h1>
          <p className="text-gray-500 mt-1">Community support and program management</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard
          title="Active Programs"
          value="8"
          change="+2"
          isPositive={true}
          icon={<Heart className="h-5 w-5" />}
          className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
        />
        <OverviewCard
          title="Beneficiaries"
          value="450"
          change="+45"
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <OverviewCard
          title="Satisfaction Rate"
          value="92%"
          change="+5%"
          isPositive={true}
          icon={<Award className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <OverviewCard
          title="Volunteers"
          value="78"
          change="+12"
          isPositive={true}
          icon={<UserCheck className="h-5 w-5" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Beneficiary Satisfaction"
          subtitle="Monthly satisfaction ratings"
          type="line"
          data={satisfactionData}
        />

        <ChartCard
          title="Program Distribution"
          subtitle="Resources by program type"
          type="bar"
          data={programData}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Handshake className="h-5 w-5 text-blue-600 mr-2" />
            Active Initiatives
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Community Outreach</p>
                <p className="text-xs text-gray-500">250 participants enrolled</p>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-xs text-gray-600">75%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Health & Wellness</p>
                <p className="text-xs text-gray-500">Weekly sessions ongoing</p>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <span className="text-xs text-gray-600">90%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Education Support</p>
                <p className="text-xs text-gray-500">Scholarship program</p>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-xs text-gray-600">60%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Leaf className="h-5 w-5 text-green-600 mr-2" />
            Sustainability Metrics
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Program Sustainability</span>
                <span className="text-sm font-medium text-green-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Volunteer Retention</span>
                <span className="text-sm font-medium text-blue-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Resource Efficiency</span>
                <span className="text-sm font-medium text-amber-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Long-term Impact</span>
                <span className="text-sm font-medium text-purple-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ScrollText className="h-5 w-5 text-blue-600 mr-2" />
            Upcoming Events
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Community Health Fair</p>
                <p className="text-sm text-gray-500">July 15 - Central Park</p>
                <div className="mt-1 flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">120 registered</span>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap">Planning</span>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Education Workshop</p>
                <p className="text-sm text-gray-500">August 3 - Community Center</p>
                <div className="mt-1 flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">45 registered</span>
                </div>
              </div>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full whitespace-nowrap">Upcoming</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Volunteer Appreciation</p>
                <p className="text-sm text-gray-500">September 10 - Main Hall</p>
                <div className="mt-1 flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">78 registered</span>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">Planning</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WelfareDashboard;
