
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  BarChart,
  PieChart
} from 'lucide-react';
import { Line } from 'recharts';

const FinanceDashboard = () => {
  const data = [
    { name: 'Jan', value: 30000 },
    { name: 'Feb', value: 45000 },
    { name: 'Mar', value: 38000 },
    { name: 'Apr', value: 50000 },
    { name: 'May', value: 42000 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">Today's Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Total Revenue"
          value="$125,000"
          trend="+8.2%"
          icon={<DollarSign className="h-5 w-5" />}
          trendDescription="vs last month"
        />
        <OverviewCard
          title="Expenses"
          value="$45,000"
          trend="-2.4%"
          icon={<CreditCard className="h-5 w-5" />}
          trendDescription="vs last month"
        />
        <OverviewCard
          title="Net Profit"
          value="$80,000"
          trend="+15.3%"
          icon={<TrendingUp className="h-5 w-5" />}
          trendDescription="vs last month"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Revenue Overview"
          subtitle="Monthly revenue trends"
          data={data}
        >
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </ChartCard>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Updates</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <BarChart className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Budget Analysis Complete</p>
                <p className="text-sm text-gray-500">Q2 budget review finished</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <PieChart className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Expense Reports Due</p>
                <p className="text-sm text-gray-500">Deadline: End of month</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;
