
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  FileText,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Inbox
} from 'lucide-react';
import { Line } from 'recharts';

const SecretaryDashboard = () => {
  const data = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 22 },
    { name: 'Fri', value: 18 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Secretary Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">Today's Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Pending Tasks"
          value="8"
          trend="-2"
          icon={<Clock className="h-5 w-5" />}
          trendDescription="from yesterday"
        />
        <OverviewCard
          title="Unread Messages"
          value="15"
          trend="+5"
          icon={<Mail className="h-5 w-5" />}
          trendDescription="new today"
        />
        <OverviewCard
          title="Completed Tasks"
          value="42"
          trend="+12"
          icon={<CheckCircle className="h-5 w-5" />}
          trendDescription="this week"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Task Completion"
          subtitle="Weekly task completion rate"
          data={data}
        >
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </ChartCard>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Calendar className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Board Meeting</p>
                <p className="text-sm text-gray-500">10:00 AM - Conference Room A</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FileText className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Document Review</p>
                <p className="text-sm text-gray-500">2:00 PM - Office</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Inbox className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <p className="font-medium">Mail Processing</p>
                <p className="text-sm text-gray-500">4:00 PM - Mail Room</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
