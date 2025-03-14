
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  DollarSign,
  TrendingUp,
  CalendarClock,
  CreditCard,
  BarChart3,
  PieChart,
  ChevronUp,
  ChevronDown,
  Wallet,
  Receipt,
  CircleDollarSign
} from 'lucide-react';

const FinanceDashboard = () => {
  const revenueData = [
    { name: 'Jan', value: 30000, secondValue: 28000 },
    { name: 'Feb', value: 45000, secondValue: 32000 },
    { name: 'Mar', value: 38000, secondValue: 35000 },
    { name: 'Apr', value: 50000, secondValue: 40000 },
    { name: 'May', value: 42000, secondValue: 38000 },
    { name: 'Jun', value: 55000, secondValue: 42000 }
  ];

  const expenseCategories = [
    { name: 'Operations', value: 42 },
    { name: 'Marketing', value: 21 },
    { name: 'HR', value: 18 },
    { name: 'IT', value: 15 },
    { name: 'Other', value: 4 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">Financial performance and metrics overview</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard
          title="Total Revenue"
          value="$256,450"
          change="+8.2%"
          isPositive={true}
          icon={<DollarSign className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <OverviewCard
          title="Expenses"
          value="$98,742"
          change="-3.1%"
          isPositive={true}
          icon={<CreditCard className="h-5 w-5" />}
          className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
        />
        <OverviewCard
          title="Net Profit"
          value="$157,708"
          change="+15.4%"
          isPositive={true}
          icon={<TrendingUp className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <OverviewCard
          title="Cash Flow"
          value="$84,320"
          change="+5.7%"
          isPositive={true}
          icon={<Wallet className="h-5 w-5" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Revenue vs Expenses"
          subtitle="Monthly comparison"
          type="area"
          data={revenueData}
        />

        <ChartCard
          title="Expense Distribution"
          subtitle="By department"
          type="bar"
          data={expenseCategories}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Receipt className="h-5 w-5 text-blue-600 mr-2" />
            Recent Transactions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <p className="font-medium">Software Licenses</p>
                <p className="text-xs text-gray-500">IT Department</p>
              </div>
              <span className="text-red-600 font-medium">-$12,500</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <p className="font-medium">Client Payment</p>
                <p className="text-xs text-gray-500">BizTech Solutions</p>
              </div>
              <span className="text-green-600 font-medium">+$28,750</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Office Supplies</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <span className="text-red-600 font-medium">-$4,250</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CircleDollarSign className="h-5 w-5 text-blue-600 mr-2" />
            Financial Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Gross Profit Margin</span>
                <span className="text-sm font-medium text-green-600">62.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Operating Margin</span>
                <span className="text-sm font-medium text-blue-600">38.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '38.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Debt-to-Equity</span>
                <span className="text-sm font-medium text-amber-600">0.42</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            Financial Updates
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Q2 Budget Review</p>
                <p className="text-sm text-gray-500">Final approval pending</p>
              </div>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Pending</span>
            </div>
            <div className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Tax Filings</p>
                <p className="text-sm text-gray-500">Documents prepared for review</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
            </div>
            <div className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">Annual Audit</p>
                <p className="text-sm text-gray-500">Preparations in progress</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;
