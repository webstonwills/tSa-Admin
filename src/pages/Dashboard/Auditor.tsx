
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  FileCheck,
  AlertTriangle,
  Calendar,
  SearchCheck,
  CheckCircle,
  FileText
} from 'lucide-react';

const AuditorDashboard = () => {
  const data = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 58 },
    { name: 'May', value: 50 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Auditor Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">Today's Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Audits Completed"
          value="28"
          change="+5"
          isPositive={true}
          icon={<FileCheck className="h-5 w-5" />}
          className=""
        />
        <OverviewCard
          title="Pending Reviews"
          value="12"
          change="-3"
          isPositive={false}
          icon={<SearchCheck className="h-5 w-5" />}
          className=""
        />
        <OverviewCard
          title="Issues Identified"
          value="15"
          change="+2"
          isPositive={false}
          icon={<AlertTriangle className="h-5 w-5" />}
          className=""
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Audit Progress"
          subtitle="Monthly audit completion rate"
          type="bar"
          data={data}
        />

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Audits</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Financial Compliance Review</p>
                <p className="text-sm text-gray-500">Completed on May 15</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FileText className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Internal Controls Assessment</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuditorDashboard;
