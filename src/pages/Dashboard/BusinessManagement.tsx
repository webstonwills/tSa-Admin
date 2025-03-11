
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  Briefcase,
  Target,
  Calendar,
  TrendingUp,
  Users,
  BarChart
} from 'lucide-react';
import { Line } from 'recharts';

const BusinessManagementDashboard = () => {
  const data = [
    { name: 'Week 1', value: 85 },
    { name: 'Week 2', value: 78 },
    { name: 'Week 3', value: 92 },
    { name: 'Week 4', value: 88 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Business Management Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">Today's Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Active Projects"
          value="12"
          trend="+2"
          icon={<Briefcase className="h-5 w-5" />}
          trendDescription="from last month"
        />
        <OverviewCard
          title="Team Performance"
          value="92%"
          trend="+5%"
          icon={<Users className="h-5 w-5" />}
          trendDescription="vs target"
        />
        <OverviewCard
          title="Goals Achieved"
          value="85%"
          trend="+8%"
          icon={<Target className="h-5 w-5" />}
          trendDescription="this quarter"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Project Performance"
          subtitle="Weekly progress overview"
          data={data}
        >
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </ChartCard>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Updates</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <TrendingUp className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Strategy Planning</p>
                <p className="text-sm text-gray-500">Q3 strategy review in progress</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <BarChart className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Performance Review</p>
                <p className="text-sm text-gray-500">Team evaluations ongoing</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BusinessManagementDashboard;
