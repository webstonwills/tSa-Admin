
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  UserCheck,
  FileText,
  CalendarClock,
  Briefcase,
  CheckSquare,
  Vote,
  LineChart,
  BarChart3,
  ClipboardList,
  Presentation,
  TrendingUp
} from 'lucide-react';

const BoardMemberDashboard = () => {
  const boardPerformanceData = [
    { name: 'Q1', value: 85 },
    { name: 'Q2', value: 78 },
    { name: 'Q3', value: 92 },
    { name: 'Q4', value: 88 }
  ];

  const strategicInitiativesData = [
    { name: 'Growth', value: 75 },
    { name: 'Innovation', value: 82 },
    { name: 'Efficiency', value: 68 },
    { name: 'Sustainability', value: 90 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Board Member Dashboard</h1>
          <p className="text-gray-500 mt-1">Governance and strategic oversight</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard
          title="Meetings Attended"
          value="15"
          change="+3"
          isPositive={true}
          icon={<UserCheck className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <OverviewCard
          title="Resolutions Passed"
          value="8"
          change="+2"
          isPositive={true}
          icon={<CheckSquare className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <OverviewCard
          title="Pending Reviews"
          value="5"
          change="-2"
          isPositive={true}
          icon={<FileText className="h-5 w-5" />}
          className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
        />
        <OverviewCard
          title="Committee Tasks"
          value="12"
          change="+4"
          isPositive={true}
          icon={<ClipboardList className="h-5 w-5" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Board Performance"
          subtitle="Quarterly metrics overview"
          type="line"
          data={boardPerformanceData}
        />

        <ChartCard
          title="Strategic Initiatives"
          subtitle="Progress by focus area (%)"
          type="bar"
          data={strategicInitiativesData}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
            Upcoming Meetings
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-sm font-bold text-blue-600">Jul 12</p>
                <p className="text-xs text-gray-500">10:00</p>
              </div>
              <div>
                <p className="font-medium">Strategic Planning Session</p>
                <p className="text-sm text-gray-500">Conference Room A - 2 hours</p>
                <div className="mt-1 flex items-center">
                  <UserCheck className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">8 attendees</span>
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-sm font-bold text-blue-600">Jul 28</p>
                <p className="text-xs text-gray-500">14:00</p>
              </div>
              <div>
                <p className="font-medium">Annual Budget Review</p>
                <p className="text-sm text-gray-500">Boardroom - 3 hours</p>
                <div className="mt-1 flex items-center">
                  <UserCheck className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">12 attendees</span>
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-12 text-center">
                <p className="text-sm font-bold text-blue-600">Aug 5</p>
                <p className="text-xs text-gray-500">11:00</p>
              </div>
              <div>
                <p className="font-medium">Governance Committee</p>
                <p className="text-sm text-gray-500">Virtual Meeting - 1.5 hours</p>
                <div className="mt-1 flex items-center">
                  <UserCheck className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">6 attendees</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Vote className="h-5 w-5 text-blue-600 mr-2" />
            Recent Decisions
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Expansion Plan Approval</p>
                <p className="text-sm text-gray-500">New market entry strategy</p>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Approved: 8-1
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">Jun 15</span>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Executive Compensation</p>
                <p className="text-sm text-gray-500">Annual review of C-suite packages</p>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Approved: Unanimous
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">Jun 8</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Sustainability Initiative</p>
                <p className="text-sm text-gray-500">Carbon reduction program</p>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Under Review
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500">Current</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Presentation className="h-5 w-5 text-blue-600 mr-2" />
            Organizational Performance
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Revenue Growth</span>
                <span className="text-sm font-medium text-green-600">+15.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Market Share</span>
                <span className="text-sm font-medium text-blue-600">22.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <span className="text-sm font-medium text-amber-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Employee Retention</span>
                <span className="text-sm font-medium text-green-600">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BoardMemberDashboard;
