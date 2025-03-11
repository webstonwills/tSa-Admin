
import React from 'react';
import { Card } from "@/components/ui/card";
import { Line } from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  Users,
  TrendingUp,
  Calendar,
  FileText,
  BarChart,
  Activity
} from 'lucide-react';

const CEODashboard = () => {
  // Sample data for the chart
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CEO Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">Today's Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Total Departments"
          value="7"
          trend="+2"
          icon={<Users className="h-5 w-5" />}
          trendDescription="from last month"
        />
        <OverviewCard
          title="Revenue Growth"
          value="15.2%"
          trend="+5.2"
          icon={<TrendingUp className="h-5 w-5" />}
          trendDescription="vs last quarter"
        />
        <OverviewCard
          title="Active Projects"
          value="24"
          trend="+3"
          icon={<Activity className="h-5 w-5" />}
          trendDescription="this month"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Performance Overview"
          subtitle="Monthly performance metrics"
          data={data}
        >
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </ChartCard>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <FileText className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Department Reports Updated</p>
                <p className="text-sm text-gray-500">All departments submitted monthly reports</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <BarChart className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Financial Review Complete</p>
                <p className="text-sm text-gray-500">Q1 financial analysis ready for review</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CEODashboard;
