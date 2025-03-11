
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  UserCheck,
  FileText,
  Calendar,
  Briefcase,
  CheckSquare,
  Vote
} from 'lucide-react';

const BoardMemberDashboard = () => {
  const data = [
    { name: 'Q1', value: 85 },
    { name: 'Q2', value: 78 },
    { name: 'Q3', value: 92 },
    { name: 'Q4', value: 88 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Board Member Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">Today's Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Meetings Attended"
          value="15"
          change="+3"
          isPositive={true}
          icon={<UserCheck className="h-5 w-5" />}
          className=""
        />
        <OverviewCard
          title="Resolutions Passed"
          value="8"
          change="+2"
          isPositive={true}
          icon={<CheckSquare className="h-5 w-5" />}
          className=""
        />
        <OverviewCard
          title="Pending Reviews"
          value="5"
          change="-2"
          isPositive={false}
          icon={<FileText className="h-5 w-5" />}
          className=""
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Board Performance"
          subtitle="Quarterly metrics overview"
          type="line"
          data={data}
        />

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Briefcase className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Strategic Planning Session</p>
                <p className="text-sm text-gray-500">Next Tuesday, 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Vote className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Annual Budget Review</p>
                <p className="text-sm text-gray-500">End of Month</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BoardMemberDashboard;
