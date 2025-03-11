
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  Heart,
  Users,
  Calendar,
  Handshake,
  Activity,
  Award
} from 'lucide-react';

const WelfareDashboard = () => {
  const data = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 72 },
    { name: 'Mar', value: 68 },
    { name: 'Apr', value: 75 },
    { name: 'May', value: 80 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welfare Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">Today's Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Active Programs"
          value="8"
          change="+2"
          isPositive={true}
          icon={<Heart className="h-5 w-5" />}
          className=""
        />
        <OverviewCard
          title="Beneficiaries"
          value="450"
          change="+45"
          isPositive={true}
          icon={<Users className="h-5 w-5" />}
          className=""
        />
        <OverviewCard
          title="Satisfaction Rate"
          value="92%"
          change="+5%"
          isPositive={true}
          icon={<Award className="h-5 w-5" />}
          className=""
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Program Impact"
          subtitle="Monthly beneficiary satisfaction"
          type="line"
          data={data}
        />

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ongoing Initiatives</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Handshake className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Community Outreach</p>
                <p className="text-sm text-gray-500">250 participants enrolled</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Activity className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Health & Wellness Program</p>
                <p className="text-sm text-gray-500">Weekly sessions ongoing</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WelfareDashboard;
